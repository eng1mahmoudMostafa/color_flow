import type { Metadata } from "next";
import { DICT, getLang } from "@/lib/i18n";
import { LEGAL_DOCUMENTS, type LegalDocKey } from "@/lib/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ColorFlow Privacy Policy — learn what we collect, how we use cookies, and your rights.",
};

export default async function PrivacyPage() {
  const lang = await getLang();
  const document = LEGAL_DOCUMENTS[lang]["privacy"];
  return <LegalPage document={document} />;
}
