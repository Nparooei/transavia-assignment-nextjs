import type { Airport, FlightOffer, SearchCriteria } from "@/features/flight-search/types/flight";

export function airportLabel(airport: Airport): string {
  return `${airport.ItemName} — ${airport.Description}`;
}

export function resolveAirportCode(value: string, airports: Airport[]): string | null {
  const normalized = value.trim().toLocaleLowerCase();

  const match = airports.find((airport) => {
    return (
      airport.ItemName.toLocaleLowerCase() === normalized ||
      airport.AirportName.toLocaleLowerCase() === normalized ||
      airport.Description.toLocaleLowerCase() === normalized ||
      airportLabel(airport).toLocaleLowerCase() === normalized
    );
  });

  return match?.ItemName ?? null;
}

export function searchFlights(
  flights: FlightOffer[],
  criteria: SearchCriteria,
): FlightOffer[] {
  return flights
    .filter((offer) => {
      const flight = offer.outboundFlight;

      return (
        flight.departureAirport.locationCode === criteria.origin &&
        flight.arrivalAirport.locationCode === criteria.destination &&
        flight.departureDateTime.slice(0, 10) === criteria.departureDate
      );
    })
    .sort((a, b) =>
      a.outboundFlight.departureDateTime.localeCompare(
        b.outboundFlight.departureDateTime,
      ),
    );
}

export function formatTime(dateTime: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateTime));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function flightDuration(departure: string, arrival: string): string {
  const minutes = Math.round(
    (new Date(arrival).getTime() - new Date(departure).getTime()) / 60_000,
  );
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
}
