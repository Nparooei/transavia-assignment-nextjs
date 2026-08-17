"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FlightSearchConfig } from "@/features/flight-search/types/flight";

const FlightSearchConfigContext = createContext<FlightSearchConfig | null>(null);

interface FlightSearchConfigProviderProps {
  children: ReactNode;
  config: FlightSearchConfig;
}

export function FlightSearchConfigProvider({
  children,
  config,
}: FlightSearchConfigProviderProps) {
  return (
    <FlightSearchConfigContext.Provider value={config}>
      {children}
    </FlightSearchConfigContext.Provider>
  );
}

export function useFlightSearchConfig(): FlightSearchConfig {
  const config = useContext(FlightSearchConfigContext);
  if (!config) {
    throw new Error("FlightSearchConfigProvider is required.");
  }
  return config;
}
