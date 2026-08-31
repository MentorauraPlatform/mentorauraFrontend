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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "MentorAura | 1-on-1 Mentorship & Career Coaching",
    description: "Accelerate your career with personalized 1-on-1 mentorship from top tech industry leaders.",
    url: "https://mentoraura.com",
    siteName: "MentorAura",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorAura | 1-on-1 Mentorship & Career Coaching",
    description: "Accelerate your career with personalized 1-on-1 mentorship from top tech industry leaders.",
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
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
