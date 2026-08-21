import { beforeEach, describe, expect, it, vi } from "vitest";
import FlightsPage from "@/app/flights/[[...search]]/page";

const navigation = vi.hoisted(() => ({
  notFound: vi.fn((): never => {
    throw new Error("TEST_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: navigation.notFound,
}));

function routeProps(search?: string[], departureDate?: string) {
  return {
    params: Promise.resolve({ search }),
    searchParams: Promise.resolve(
      departureDate === undefined ? {} : { departureDate },
    ),
  };
}

describe("flights page URL boundary", () => {
  beforeEach(() => {
    navigation.notFound.mockClear();
  });

  it.each([
    {
      name: "a malformed origin",
      search: ["AMSTERDAM", "ALC"],
      departureDate: "2022-11-10",
    },
    {
      name: "too many route segments",
      search: ["AMS", "ALC", "EXTRA"],
      departureDate: "2022-11-10",
    },
    {
      name: "an out-of-range date",
      search: ["AMS", "ALC"],
      departureDate: "2022-12-01",
    },
    {
      name: "an unsupported origin",
      search: ["RTM", "ALC"],
      departureDate: "2022-11-10",
    },
    {
      name: "identical airports",
      search: ["AMS", "AMS"],
      departureDate: "2022-11-10",
    },
    {
      name: "an unavailable destination",
      search: ["AMS", "EIN"],
      departureDate: "2022-11-10",
    },
  ])("rejects a URL with $name", async ({ search, departureDate }) => {
    await expect(
      FlightsPage(routeProps(search, departureDate)),
    ).rejects.toThrow("TEST_NOT_FOUND");
    expect(navigation.notFound).toHaveBeenCalledOnce();
  });

  it("passes a valid complete URL to the client without resolving results", async () => {
    const page = await FlightsPage(
      routeProps(["AMS", "ALC"], "2022-11-10"),
    );

    expect(navigation.notFound).not.toHaveBeenCalled();
    expect(page).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          initialUrlState: {
            origin: "AMS",
            destination: "ALC",
            departureDate: "2022-11-10",
          },
        }),
      }),
    );
    expect(page.props).not.toHaveProperty("initialSearchState");
  });

  it("keeps a partial URL as an editable, unsearched page", async () => {
    const page = await FlightsPage(routeProps(["AMS", "ALC"]));

    expect(navigation.notFound).not.toHaveBeenCalled();
    expect(page.props).not.toHaveProperty("initialSearchState");
    expect(page.props.initialUrlState).toEqual({
      origin: "AMS",
      destination: "ALC",
      departureDate: undefined,
    });
  });
});
