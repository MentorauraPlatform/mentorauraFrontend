import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MentorAura | 1-on-1 Mentorship & Career Coaching",
    template: "%s | MentorAura",
  },
  description: "Connect 1-on-1 with verified tech leaders, software engineers, product managers, and executives for personalized career growth and mentorship.",
  keywords: [
    "Mentorship",
    "Career Coaching",
    "Tech Mentors",
    "Software Engineering Mentors",
    "Product Management Coaching",
    "1-on-1 Mentorship",
    "MentorAura",
  ],
  authors: [{ name: "MentorAura Team" }],
  creator: "MentorAura",
  metadataBase: new URL("https://mentoraura.com"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "MentorAura | 1-on-1 Mentorship & Career Coaching",
    description: "Accelerate your career with personalized 1-on-1 mentorship from top tech industry leaders.",
    url: "https://mentoraura.com",
    siteName: "MentorAura",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MentorAura Platform Logo & Brand",
        type: "image/png",
      },
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "MentorAura Icon Logo",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorAura | 1-on-1 Mentorship & Career Coaching",
    description: "Accelerate your career with personalized 1-on-1 mentorship from top tech industry leaders.",
    images: ["/og-image.png"],
    creator: "@mentoraura",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta property="og:image" content="https://mentoraura.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://mentoraura.com/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="MentorAura Platform Logo" />
        <meta name="twitter:image" content="https://mentoraura.com/og-image.png" />
      </head>
      <body className="antialiased font-sans bg-[#FFFCF9] text-[#172033]">
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </NextIntlClientProvider>
        <Toaster position="bottom-right" closeButton />
      </body>
    </html>
  );
}
