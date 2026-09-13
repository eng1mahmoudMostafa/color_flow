"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { CrashBoundary } from "@/components/crash-boundary";
import { contrastGrade } from "@/lib/colors";

type Props = {
  hex: string;
  colorName?: string;
  paletteName?: string;
  onClose: () => void;
};

type ColorDetail = {
  rgb: string;
  hsl: string;
  cmyk: string;
  hue: number;
  saturation: number;
  lightness: number;
  contrast: {
    onWhite: { ratio: number; grade: string };
    onBlack: { ratio: number; grade: string };
    bestText: string;
  };
  complementary: string;
};

/** Detail modal for a single color: formats, contrast grades and copy actions. */
export function ColorModal({ hex, colorName, paletteName, onClose }: Props) {
  const [detail, setDetail] = useState<ColorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/colors/${encodeURIComponent(hex)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled || !j.ok) return;
        setDetail(j.data as ColorDetail);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const textOn = detail
    ? { color: detail.contrast.bestText === "dark" ? "#0b1020" : "#ffffff" }
    : { color: "#ffffff" };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${colorName ?? hex} color details`}
      >
        <motion.div
          className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-line bg-surface shadow-lifted sm:rounded-3xl"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-36 items-end justify-between p-5" style={{ backgroundColor: hex }}>
            <div style={textOn}>
              <p className="text-2xl font-bold tracking-tight">{hex.toUpperCase()}</p>
              <p className="mt-0.5 text-sm opacity-80">
                {colorName ?? "Color"}
                {paletteName ? ` · from ${paletteName}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close color details"
              className="rounded-full bg-black/20 p-2 text-white backdrop-blur transition hover:bg-black/35"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="p-5">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-faint">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading details…
              </div>
            )}

            {detail && (
              <>
                <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {[
                    ["HEX", hex.toUpperCase()],
                    ["RGB", detail.rgb],
                    ["HSL", detail.hsl],
                    ["CMYK", detail.cmyk],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-raised px-3.5 py-2.5"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                        {label}
                      </dt>
                      <dd className="truncate font-mono text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl border border-line bg-surface-raised p-3">
                    <p className="font-semibold uppercase tracking-widest text-ink-faint">On white</p>
                    <p className="mt-1 font-mono text-sm">
                      {detail.contrast.onWhite.ratio.toFixed(2)}:1 · {contrastGrade(detail.contrast.onWhite.ratio)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-raised p-3">
                    <p className="font-semibold uppercase tracking-widest text-ink-faint">On black</p>
                    <p className="mt-1 font-mono text-sm">
                      {detail.contrast.onBlack.ratio.toFixed(2)}:1 · {contrastGrade(detail.contrast.onBlack.ratio)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {/* Isolated: a Translate rewrite inside the buttons resets only
                      this group, never the whole page. */}
                  <CrashBoundary>
                  <CopyButton value={hex.toUpperCase()} label="Copy HEX" toastMessage={`${hex.toUpperCase()} copied to clipboard.`} />
                  <CopyButton value={detail.rgb} label="Copy RGB" toastMessage="RGB value copied to clipboard." />
                  <CopyButton value={detail.hsl} label="Copy HSL" toastMessage="HSL value copied to clipboard." />
                  <CopyButton
                    value={[hex.toUpperCase(), detail.rgb, detail.hsl, detail.cmyk].join("\n")}
                    label="Copy all"
                    toastMessage="All color formats copied to clipboard."
                  />
                  </CrashBoundary>
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-[11px] leading-relaxed text-ink-faint">
                  <Lock className="h-3 w-3 shrink-0" aria-hidden />
                  Every copy action is verified on the server. Grades follow WCAG 2.1 contrast rules.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
