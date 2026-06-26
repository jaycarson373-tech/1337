import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "1337 | The Crypto Intelligence Model",
  description:
    "1337 researches crypto before it answers, pulling market, on-chain and protocol data into a Crypto Intelligence Layer.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  },
  openGraph: {
    title: "1337 | The Crypto Intelligence Model",
    description:
      "Ask anything about crypto. 1337 researches live data before answering.",
    images: [
      {
        url: "/1337-logo.png",
        width: 1280,
        height: 853,
        alt: "1337 neon purple logo"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
