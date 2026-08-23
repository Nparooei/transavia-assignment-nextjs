import { FlightSearch } from "@/features/flight-search/components/flight-search/flight-search";
import { buildFlightSearchUrl } from "@/features/flight-search/lib/flight-search-url";
import type { FlightSearchUrlState } from "@/features/flight-search/types/flight";
import type { FlightSearchState } from "@/features/flight-search/types/search";

interface FlightSearchPageProps {
  initialSearchState?: FlightSearchState;
  initialUrlState?: FlightSearchUrlState;
}

/** Server composition boundary; the route owns validation and data resolution. */
export function FlightSearchPage({
  initialSearchState,
  initialUrlState,
}: FlightSearchPageProps) {
  return (
    <FlightSearch
      key={buildFlightSearchUrl(initialUrlState ?? {})}
      initialSearchState={initialSearchState}
      initialUrlState={initialUrlState}
    />
  );
}
