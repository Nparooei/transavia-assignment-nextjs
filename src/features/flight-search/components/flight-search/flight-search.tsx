"use client";

import { SyntheticEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import layoutStyles from "@/components/layout/page-layout/page-layout.module.css";
import { useFlightSearchConfig } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import { airportLabel, resolveAirportCode } from "@/features/flight-search/lib/flights";
import { buildFlightSearchUrl } from "@/features/flight-search/lib/flight-search-url";
import { SearchCriteriaSchema } from "@/features/flight-search/schemas/flight";
import type { FlightSearchUrlState } from "@/features/flight-search/types/flight";
import type { FlightSearchState } from "@/features/flight-search/types/search";
import { ResultsSection } from "../results-section/results-section";
import { SearchForm } from "../search-form/search-form";
import styles from "./flight-search.module.css";

interface FlightSearchProps {
  initialUrlState?: FlightSearchUrlState;
  initialSearchState?: FlightSearchState;
}

interface SearchDraft {
  origin: string;
  destination: string;
  departureDate: string;
}

/** Owns the interactive search draft, validation and route navigation. */
export function FlightSearch({
  initialUrlState,
  initialSearchState,
}: FlightSearchProps) {
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const searchState = error ? null : initialSearchState ?? null;

  useEffect(() => {
    if (searchState || error) resultsRef.current?.focus();
  }, [searchState, error]);

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
      setError(criteriaResult.error.issues[0].message);
      return;
    }

    setError(null);
    startNavigation(() => {
      router.push(buildFlightSearchUrl(criteriaResult.data), { scroll: false });
    });
  }

  function useExample() {
    const amsterdam = airportByCode.get("AMS");
    const alicante = airportByCode.get("ALC");
    setDraft((current) => ({
      origin: amsterdam ? airportLabel(amsterdam) : current.origin,
      destination: alicante ? airportLabel(alicante) : current.destination,
      departureDate: minDate,
    }));
    setError(null);

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
      <div className={`${layoutStyles.shell} ${styles.searchWrap}`}>
        <SearchForm
          airports={airports}
          destinationAirports={destinationAirports}
          origin={origin}
          destination={destination}
          destinationInputRef={destinationInputRef}
          departureDate={departureDate}
          minDate={minDate}
          maxDate={maxDate}
          isLoading={isNavigating}
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
        shellClassName={layoutStyles.shell}
        error={error}
        resultDestinationName={resultDestinationName}
        resultsRef={resultsRef}
        searchState={searchState}
        onUseExample={useExample}
      />
    </>
  );
}
