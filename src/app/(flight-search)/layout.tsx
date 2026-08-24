import type { ReactNode } from "react";
import { FlightSearchConfigProvider } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import { getFlightSearchConfig } from "@/features/flight-search/server/flight-search-service";

export default function FlightSearchLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <FlightSearchConfigProvider config={getFlightSearchConfig()}>
      {children}
    </FlightSearchConfigProvider>
  );
}
