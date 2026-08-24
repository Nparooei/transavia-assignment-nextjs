import { z } from "zod";
import {
  AirportCodeSchema,
  AirportSchema,
  FlightOfferSchema,
} from "@/features/flight-search/schemas/flight";
import {
  FLIGHT_DATA_MAX_DATE,
  FLIGHT_DATA_MIN_DATE,
} from "@/features/flight-search/schemas/search";

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

export type FlightSearchResponse = z.infer<typeof FlightSearchResponseSchema>;
export type FlightSearchConfig = z.infer<typeof FlightSearchConfigSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
