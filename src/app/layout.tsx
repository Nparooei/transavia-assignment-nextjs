import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageFooter } from "@/components/layout/page-footer/page-footer";
import { PageHeader } from "@/components/layout/page-header/page-header";
import layoutStyles from "@/components/layout/page-layout/page-layout.module.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight finder | Transavia",
  description: "Find available Transavia flights from Amsterdam.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <div className={layoutStyles.page}>
          <PageHeader />
          <main>{children}</main>
          <PageFooter />
        </div>
      </body>
    </html>
  );
}
