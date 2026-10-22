/**
 * Central site configuration.
 *
 * The canonical URL was previously duplicated across `layout.tsx`, `robots.ts`
 * and `sitemap.ts` with a placeholder default (`colorflow.example.com`), which
 * silently produced wrong canonical URLs in production. Every consumer now
 * imports from here so the domain is defined exactly once.
 */

export const SITE_NAME = "ColorFlow";

function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const netlify = (process.env.URL || "").trim(); // injected by Netlify at build time
  const candidate =
    raw && raw !== "undefined" && raw.startsWith("http")
      ? raw
      : netlify && netlify.startsWith("http")
        ? netlify
        : "https://colorflow.app";
  // Normalise: no trailing slash, so `${SITE_URL}/path` is always correct.
  return candidate.replace(/\/+$/, "");
}

/** Canonical origin, e.g. "https://colorflow.app" (never ends with "/"). */
export const SITE_URL = resolveSiteUrl();

/** Public contact address shown in the footer and on the contact page. */
export const CONTACT_EMAIL =
  (process.env.CONTACT_EMAIL || "support@colorflow.app").trim().toLowerCase();

/** WhatsApp number in international format (digits only) and display form. */
export const WHATSAPP_NUMBER = "201130278851";
export const WHATSAPP_DISPLAY = "+20 113 027 8851";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Revision date of the legal documents, shown on every legal page. */
export const LEGAL_LAST_UPDATED = {
  en: "October 21, 2026",
  ar: "21 أكتوبر 2026",
} as const;
