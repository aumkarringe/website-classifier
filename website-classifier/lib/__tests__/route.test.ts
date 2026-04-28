import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { POST } from "@/app/api/classify/route";

// Mock the scraper and classifier so tests are deterministic
const mockScrape: any = jest.fn();
const mockClassify: any = jest.fn();

jest.mock("@/lib/scraper", () => ({
  __esModule: true,
  scrapeWebsite: (...args: any[]) => mockScrape(...args),
}));

jest.mock("@/lib/classifier", () => ({
  __esModule: true,
  classifyPage: (...args: any[]) => mockClassify(...args),
}));

function makeReqLike(body: object) {
  return ({ json: async () => body } as unknown) as any;
}

describe("POST /api/classify", () => {
  beforeEach(() => {
    mockScrape.mockReset();
    mockClassify.mockReset();
  });

  it("returns 400 if no URL provided", async () => {
    const res = await POST(makeReqLike({} as any));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid URL format", async () => {
    const res = await POST(makeReqLike({ url: "not a url!!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 200 with valid URL", async () => {
    mockScrape.mockResolvedValueOnce({ title: "Example", markdown: "content" });
    mockClassify.mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example",
      category: "Ecommerce",
      explanation: "Reason",
      confidence: 90,
      cached: false,
    });

    const res = await POST(makeReqLike({ url: "https://example.com" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.category).toBeDefined();
    expect(data.explanation).toBeDefined();
    expect(data.confidence).toBeDefined();
    expect(data.processingMs).toBeDefined();
  });

  it("auto-prepends https:// if missing", async () => {
    mockScrape.mockResolvedValueOnce({ title: "Example", markdown: "content" });
    mockClassify.mockResolvedValueOnce({
      url: "https://example.com",
      title: "Example",
      category: "Ecommerce",
      explanation: "Reason",
      confidence: 90,
      cached: false,
    });

    const res = await POST(makeReqLike({ url: "example.com" }));
    const data = await res.json();
    expect(data.url).toMatch(/^https:\/\//);
  });
});