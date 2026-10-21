"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { isFavorite, onFavoritesChange, toggleFavorite } from "@/lib/favorites";
import { useDict } from "@/components/providers";
import { cn } from "@/lib/utils";

/** Heart toggle on palette cards — guest favorites kept in localStorage. */
export function FavoriteHeart({ slug, name }: { slug: string; name: string }) {
  const t = useDict().fav;
  const [fav, setFav] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const sync = () => setFav(isFavorite(slug));
    sync();
    return onFavoritesChange(sync);
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => {
        const added = toggleFavorite(slug);
        if (added) {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 500);
        }
      }}
      aria-pressed={fav}
      aria-label={fav ? t.remove(name) : t.add(name)}
      title={fav ? t.removeShort : t.addShort}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 transition",
        fav
          ? "bg-rose-50 text-rose-500 ring-rose-200 hover:bg-rose-100 dark:bg-rose-950/50 dark:ring-rose-900"
          : "text-ink-faint ring-line hover:bg-surface-raised hover:text-rose-500"
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-transform", fav && "fill-current", pulse && "scale-125")}
        aria-hidden
      />
    </button>
  );
}
