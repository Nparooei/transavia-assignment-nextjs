import { expect, test } from "@playwright/test";

test.describe("flight route validation", () => {
  test("returns a 404 for malformed route state", async ({ page }) => {
    const response = await page.goto("/flights/AMS/ALC/EXTRA");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("This page could not be found.")).toBeVisible();
  });

  test("returns a 404 for an invalid departure date", async ({ page }) => {
    const response = await page.goto(
      "/flights/AMS/ALC?departureDate=2022-12-01",
    );

    expect(response?.status()).toBe(404);
  });

  for (const { name, url } of [
    {
      name: "an unsupported origin",
      url: "/flights/RTM/ALC?departureDate=2022-11-10",
    },
    {
      name: "identical airports",
      url: "/flights/AMS/AMS?departureDate=2022-11-10",
    },
    {
      name: "an unavailable destination",
      url: "/flights/AMS/EIN?departureDate=2022-11-10",
    },
  ]) {
    test(`returns a 404 for ${name}`, async ({ page }) => {
      const response = await page.goto(url);

      expect(response?.status()).toBe(404);
      await expect(page.getByText("This page could not be found.")).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Origin" })).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Check your search" })).toHaveCount(0);
    });
  }

  test("keeps an available search with no matching flights as a valid page", async ({ page }) => {
    const response = await page.goto(
      "/flights/AMS/AMM?departureDate=2022-11-11",
    );

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "No matching flights" })).toBeVisible();
  });
});
