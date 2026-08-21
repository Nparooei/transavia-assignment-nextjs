import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SWRConfig } from "swr";
import { FlightSearchConfigProvider } from "@/features/flight-search/components/flight-search-config-provider/flight-search-config-provider";
import { FlightSearchPage } from "@/features/flight-search/components/flight-search-page/flight-search-page";
import type {
  Airport,
  FlightOffer,
  FlightSearchConfig,
} from "@/features/flight-search/types/flight";

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
    <SWRConfig value={{ provider: () => new Map() }}>
      <FlightSearchConfigProvider config={flightSearchConfig}>
        <FlightSearchPage {...props} />
      </FlightSearchConfigProvider>
    </SWRConfig>
  );
}

describe("FlightSearchPage", () => {
  const browserFetch = vi.fn();

  beforeEach(() => {
    browserFetch.mockReset();
    browserFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      return new Response(
        JSON.stringify({ flights: url.includes("destination=BCN") ? [] : flights }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", browserFetch);
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

    expect(screen.getByRole("heading", { name: "Where will you go next?" })).toBeInTheDocument();
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

  it("resets local draft and validation state when the initial route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ConfiguredPage />);

    await user.type(screen.getByRole("combobox", { name: "Destination" }), "Atlantis");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Search flights" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a valid airport");

    rerender(
      <ConfiguredPage initialUrlState={alcCriteria} />,
    );

    expect(screen.getByRole("combobox", { name: "Origin" })).toHaveValue(
      "AMS — Amsterdam (Schiphol), Netherlands",
    );
    expect(screen.getByRole("combobox", { name: "Destination" })).toHaveValue(
      "ALC — Alicante, Spain",
    );
    expect(screen.getByLabelText("Departure date")).toHaveValue("2022-11-10");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(await screen.findByText("HV6143")).toBeInTheDocument();
  });

  it("fetches a complete initial search through the flight API route", async () => {
    render(<ConfiguredPage initialUrlState={alcCriteria} />);

    expect(await screen.findByText("HV6143")).toBeInTheDocument();
    expect(browserFetch).toHaveBeenCalledOnce();
    expect(browserFetch).toHaveBeenCalledWith(
      "/api/flights?origin=AMS&destination=ALC&departureDate=2022-11-10",
    );
  });

  it("keeps edits local, updates the URL, and calls the API on submit", async () => {
    const user = userEvent.setup();
    render(<ConfiguredPage />);

    await user.click(screen.getByRole("combobox", { name: "Origin" }));
    await user.keyboard("{ArrowDown}{Enter}");
    await user.type(screen.getByRole("combobox", { name: "Destination" }), "ALC");
    await user.keyboard("{ArrowDown}{Enter}");
    await user.clear(screen.getByLabelText("Departure date"));
    await user.type(screen.getByLabelText("Departure date"), "2022-11-20");

    expect(window.location.pathname).toBe("/");
    expect(browserFetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Search flights" }));

    await waitFor(() =>
      expect(browserFetch).toHaveBeenCalledWith(
        "/api/flights?origin=AMS&destination=ALC&departureDate=2022-11-20",
      ),
    );
    expect(window.location.pathname).toBe("/flights/AMS/ALC");
    expect(window.location.search).toBe("?departureDate=2022-11-20");
  });

  it("shows matching flights returned by the API", async () => {
    render(<ConfiguredPage initialUrlState={alcCriteria} />);

    expect(await screen.findByRole("heading", { name: "Amsterdam to Alicante" })).toBeInTheDocument();
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

  it("renders a helpful empty state when the API returns no matching flight", async () => {
    const criteria = { ...alcCriteria, destination: "BCN" };
    render(<ConfiguredPage initialUrlState={criteria} />);

    expect(await screen.findByText("No matching flights")).toBeInTheDocument();
  });

  it("prefills the example without replacing the committed results", async () => {
    const user = userEvent.setup();
    const criteria = { ...alcCriteria, destination: "BCN" };
    render(<ConfiguredPage initialUrlState={criteria} />);

    const destinationInput = screen.getByRole("combobox", { name: "Destination" });
    expect(await screen.findByRole("heading", { name: "No matching flights" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use an available example" }));

    expect(screen.getByRole("combobox", { name: "Origin" })).toHaveValue(
      "AMS — Amsterdam (Schiphol), Netherlands",
    );
    expect(destinationInput).toHaveValue("ALC — Alicante, Spain");
    expect(screen.getByLabelText("Departure date")).toHaveValue("2022-11-10");
    await waitFor(() => expect(destinationInput).toHaveFocus());
    // Focusing the React Aria combobox temporarily hides outside content from the accessibility tree.
    expect(screen.getByText("No matching flights")).toBeInTheDocument();
    expect(browserFetch).toHaveBeenCalledOnce();
  });

  it("revalidates when the already-current search is submitted again", async () => {
    const user = userEvent.setup();
    render(<ConfiguredPage initialUrlState={alcCriteria} />);

    expect(await screen.findByText("HV6143")).toBeInTheDocument();
    expect(browserFetch).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Search flights" }));

    await waitFor(() => expect(browserFetch).toHaveBeenCalledTimes(2));
    expect(screen.getByText("HV6143")).toBeInTheDocument();
  });
});
