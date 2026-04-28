import FirecrawlApp from "@mendable/firecrawl-js";

// Checking if the API key exists before proceeding anything further
if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error("Missing FIRECRAWL_API_KEY");
}

// Initializing the Firecrawl app with the API key
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

// Defining what the scrapper will return. It will return a title and a cleaned text content
export interface ScraperResponse {
  title: string; 
  content: string;
}

// Defining the scraping function
export async function scrapeWebsite(url: string): Promise<ScraperResponse> {
  try {

    //Send URL to Firecrawl and get the response in a cleaned markdown format
    const response = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });

    // Extract the title and content from the response and fall back to the URL if not found
    const title = response.metadata?.title || url;

    // Get the main content from the response and limit the size for LLM efficiency
    const content = (response.markdown || "").slice(0, 5000);

    //if no content is found, throw an error
    if (!content) {
      throw new Error("No content found");
    }
    
    //return the scraped data
    return { title, content };
  } catch (error: any) {
    throw new Error(
      `Failed to scrape website: ${url} - ${error?.message || "Unknown error"}`
    );
  }
}