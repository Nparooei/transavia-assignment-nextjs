import { z } from "zod";

export const FLIGHT_DATA_MIN_DATE = "2022-11-10";
export const FLIGHT_DATA_MAX_DATE = "2022-11-30";

export const AirportCodeSchema = z
  .string({ error: "Choose a valid airport." })
  .regex(/^[A-Z]{3}$/, "Airport codes must contain three uppercase letters.");

const localDateTimeSchema = z.iso.datetime({ local: true });

export const AirportSchema = z.strictObject({
  ItemName: AirportCodeSchema,
  AirportName: z.string().min(1),
  Description: z.string().min(1),
});

export const AirportsResponseSchema = z
  .strictObject({
    Airports: z.array(AirportSchema).min(1),
  })
  .refine(
    ({ Airports }) =>
      new Set(Airports.map((airport) => airport.ItemName)).size === Airports.length,
    {
      message: "Airport codes must be unique.",
      path: ["Airports"],
    },
  )
  .refine(({ Airports }) => Airports.some(({ ItemName }) => ItemName === "AMS"), {
    message: "The supported AMS origin must exist.",
    path: ["Airports"],
  });

export const FlightOfferSchema = z.strictObject({
  outboundFlight: z.strictObject({
    id: z.string().min(1),
    departureDateTime: localDateTimeSchema,
    arrivalDateTime: localDateTimeSchema,
    marketingAirline: z.strictObject({
      companyShortName: z.string().min(1),
    }),
    flightNumber: z.number().int().positive(),
    departureAirport: z.strictObject({ locationCode: AirportCodeSchema }),
    arrivalAirport: z.strictObject({ locationCode: AirportCodeSchema }),
  }),
  pricingInfoSum: z.strictObject({
    totalPriceAllPassengers: z.number().nonnegative(),
    totalPriceOnePassenger: z.number().nonnegative().optional(),
    baseFare: z.number().nonnegative().optional(),
    taxSurcharge: z.number().nonnegative().optional(),
    currencyCode: z.string().regex(/^[A-Z]{3}$/),
    productClass: z.string().min(1),
  }),
  deeplink: z.strictObject({ href: z.url().startsWith("https://") }),
});

export const FlightsResponseSchema = z
  .strictObject({
    resultSet: z.strictObject({ count: z.number().int().nonnegative() }),
    flightOffer: z.array(FlightOfferSchema),
  })
  .refine(({ resultSet, flightOffer }) => resultSet.count === flightOffer.length, {
    message: "Result count must match the number of flight offers.",
    path: ["resultSet", "count"],
  });

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

export const FlightSearchResponseSchema = z.strictObject({
  flights: z.array(FlightOfferSchema),
});

export const FlightSearchConfigSchema = z.strictObject({
  airports: z.array(AirportSchema).min(1),
  destinationCodes: z.array(AirportCodeSchema),
  minDate: z.literal(FLIGHT_DATA_MIN_DATE),
  maxDate: z.literal(FLIGHT_DATA_MAX_DATE),
});

export const ApiErrorResponseSchema = z.strictObject({
  message: z.string().min(1),
  issues: z
    .array(
      z.strictObject({
        field: z.string(),
        message: z.string().min(1),
      }),
    )
    .optional(),
});

export type Airport = z.infer<typeof AirportSchema>;
export type AirportsResponse = z.infer<typeof AirportsResponseSchema>;
export type FlightOffer = z.infer<typeof FlightOfferSchema>;
export type FlightsResponse = z.infer<typeof FlightsResponseSchema>;
export type SearchCriteria = z.infer<typeof SearchCriteriaSchema>;
export type FlightSearchResponse = z.infer<typeof FlightSearchResponseSchema>;
export type FlightSearchConfig = z.infer<typeof FlightSearchConfigSchema>;
export type FlightSearchUrlState = z.infer<typeof FlightSearchUrlStateSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
