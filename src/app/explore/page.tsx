import type { Metadata } from "next";
import Link from "next/link";
import { listPalettes } from "@/lib/palettes";
import { CATEGORY_META, CATEGORY_LABELS } from "@/lib/data/palettes";
import { PaletteCard } from "@/components/palette-card";
import { paletteQuerySchema } from "@/lib/validation";
import { DICT, getLang, categoryLabel } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Explore Palettes",
  description: "Browse all curated color palettes by category.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const lang = await getLang();
  const t = DICT[lang].explore;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") flat[k] = v;
  }
  const parsed = paletteQuerySchema.safeParse(flat);
  const query = parsed.success ? parsed.data : { page: 1, perPage: 12 };
  const { palettes, total, hasMore } = await listPalettes(query);

  const pageParams = (page: number) => {
    const p = new URLSearchParams();
    if (query.category) p.set("category", query.category);
    if (query.q) p.set("q", query.q);
    if (query.featured !== undefined) p.set("featured", String(query.featured));
    if (query.trending !== undefined) p.set("trending", String(query.trending));
    p.set("page", String(page));
    return `/explore?${p.toString()}`;
  };

  const activeCat = query.category
    ? categoryLabel(query.category, lang, CATEGORY_LABELS[query.category])
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCat ? `${activeCat} ${DICT[lang].common.palettes}` : t.title}
          {query.trending ? ` — ${t.trending}` : ""}
          {query.featured ? ` — ${t.featured}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-ink-faint">{t.found(total)}</p>
      </header>

      {/* Category filter chips */}
      <nav aria-label={t.filterByCategory} className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/explore"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition ${
            !query.category
              ? "bg-brand-600 text-white ring-brand-600"
              : "bg-surface text-ink-soft ring-line hover:text-ink"
          }`}
        >
          {t.all}
        </Link>
        {CATEGORY_META.map((c) => (
          <Link
            key={c.key}
            href={`/explore?category=${c.key}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition ${
              query.category === c.key
                ? "bg-brand-600 text-white ring-brand-600"
                : "bg-surface text-ink-soft ring-line hover:text-ink"
            }`}
          >
            {categoryLabel(c.key, lang, c.label)}
          </Link>
        ))}
      </nav>

      {palettes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-ink-faint">{t.empty}</p>
          <Link href="/explore" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            {t.clear}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {palettes.map((palette, i) => (
            <PaletteCard key={palette.slug} palette={palette} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(query.page ?? 1) > 1 || hasMore ? (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
          {(query.page ?? 1) > 1 && (
            <Link
              href={pageParams((query.page ?? 1) - 1)}
              className="rounded-xl bg-surface px-4 py-2 text-sm font-semibold ring-1 ring-line transition hover:bg-surface-raised"
            >
              <span className="rtl-arrow">←</span> {t.previous}
            </Link>
          )}
          <span className="text-sm text-ink-faint">
            {t.page} {query.page ?? 1}
          </span>
          {hasMore && (
            <Link
              href={pageParams((query.page ?? 1) + 1)}
              className="rounded-xl bg-surface px-4 py-2 text-sm font-semibold ring-1 ring-line transition hover:bg-surface-raised"
            >
              {t.next} <span className="rtl-arrow">→</span>
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}
