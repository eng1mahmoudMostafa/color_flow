import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { CrashBoundary } from "@/components/crash-boundary";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
const netlifyUrl = (process.env.URL || "").trim(); // injected automatically by Netlify at build time
const siteUrl =
  rawSiteUrl && rawSiteUrl !== "undefined" && rawSiteUrl.startsWith("http")
    ? rawSiteUrl
    : netlifyUrl && netlifyUrl.startsWith("http")
      ? netlifyUrl
      : "https://colorflow.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ColorFlow — 10,000+ Curated Color Palettes",
    template: "%s · ColorFlow",
  },
  description:
    "Beautiful color palettes with a harmony generator. Browse 10,000+ palettes, try each palette live on the site, and unlock color copying with a quick 30-second ad.",
  keywords: ["color palettes", "color generator", "hex colors", "design", "ui colors", "10000 palettes"],
  authors: [{ name: "البشمهندس محمود مصطفى" }],
  openGraph: {
    type: "website",
    siteName: "ColorFlow",
    title: "ColorFlow — 10,000+ Curated Color Palettes",
    description: "10,000+ palettes and a harmony generator. Copy any color code for free.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d16" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // NOTE: page translation stays ENABLED (no translate="no" here).
    // Crash-safety is handled instead by:
    //  1. translate="no" only on technical code values (HEX/RGB/...) which must
    //     never be rewritten,  2. an app-level ErrorBoundary that recovers, and
    //  3. toast unmount without exit-animation DOM ops that clash with Translate.
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers>
          {/* App-level recovery: a transient auto-translate DOM rewrite anywhere
              on the page remounts the UI silently instead of showing the
              global error page. Copy actions inside survive because the toast
              + clipboard work already completed before the crash. */}
          <CrashBoundary>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CrashBoundary>
        </Providers>
      </body>
    </html>
  );
}
