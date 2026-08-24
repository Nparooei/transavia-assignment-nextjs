import { z } from "zod";
import { AirportCodeSchema } from "@/features/flight-search/schemas/flight";

export const FLIGHT_DATA_MIN_DATE = "2022-11-10";
export const FLIGHT_DATA_MAX_DATE = "2022-11-30";

export const SearchCriteriaSchema = z
  .strictObject({
    origin: z.literal("AMS", { error: "Choose AMS as the origin." }),
    destination: AirportCodeSchema,
    departureDate: z.iso.date({ error: "Choose a valid departure date." }),
  })
  .refine(({ origin, destination }) => origin !== destination, {
    message: "Origin and destination must be different.",
    path: ["destination"],
  })
  .refine(
    ({ departureDate }) =>
      departureDate >= FLIGHT_DATA_MIN_DATE &&
      departureDate <= FLIGHT_DATA_MAX_DATE,
    {
      message: `Departure date must be between ${FLIGHT_DATA_MIN_DATE} and ${FLIGHT_DATA_MAX_DATE}.`,
      path: ["departureDate"],
    },
  );

export const SearchDateSchema = z
  .iso.date()
  .refine(
    (date) => date >= FLIGHT_DATA_MIN_DATE && date <= FLIGHT_DATA_MAX_DATE,
    `Date must be between ${FLIGHT_DATA_MIN_DATE} and ${FLIGHT_DATA_MAX_DATE}.`,
  );

/** Safe state accepted from bookmarkable route segments and URL parameters. */
export const FlightSearchUrlStateSchema = z
  .strictObject({
    origin: AirportCodeSchema.optional(),
    destination: AirportCodeSchema.optional(),
    departureDate: SearchDateSchema.optional(),
  })
  .refine(({ origin, destination }) => !destination || Boolean(origin), {
    message: "A destination requires an origin.",
    path: ["destination"],
  })
  .refine(
    ({ origin, destination, departureDate }) =>
      !departureDate || Boolean(origin && destination),
    {
      message: "A departure date requires both airports.",
      path: ["departureDate"],
    },
  );

const SingleQueryValueSchema = z.tuple([z.string()]).transform(([value]) => value);

/** Parses raw URLSearchParams values and rejects missing or duplicate parameters. */
export const SearchCriteriaQuerySchema = z
  .strictObject({
    origin: SingleQueryValueSchema,
    destination: SingleQueryValueSchema,
    departureDate: SingleQueryValueSchema,
  })
  .pipe(SearchCriteriaSchema);

/** Parses the raw optional catch-all segments before any values can be discarded. */
export function createFlightSearchRouteStateSchema() {
  const RouteSegmentsSchema = z.union([
    z.tuple([AirportCodeSchema]),
    z.tuple([AirportCodeSchema, AirportCodeSchema]),
  ]);

  return z
    .strictObject({
      segments: RouteSegmentsSchema,
      departureDate: SearchDateSchema.optional(),
    })
    .refine(
      ({ segments, departureDate }) => !departureDate || segments.length === 2,
      {
        message: "A departure date requires both airports.",
        path: ["departureDate"],
      },
    )
    .transform(({ segments, departureDate }) => ({
      origin: segments[0],
      destination: segments[1],
      departureDate,
    }));
}

export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export type FlightSearchUrlState = z.infer<typeof FlightSearchUrlStateSchema>;
