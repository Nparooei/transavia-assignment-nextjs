import { expect, type Locator, type Page } from "@playwright/test";

export class FlightSearchPage {
  readonly origin: Locator;
  readonly destination: Locator;
  readonly departureDate: Locator;
  readonly submit: Locator;

  constructor(readonly page: Page) {
    this.origin = page.getByRole("combobox", { name: "Origin" });
    this.destination = page.getByRole("combobox", { name: "Destination" });
    this.departureDate = page.getByLabel("Departure date");
    this.submit = page.getByRole("button", { name: "Search flights" });
  }

  async goto() {
    const response = await this.page.goto("/");
    await expect(this.origin).toBeVisible();
    return response;
  }

  async chooseAirport(field: Locator, code: string) {
    await field.fill(code);
    await field.press("ArrowDown");
    await field.press("Enter");
  }

  async search({
    origin,
    destination,
    departureDate,
  }: {
    origin: string;
    destination: string;
    departureDate: string;
  }) {
    await this.chooseAirport(this.origin, origin);
    await this.chooseAirport(this.destination, destination);
    await this.departureDate.fill(departureDate);
    await this.submit.click();
  }
}
