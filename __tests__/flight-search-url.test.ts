import { describe, expect, it } from "vitest";
import { buildFlightSearchUrl } from "@/features/flight-search/lib/flight-search-url";
import type { FlightSearchUrlState } from "@/features/flight-search/types/flight";

describe("flight search URLs", () => {
  it("keeps airports in the path and the departure date in the query", () => {
    expect(
      buildFlightSearchUrl({
        origin: "AMS",
        destination: "ALC",
        departureDate: "2022-11-20",
      }),
    ).toBe("/flights/AMS/ALC?departureDate=2022-11-20");
  });

  it("supports incomplete form state without placeholder segments", () => {
    expect(buildFlightSearchUrl({ origin: "AMS" })).toBe("/flights/AMS");
    expect(buildFlightSearchUrl({})).toBe("/");
  });

  it("validates its input at runtime", () => {
    expect(() =>
      buildFlightSearchUrl({ origin: "ams" } as FlightSearchUrlState),
    ).toThrow();
  });
});
