import type { Metadata } from "next";
import Link from "next/link";
import { GRADIENTS } from "@/lib/data/gradients";
import { CopyButton } from "@/components/copy-button";
import { DICT, getLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "CSS Gradients",
  description:
    "Beautiful ready-to-use CSS gradients with the full CSS code. Copy any gradient code — unlocked for 24 hours after a quick 30-second ad.",
  alternates: { canonical: "/gradients" },
  openGraph: {
    title: "CSS Gradients — ColorFlow",
    description: "Ready-to-use CSS gradients with copyable code.",
  },
};

export default async function GradientsPage() {
  const lang = await getLang();
  const t = DICT[lang].gradients;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.sub}</p>
      </header>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Gradients">
        {GRADIENTS.map((g) => (
          <li
            key={g.slug}
            className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-soft"
          >
            <div className="h-36 w-full transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: g.css }} />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{g.name}</p>
                <p className="truncate text-xs text-ink-faint" translate="no">
                  {g.stops.join(" · ")}
                </p>
              </div>
              <CopyButton
                variant="icon"
                value={`background: ${g.css};`}
                toastMessage={`${g.name} CSS copied to clipboard.`}
                className="bg-black/10 text-ink dark:bg-white/10"
                label={t.copy}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-sm text-ink-faint">
        {t.footer}{" "}
        <Link href="/explore" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          {t.explore}
        </Link>
      </p>
    </div>
  );
}
