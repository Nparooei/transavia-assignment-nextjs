// Compatibility export for consumers. Runtime schemas are the source of truth.
export type {
  ApiErrorResponse,
  FlightSearchConfig,
  FlightSearchResponse,
} from "@/features/flight-search/schemas/api";
export type {
  Airport,
  AirportsResponse,
  FlightOffer,
  FlightsResponse,
} from "@/features/flight-search/schemas/flight";
export type {
  FlightSearchUrlState,
  SearchCriteria,
} from "@/features/flight-search/schemas/search";
