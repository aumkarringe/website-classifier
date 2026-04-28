import { describe, expect, it, jest } from "@jest/globals";
import Groq from "groq-sdk";
import { classifyPage } from "@/lib/classifier";

jest.mock("groq-sdk", () => {
  const createMock = jest.fn();
  const GroqMock = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: createMock,
      },
    },
  }));

  return {
    __esModule: true,
    default: GroqMock,
    __mockCreate: createMock,
  };
});

const createMock = (jest.requireMock("groq-sdk") as { __mockCreate: jest.Mock }).__mockCreate;

const mockScrape = {
  title: "Amazon - Online Shopping",
  content: "Buy products online. Add to cart. Checkout. Free shipping on orders over $25.",
};

describe("classifyPage", () => {
  it("returns a valid category", async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "Ecommerce",
              explanation: "It looks like an online store.",
              confidence: 95,
            }),
          },
        },
      ],
    } as never);

    const result = await classifyPage("https://amazon.com", mockScrape);
    const valid = ["Ecommerce", "Social / UGC", "News / Media", "Other"];
    expect(valid).toContain(result.category);
  });

  it("returns confidence between 0 and 100", async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "Ecommerce",
              explanation: "It looks like an online store.",
              confidence: 95,
            }),
          },
        },
      ],
    } as never);

    const result = await classifyPage("https://amazon.com", mockScrape);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it("returns an explanation string", async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "Ecommerce",
              explanation: "It looks like an online store.",
              confidence: 95,
            }),
          },
        },
      ],
    } as never);

    const result = await classifyPage("https://amazon.com", mockScrape);
    expect(typeof result.explanation).toBe("string");
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it("returns cached: true on second call with same URL", async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "Ecommerce",
              explanation: "It looks like an online store.",
              confidence: 95,
            }),
          },
        },
      ],
    } as never);

    await classifyPage("https://cached-test.com", mockScrape);
    const second = await classifyPage("https://cached-test.com", mockScrape);
    expect(second.cached).toBe(true);
  });

  it("returns cached: false on first call", async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "Ecommerce",
              explanation: "It looks like an online store.",
              confidence: 95,
            }),
          },
        },
      ],
    } as never);

    const result = await classifyPage("https://fresh-url-xyz.com", mockScrape);
    expect(result.cached).toBe(false);
  });
});