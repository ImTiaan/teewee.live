import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "Teewee Live - Streamer & Content Creator",
    template: "%s | Teewee Live",
  },
  description: "Official website for Teewee. Watch live streams, view OBS screens, and connect with the community on Twitch, Kick, and YouTube.",
  keywords: ["Teewee", "Streamer", "Twitch", "Kick", "YouTube", "Content Creator", "Gaming", "Live Stream"],
  authors: [{ name: "Teewee" }],
  creator: "Teewee",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://teewee.live",
    title: "Teewee Live - Streamer & Content Creator",
    description: "Watch live streams, view OBS screens, and connect with the community.",
    siteName: "Teewee Live",
    images: [
      {
        url: "/screens/assets/logo.png",
        width: 800,
        height: 600,
        alt: "Teewee Live Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teewee Live",
    description: "Streamer & Content Creator",
    images: ["/screens/assets/logo.png"],
    creator: "@teewee", // Update this if you have a specific Twitter handle
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
