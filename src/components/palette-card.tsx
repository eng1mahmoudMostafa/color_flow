"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { bestTextColor } from "@/lib/colors";
import { CopyButton } from "@/components/copy-button";
import { TryColorsButton, TryColorsModal } from "@/components/try-colors-modal";
import { FavoriteHeart } from "@/components/favorite-heart";
import { ColorModal } from "@/components/color-modal";
import type { PaletteSummary } from "@/types";
import { CATEGORY_LABELS } from "@/lib/data/palettes";

export function PaletteCard({ palette, index = 0 }: { palette: PaletteSummary; index?: number }) {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [tryOpen, setTryOpen] = useState(false);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: "easeOut" }}
        className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition hover:shadow-lifted"
      >
        <Link href={`/palette/${palette.slug}`} className="block" aria-label={`View ${palette.name} palette`}>
          <div className="flex h-32">
            {palette.colors.map((color, i) => (
              <div
                key={`${color.hex}-${i}`}
                className="relative flex-1 transition-[flex] duration-300 ease-out group-hover:brightness-[1.03]"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </Link>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/palette/${palette.slug}`}
                className="block truncate text-sm font-semibold tracking-tight hover:text-brand-600 dark:hover:text-brand-400"
              >
                {palette.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-faint">
                {CATEGORY_LABELS[palette.category] ?? palette.category}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <FavoriteHeart slug={palette.slug} name={palette.name} />
              <CopyButton
                value={palette.colors.map((c) => c.hex).join(", ")}
                label="Copy palette"
                toastMessage="Full palette copied to clipboard."
                className="!px-3 !py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {palette.colors.map((color, i) => (
              <button
                key={`${color.hex}-chip-${i}`}
                type="button"
                onClick={() => setActiveColor(color.hex)}
                aria-label={`Details for ${color.name} ${color.hex}`}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition hover:opacity-80"
                style={{ backgroundColor: color.hex, color: bestTextColor(color.hex) }}
              >
                {color.hex.replace("#", "")}
              </button>
            ))}
          </div>
          <TryColorsButton onClick={() => setTryOpen(true)} />
        </div>
      </motion.article>

      {tryOpen && <TryColorsModal palette={palette} onClose={() => setTryOpen(false)} />}

      {activeColor && (
        <ColorModal
          hex={activeColor}
          colorName={palette.colors.find((c) => c.hex === activeColor)?.name}
          paletteName={palette.name}
          onClose={() => setActiveColor(null)}
        />
      )}
    </>
  );
}
