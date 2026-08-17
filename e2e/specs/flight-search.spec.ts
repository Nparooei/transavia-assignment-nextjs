import { expect, test, type Page } from "@playwright/test";
import { FlightSearchPage } from "../pages/flight-search.page";

function trackBrowserFlightApiRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/flights") {
      requests.push(request.url());
    }
  });
  return requests;
}

test.describe("flight search", () => {
  test("renders the search form without a browser API request", async ({ page }) => {
    const browserApiRequests = trackBrowserFlightApiRequests(page);
    const search = new FlightSearchPage(page);
    await search.goto();

    await expect(search.origin).toHaveValue(/AMS.*Amsterdam/);
    await expect(search.destination).toHaveValue("");
    await expect(search.departureDate).toHaveValue("2022-11-10");
    expect(browserApiRequests).toEqual([]);
  });

  test("submits a complete search and renders matching flights", async ({ page }) => {
    const browserApiRequests = trackBrowserFlightApiRequests(page);
    const search = new FlightSearchPage(page);
    const homeResponse = await search.goto();
    expect(homeResponse).not.toBeNull();
    expect(await homeResponse?.text()).toContain("Aalborg, Denmark");
    const navigationPayload = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === "/flights/AMS/ALC" &&
        url.searchParams.has("_rsc")
      );
    });
    await search.search({
      origin: "AMS",
      destination: "ALC",
      departureDate: "2022-11-10",
    });

    const navigationBody = await (await navigationPayload).text();

    await expect(page).toHaveURL(
      /\/flights\/AMS\/ALC\?departureDate=2022-11-10$/,
    );
    await expect(page.getByRole("heading", { name: "Amsterdam to Alicante" })).toBeVisible();
    await expect(page.getByText("HV6143")).toBeVisible();
    await expect(page.getByText("HV6145")).toBeVisible();
    expect(browserApiRequests).toEqual([]);
    expect(navigationBody).not.toContain("Aalborg, Denmark");
  });

  test("restores the committed search after a hard refresh", async ({ page }) => {
    const browserApiRequests = trackBrowserFlightApiRequests(page);
    const search = new FlightSearchPage(page);
    await page.goto("/flights/AMS/ALC?departureDate=2022-11-10");
    await expect(search.destination).toHaveValue(/ALC.*Alicante/);

    await page.reload();

    await expect(search.origin).toHaveValue(/AMS.*Amsterdam/);
    await expect(search.destination).toHaveValue(/ALC.*Alicante/);
    await expect(search.departureDate).toHaveValue("2022-11-10");
    await expect(page.getByText("HV6143")).toBeVisible();
    expect(browserApiRequests).toEqual([]);
  });

  test("hydrates ComboBox options in a newly opened tab", async ({ context }) => {
    const page = await context.newPage();
    const clientFailures: string[] = [];
    page.on("pageerror", (error) => clientFailures.push(error.message));
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).pathname.startsWith("/_next/")) {
        clientFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
      }
    });
    page.on("response", (response) => {
      if (
        new URL(response.url()).pathname.startsWith("/_next/") &&
        response.status() >= 400
      ) {
        clientFailures.push(`${response.url()}: HTTP ${response.status()}`);
      }
    });

    try {
      await page.goto("/flights/AMS/ALC?departureDate=2022-11-10");

      await expect(page.getByRole("combobox", { name: "Origin" })).toHaveValue(
        /AMS.*Amsterdam/,
      );
      await expect(page.getByRole("combobox", { name: "Destination" })).toHaveValue(
        /ALC.*Alicante/,
      );

      const options = page.getByRole("option");
      const originTrigger = page.getByRole("button", {
        name: "Show origin options",
      });
      await expect
        .poll(async () => {
          if ((await options.count()) === 0) await originTrigger.click();
          return { failures: [...clientFailures], options: await options.count() };
        })
        .toEqual({ failures: [], options: 202 });

      await page.keyboard.press("Escape");
      const destinationTrigger = page.getByRole("button", {
        name: "Show destination options",
      });
      await expect
        .poll(async () => {
          if ((await options.count()) === 0) await destinationTrigger.click();
          return { failures: [...clientFailures], options: await options.count() };
        })
        .toEqual({ failures: [], options: 41 });

      expect(clientFailures).toEqual([]);
    } finally {
      await page.close();
    }
  });

  test("renders a complete search without client JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    try {
      await page.goto("/flights/AMS/ALC?departureDate=2022-11-10");

      await expect(page.getByRole("combobox", { name: "Origin" })).toHaveValue(
        /AMS.*Amsterdam/,
      );
      await expect(page.getByRole("heading", { name: "Amsterdam to Alicante" })).toBeVisible();
      await expect(page.getByText("HV6143")).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
