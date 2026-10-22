import type { Metadata } from "next";
import { DICT, getLang } from "@/lib/i18n";
import Link from "next/link";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_LINK, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with ColorFlow support by email or WhatsApp.",
};

export default async function ContactPage() {
  const lang = await getLang();
  const isRtl = lang === "ar";
  const t = DICT[lang].contact as {
    title: string;
    subtitle: string;
    email: string;
    emailBody: string;
    writeEmail: string;
    whatsapp: string;
    whatsappBody: string;
    openWhatsapp: string;
    backHome: string;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {t.subtitle}
        </p>
      </header>

      <section className="space-y-6">
        <div className="rounded-lg border border-line bg-white dark:bg-surface p-6 shadow-sm dark:text-ink">
          <h2 className="text-lg font-semibold mb-4">{t.email}</h2>
          <p className="mb-2 text-sm text-ink-soft">
            {(() => {
              const [before, after] = t.emailBody.split("{email}");
              return (
                <>
                  {before}
                  <b>{CONTACT_EMAIL}</b>
                  {after}
                </>
              );
            })()}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Hello ${SITE_NAME}`)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            {t.writeEmail}
          </a>
        </div>

        <div className="rounded-lg border border-line bg-white dark:bg-surface p-6 shadow-sm dark:text-ink">
          <h2 className="text-lg font-semibold mb-4">{t.whatsapp}</h2>
          <p className="mb-2 text-sm text-ink-soft">
            {t.whatsappBody}
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            {t.openWhatsapp}
          </a>
          <p className="mt-1 text-xs text-ink-faint">{WHATSAPP_DISPLAY}</p>
        </div>
      </section>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        {t.backHome}
      </Link>
    </div>
  );
}
