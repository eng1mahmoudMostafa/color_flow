/**
 * Legal page content — types and registry.
 *
 * The copy is deliberately split per-document and per-language so the EN and
 * AR versions always describe the same behaviour: a change to the product
 * (cookies, retention, ad model) must be reflected in both languages at once.
 *
 * Every statement here mirrors the actual implementation:
 *  - cookies: `cf_sid` (guest, httpOnly), `cf_auth` (signed session), `lang` (UI language)
 *  - localStorage: favourites, theme, generator salt
 *  - server records: users, access sessions, ad sessions, aggregate analytics, ad stats
 */

export type LegalLang = "en" | "ar";

export type LegalSection = {
  /** Heading of the section. */
  heading: string;
  /** Paragraphs of the section body. */
  paragraphs: string[];
  /** Optional bullet list rendered under the paragraphs. */
  bullets?: string[];
};

export type LegalDocument = {
  /** Document title, used for <title> and the page heading. */
  title: string;
  /** Short one-line summary shown under the title. */
  intro: string;
  /** Label for the "last updated" line. */
  lastUpdatedLabel: string;
  /** Value for the "last updated" line. */
  lastUpdated: string;
  sections: LegalSection[];
};

export type LegalDocKey = "privacy" | "terms";

import { PRIVACY_EN } from "./legal/privacy-en";
import { TERMS_EN } from "./legal/terms-en";
import { PRIVACY_AR } from "./legal/privacy-ar";
import { TERMS_AR } from "./legal/terms-ar";

export const LEGAL_DOCUMENTS: Record<LegalLang, Record<LegalDocKey, LegalDocument>> = {
  en: { privacy: PRIVACY_EN, terms: TERMS_EN },
  ar: { privacy: PRIVACY_AR, terms: TERMS_AR },
};
