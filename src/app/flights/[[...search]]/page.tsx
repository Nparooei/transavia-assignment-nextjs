import { notFound } from "next/navigation";
import { FlightSearchPage } from "@/features/flight-search/components/flight-search-page/flight-search-page";
import { createFlightSearchRouteStateSchema } from "@/features/flight-search/schemas/flight";
import { validateFlightSearchCriteria } from "@/features/flight-search/server/flight-search-service";

interface FlightsPageProps {
  params: Promise<{ search?: string[] }>;
  searchParams: Promise<{ departureDate?: string | string[] }>;
}

const FlightSearchRouteStateSchema = createFlightSearchRouteStateSchema();

export default async function FlightsPage({ params, searchParams }: FlightsPageProps) {
  const [{ search }, { departureDate }] = await Promise.all([params, searchParams]);
  const result = FlightSearchRouteStateSchema.safeParse({
    segments: search,
    departureDate,
  });

  if (!result.success) notFound();

  if (
    result.data.departureDate &&
    !validateFlightSearchCriteria(result.data).success
  ) {
    notFound();
  }

  return <FlightSearchPage initialUrlState={result.data} />;
}
