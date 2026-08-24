import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/(flight-search)/flights/[[...search]]/page";

describe("flights page metadata", () => {
  it("uses the route airport names in the page title", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ search: ["AMS", "ALC"] }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Flights from Amsterdam to Alicante | Transavia");
  });
});
