"use client";

import Link from "next/link";
import { useState } from "react";
import { bestTextColor } from "@/lib/colors";
import { CopyButton } from "@/components/copy-button";
import { ColorModal } from "@/components/color-modal";
import type { ColorInfo } from "@/types";

/**
 * Interactive color strip used on the palette detail page.
 * Note: every copy click is re-verified by the server via CopyButton —
 * this component never grants access on its own.
 */
export function PaletteColorStrip({ colors }: { colors: ColorInfo[] }) {
  const [activeColor, setActiveColor] = useState<ColorInfo | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-line shadow-lifted">
        <div className="flex h-64 sm:h-80" role="list">
          {colors.map((color, i) => (
            <div
              key={`${color.hex}-${i}`}
              role="listitem"
              tabIndex={0}
              onClick={() => setActiveColor(color)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveColor(color);
                }
              }}
              aria-label={`Open details for ${color.name} ${color.hex}`}
              className="group relative flex-1 cursor-pointer transition-all duration-300 hover:flex-[1.6] focus-visible:flex-[1.6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              style={{ backgroundColor: color.hex }}
            >
              <span
                className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 p-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ color: bestTextColor(color.hex) }}
              >
                <span className="text-xs font-bold uppercase tracking-widest">{color.name}</span>
                <span className="font-mono text-xs opacity-90">{color.hex.toUpperCase()}</span>
              </span>
              <span
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <CopyButton
                  variant="icon"
                  value={color.hex.toUpperCase()}
                  toastMessage={`${color.hex.toUpperCase()} copied to clipboard.`}
                  className="bg-black/25 text-white"
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-friendly hex list */}
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {colors.map((color, i) => (
          <li key={`${color.hex}-row-${i}`}>
            <button
              type="button"
              onClick={() => setActiveColor(color)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-left transition hover:bg-surface-raised"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-black/10"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{color.name}</span>
                <span className="block font-mono text-[11px] text-ink-faint">{color.hex.toUpperCase()}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {activeColor && (
        <ColorModal
          hex={activeColor.hex}
          colorName={activeColor.name}
          onClose={() => setActiveColor(null)}
        />
      )}
    </>
  );
}

export function PaletteBreadcrumb({ paletteName }: { paletteName: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-faint">
      <Link href="/" className="hover:text-ink">
        Home
      </Link>
      <span aria-hidden className="mx-1.5">
        /
      </span>
      <Link href="/explore" className="hover:text-ink">
        Palettes
      </Link>
      <span aria-hidden className="mx-1.5">
        /
      </span>
      <span className="text-ink" aria-current="page">
        {paletteName}
      </span>
    </nav>
  );
}
