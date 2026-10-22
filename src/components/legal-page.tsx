"use client";

import Link from "next/link";

type Props = {
  /** The legal document data (already resolved server-side). */
  document: {
    title: string;
    intro: string;
    lastUpdatedLabel: string;
    lastUpdated: string;
    sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  };
};

/**
 * Shared renderer for Privacy Policy and Terms of Service pages.
 * Renders the document in the active language (EN / AR) with RTL support.
 */
export function LegalPage({ document }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
        <p className="mt-2 text-sm text-ink-faint italic">
          {document.lastUpdatedLabel}: {document.lastUpdated}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{document.intro}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          <span className="rtl-arrow">←</span> Back to home
        </Link>
      </header>

      <article className="space-y-8 prose prose-sm dark:prose-invert max-w-none">
        {document.sections.map((section, i) => (
          <section key={i} id={`section-${i}`}>
            <h2
              id={section.heading.replace(/\s+/g, "-").toLowerCase()}
              className="text-xl font-bold tracking-tight mb-3"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mb-3 leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul key="bullets" className="ml-5 space-y-1 list-disc text-ink-soft">
                {section.bullets.map((b, j) => (
                  <li key={j} className="mb-1">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <footer className="mt-12 pt-8 border-t border-line text-xs text-ink-faint">
        © {new Date().getFullYear()} ColorFlow.{" "}
        <Link href="/contact" className="text-brand-600 hover:underline dark:text-brand-400">
          Contact us
        </Link>
      </footer>
    </div>
  );
}
