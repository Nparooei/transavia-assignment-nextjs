"use client";

import { Typography } from "@/components/ui/typography/typography";
import { FlightCard } from "@/features/flight-search/components/flight-card/flight-card";
import { formatDate } from "@/features/flight-search/lib/flights";
import type { FlightSearchState } from "@/features/flight-search/types/search";
import styles from "../results-section/results-section.module.css";

interface FlightResultsListProps {
  resultDestinationName: string | null;
  searchState: FlightSearchState;
}

/** Loaded only after a search returns matching flights. */
export default function FlightResultsList({
  resultDestinationName,
  searchState,
}: FlightResultsListProps) {
  return (
    <div>
      <div className={styles.heading}>
        <div>
          <Typography variant="eyebrow" tone="accent">Choose your flight</Typography>
          <Typography as="h2" variant="heading">Amsterdam to {resultDestinationName}</Typography>
          <Typography variant="body">{formatDate(searchState.criteria.departureDate)}</Typography>
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
  );
}
