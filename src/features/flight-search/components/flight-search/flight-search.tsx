"use client";

import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useFlightSearchConfig } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import {
  buildFlightSearchApiUrl,
  fetchFlightSearch,
} from "@/features/flight-search/lib/flight-search-api";
import { airportLabel, resolveAirportCode } from "@/features/flight-search/lib/flights";
import { buildFlightSearchUrl } from "@/features/flight-search/lib/flight-search-url";
import { SearchCriteriaSchema } from "@/features/flight-search/schemas/flight";
import type {
  FlightSearchUrlState,
  SearchCriteria,
} from "@/features/flight-search/types/flight";
import type { FlightSearchState } from "@/features/flight-search/types/search";
import { ResultsSection } from "../results-section/results-section";
import { SearchForm } from "../search-form/search-form";
import styles from "../flight-search-page/flight-search-page.module.css";

interface FlightSearchProps {
  initialUrlState?: FlightSearchUrlState;
}

interface SearchDraft {
  origin: string;
  destination: string;
  departureDate: string;
}

/** Owns the interactive search draft, validation and client-side API search. */
export function FlightSearch({ initialUrlState }: FlightSearchProps) {
  const { airports, destinationCodes, maxDate, minDate } = useFlightSearchConfig();
  const airportByCode = useMemo(
    () => new Map(airports.map((airport) => [airport.ItemName, airport])),
    [airports],
  );
  const destinationAirports = useMemo(() => {
    const availableCodes = new Set(destinationCodes);
    return airports.filter((airport) => availableCodes.has(airport.ItemName));
  }, [airports, destinationCodes]);
  const [draft, setDraft] = useState<SearchDraft>(() => {
    const initialOrigin =
      airportByCode.get(initialUrlState?.origin ?? "AMS") ?? airports[0];
    const initialDestination = initialUrlState?.destination
      ? airportByCode.get(initialUrlState.destination)
      : undefined;

    return {
      origin: airportLabel(initialOrigin),
      destination: initialDestination ? airportLabel(initialDestination) : "",
      departureDate: initialUrlState?.departureDate ?? minDate,
    };
  });
  const { origin, destination, departureDate } = draft;
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedCriteria, setSubmittedCriteria] = useState<
    SearchCriteria | undefined
  >(() => {
    const result = SearchCriteriaSchema.safeParse(initialUrlState);
    return result.success ? result.data : undefined;
  });
  const apiUrl = submittedCriteria
    ? buildFlightSearchApiUrl(submittedCriteria)
    : null;
  const {
    data,
    error: requestError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(apiUrl, fetchFlightSearch, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const error = validationError ?? requestError?.message ?? null;
  const searchState: FlightSearchState | null =
    !error && submittedCriteria && data
      ? { criteria: submittedCriteria, results: data.flights }
      : null;

  useEffect(() => {
    if (data || error) resultsRef.current?.focus();
  }, [data, error]);

  function submitSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const originCode = resolveAirportCode(origin, airports);
    const destinationCode = resolveAirportCode(destination, airports);

    const criteriaResult = SearchCriteriaSchema.safeParse({
      origin: originCode,
      destination: destinationCode,
      departureDate,
    });

    if (!criteriaResult.success) {
      setValidationError(criteriaResult.error.issues[0].message);
      return;
    }

    setValidationError(null);
    const nextApiUrl = buildFlightSearchApiUrl(criteriaResult.data);
    setSubmittedCriteria(criteriaResult.data);
    window.history.pushState(
      null,
      "",
      buildFlightSearchUrl(criteriaResult.data),
    );

    if (nextApiUrl === apiUrl) void mutate();
  }

  function useExample() {
    const amsterdam = airportByCode.get("AMS");
    const alicante = airportByCode.get("ALC");
    setDraft((current) => ({
      origin: amsterdam ? airportLabel(amsterdam) : current.origin,
      destination: alicante ? airportLabel(alicante) : current.destination,
      departureDate: minDate,
    }));
    setValidationError(null);

    // Let's wait until the state is updated and the input is rendered, then scroll to and focus the destination field.
    requestAnimationFrame(() => {
      const destinationInput = destinationInputRef.current;
      if (typeof destinationInput?.scrollIntoView === "function") {
        destinationInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      destinationInput?.focus();
    });
  }

  const resultDestinationName = searchState
    ? airportByCode.get(searchState.criteria.destination)?.AirportName ??
      searchState.criteria.destination
    : null;

  return (
    <>
      <div className={`${styles.shell} ${styles.searchWrap}`}>
        <SearchForm
          airports={airports}
          destinationAirports={destinationAirports}
          origin={origin}
          destination={destination}
          destinationInputRef={destinationInputRef}
          departureDate={departureDate}
          minDate={minDate}
          maxDate={maxDate}
          isLoading={isLoading || isValidating}
          onOriginChange={(value) =>
            setDraft((current) => ({ ...current, origin: value }))
          }
          onDestinationChange={(value) =>
            setDraft((current) => ({ ...current, destination: value }))
          }
          onDepartureDateChange={(value) =>
            setDraft((current) => ({ ...current, departureDate: value }))
          }
          onSubmit={submitSearch}
        />
        <p className={styles.dataNote}>
          <span aria-hidden="true">●</span> Available data: departures from Amsterdam, 10–30 November 2022
        </p>
      </div>

      <ResultsSection
        shellClassName={styles.shell}
        error={error}
        resultDestinationName={resultDestinationName}
        resultsRef={resultsRef}
        searchState={searchState}
        onUseExample={useExample}
      />
    </>
  );
}
