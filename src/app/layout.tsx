import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { organizationLd, siteUrl, websiteLd } from "@/lib/seo";
import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import SWRegister from "@/components/SWRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#c4552c",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  title: {
    default: `${BRAND.name}. ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  openGraph: {
    siteName: BRAND.name,
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <AppShell>{children}</AppShell>
        <SWRegister />
      </body>
    </html>
  );
}
