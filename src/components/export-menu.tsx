"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Check } from "lucide-react";

const FORMATS = [
  { key: "json", label: "JSON" },
  { key: "css", label: "CSS vars" },
  { key: "scss", label: "SCSS" },
  { key: "tailwind", label: "Tailwind" },
] as const;

type Props = { slug: string; name: string; description?: string };

/** Export dropdown (JSON / CSS / SCSS / Tailwind) + native share button. */
export function ExportMenu({ slug, name, description }: Props) {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: `${name} — ColorFlow Palette`, text: description ?? name, url };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(data);
      } else {
        await (navigator as Navigator).clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1600);
      }
    } catch {
      /* user cancelled the share sheet — nothing to do */
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition hover:bg-surface-raised"
        >
          <Download className="h-4 w-4" aria-hidden /> Export
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-soft"
          >
            {FORMATS.map((f) => (
              <a
                key={f.key}
                role="menuitem"
                href={`/api/palettes/${slug}/export?format=${f.key}`}
                className="block px-4 py-2 text-sm text-ink-soft transition hover:bg-surface-raised hover:text-ink"
              >
                {f.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${name}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition hover:bg-surface-raised"
      >
        {shared ? <Check className="h-4 w-4 text-emerald-500" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
        <span className="hidden sm:inline">{shared ? "Link copied" : "Share"}</span>
      </button>
    </div>
  );
}
