import { Input, TextField } from "react-aria-components";
import { Field, InputShell } from "../field/field";
import { Icon } from "../icon/icon";
import dateStyles from "./date-input.module.css";

interface DateInputProps {
  label: string;
  max: string;
  min: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ label, max, min, name, value, onChange }: DateInputProps) {
  return (
    <TextField
      className={dateStyles.field}
      isRequired
      name={name}
      type="date"
      value={value}
      onChange={onChange}
    >
      <Field label={label}>
        <InputShell>
          <Icon name="calendar" />
          <Input min={min} max={max} />
        </InputShell>
      </Field>
    </TextField>
  );
}
