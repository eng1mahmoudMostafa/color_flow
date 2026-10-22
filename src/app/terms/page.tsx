import type { Metadata } from "next";
import { DICT, getLang } from "@/lib/i18n";
import { LEGAL_DOCUMENTS, type LegalDocKey } from "@/lib/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ColorFlow Terms of Service — governing your use of the site, copy access and rewarded advertisement.",
};

export default async function TermsPage() {
  const lang = await getLang();
  const document = LEGAL_DOCUMENTS[lang]["terms"];
  return <LegalPage document={document} />;
}
