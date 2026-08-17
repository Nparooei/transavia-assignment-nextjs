import type { FlightOffer, SearchCriteria } from "@/features/flight-search/types/flight";

export interface FlightSearchState {
  criteria: SearchCriteria;
  results: FlightOffer[];
}
