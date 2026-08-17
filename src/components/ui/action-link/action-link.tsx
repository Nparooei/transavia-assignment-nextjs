import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-aria-components";
import styles from "./action-link.module.css";

interface ActionLinkProps extends Omit<LinkProps, "children" | "className"> {
  children: ReactNode;
  className?: string;
}

export function ActionLink({ children, className = "", ...props }: ActionLinkProps) {
  return (
    <Link className={`${styles.link} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}
