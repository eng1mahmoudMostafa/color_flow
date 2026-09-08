import Link from "next/link";
import { Sparkles, Wand2, ShieldCheck, Clock } from "lucide-react";
import { listPalettes } from "@/lib/palettes";
import { CATEGORY_META } from "@/lib/data/palettes";
import { PaletteCard } from "@/components/palette-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ palettes: trending }, { palettes: featured }] = await Promise.all([
    listPalettes({ trending: true, perPage: 8 }),
    listPalettes({ featured: true, perPage: 4 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(60% 80% at 15% 10%, rgba(59,109,246,0.14), transparent), radial-gradient(50% 70% at 85% 20%, rgba(168,85,247,0.12), transparent), radial-gradient(45% 60% at 50% 100%, rgba(20,184,166,0.10), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            10,000+ palettes · 17 curated categories
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Colors that <span className="text-brand-600 dark:text-brand-400">flow</span> into your
            designs
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Explore 10,000+ palettes, generate perfect harmonies, and copy any color code.
            Copying is free after watching one 30-second ad — unlocked for 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.99]"
            >
              Explore palettes
            </Link>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-surface px-6 py-3 text-sm font-semibold text-ink ring-1 ring-line transition hover:bg-surface-raised"
            >
              <Wand2 className="h-4 w-4" aria-hidden /> Try the generator
            </Link>
          </div>
          <div className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-6 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Copy unlocked · 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-500" aria-hidden /> One 30s ad · unlock
            </span>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="trending-heading">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 id="trending-heading" className="text-2xl font-bold tracking-tight">
              Trending now
            </h2>
            <p className="mt-1 text-sm text-ink-faint">The palettes designers are loving this week.</p>
          </div>
          <Link href="/explore" className="shrink-0 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((palette, i) => (
            <PaletteCard key={palette.slug} palette={palette} index={i} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-t border-line bg-surface-raised/50" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 id="featured-heading" className="text-2xl font-bold tracking-tight">
              Editor&apos;s picks
            </h2>
            <p className="mt-1 text-sm text-ink-faint">Hand-selected by our curation team.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((palette, i) => (
              <PaletteCard key={palette.slug} palette={palette} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-t border-line" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 id="categories-heading" className="text-2xl font-bold tracking-tight">
            Browse by category
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {CATEGORY_META.map((c) => (
              <Link
                key={c.key}
                href={`/explore?category=${c.key}`}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
