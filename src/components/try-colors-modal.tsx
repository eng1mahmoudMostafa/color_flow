"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { bestTextColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { PaletteSummary } from "@/types";

type PreviewMode = "website" | "app" | "poster";

const MODES: { key: PreviewMode; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "app", label: "Mobile app" },
  { key: "poster", label: "Poster" },
];

/**
 * "Try colors" live preview — opens on the site (no external navigation).
 * Renders mock Website / Mobile / Poster designs painted with the palette
 * colors so visitors can see the palette in action before copying anything.
 */
export function TryColorsModal({ palette, onClose }: { palette: PaletteSummary; onClose: () => void }) {
  const [mode, setMode] = useState<PreviewMode>("website");
  const c = palette.colors.map((x) => x.hex);
  // Defensive defaults — a malformed palette must never crash the page.
  const [primary = "#3b6df6", secondary = "#1f2937", accent = "#8b5cf6", ...rest] = c;
  const onPrimary = bestTextColor(primary);
  const onSecondary = bestTextColor(secondary);
  const onAccent = bestTextColor(accent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Try ${palette.name} colors`}
      >
        <motion.div
          initial={{ scale: 0.94, y: 14 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-lifted"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Try colors — {palette.name}</p>
              <p className="text-xs text-ink-faint">Live preview painted with this palette</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-full p-2 text-ink-soft transition hover:bg-surface-raised"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex gap-1.5 px-5 pt-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  mode === m.key
                    ? "bg-brand-600 text-white shadow-soft"
                    : "bg-surface-raised text-ink-soft hover:text-ink"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {mode === "website" && (
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: primary, color: onPrimary }}>
                  <span className="text-xs font-bold">Brand</span>
                  <div className="flex gap-3 text-[10px] opacity-80">
                    <span>Home</span>
                    <span>Features</span>
                    <span>Pricing</span>
                  </div>
                </div>
                <div className="px-6 py-8 text-center" style={{ backgroundColor: secondary, color: onSecondary }}>
                  <p className="text-xl font-extrabold tracking-tight">Design with confidence</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs opacity-80">
                    This hero section is painted with your palette — every section uses one of its colors.
                  </p>
                  <span className="mt-4 inline-block rounded-xl px-4 py-2 text-xs font-bold shadow-soft" style={{ backgroundColor: accent, color: onAccent }}>
                    Get started
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3" style={{ backgroundColor: rest[0] ?? secondary }}>
                  {rest.concat(rest.slice(0, 1)).slice(0, 3).map((hex, i) => (
                    <div key={i} className="rounded-xl p-3 text-[10px] font-semibold" style={{ backgroundColor: hex, color: bestTextColor(hex) }}>
                      Feature {i + 1}
                      <p className="mt-1 text-[9px] opacity-70">Card painted with {hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "app" && (
              <div className="flex justify-center">
                <div className="w-56 overflow-hidden rounded-[2rem] border-4 border-line shadow-lifted">
                  <div className="px-4 py-3 text-center text-xs font-bold" style={{ backgroundColor: primary, color: onPrimary }}>
                    App title
                  </div>
                  <div className="space-y-2 p-3" style={{ backgroundColor: secondary, color: onSecondary }}>
                    {rest.concat(rest.slice(0, 2)).slice(0, 4).map((hex, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl p-2.5 text-[10px] font-semibold" style={{ backgroundColor: hex, color: bestTextColor(hex) }}>
                        <span className="h-5 w-5 rounded-full" style={{ backgroundColor: accent }} />
                        List item {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end p-3" style={{ backgroundColor: secondary }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-soft" style={{ backgroundColor: accent, color: onAccent }}>+</span>
                  </div>
                  <div className="flex justify-around py-2" style={{ backgroundColor: primary, color: onPrimary }}>
                    <span className="text-[10px]">Home</span>
                    <span className="text-[10px] opacity-60">Search</span>
                    <span className="text-[10px] opacity-60">Profile</span>
                  </div>
                </div>
              </div>
            )}

            {mode === "poster" && (
              <div
                className="relative mx-auto flex h-72 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl text-center"
                style={{ background: `linear-gradient(135deg, ${c.join(", ")})` }}
              >
                <p className="px-8 text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">
                  {palette.name}
                </p>
                <p className="mt-1 px-8 text-xs font-medium text-white/85 drop-shadow">
                  Poster mockup using a {c.length}-color gradient
                </p>
                <span className="mt-4 rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-bold text-black">
                  {palette.category}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
            <CopyButton
              value={c.join(", ")}
              label="Copy all colors"
              toastMessage="All palette colors copied."
              className="!py-2 text-xs"
            />
            {c.map((hex, i) => (
              <CopyButton
                key={`${hex}-try-${i}`}
                variant="icon"
                value={hex.toUpperCase()}
                toastMessage={`${hex.toUpperCase()} copied.`}
                className="h-7 w-7 rounded-lg"
              />
            ))}
            <span className="ml-auto text-[10px] text-ink-faint">Copying unlocks after the 30s ad</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** "Try colors" button shown under each palette card. */
export function TryColorsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
    >
      <Play className="h-3.5 w-3.5" aria-hidden />
      Try colors
    </button>
  );
}