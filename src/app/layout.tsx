import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FlightSearchConfigProvider } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import { getFlightSearchConfig } from "@/features/flight-search/server/flight-search-service";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight finder | Transavia",
  description: "Find available Transavia flights from Amsterdam.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <FlightSearchConfigProvider config={getFlightSearchConfig()}>
          {children}
        </FlightSearchConfigProvider>
      </body>
    </html>
  );
}
