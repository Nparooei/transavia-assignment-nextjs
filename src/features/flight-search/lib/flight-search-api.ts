import {
  ApiErrorResponseSchema,
  FlightSearchResponseSchema,
} from "@/features/flight-search/schemas/flight";
import type {
  FlightSearchResponse,
  SearchCriteria,
} from "@/features/flight-search/types/flight";

export function buildFlightSearchApiUrl(criteria: SearchCriteria): string {
  const params = new URLSearchParams(criteria);
  return `/api/flights?${params.toString()}`;
}

export async function fetchFlightSearch(
  url: string,
): Promise<FlightSearchResponse> {
  const response = await fetch(url);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = ApiErrorResponseSchema.safeParse(payload);
    const message = apiError.success
      ? apiError.data.issues?.[0]?.message ?? apiError.data.message
      : `Flight search failed (${response.status}).`;

    throw new Error(message);
  }

  return FlightSearchResponseSchema.parse(payload);
}
