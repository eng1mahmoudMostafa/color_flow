import type { LegalDocument } from "@/lib/legal";

export const TERMS_EN: LegalDocument = {
  title: "Terms of Service",
  intro:
    "These terms govern your use of ColorFlow. By using the site you agree to them. If you do not agree, please stop using the site.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "October 21, 2026",
  sections: [
    {
      heading: "1. Acceptance of these terms",
      paragraphs: [
        "These terms form a binding agreement between you and ColorFlow regarding your use of the website, including browsing palettes, generating colour harmonies and using the colour-code copying feature.",
        "We may update these terms from time to time. Continued use after an update constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "2. The service",
      paragraphs: [
        "ColorFlow provides colour palettes, a harmony generator, colour detail pages with RGB / HSL / CMYK values and WCAG 2.1 contrast grades, CSS gradients, and code exports.",
        "The palette library is generated and curated by us. We aim to keep it accurate but do not warrant that every colour combination is suitable for a particular design decision.",
      ],
    },
    {
      heading: "3. Copy access and the rewarded advertisement",
      paragraphs: [
        "Copying colour codes requires access. Access is granted for 24 hours after you complete a short advertisement inside the site's reward modal.",
        "Completion is measured on our server, using the elapsed time between the ad session being created and the verification request. Client-side timers, modified device clocks and forged requests are not accepted, and attempts that fail verification are counted and rate-limited.",
        "Access is personal to the browser session that earned it. Circumventing the reward flow — for example through automated scripting, request replay or emulating verification calls — is a breach of these terms and may result in that session being denied access.",
      ],
    },
    {
      heading: "4. Acceptable use",
      paragraphs: [
        "You may browse, generate and export palettes for any lawful purpose, including commercial projects.",
      ],
      bullets: [
        "Do not scrape the site at a rate that degrades it for others, or bypass rate limits.",
        "Do not attempt to defeat the reward-ad verification or to unlock copying without completing the advertisement.",
        "Do not upload, publish or distribute unlawful, infringing or malicious content.",
        "Do not use the site to violate any applicable law or third-party rights.",
      ],
    },
    {
      heading: "5. Advertisements",
      paragraphs: [
        "The site displays third-party and house advertisements, including in the reward modal. Advertisements are selected by our ad system and we do not endorse the products or claims they promote.",
        "Advertisers are responsible for their own creatives and destination pages. If you believe an advertisement is inappropriate or infringes your rights, contact us and we will review and remove it.",
      ],
    },
    {
      heading: "6. Intellectual property",
      paragraphs: [
        "The ColorFlow name, logo, site design, the harmony generator and the palette data set are owned by the operator and protected by applicable intellectual-property law.",
        "The colour values themselves are not subject to copyright and may be used freely in your own projects. Attribution is appreciated but not required.",
      ],
    },
    {
      heading: "7. Availability and changes",
      paragraphs: [
        "We work to keep the site available and accurate, but we do not guarantee uninterrupted access. Features, the palette library and the advertisement model may change or be withdrawn at any time.",
      ],
    },
    {
      heading: "8. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, the operator is not liable for indirect or consequential loss arising from use of the site, including lost profits, lost data or business interruption. Nothing in these terms limits liability that cannot lawfully be limited.",
      ],
    },
    {
      heading: "9. Indemnity",
      paragraphs: [
        "You agree to indemnify the operator against claims arising from your misuse of the site, your breach of these terms, or your infringement of any third-party right.",
      ],
    },
    {
      heading: "10. Governing law",
      paragraphs: [
        "These terms are governed by the laws applicable at the operator's place of establishment, without regard to conflict-of-law rules. Consumer protections that apply mandatorily in your jurisdiction remain unaffected.",
      ],
    },
    {
      heading: "11. Contact",
      paragraphs: [
        "Questions about these terms can be sent to the contact address listed on the Contact page. We aim to respond within a reasonable timeframe.",
      ],
    },
  ],
};
