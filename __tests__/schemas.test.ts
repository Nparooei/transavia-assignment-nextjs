import { describe, expect, it } from "vitest";
import {
  FlightSearchResponseSchema,
  FlightSearchUrlStateSchema,
  SearchCriteriaSchema,
  createFlightSearchRouteStateSchema,
} from "@/features/flight-search/schemas/flight";

describe("flight API schemas", () => {
  it("accepts valid search criteria", () => {
    expect(
      SearchCriteriaSchema.safeParse({
        origin: "AMS",
        destination: "ALC",
        departureDate: "2022-11-10",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed search criteria", () => {
    expect(
      SearchCriteriaSchema.safeParse({
        origin: "amsterdam",
        destination: "ALC",
        departureDate: "10-11-2022",
      }).success,
    ).toBe(false);
  });

  it("accepts partial URL state and rejects unsafe URL values", () => {
    expect(
      FlightSearchUrlStateSchema.safeParse({
        origin: "AMS",
        destination: undefined,
        departureDate: undefined,
      }).success,
    ).toBe(true);

    expect(
      FlightSearchUrlStateSchema.safeParse({
        origin: "<script>",
        destination: "ALC",
        departureDate: "2022-12-01",
      }).success,
    ).toBe(false);
  });

  it.each([
    { name: "missing segments", input: { segments: undefined, departureDate: undefined } },
    {
      name: "extra segments",
      input: { segments: ["AMS", "ALC", "unexpected"], departureDate: undefined },
    },
    {
      name: "duplicate date parameters",
      input: {
        segments: ["AMS", "ALC"],
        departureDate: ["2022-11-10", "2022-11-11"],
      },
    },
  ])("rejects raw route input with $name", ({ input }) => {
    const schema = createFlightSearchRouteStateSchema();
    expect(schema.safeParse(input).success).toBe(false);
  });

  it.each([
    {
      name: "an unsupported origin",
      criteria: { origin: "RTM", destination: "ALC", departureDate: "2022-11-10" },
    },
    {
      name: "the same origin and destination",
      criteria: { origin: "AMS", destination: "AMS", departureDate: "2022-11-10" },
    },
    {
      name: "a date outside the supplied range",
      criteria: { origin: "AMS", destination: "ALC", departureDate: "2022-12-01" },
    },
  ])("rejects $name", ({ criteria }) => {
    expect(SearchCriteriaSchema.safeParse(criteria).success).toBe(false);
  });

  it("rejects a response containing an invalid flight price", () => {
    const result = FlightSearchResponseSchema.safeParse({
      flights: [
        {
          outboundFlight: {
            id: "flight-1",
            departureDateTime: "2022-11-10T06:45:00",
            arrivalDateTime: "2022-11-10T09:25:00",
            marketingAirline: { companyShortName: "HV" },
            flightNumber: 6143,
            departureAirport: { locationCode: "AMS" },
            arrivalAirport: { locationCode: "ALC" },
          },
          pricingInfoSum: {
            totalPriceAllPassengers: "50.70",
            currencyCode: "EUR",
            productClass: "Basic",
          },
          deeplink: { href: "https://example.com/book" },
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([
        "flights",
        0,
        "pricingInfoSum",
        "totalPriceAllPassengers",
      ]);
    }
  });
});
