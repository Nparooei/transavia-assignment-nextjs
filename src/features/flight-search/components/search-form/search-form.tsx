import type { RefObject, SyntheticEvent } from "react";
import { Form } from "react-aria-components";
import type { Airport } from "@/features/flight-search/types/flight";
import { AirportComboBox } from "@/features/flight-search/components/airport-combo-box/airport-combo-box";
import { Button } from "@/components/ui/button/button";
import { DateInput } from "@/components/ui/date-input/date-input";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./search-form.module.css";

interface SearchFormProps {
  airports: Airport[];
  destinationAirports: Airport[];
  origin: string;
  destination: string;
  destinationInputRef: RefObject<HTMLInputElement | null>;
  departureDate: string;
  minDate: string;
  maxDate: string;
  isLoading: boolean;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onDepartureDateChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export function SearchForm({
  airports,
  destinationAirports,
  origin,
  destination,
  destinationInputRef,
  departureDate,
  minDate,
  maxDate,
  isLoading,
  onOriginChange,
  onDestinationChange,
  onDepartureDateChange,
  onSubmit,
}: SearchFormProps) {
  return (
    <Form className={styles.form} onSubmit={onSubmit} validationBehavior="aria">
      <AirportComboBox
        airports={airports}
        label="Origin"
        name="origin"
        placeholder="Airport or city"
        value={origin}
        onChange={onOriginChange}
      />
      <AirportComboBox
        airports={destinationAirports}
        label="Destination"
        name="destination"
        placeholder="Where do you want to go?"
        inputRef={destinationInputRef}
        value={destination}
        onChange={onDestinationChange}
      />
      <DateInput
        label="Departure date"
        min={minDate}
        max={maxDate}
        name="departureDate"
        value={departureDate}
        onChange={onDepartureDateChange}
      />
      <Button className={styles.submit} type="submit" isPending={isLoading}>
        {isLoading ? "Searching…" : "Search flights"}
        <Icon name="arrow" />
      </Button>
    </Form>
  );
}
