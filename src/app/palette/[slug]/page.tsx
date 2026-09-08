import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaletteBySlug, getRelatedPalettes } from "@/lib/palettes";
import { CATEGORY_LABELS } from "@/lib/data/palettes";
import { PaletteColorStrip, PaletteBreadcrumb } from "@/components/palette-color-strip";
import { PaletteCard } from "@/components/palette-card";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const palette = await getPaletteBySlug(slug);
  if (!palette) return { title: "Palette not found" };
  return {
    title: `${palette.name} Color Palette`,
    description: palette.description,
    openGraph: {
      title: `${palette.name} — ColorFlow Palette`,
      description: palette.description,
    },
  };
}

export default async function PalettePage({ params }: { params: Params }) {
  const { slug } = await params;
  const palette = await getPaletteBySlug(slug);
  if (!palette) notFound();

  const related = await getRelatedPalettes(palette.category, palette.slug, 4);
  const hexList = palette.colors.map((c) => c.hex.toUpperCase()).join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PaletteBreadcrumb paletteName={palette.name} />

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{palette.name}</h1>
            {palette.trending && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Trending
              </span>
            )}
            {palette.featured && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Featured
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{palette.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Link
              href={`/explore?category=${palette.category}`}
              className="rounded-full bg-surface-raised px-3 py-1 font-semibold text-ink-soft ring-1 ring-line transition hover:text-ink"
            >
              {CATEGORY_LABELS[palette.category] ?? palette.category}
            </Link>
            {palette.tags.map((tag) => (
              <span key={tag} className="rounded-full px-2.5 py-1 text-ink-faint">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <CopyButton
          value={hexList}
          label="Copy palette"
          toastMessage="Full palette copied to clipboard."
        />
      </header>

      <PaletteColorStrip colors={palette.colors} />

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-5 text-xl font-bold tracking-tight">
            More {CATEGORY_LABELS[palette.category] ?? palette.category} palettes
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <PaletteCard key={p.slug} palette={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
