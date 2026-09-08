"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { PaletteCard } from "@/components/palette-card";
import { getFavoriteSlugs, onFavoritesChange } from "@/lib/favorites";
import type { PaletteSummary } from "@/types";

export default function FavoritesPage() {
  const [palettes, setPalettes] = useState<PaletteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const slugs = getFavoriteSlugs();
      if (slugs.length === 0) {
        if (!cancelled) {
          setPalettes([]);
          setLoading(false);
        }
        return;
      }
      try {
        const results = await Promise.all(
          slugs.slice(-100).map(async (slug) => {
            const res = await fetch(`/api/palettes/${encodeURIComponent(slug)}`);
            const json = await res.json();
            return json.ok ? (json.data as PaletteSummary) : null;
          })
        );
        if (!cancelled) {
          setPalettes(results.filter((p): p is PaletteSummary => p !== null));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    void load();
    const unsubscribe = onFavoritesChange(() => {
      setLoading(true);
      void load();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:ring-rose-900">
          <Heart className="h-5 w-5 fill-current" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
          <p className="text-sm text-ink-soft">
            {loading ? "Loading…" : `${palettes.length} saved palette${palettes.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-faint">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Loading your favorites…
        </div>
      )}

      {!loading && palettes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <Heart className="mx-auto h-10 w-10 text-ink-faint" aria-hidden />
          <p className="mt-3 text-sm font-medium">No favorites yet.</p>
          <p className="mt-1 text-sm text-ink-faint">
            Tap the heart on any palette to save it here — stored on your device.
          </p>
        </div>
      )}

      {!loading && palettes.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {palettes.map((palette, i) => (
            <PaletteCard key={palette.slug} palette={palette} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
