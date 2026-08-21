"use client";

import { lazy, Suspense, type RefObject } from "react";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { Typography } from "@/components/ui/typography/typography";
import type { FlightSearchState } from "@/features/flight-search/types/search";
import styles from "./results-section.module.css";

const FlightResultsList = lazy(
  () => import("../flight-results-list/flight-results-list"),
);

function FlightResultsSkeleton() {
  return (
    <div className={styles.resultsSkeleton} role="status">
      <p className={styles.loadingLabel}>Preparing flight results…</p>
      <div className={styles.skeletonHeading} />
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
    </div>
  );
}

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
            <Typography variant="eyebrow" tone="accent">A little inspiration</Typography>
            <Typography as="h2" variant="heading">Your next trip is one search away</Typography>
            <Typography variant="body">Pick one of 41 destinations with flights in the provided data set.</Typography>
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
          <Typography as="h2" variant="heading">Check your search</Typography>
          <Typography variant="body">{error}</Typography>
        </div>
      )}

      {searchState && searchState.results.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><Icon name="plane" /></span>
          <Typography as="h2" variant="heading">No matching flights</Typography>
          <Typography variant="body">
            The provided data only includes departures from Amsterdam between 10 and 30 November 2022.
          </Typography>
          <Button className={styles.emptyAction} variant="text" onPress={onUseExample}>Use an available example</Button>
        </div>
      )}

      {searchState && searchState.results.length > 0 && (
        <Suspense fallback={<FlightResultsSkeleton />}>
          <FlightResultsList
            resultDestinationName={resultDestinationName}
            searchState={searchState}
          />
        </Suspense>
      )}
    </section>
  );
}
