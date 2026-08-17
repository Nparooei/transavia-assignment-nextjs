import { describe, expect, it } from "vitest";
import {
  flightDuration,
  formatPrice,
  resolveAirportCode,
  searchFlights,
} from "@/features/flight-search/lib/flights";
import type { Airport, FlightOffer } from "@/features/flight-search/types/flight";

const airports: Airport[] = [
  { ItemName: "AMS", AirportName: "Amsterdam", Description: "Amsterdam, Netherlands" },
  { ItemName: "ALC", AirportName: "Alicante", Description: "Alicante, Spain" },
];

function offer(id: string, destination: string, departureDateTime: string): FlightOffer {
  return {
    outboundFlight: {
      id,
      departureDateTime,
      arrivalDateTime: departureDateTime.replace("08:00", "10:40"),
      marketingAirline: { companyShortName: "HV" },
      flightNumber: 100,
      departureAirport: { locationCode: "AMS" },
      arrivalAirport: { locationCode: destination },
    },
    pricingInfoSum: {
      totalPriceAllPassengers: 50.7,
      currencyCode: "EUR",
      productClass: "Basic",
    },
    deeplink: { href: "https://example.com" },
  };
}

describe("flight search logic", () => {
  it("resolves an airport from its code, city name, or display label", () => {
    expect(resolveAirportCode("ams", airports)).toBe("AMS");
    expect(resolveAirportCode("Alicante", airports)).toBe("ALC");
    expect(resolveAirportCode("ALC — Alicante, Spain", airports)).toBe("ALC");
    expect(resolveAirportCode("Unknown", airports)).toBeNull();
  });

  it("matches all criteria and sorts matching flights by departure", () => {
    const flights = [
      offer("late", "ALC", "2022-11-10T08:00:00"),
      offer("wrong-destination", "BCN", "2022-11-10T07:00:00"),
      offer("early", "ALC", "2022-11-10T06:00:00"),
      offer("wrong-date", "ALC", "2022-11-11T08:00:00"),
    ];

    const result = searchFlights(flights, {
      origin: "AMS",
      destination: "ALC",
      departureDate: "2022-11-10",
    });

    expect(result.map((flight) => flight.outboundFlight.id)).toEqual(["early", "late"]);
  });

  it("formats the total price and calculates duration", () => {
    expect(formatPrice(58.7, "EUR")).toMatch(/€58\.70/);
    expect(flightDuration("2022-11-10T06:45:00", "2022-11-10T09:25:00")).toBe("2h 40m");
  });
});
