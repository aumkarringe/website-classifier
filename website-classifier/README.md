# SiteSense: Website Classifier

A Next.js app that scrapes a URL and classifies the page into one of four categories using Groq and Firecrawl.

## Prerequisites

Before starting, ensure you have:

- **Node.js 18 or newer** — [Download here](https://nodejs.org/)
- **npm** — comes with Node.js
- **Git** — [Download here](https://git-scm.com/) (optional, for cloning the repo)

## Getting API Keys

### 1. Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy and save it securely

### 2. Firecrawl API Key

1. Visit [Firecrawl Dashboard](https://app.firecrawl.dev)
2. Sign up or log in
3. Go to **API Keys**
4. Create a new API key
5. Copy and save it securely

## Installation & Setup

1. Clone the repository (or download the source):

```bash
git clone <repository-url>
cd website-classifier
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root:

```bash
touch .env.local
```

4. Add your API keys to `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint
- `npm run test` - run the Jest test suite
- `npm run test:watch` - run Jest in watch mode

## How It Works

1. Enter a website URL in the input box
2. Click "Classify" or press Enter
3. The app sends the URL to `POST /api/classify`
4. The API:
   - Scrapes the page content using Firecrawl
   - Sends the content to Groq's LLM (llama-3.1-8b-instant)
   - Returns category, confidence score, and explanation
5. Results are cached locally for 30 minutes per URL
6. Results display with:
   - Detected website category (Ecommerce, Social/UGC, News/Media, or Other)
   - Confidence score (0–100%)
   - AI-generated explanation
   - Processing time
   - Cache indicator (if cached)

## Project Structure

- `app/` - Next.js App Router pages, layout, global styles, and API route
- `lib/` - scraping, classification, caching, and shared types
- `components/` - reusable UI pieces
- `public/` - static assets

## Troubleshooting

### "Missing GROQ_API_KEY" or "Missing FIRECRAWL_API_KEY"

- Ensure your `.env.local` file exists in the project root
- Check that both keys are correctly copied (no extra spaces)
- Restart the dev server after adding/modifying keys: `npm run dev`

### Port 3000 is already in use

Kill the existing process or use a different port:

```bash
npm run dev -- -p 3001
```

### Node.js version error

Check your Node.js version:

```bash
node --version
```

If it's below 18, [upgrade Node.js](https://nodejs.org/).

### API rate limits or timeouts

- Groq and Firecrawl have rate limits on free tiers
- Wait a few minutes and retry
- Consider upgrading your API plans for higher limits

## Features

- **Fast Classification** — Uses Groq's fast LLM for quick inference
- **Smart Caching** — Stores results locally to avoid repeated API calls
- **Confidence Scores** — Shows how confident the model is (0–100%)
- **Error Handling** — Clear error messages if URLs can't be scraped or classified
- **Responsive UI** — Works on desktop and mobile
- **Loading States** — Visual feedback during processing
- **Animations** — Smooth transitions and entrance animations

## Implementation Choices & Tradeoffs

### Why Groq?
- **Speed**: Groq's inference is significantly faster than competitors, making classifications feel responsive
- **Accuracy**: llama-3.1-8b-instant provides strong accuracy for web classification without the cost of larger models
- **Cost**: Free tier is generous; suitable for a take-home project without enterprise pricing

### Client-Side Caching (localStorage)
- **Why**: Avoids redundant API calls when classifying the same URL multiple times
- **Tradeoff**: localStorage is limited (around 5MB per domain), but sufficient for URL classification history

### Framer Motion for Animations
- **Why**: Provides smooth, performant animations with minimal boilerplate.
- **Tradeoff**: Adds ~40KB to bundle, but creates a more polished, professional feel

### CSS Custom Properties (Theme Switching)
- **Why**: Allows instant category-based theming (background, borders, text color) with a single class toggle on the body
- **Tradeoff**: Requires more CSS variables upfront, but enables dynamic color switching without re-rendering

### Firecrawl for Web Scraping
- **Why**: Handles JavaScript-heavy sites, respects robots.txt, returns structured markdown
- **Tradeoff**: Rate limits on free tier; some large pages may timeout

### API Route Pattern (`/api/classify`)
- **Why**: Encapsulates API key usage server-side; prevents exposing keys to the frontend
- **Tradeoff**: Adds latency but essential for security

### React Hooks + TypeScript
- **Why**: Type safety catches errors at compile time; hooks are simpler than class components
- **Tradeoff**: Requires understanding of useEffect dependencies and hook rules

## Notes

- The app requires both API keys to work
- Test suite uses mock keys automatically (no real API calls during tests)
- Results are cached in browser localStorage
- Each classification request typically takes 2–10 seconds depending on page size and API load

## Development

To run tests with watch mode:

```bash
npm run test:watch
```

To lint the codebase:

```bash
npm run lint
```

To build for production:

```bash
npm run build
npm run start
```
