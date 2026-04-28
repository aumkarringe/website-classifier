import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { classifyPage } from "@/lib/classifier";

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const scraperResponse = await scrapeWebsite(parsedUrl.toString());
    const classification = await classifyPage(parsedUrl.toString(), scraperResponse);

    return NextResponse.json({
      ...classification,
      processingMs: Date.now() - start,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}