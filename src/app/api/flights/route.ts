import { NextRequest, NextResponse } from "next/server";
import { FlightSearchResponseSchema } from "@/features/flight-search/schemas/flight";
import {
  getFlightSearchConfig,
  resolveFlightSearchQuery,
} from "@/features/flight-search/server/flight-search-service";

export function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.size === 0) {
    return NextResponse.json(getFlightSearchConfig());
  }

  const result = resolveFlightSearchQuery({
    origin: request.nextUrl.searchParams.getAll("origin"),
    destination: request.nextUrl.searchParams.getAll("destination"),
    departureDate: request.nextUrl.searchParams.getAll("departureDate"),
  });

  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 });
  }

  return NextResponse.json(
    FlightSearchResponseSchema.parse({ flights: result.data.results }),
  );
}
