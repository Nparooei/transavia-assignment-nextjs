import "server-only";
import type { ZodError } from "zod";
import airportsData from "./data/airports.json";
import flightsData from "./data/flights-from-AMS.json";
import { searchFlights } from "@/features/flight-search/lib/flights";
import {
  ApiErrorResponseSchema,
  AirportsResponseSchema,
  FLIGHT_DATA_MAX_DATE,
  FLIGHT_DATA_MIN_DATE,
  FlightSearchConfigSchema,
  FlightsResponseSchema,
  SearchCriteriaQuerySchema,
  SearchCriteriaSchema,
} from "@/features/flight-search/schemas/flight";
import type {
  ApiErrorResponse,
  FlightSearchConfig,
  SearchCriteria,
} from "@/features/flight-search/types/flight";
import type { FlightSearchState } from "@/features/flight-search/types/search";

const airportsResponse = AirportsResponseSchema.parse(airportsData);
const flightsResponse = FlightsResponseSchema.parse(flightsData);
const flights = flightsResponse.flightOffer;
const availableDestinations = new Set(
  flights.map((offer) => offer.outboundFlight.arrivalAirport.locationCode),
);
const unavailableDestinationIssue = {
  message: "Destination is not available in the supplied flight data.",
  path: ["destination"],
};
const AvailableSearchCriteriaSchema = SearchCriteriaSchema.refine(
  ({ destination }) => availableDestinations.has(destination),
  unavailableDestinationIssue,
);
const AvailableSearchCriteriaQuerySchema = SearchCriteriaQuerySchema.refine(
  ({ destination }) => availableDestinations.has(destination),
  unavailableDestinationIssue,
);
const flightSearchConfig = FlightSearchConfigSchema.parse({
  airports: airportsResponse.Airports,
  destinationCodes: Array.from(availableDestinations),
  minDate: FLIGHT_DATA_MIN_DATE,
  maxDate: FLIGHT_DATA_MAX_DATE,
});

export type FlightSearchResolution =
  | { success: true; data: FlightSearchState }
  | { success: false; error: ApiErrorResponse };

function validationError(error: ZodError): ApiErrorResponse {
  return ApiErrorResponseSchema.parse({
    message: "Invalid flight search criteria.",
    issues: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function search(criteria: SearchCriteria): FlightSearchResolution {
  return {
    success: true,
    data: {
      criteria,
      results: searchFlights(flights, criteria),
    },
  };
}

export function getFlightSearchConfig(): FlightSearchConfig {
  return flightSearchConfig;
}

export function validateFlightSearchCriteria(input: unknown) {
  const result = AvailableSearchCriteriaSchema.safeParse(input);
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, error: validationError(result.error) };
}

export function resolveFlightSearchCriteria(input: unknown): FlightSearchResolution {
  const result = validateFlightSearchCriteria(input);
  return result.success ? search(result.data) : result;
}

export function resolveFlightSearchQuery(input: unknown): FlightSearchResolution {
  const result = AvailableSearchCriteriaQuerySchema.safeParse(input);
  return result.success
    ? search(result.data)
    : { success: false, error: validationError(result.error) };
}
