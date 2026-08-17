import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps } from "react-aria-components";
import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "text";

interface AppButtonProps extends Omit<ButtonProps, "children" | "className"> {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  text: styles.text,
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: AppButtonProps) {
  return (
    <AriaButton
      className={`${styles.button} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
