import { beforeEach, describe, expect, it, vi } from "vitest";
import FlightsPage from "@/app/flights/[[...search]]/page";

const navigation = vi.hoisted(() => ({
  notFound: vi.fn((): never => {
    throw new Error("TEST_NOT_FOUND");
  }),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: navigation.notFound,
  useRouter: () => ({ push: navigation.push }),
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
      name: "an unsupported origin",
      search: ["RTM", "ALC"],
    },
    {
      name: "identical airports",
      search: ["AMS", "AMS"],
    },
    {
      name: "an unavailable destination",
      search: ["AMS", "EIN"],
    },
  ])("rejects a complete URL with $name", async ({ search }) => {
    await expect(
      FlightsPage(routeProps(search, "2022-11-10")),
    ).rejects.toThrow("TEST_NOT_FOUND");
    expect(navigation.notFound).toHaveBeenCalledOnce();
  });

  it("resolves a valid complete URL once and passes its results to the page", async () => {
    const page = await FlightsPage(
      routeProps(["AMS", "ALC"], "2022-11-10"),
    );

    expect(navigation.notFound).not.toHaveBeenCalled();
    expect(page).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          initialSearchState: expect.objectContaining({
            criteria: {
              origin: "AMS",
              destination: "ALC",
              departureDate: "2022-11-10",
            },
            results: expect.arrayContaining([
              expect.objectContaining({
                outboundFlight: expect.objectContaining({
                  id: "AMSALC20221110HV6143",
                }),
              }),
            ]),
          }),
        }),
      }),
    );
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
