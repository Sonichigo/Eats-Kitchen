import React from 'react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Culinary Map",
  description: "Fine recipes, gourmet insights, and curated restaurant reviews.",
  keywords: [
    "recipes",
    "food reviews",
    "restaurant recommendations",
    "home cooking",
    "culinary blog",
    "Eats and Kitchen",
    "chef tips",
    "gourmet cuisine"
  ],
  // Next.js automatically detects app/icon.tsx, so we can remove manual icon definitions
  // or keep them as fallbacks if you add static files later.
  openGraph: {
    title: "The Culinary Map",
    description: "Discover fine recipes and curated restaurant reviews.",
    url: "https://theculinarymap.com/",
    siteName: "The Culinary Map",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Culinary Map",
    description: "Fine recipes and restaurant reviews.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}