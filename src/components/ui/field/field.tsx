import type { ReactNode } from "react";
import { Label } from "react-aria-components";
import styles from "./field.module.css";

interface FieldProps {
  children: ReactNode;
  className?: string;
  label: ReactNode;
}

interface InputShellProps {
  children: ReactNode;
  className?: string;
}

export function Field({ children, className = "", label }: FieldProps) {
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      <Label className={styles.label}>{label}</Label>
      {children}
    </div>
  );
}

export function InputShell({ children, className = "" }: InputShellProps) {
  return <div className={`${styles.inputShell} ${className}`.trim()}>{children}</div>;
}
