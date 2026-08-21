import { Icon } from "@/components/ui/icon/icon";
import { Typography } from "@/components/ui/typography/typography";
import { FlightSearch } from "@/features/flight-search/components/flight-search/flight-search";
import { buildFlightSearchUrl } from "@/features/flight-search/lib/flight-search-url";
import type { FlightSearchUrlState } from "@/features/flight-search/types/flight";
import styles from "./flight-search-page.module.css";

interface FlightSearchPageProps {
  initialUrlState?: FlightSearchUrlState;
}

/** Server composition boundary; the client owns flight-result fetching. */
export function FlightSearchPage({ initialUrlState }: FlightSearchPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <nav className={`${styles.nav} ${styles.shell}`} aria-label="Main navigation">
          <a className={styles.brand} href="#top" aria-label="Transavia flight finder home">
            <span className={styles.brandMark}><Icon name="plane" /></span>
            <span>transavia</span>
          </a>
          <span className={styles.navNote}>Flight finder</span>
        </nav>
        <div className={`${styles.heroCopy} ${styles.shell}`} id="top">
          <Typography variant="eyebrow">Ready when you are</Typography>
          <Typography as="h1" variant="hero">Where will you go next?</Typography>
          <Typography variant="body">Search our available flights from Amsterdam and start looking forward to your trip.</Typography>
        </div>
      </section>

      <FlightSearch
        key={buildFlightSearchUrl(initialUrlState ?? {})}
        initialUrlState={initialUrlState}
      />

      <footer className={`${styles.footer} ${styles.shell}`}>
        <span>Transavia flight finder</span>
        <span>Interview assignment · provided data set</span>
      </footer>
    </main>
  );
}
