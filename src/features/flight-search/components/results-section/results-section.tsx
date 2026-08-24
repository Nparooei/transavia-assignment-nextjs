import type { RefObject } from "react";
import { formatDate } from "@/features/flight-search/lib/flights";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { Typography } from "@/components/ui/typography/typography";
import { FlightCard } from "../flight-card/flight-card";
import type { FlightSearchState } from "@/features/flight-search/types/search";
import styles from "./results-section.module.css";

interface ResultsSectionProps {
  error: string | null;
  resultDestinationName: string | null;
  resultsRef: RefObject<HTMLElement | null>;
  searchState: FlightSearchState | null;
  shellClassName: string;
  onUseExample: () => void;
}

export function ResultsSection({
  error,
  resultDestinationName,
  resultsRef,
  searchState,
  shellClassName,
  onUseExample,
}: ResultsSectionProps) {
  return (
    <section
      className={`${styles.results} ${shellClassName}`}
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      ref={resultsRef}
    >
      {!searchState && !error && (
        <div className={styles.welcome}>
          <div>
            <Typography variant="eyebrow" tone="accent">
              A little inspiration
            </Typography>
            <Typography as="h2" variant="heading">
              Your next trip is one search away
            </Typography>
            <Typography variant="body">
              Pick one of 41 destinations with flights in the provided data set.
            </Typography>
          </div>
          <Button className={styles.exampleButton} variant="secondary" onPress={onUseExample}>
            Try Amsterdam → Alicante
            <Icon name="arrow" />
          </Button>
        </div>
      )}

      {error && (
        <div className={styles.empty} role="alert">
          <span className={styles.emptyIcon}>!</span>
          <Typography as="h2" variant="heading">
            Check your search
          </Typography>
          <Typography variant="body">{error}</Typography>
        </div>
      )}

      {searchState && searchState.results.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name="plane" />
          </span>
          <Typography as="h2" variant="heading">
            No matching flights
          </Typography>
          <Typography variant="body">
            The provided data only includes departures from Amsterdam between 10 and 30 November
            2022.
          </Typography>
          <Button className={styles.emptyAction} variant="text" onPress={onUseExample}>
            Use an available example
          </Button>
        </div>
      )}

      {searchState && searchState.results.length > 0 && (
        <div>
          <div className={styles.heading}>
            <div>
              <Typography variant="eyebrow" tone="accent">
                Choose your flight
              </Typography>
              <Typography as="h2" variant="heading">
                Amsterdam to {resultDestinationName}
              </Typography>
              <Typography variant="body">
                {formatDate(searchState.criteria.departureDate)}
              </Typography>
            </div>
            <span className={styles.count}>
              {searchState.results.length} {searchState.results.length === 1 ? "flight" : "flights"}
            </span>
          </div>
          <div className={styles.flightList}>
            {searchState.results.map((offer) => (
              <FlightCard key={offer.outboundFlight.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
