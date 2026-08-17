import { flightDuration, formatPrice, formatTime } from "@/features/flight-search/lib/flights";
import type { FlightOffer } from "@/features/flight-search/types/flight";
import { ActionLink } from "@/components/ui/action-link/action-link";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./flight-card.module.css";

interface FlightCardProps {
  offer: FlightOffer;
}

/** Pure presentational component: the complete card is determined by its props. */
export function FlightCard({ offer }: FlightCardProps) {
  const flight = offer.outboundFlight;

  return (
    <article className={styles.card}>
      <div className={styles.flightNumber}>
        <span className={styles.mark}><Icon name="plane" /></span>
        <div>
          <span>Transavia</span>
          <strong>{flight.marketingAirline.companyShortName}{flight.flightNumber}</strong>
        </div>
      </div>

      <div className={styles.journey}>
        <div className={styles.airportTime}>
          <strong>{formatTime(flight.departureDateTime)}</strong>
          <span>{flight.departureAirport.locationCode}</span>
        </div>
        <div className={styles.route}>
          <span>{flightDuration(flight.departureDateTime, flight.arrivalDateTime)}</span>
          <div><Icon name="plane" /></div>
          <small>Direct</small>
        </div>
        <div className={`${styles.airportTime} ${styles.arrival}`}>
          <strong>{formatTime(flight.arrivalDateTime)}</strong>
          <span>{flight.arrivalAirport.locationCode}</span>
        </div>
      </div>

      <div className={styles.price}>
        <span>From</span>
        <strong>
          {formatPrice(
            offer.pricingInfoSum.totalPriceAllPassengers,
            offer.pricingInfoSum.currencyCode,
          )}
        </strong>
        <small>total price</small>
      </div>

      <ActionLink className={styles.select} href={offer.deeplink.href} target="_blank" rel="noreferrer">
        Select
        <Icon name="arrow" />
      </ActionLink>
    </article>
  );
}
