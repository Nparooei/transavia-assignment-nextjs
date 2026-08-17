import {
  Button as AriaButton,
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";
import type { RefObject } from "react";
import { airportLabel } from "@/features/flight-search/lib/flights";
import type { Airport } from "@/features/flight-search/types/flight";
import { Icon } from "@/components/ui/icon/icon";
import { Field, InputShell } from "@/components/ui/field/field";
import comboStyles from "./airport-combo-box.module.css";

interface AirportComboBoxProps {
  airports: Airport[];
  label: string;
  name: string;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export function AirportComboBox({
  airports,
  label,
  name,
  placeholder,
  inputRef,
  value,
  onChange,
}: AirportComboBoxProps) {
  function selectAirport(key: Key | null) {
    const airport = airports.find((item) => item.ItemName === key);
    if (airport) {
      onChange(airportLabel(airport));
    }
  }

  return (
    <ComboBox
      className={comboStyles.combo}
      inputValue={value}
      onInputChange={onChange}
      onChange={selectAirport}
      allowsCustomValue
      isRequired
      menuTrigger="focus"
      name={name}
    >
      <Field label={label}>
        <InputShell>
          <Icon name="pin" />
          <Input ref={inputRef} placeholder={placeholder} autoComplete="off" />
          <AriaButton className={comboStyles.trigger} aria-label={`Show ${label.toLowerCase()} options`}>
            <Icon name="chevron" />
          </AriaButton>
        </InputShell>
      </Field>
      <Popover className={comboStyles.popover}>
        <ListBox className={comboStyles.list} items={airports}>
          {(airport) => (
            <ListBoxItem
              className={comboStyles.option}
              id={airport.ItemName}
              textValue={airportLabel(airport)}
            >
              <strong>{airport.ItemName}</strong>
              <span>{airport.Description}</span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}
