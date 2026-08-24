import type { FlightSearchUrlState } from "@/features/flight-search/types/flight";
import { FlightSearchUrlStateSchema } from "@/features/flight-search/schemas/search";

export function buildFlightSearchUrl(state: FlightSearchUrlState): string {
  const { origin, destination, departureDate } = FlightSearchUrlStateSchema.parse(state);
  const segments = origin ? ["flights", origin] : [];
  if (origin && destination) segments.push(destination);

  const pathname = segments.length
    ? `/${segments.map(encodeURIComponent).join("/")}`
    : "/";
  const params = new URLSearchParams();
  if (departureDate) params.set("departureDate", departureDate);

  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
