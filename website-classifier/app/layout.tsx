import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SiteSense: Website Classifier",
  description: "Classify any URL into a category using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>{children}</body>
    </html>
  );
}