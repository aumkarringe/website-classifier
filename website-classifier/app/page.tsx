"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClassifyResponse, ClassifyError, Category } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const CATEGORY_META: Record<Category, { theme: string; icon: string; label: string; sub: string }> = {
  "Ecommerce":    { theme: "Ecommerce",    icon: "🛍", label: "Ecommerce",    sub: "Stores & products" },
  "Social / UGC": { theme: "Social / UGC", icon: "👥", label: "Social / UGC", sub: "Communities & feeds" },
  "News / Media": { theme: "News / Media", icon: "📰", label: "News / Media", sub: "Articles & reporting" },
  "Other":        { theme: "Other",        icon: "⊞",  label: "Other",        sub: "Everything else" },
};

const CATEGORY_COLOR: Record<Category, string> = {
  "Ecommerce":    "hsl(var(--cat-ecommerce))",
  "Social / UGC": "hsl(var(--cat-social))",
  "News / Media": "hsl(var(--cat-news))",
  "Other":        "hsl(var(--cat-other))",
};

const CATEGORY_CARD_CLASS: Record<Category, string> = {
  "Ecommerce":    "card-ecommerce",
  "Social / UGC": "card-social",
  "News / Media": "card-news",
  "Other":        "card-other",
};

const themeMap: Record<Category, string> = {
  "Ecommerce":    "theme-ecommerce",
  "Social / UGC": "theme-social",
  "News / Media": "theme-news",
  "Other":        "theme-other",
};

const QUICK_TRIES = ["amazon.com", "reddit.com", "bbc.com", "stripe.com"];
const ALL_CATEGORIES: Category[] = ["Ecommerce", "Social / UGC", "News / Media", "Other"];

export default function Home() {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ClassifyResponse | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [history, setHistory] = useState<ClassifyResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme switcher
  useEffect(() => {
    document.body.classList.remove(...Object.values(themeMap));
    if (result) {
      document.body.classList.add(themeMap[result.category]);
    }
  }, [result]);

  // Torchlight — track cursor position as CSS vars
  useEffect(() => {
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  async function handleClassify(submitUrl?: string) {
    const target = (submitUrl ?? url).trim();
    if (!target || loading) return;
    if (submitUrl) setUrl(submitUrl);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      const data: ClassifyResponse | ClassifyError = await res.json();

      if (!res.ok || "error" in data) {
  const rawError = "error" in data ? data.error : null;

  const cleanError =
    rawError?.includes("We apologize") || rawError?.includes("enterprise")
      ? "This website cannot be processed. Please try another URL."
      : rawError ?? "Classification failed.";

  setError(cleanError);
} else {
        const classified = data as ClassifyResponse;
        setResult(classified);
        setHistory(prev => {
          const filtered = prev.filter(h => h.url !== classified.url);
          return [classified, ...filtered].slice(0, 5);
        });
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setError(null);
    document.body.classList.remove(...Object.values(themeMap));
    inputRef.current?.focus();
  }

  const meta     = result ? CATEGORY_META[result.category] : null;
  const catColor = result ? CATEGORY_COLOR[result.category] : null;

  const domain = result?.url
    ? (() => { try { return new URL(result.url).hostname.replace("www.", ""); } catch { return result.url; } })()
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-transparent">

      {/* Torchlight overlay */}
      <div className="torch-overlay" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4"
        style={{
          borderBottom: "1px solid hsl(var(--border) / 0.2)",
          background: "hsl(var(--background) / 0.7)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 6 }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
            className="logo-badge"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>✦</span>
          </motion.div>
          <span className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            SiteSense
          </span>
        </div>
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          AI URL classifier
        </span>
      </motion.nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 pt-24 md:pt-32 pb-16 gap-6 md:gap-8 max-w-3xl mx-auto w-full">

        {/* Status pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 flex-wrap justify-center"
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
          >
            <span>✦</span>
            <span>AI Website Classifier</span>
          </div>
          {history.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
            >
              <span>▤</span>
              <span>{history.length} cached</span>
              <button
                onClick={() => setHistory([])}
                className="ml-1 hover:opacity-60 transition-opacity"
              >
                🗑
              </button>
            </div>
          )}
        </motion.div>

        {/* Hero heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-heading font-bold tracking-tight leading-tight text-center break-words w-full"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 5.5rem)",
            color: catColor ?? "hsl(var(--foreground))",
          }}
        >
          Understand any Website instantly
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base font-medium text-center max-w-md leading-relaxed -mt-2 md:-mt-4 px-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Paste any URL and we'll scrape the page and classify it into one
          of four categories with a confidence score.
        </motion.p>

        {/* Input bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full space-y-3"
        >
          <div
            className="flex items-center gap-0 rounded-2xl overflow-hidden w-full"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border) / 0.5)",
              boxShadow: catColor
  ? `0 0 0 1px rgba(255,255,255,0.18), 0 0 22px 4px rgba(255,255,255,0.12), 0 0 0 1px ${catColor}32, 0 14px 40px rgba(2,6,23,0.35)`
  : "0 0 0 1px rgba(255,255,255,0.16), 0 0 22px 4px rgba(255,255,255,0.12), 0 14px 40px rgba(2,6,23,0.35)",
              transition: "box-shadow 0.7s ease",
            }}
          >
            {/* Globe icon */}
            <div className="px-3 md:px-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClassify()}
              placeholder="https://example.com"
              className="flex-1 bg-transparent text-sm outline-none py-3 md:py-4 min-w-0"
              style={{ color: "hsl(var(--foreground))" }}
            />

            {url && !loading && (
              <button
                onClick={handleReset}
                className="px-2 md:px-3 text-xs transition-opacity hover:opacity-60 shrink-0"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                ✕
              </button>
            )}

            {/* Classify button */}
            <button
              onClick={() => handleClassify()}
              disabled={!url.trim() || loading}
              className="btn-classify px-4 md:px-6 py-3 md:py-4 text-sm font-semibold shrink-0 rounded-xl m-1.5 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              style={{
                background: catColor ?? "hsl(var(--foreground))",
                color: "hsl(var(--background))",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin-smooth w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span className="hidden sm:inline">Analyzing</span>
                </span>
              ) : "Classify"}
            </button>
          </div>

          <AnimatePresence>
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center px-2"
              >
                <span className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Try:</span>
                {QUICK_TRIES.map((site) => (
                  <button
                    key={site}
                    onClick={() => handleClassify(site)}
                    className="px-2.5 md:px-3 py-1 rounded-full text-xs transition-all duration-150 hover:opacity-95 active:scale-95 glass"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {site}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full rounded-2xl px-4 md:px-5 py-4 text-sm flex items-start gap-2"
    style={{
      background: "rgba(234, 179, 8, 0.12)", // yellow
      border: "1px solid rgba(234, 179, 8, 0.4)",
      color: "#f6ff45",
    }}
          >
            ⚠ {error}
          </motion.div>
        )}

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-3 animate-pulse"
            >
              <div
                className="rounded-2xl p-4 md:p-6 space-y-4"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border) / 0.5)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(var(--muted))" }} />
                  <div className="h-3 w-24 rounded" style={{ background: "hsl(var(--muted))" }} />
                </div>
                <div className="h-3 w-3/4 rounded" style={{ background: "hsl(var(--muted))" }} />
                <div className="h-px w-full" style={{ background: "hsl(var(--border) / 0.4)" }} />
                <div className="h-3 w-16 rounded" style={{ background: "hsl(var(--muted))" }} />
                <div className="h-8 w-32 rounded-full" style={{ background: "hsl(var(--muted))" }} />
                <div className="h-1.5 w-full rounded-full" style={{ background: "hsl(var(--muted))" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result card */}
        <AnimatePresence>
          {result && meta && catColor && (
            <motion.div
              className="w-full space-y-3 animate-fade-in-up"
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "hsl(var(--card))",
                  border: `1px solid ${catColor}40`,
                  boxShadow: `0 0 60px -20px ${catColor}44`,
                }}
              >
                {/* Domain + title */}
                <div
                  className="px-4 md:px-6 py-4 md:py-5 space-y-1"
                  style={{ borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
                      {domain}
                    </span>
                  </div>
                  <p className="text-sm pl-5 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {result.title}
                  </p>
                </div>

                {/* Category + confidence */}
                <div className="px-4 md:px-6 py-4 md:py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs uppercase tracking-widest font-medium"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      Category
                    </span>
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {result.confidence}% confidence
                    </span>
                  </div>

                  {/* Category pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45 }}
                    className="inline-flex items-center gap-3 category-badge"
                    style={{
                      background: `${catColor}22`,
                      border: `1px solid ${catColor}50`,
                      color: catColor,
                    }}
                  >
                    <motion.span
                      className="category-dot"
                      style={{ background: catColor }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-sm font-semibold">{result.category}</span>
                  </motion.div>

                  {/* Confidence bar */}
                  <motion.div
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  <Progress
    value={result.confidence}
    className="h-2 rounded-full overflow-hidden"
  />
</motion.div>
                </div>

                {/* Explanation box */}
                <motion.div
                  className="mx-3 md:mx-6 mb-4 md:mb-6 explanation-box"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                >
                  <p
                    className="text-xs uppercase tracking-widest font-medium mb-2"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Explanation:
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "hsl(var(--foreground) / 0.85)" }}
                  >
                    {result.explanation}
                  </p>
                </motion.div>

                {/* Footer */}
                <div
                  className="px-4 md:px-6 py-3 flex items-center justify-between text-xs gap-2"
                  style={{
                    borderTop: "1px solid hsl(var(--border) / 0.3)",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  <span className="shrink-0">{result.cached ? "⚡ Cached" : `⏱ ${result.processingMs}ms`}</span>
                  <span className="truncate text-right">Groq · llama-3.1-8b-instant</span>
                </div>
              </div>

              {/* Classify another */}
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:opacity-70"
                style={{
                  color: "hsl(var(--muted-foreground))",
                  border: "1px solid hsl(var(--border) / 0.4)",
                }}
              >
                ← Classify another URL
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category cards idle state */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.div
              className="relative w-full space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-10 -bottom-4 rounded-[2rem]"
                style={{
                  background:
                    "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 32%, transparent 72%)",
                  filter: "blur(22px)",
                  opacity: 0.8,
                }}
              />
              <p
                className="text-xs uppercase tracking-widest font-medium text-center"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Categories we detect
              </p>
              <div
                className="relative grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 stagger-children"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 26px rgba(255,255,255,0.05), 0 0 64px rgba(255,255,255,0.03)",
                }}
              >
                {ALL_CATEGORIES.map((cat) => {
                  const m = CATEGORY_META[cat];
                  const c = CATEGORY_COLOR[cat];
                  return (
                    <motion.div
                      key={cat}
                      className={`glass ${CATEGORY_CARD_CLASS[cat]} rounded-2xl p-3 md:p-4 space-y-2 md:space-y-3 text-left animate-fade-in-up cursor-default`}
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-base md:text-lg"
                        style={{ background: `${c}22` }}
                      >
                        {m.icon}
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold" style={{ color: c }}>
                          {m.label}
                        </p>
                        <p className="text-xs mt-0.5 leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {m.sub}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-xs mt-4 text-center px-4" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>
          Scraping by Firecrawl · Classification by Groq
        </p>
      </main>
    </div>
  );
}