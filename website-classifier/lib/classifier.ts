import Groq from "groq-sdk";
import { ScraperResponse } from "./scraper";
import { Category, ClassifyResponse } from "./types";

// Checking if the API key exists before proceeding anything further
if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY");
}

// Initializing the Groq client with the API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//Simple in-memory cache for storing previous results
const cache = new Map<string, Omit<ClassifyResponse, "processingMs">>();

// Valid categories for classification
const VALID_CATEGORIES: Category[] = [
  "Ecommerce",
  "Social / UGC",
  "News / Media",
  "Other",
];

// Classify a page based on its URL and scraped content
export async function classifyPage(
  url: string,
  scraperResponse: ScraperResponse
): Promise<Omit<ClassifyResponse, "processingMs">> {
    // Clean URL for consistent cache key
  const key = url.toLowerCase().trim();
  // Check if the URL is already in the cache, returning directly
  if (cache.has(key)) {
    return { ...cache.get(key)!, cached: true };
  }

  const classifyPrompt = `You are a website classifier. Given the page content below, classify it into EXACTLY ONE category.

Categories:
- Ecommerce: online store, products, shopping cart, pricing, buy buttons
- Social / UGC: social network, user posts, forums, comments, profiles
- News / Media: journalism, articles, blog posts, news, press
- Other: anything that doesn't fit the above

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "category": "<category>",
  "explanation": "<one sentence why>",
  "confidence": <0-100>
}

URL: ${url}
Title: ${scraperResponse.title}
Content:
${scraperResponse.content}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: classifyPrompt }],
    temperature: 0.1,
    max_tokens: 150,
  });
  // Get the raw response from the LLM
  const raw = completion.choices[0]?.message?.content || "{}";

  // Try to convert the raw response to JSON
  let parsed: { category?: string; explanation?: string; confidence?: number } = {};
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw new Error("LLM returned malformed JSON — try again.");
  }
  // Validate the category(if the category is not valid, default to 'Other')
  if (!VALID_CATEGORIES.includes(parsed.category as Category)) {
    parsed.category = "Other";
  }

  // Create the result object
  const result: Omit<ClassifyResponse, "processingMs"> = {
    url,
    title: scraperResponse.title,
    category: parsed.category as Category,
    explanation: parsed.explanation || "No explanation provided.",
    confidence: Math.min(100, Math.max(0, parsed.confidence ?? 50)),
    cached: false,
  };
  // Store the result in the cache
  cache.set(key, result);
  // Return the result
  return result;
}