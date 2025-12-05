import React from 'react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eats & Kitchen",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "Eats & Kitchen",
    description: "Discover fine recipes and curated restaurant reviews.",
    url: "https://sonichigoeatsandkitchen.com/",
    siteName: "Eats & Kitchen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eats & Kitchen – Culinary Excellence"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Eats & Kitchen",
    description: "Fine recipes and restaurant reviews.",
    images: ["/og-image.png"]
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