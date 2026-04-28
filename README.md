<div align="center">

# ✦ SiteSense

### AI-Powered Website Classifier

<img width="3334" height="1792" alt="image" src="https://github.com/user-attachments/assets/e411dab6-60cd-4501-8811-9380e01eeebc" />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-llama--3.1--8b-F55036?style=flat-square)
![Firecrawl](https://img.shields.io/badge/Firecrawl-scraping-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**Paste any URL and SiteSense scrapes the page and classifies it into one of four categories with a confidence score.**

[🛍 Ecommerce](#) · [👥 Social / UGC](#) · [📰 News / Media](#) · [⊞ Other](#)

</div>

---

## 📋 Prerequisites

Before starting, ensure you have:

| Requirement | Version | Link |
|-------------|---------|------|
| **Node.js** | 18 or newer | [Download](https://nodejs.org/) |
| **npm** | comes with Node.js | — |
| **Git** | any | [Download](https://git-scm.com/) *(optional)* |

---

## 🔑 Getting API Keys

### 1 · Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy and save it securely

### 2 · Firecrawl API Key

1. Visit [Firecrawl Dashboard](https://app.firecrawl.dev)
2. Sign up or log in
3. Go to **API Keys**
4. Create a new API key
5. Copy and save it securely

---

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone <repository-url>
cd website-classifier
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your environment file**
```bash
touch .env.local
```

**4. Add your API keys to `.env.local`**
```env
GROQ_API_KEY=your_groq_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

**5. Start the development server**
```bash
npm run dev
```

**6.** Open your browser at `http://localhost:3000`

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |

---

## ⚙️ How It Works

```
User enters URL
      │
      ▼
POST /api/classify
      │
      ├── 1. Scrape page content  ──▶  Firecrawl
      │
      ├── 2. Classify content     ──▶  Groq (llama-3.1-8b-instant)
      │
      └── 3. Return result
                │
                ▼
      ┌─────────────────────────┐
      │  Category               │
      │  Confidence Score 0–100%│
      │  AI Explanation         │
      │  Processing Time        │
      │  Cache Indicator        │
      └─────────────────────────┘
```

Results are **cached locally for 30 minutes** per URL to avoid repeated API calls.

---

## 🗂 Project Structure

```
website-classifier/
├── app/                  # Next.js App Router pages, layout,
│                         # global styles, and API route
├── lib/                  # Scraping, classification, caching,
│                         # and shared types
├── components/           # Reusable UI pieces
└── public/               # Static assets
```

---

## 🏗 Implementation Choices & Tradeoffs

<details>
<summary><strong>⚡ Why Groq?</strong></summary>

- **Speed** - Groq's inference is significantly faster than competitors, making classifications feel responsive
- **Accuracy** - llama-3.1-8b-instant provides strong accuracy for web classification without the cost of larger models
- **Cost** - Free tier is generous; suitable for a project without enterprise pricing

</details>

<details>
<summary><strong>💾 Client-Side Caching (localStorage)</strong></summary>

- **Why** - Avoids redundant API calls when classifying the same URL multiple times
- **Tradeoff** - localStorage is limited (~5MB per domain), but sufficient for URL classification history

</details>

<details>
<summary><strong>🎞 Framer Motion for Animations</strong></summary>

- **Why** - Provides smooths animations with minimal boilerplate
- **Tradeoff** - Adds ~40KB to bundle, but creates a more polished, professional feel

</details>

<details>
<summary><strong>🎨 CSS Custom Properties (Theme Switching)</strong></summary>

- **Why** - Allows instant category-based theming (background, borders, text color) with a single class toggle on the body
- **Tradeoff** - Requires more CSS variables upfront, but enables dynamic color switching without re-rendering

</details>

<details>
<summary><strong>🕷 Firecrawl for Web Scraping</strong></summary>

- **Why** - Handles JavaScript-heavy sites and returns structured markdown
- **Tradeoff** - Rate limits on free tier; some large pages may timeout

</details>

<details>
<summary><strong>🔒 API Route Pattern (/api/classify)</strong></summary>

- **Why** - Encapsulates API key usage server-side; prevents exposing keys to the frontend
- **Tradeoff** - Adds latency but essential for security

</details>

<details>
<summary><strong>🪝 React Hooks + TypeScript</strong></summary>

- **Why** - Type safety catches errors at compile time; hooks are simpler than class components
- **Tradeoff** - Requires understanding of useEffect dependencies and hook rules

</details>

---

## 🔧 Troubleshooting

### ❌ "Missing GROQ_API_KEY" or "Missing FIRECRAWL_API_KEY"
- Ensure your `.env.local` file exists in the project root
- Check that both keys are correctly copied (no extra spaces)
- Restart the dev server after adding/modifying keys:
  ```bash
  npm run dev
  ```

### ❌ Node.js version error
Check your Node.js version:
```bash
node --version
```
If it's below 18, [upgrade Node.js](https://nodejs.org/).

### ❌ API rate limits or timeouts
- Groq and Firecrawl have rate limits on free tiers
- Wait a few minutes and retry
- Consider upgrading your API plans for higher limits

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Fast Classification** | Uses Groq's fast LLM for quick inference |
| 🧠 **Smart Caching** | Stores results locally to avoid repeated API calls |
| 📊 **Confidence Scores** | Shows how confident the model is (0–100%) |
| 🛡 **Error Handling** | Clear error messages if URLs can't be scraped or classified |
| 📱 **Responsive UI** | Works on desktop and mobile |
| ⏳ **Loading States** | Visual feedback during processing |
| 🎞 **Animations** | Smooth transitions and entrance animations |

---

## 📝 Notes

> - The app requires **both** API keys to work
> - Test suite uses mock keys automatically, no real API calls during tests
> - Results are cached in **browser localStorage**
> - Each classification typically takes **2–10 seconds** depending on page size and API load

---

## 💻 Development

```bash
# Run tests in watch mode
npm run test:watch

# Lint the codebase
npm run lint

# Build and run for production
npm run build
npm run start
```

---

<div align="center">

Made with ✦ using **Next.js** · **Groq** · **Firecrawl**

</div>
