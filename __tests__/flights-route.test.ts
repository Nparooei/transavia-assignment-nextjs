import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/flights/route";

function request(query: string) {
  return new NextRequest(`http://localhost/api/flights?${query}`);
}

describe("GET /api/flights server validation", () => {
  it("returns static search configuration without flight results", async () => {
    const response = GET(request(""));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.airports).toEqual(
      expect.arrayContaining([expect.objectContaining({ ItemName: "AMS" })]),
    );
    expect(body.destinationCodes).toContain("ALC");
    expect(body).not.toHaveProperty("flights");
  });

  it("returns validated matching flights for valid criteria", async () => {
    const response = GET(
      request("origin=AMS&destination=ALC&departureDate=2022-11-10"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.flights).toHaveLength(2);
    expect(body).not.toHaveProperty("airports");
    expect(body).not.toHaveProperty("destinationCodes");
  });

  it.each([
    ["unsupported origin", "origin=RTM&destination=ALC&departureDate=2022-11-10", "origin"],
    ["same airports", "origin=AMS&destination=AMS&departureDate=2022-11-10", "destination"],
    ["unavailable destination", "origin=AMS&destination=JFK&departureDate=2022-11-10", "destination"],
    ["out-of-range date", "origin=AMS&destination=ALC&departureDate=2022-12-01", "departureDate"],
    ["duplicate origin", "origin=AMS&origin=RTM&destination=ALC&departureDate=2022-11-10", "origin"],
  ])("rejects %s", async (_name, query, invalidField) => {
    const response = GET(request(query));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid flight search criteria.");
    expect(body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: invalidField })]),
    );
  });
});
