import type { Metadata } from "next";
import { getLang } from "@/lib/i18n";
import Link from "next/link";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_LINK, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with ColorFlow support by email or WhatsApp.",
};

export default async function ContactPage() {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Have a question, feedback or need help? Reach out via email or WhatsApp.
        </p>
      </header>

      <section className="space-y-6">
        <div className="rounded-lg border border-line bg-white dark:bg-surface p-6 shadow-sm dark:text-ink">
          <h2 className="text-lg font-semibold mb-4">Email</h2>
          <p className="mb-2 text-sm text-ink-soft">
            Drop us a line at <b>{CONTACT_EMAIL}</b>. We typically reply within a few business days.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Hello ${SITE_NAME}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Write email →
          </a>
        </div>

        <div className="rounded-lg border border-line bg-white dark:bg-surface p-6 shadow-sm dark:text-ink">
          <h2 className="text-lg font-semibold mb-4">WhatsApp</h2>
          <p className="mb-2 text-sm text-ink-soft">
            Prefer instant messaging? Chat with us on WhatsApp.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Open WhatsApp →
          </a>
          <p className="mt-1 text-xs text-ink-faint">{WHATSAPP_DISPLAY}</p>
        </div>
      </section>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        <span className="rtl-arrow">←</span> Back to home
      </Link>
    </div>
  );
}
