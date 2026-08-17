import type { ReactNode } from "react";
import styles from "./typography.module.css";

type TypographyElement = "h1" | "h2" | "p" | "span";
type TypographyVariant = "hero" | "heading" | "body" | "eyebrow";
type TypographyTone = "default" | "accent";

interface TypographyProps {
  as?: TypographyElement;
  children: ReactNode;
  className?: string;
  tone?: TypographyTone;
  variant: TypographyVariant;
}

const variantClasses: Record<TypographyVariant, string> = {
  hero: styles.hero,
  heading: styles.heading,
  body: styles.body,
  eyebrow: styles.eyebrow,
};

export function Typography({
  as: Element = "p",
  children,
  className = "",
  tone = "default",
  variant,
}: TypographyProps) {
  const toneClass = tone === "accent" ? styles.accent : "";

  return (
    <Element className={`${variantClasses[variant]} ${toneClass} ${className}`.trim()}>
      {children}
    </Element>
  );
}
