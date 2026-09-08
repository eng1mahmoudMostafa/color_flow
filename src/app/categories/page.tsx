import type { Metadata } from "next";
import Link from "next/link";
import { listPalettes } from "@/lib/palettes";
import { CATEGORY_META } from "@/lib/data/palettes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all color palette categories on ColorFlow.",
};

export default async function CategoriesPage() {
  const counts = await Promise.all(
    CATEGORY_META.map(async (c) => {
      const { total } = await listPalettes({ category: c.key, perPage: 1 });
      return { ...c, total };
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All categories</h1>
        <p className="mt-1.5 text-sm text-ink-faint">
          {CATEGORY_META.length} curated categories — pick a mood or an industry.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {counts.map((c) => (
          <Link
            key={c.key}
            href={`/explore?category=${c.key}`}
            className="group rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:shadow-lifted"
          >
            <p className="font-semibold tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {c.label}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              {c.total} palette{c.total === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
