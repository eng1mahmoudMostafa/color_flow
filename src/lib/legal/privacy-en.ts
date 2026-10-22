import type { LegalDocument } from "@/lib/legal";

export const PRIVACY_EN: LegalDocument = {
  title: "Privacy Policy",
  intro:
    "This policy explains what ColorFlow collects, why we collect it, and the choices you have. It applies to colorflow.app and to every page under it.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "October 21, 2026",
  sections: [
    {
      heading: "1. Summary",
      paragraphs: [
        "ColorFlow is a palette-browsing and colour-code tool. Browsing palettes, generating harmonies and reading colour details are open to everyone — no account is needed.",
        "Copying colour codes is gated behind a short rewarded advertisement. When you complete the ad, we grant you 24 hours of copying access tied to your browser session.",
      ],
      bullets: [
        "Browsing and generating: no sign-up, no personal data.",
        "Copying: requires watching a 30-second advertisement, verified on our server.",
        "Analytics: anonymous, aggregate event counters only.",
      ],
    },
    {
      heading: "2. What we collect",
      paragraphs: [
        "We collect only what the site needs to work. We do not sell personal data, and we do not build advertising profiles about you.",
      ],
      bullets: [
        "Guest session cookie (cf_sid) — a random identifier, HTTP-only, created automatically so we can remember your 24-hour copy access.",
        "Language cookie (lang) — stores whether you chose English or Arabic, so the interface stays in your language.",
        "Favourites and theme preference — stored locally in your browser (localStorage), never transmitted to us.",
        "Account details — only if you choose to register: name, email address and a hashed password. The raw password is never stored.",
        "Access and ad sessions — the time a rewarded ad started, when it was completed, and when your 24-hour copy access expires.",
        "Ad statistics — how many times an advertisement was shown and how many times it was clicked.",
        "Aggregate analytics — event type, optional non-identifying metadata, and a timestamp.",
      ],
    },
    {
      heading: "3. Cookies",
      paragraphs: [
        "We use three cookies, all of which are strictly functional. There are no third-party advertising cookies and no cross-site tracking cookies.",
      ],
      bullets: [
        "cf_sid — essential, HTTP-only, expires after 30 days, stores your guest identity.",
        "cf_auth — essential, HTTP-only, signed session cookie for registered accounts.",
        "lang — preferences, expires after 12 months, remembers your interface language.",
      ],
    },
    {
      heading: "4. IP addresses and rate limiting",
      paragraphs: [
        "To protect the service from abuse (for example, scripted ad verification or automated scraping), we derive a short, one-way hash of your IP address and use it only as a rate-limiting key. The hash is not reversible and is not stored alongside your session data.",
      ],
    },
    {
      heading: "5. Third parties",
      paragraphs: [
        "Advertisement creatives are hosted on external providers and are loaded directly by your browser. When you click an advertisement, you are sent to the advertiser's own website, which is governed by that advertiser's privacy policy, not by this one.",
        "If you register for an account, password hashing is performed locally using bcrypt. We do not send your credentials to any third party.",
      ],
    },
    {
      heading: "6. How long we keep data",
      paragraphs: [
        "Copy-access sessions and ad sessions are deleted shortly after they expire. Account records are kept until you ask us to delete them. Aggregate analytics counters are retained only as totals and are not linked to an individual.",
      ],
    },
    {
      heading: "7. Your rights",
      paragraphs: [
        "You can clear your favourites and theme at any time by clearing your browser storage. If you have an account, you may ask us for a copy of your data or ask us to delete your account entirely.",
      ],
    },
    {
      heading: "8. Children",
      paragraphs: [
        "ColorFlow is a general-audience design tool and is not directed at children under 13. We do not knowingly collect personal information from children.",
      ],
    },
    {
      heading: "9. Changes and contact",
      paragraphs: [
        "If this policy changes materially we will update the date at the top of this page. Questions about privacy can be sent to the contact address on the Contact page.",
      ],
    },
  ],
};
