import { z } from "zod";

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

export type Airport = z.infer<typeof AirportSchema>;
export type AirportsResponse = z.infer<typeof AirportsResponseSchema>;
export type FlightOffer = z.infer<typeof FlightOfferSchema>;
export type FlightsResponse = z.infer<typeof FlightsResponseSchema>;
