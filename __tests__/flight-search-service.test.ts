import { describe, expect, it } from "vitest";
import {
  getFlightSearchConfig,
  resolveFlightSearchCriteria,
} from "@/features/flight-search/server/flight-search-service";

describe("flight search server service", () => {
  it("provides validated static configuration", () => {
    const config = getFlightSearchConfig();

    expect(config.airports).toEqual(
      expect.arrayContaining([expect.objectContaining({ ItemName: "AMS" })]),
    );
    expect(config.destinationCodes).toHaveLength(41);
    expect(new Set(config.destinationCodes).size).toBe(config.destinationCodes.length);
    expect(config.minDate).toBe("2022-11-10");
    expect(config.maxDate).toBe("2022-11-30");
  });

  it("returns matching flights for available criteria", () => {
    const result = resolveFlightSearchCriteria({
      origin: "AMS",
      destination: "ALC",
      departureDate: "2022-11-10",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(2);
      expect(result.data.results.map((offer) => offer.outboundFlight.id)).toEqual([
        "AMSALC20221110HV6143",
        "AMSALC20221110HV6145",
      ]);
    }
  });

  it("returns a serializable validation error for an unavailable destination", () => {
    const result = resolveFlightSearchCriteria({
      origin: "AMS",
      destination: "EIN",
      departureDate: "2022-11-10",
    });

    expect(result).toEqual({
      success: false,
      error: {
        message: "Invalid flight search criteria.",
        issues: [
          {
            field: "destination",
            message: "Destination is not available in the supplied flight data.",
          },
        ],
      },
    });
  });
});
