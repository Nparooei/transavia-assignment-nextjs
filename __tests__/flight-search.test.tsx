import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlightSearchConfigProvider } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import { FlightSearchPage } from "@/features/flight-search/components/flight-search-page/flight-search-page";
import type {
  Airport,
  FlightOffer,
  FlightSearchConfig,
} from "@/features/flight-search/types/flight";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const airports: Airport[] = [
  { ItemName: "AMS", AirportName: "Amsterdam (Schiphol)", Description: "Amsterdam (Schiphol), Netherlands" },
  { ItemName: "ALC", AirportName: "Alicante", Description: "Alicante, Spain" },
  { ItemName: "BCN", AirportName: "Barcelona", Description: "Barcelona, Spain" },
];

const flights: FlightOffer[] = [
  {
    outboundFlight: {
      id: "AMSALC20221110HV6143",
      departureDateTime: "2022-11-10T06:45:00",
      arrivalDateTime: "2022-11-10T09:25:00",
      marketingAirline: { companyShortName: "HV" },
      flightNumber: 6143,
      departureAirport: { locationCode: "AMS" },
      arrivalAirport: { locationCode: "ALC" },
    },
    pricingInfoSum: {
      totalPriceAllPassengers: 50.7,
      currencyCode: "EUR",
      productClass: "Basic",
    },
    deeplink: { href: "https://example.com/book" },
  },
];

const destinationCodes = ["ALC", "BCN"];
const flightSearchConfig: FlightSearchConfig = {
  airports,
  destinationCodes,
  minDate: "2022-11-10",
  maxDate: "2022-11-30",
};
const alcCriteria = {
  origin: "AMS" as const,
  destination: "ALC",
  departureDate: "2022-11-10",
};

function ConfiguredPage(props: ComponentProps<typeof FlightSearchPage>) {
  return (
    <FlightSearchConfigProvider config={flightSearchConfig}>
      <FlightSearchPage {...props} />
    </FlightSearchConfigProvider>
  );
}

describe("FlightSearchPage", () => {
  beforeEach(() => {
    push.mockReset();
    window.history.replaceState({}, "", "/");
  });

  it("has no detectable accessibility violations in its initial state", async () => {
    const { container } = render(<ConfiguredPage />);

    const results = await axe.run(container, {
      rules: {
        // JSDOM does not calculate visual contrast; this remains a browser audit concern.
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("renders all required fields and the dataset guidance", () => {
    render(<ConfiguredPage />);

    expect(screen.getByRole("combobox", { name: "Origin" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Destination" })).toBeInTheDocument();
    expect(screen.getByLabelText("Departure date")).toBeInTheDocument();
    expect(screen.getByText(/Available data: departures from Amsterdam/)).toBeInTheDocument();
  });

  it("restores valid selections from the URL-derived initial state", () => {
    render(
      <ConfiguredPage
        initialUrlState={{
          origin: "AMS",
          destination: "ALC",
          departureDate: "2022-11-20",
        }}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Origin" })).toHaveValue(
      "AMS — Amsterdam (Schiphol), Netherlands",
    );
    expect(screen.getByRole("combobox", { name: "Destination" })).toHaveValue(
      "ALC — Alicante, Spain",
    );
    expect(screen.getByLabelText("Departure date")).toHaveValue("2022-11-20");
  });

  it("resets local draft and validation state when the committed route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ConfiguredPage />);

    await user.type(screen.getByRole("combobox", { name: "Destination" }), "Atlantis");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Search flights" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a valid airport");

    rerender(
      <ConfiguredPage
        initialUrlState={alcCriteria}
        initialSearchState={{ criteria: alcCriteria, results: flights }}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Origin" })).toHaveValue(
      "AMS — Amsterdam (Schiphol), Netherlands",
    );
    expect(screen.getByRole("combobox", { name: "Destination" })).toHaveValue(
      "ALC — Alicante, Spain",
    );
    expect(screen.getByLabelText("Departure date")).toHaveValue("2022-11-10");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("HV6143")).toBeInTheDocument();
  });

  it("renders server-provided results without a browser API request", () => {
    const browserFetch = vi.fn();
    vi.stubGlobal("fetch", browserFetch);

    render(
      <ConfiguredPage
        initialUrlState={alcCriteria}
        initialSearchState={{ criteria: alcCriteria, results: flights }}
      />,
    );

    expect(screen.getByText("HV6143")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(browserFetch).not.toHaveBeenCalled();
  });

  it("keeps edits local and navigates once with the complete submitted search", async () => {
    const user = userEvent.setup();
    render(<ConfiguredPage />);

    await user.click(screen.getByRole("combobox", { name: "Origin" }));
    await user.keyboard("{ArrowDown}{Enter}");
    await user.type(screen.getByRole("combobox", { name: "Destination" }), "ALC");
    await user.keyboard("{ArrowDown}{Enter}");
    await user.clear(screen.getByLabelText("Departure date"));
    await user.type(screen.getByLabelText("Departure date"), "2022-11-20");

    expect(window.location.pathname).toBe("/");
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Search flights" }));

    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith(
      "/flights/AMS/ALC?departureDate=2022-11-20",
      { scroll: false },
    );
  });

  it("shows server-derived matching flights on the navigated page", () => {
    render(
      <ConfiguredPage
        initialUrlState={alcCriteria}
        initialSearchState={{ criteria: alcCriteria, results: flights }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Amsterdam to Alicante" })).toBeInTheDocument();
    expect(screen.getByText("HV6143")).toBeInTheDocument();
    expect(screen.getByText(/€50\.70/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Select/ })).toHaveAttribute("href", "https://example.com/book");
  });

  it("validates unknown airports", async () => {
    const user = userEvent.setup();
    render(<ConfiguredPage />);

    await user.type(screen.getByRole("combobox", { name: "Destination" }), "Atlantis");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Search flights" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a valid airport");
  });

  it("renders a helpful empty state when no flight matches", () => {
    const criteria = { ...alcCriteria, destination: "BCN" };
    render(
      <ConfiguredPage
        initialUrlState={criteria}
        initialSearchState={{ criteria, results: [] }}
      />,
    );

    expect(screen.getByText("No matching flights")).toBeInTheDocument();
  });

  it("prefills the example without replacing the committed results", async () => {
    const user = userEvent.setup();
    const criteria = { ...alcCriteria, destination: "BCN" };
    render(
      <ConfiguredPage
        initialUrlState={criteria}
        initialSearchState={{ criteria, results: [] }}
      />,
    );

    const destinationInput = screen.getByRole("combobox", { name: "Destination" });
    expect(screen.getByRole("heading", { name: "No matching flights" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use an available example" }));

    expect(screen.getByRole("combobox", { name: "Origin" })).toHaveValue(
      "AMS — Amsterdam (Schiphol), Netherlands",
    );
    expect(destinationInput).toHaveValue("ALC — Alicante, Spain");
    expect(screen.getByLabelText("Departure date")).toHaveValue("2022-11-10");
    await waitFor(() => expect(destinationInput).toHaveFocus());
    // Focusing the React Aria combobox temporarily hides outside content from the accessibility tree.
    expect(screen.getByText("No matching flights")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("keeps results visible when submitting the already-current search URL", async () => {
    const user = userEvent.setup();
    render(
      <ConfiguredPage
        initialUrlState={alcCriteria}
        initialSearchState={{ criteria: alcCriteria, results: flights }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Search flights" }));

    expect(push).toHaveBeenCalledWith(
      "/flights/AMS/ALC?departureDate=2022-11-10",
      { scroll: false },
    );
    expect(screen.getByText("HV6143")).toBeInTheDocument();
  });
});
