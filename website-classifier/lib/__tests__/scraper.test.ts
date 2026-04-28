import { describe, expect, it, jest } from "@jest/globals";

const scrapeMock: any = jest.fn();

jest.mock("@mendable/firecrawl-js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      scrape: scrapeMock,
    })),
  };
});

import { scrapeWebsite } from "@/lib/scraper";

describe("scrapeWebsite", () => {
  it("returns title and content from Firecrawl", async () => {
    scrapeMock.mockResolvedValueOnce({
      metadata: { title: "Example Domain" },
      markdown: "Example content for testing.",
    });

    const result = await scrapeWebsite("https://example.com");
    expect(typeof result.title).toBe("string");
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.title).toBe("Example Domain");
    expect(result.content).toBe("Example content for testing.");
  });

  it("throws when Firecrawl returns no content", async () => {
    scrapeMock.mockResolvedValueOnce({
      metadata: { title: "Empty" },
      markdown: "",
    });

    await expect(scrapeWebsite("https://example.com")).rejects.toThrow(
      "Failed to scrape website"
    );
  });

  it("trims content to 5000 chars max", async () => {
    scrapeMock.mockResolvedValueOnce({
      metadata: { title: "Long Page" },
      markdown: "a".repeat(6000),
    });

    const result = await scrapeWebsite("https://example.com");
    expect(result.content.length).toBeLessThanOrEqual(5000);
  });
});