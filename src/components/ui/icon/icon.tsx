import type { SVGProps } from "react";

export type IconName = "arrow" | "calendar" | "chevron" | "pin" | "plane";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
}

/** Decorative application icon. Meaningful labels belong on the parent control. */
export function Icon({ name, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {name === "plane" && (
        <path
          d="m3.5 13.2 7.1 1.1 3.9 6.2 1.8-.6-1.7-6.5 4.5-1.4c1.5-.5 2.3-1.5 1.9-2.6-.4-1.2-1.7-1.4-3.2-.9l-4.5 1.4-2.5-6.2-1.8.6.5 7.3-6.6 2.2.6-.6Z"
          fill="currentColor"
        />
      )}
      {name === "pin" && (
        <>
          <path
            d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 3v4m10-4v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
      {name === "arrow" && (
        <path
          d="M5 12h14m-5-5 5 5-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === "chevron" && (
        <path
          d="m7 9 5 5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
