"use client";

import { useState } from "react";
import { Wand2, Loader2, RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const HARMONIES = [
  { key: "monochromatic", label: "Monochromatic" },
  { key: "analogous", label: "Analogous" },
  { key: "complementary", label: "Complementary" },
  { key: "split-complementary", label: "Split Complementary" },
  { key: "triadic", label: "Triadic" },
  { key: "tetradic", label: "Tetradic" },
] as const;

type GeneratedColor = { hex: string; rgb: string; hsl: string; cmyk: string; textOn: string };

export function Generator() {
  const [base, setBase] = useState("#3B82F6");
  const [harmony, setHarmony] = useState<(typeof HARMONIES)[number]["key"]>("analogous");
  const [salt, setSalt] = useState(0);
  const [palette, setPalette] = useState<GeneratedColor[]>([]);
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const generate = async (nextSalt?: number) => {
    setLoading(true);
    try {
      const s = nextSalt ?? salt;
      const res = await fetch("/api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, harmony, salt: s }),
      });
      const json = await res.json();
      if (json.ok && json.data.palette?.length) {
        setPalette(json.data.palette as GeneratedColor[]);
      } else if (json.data?.rateLimited) {
        push("Generator rate limit reached — please wait a moment.", "error");
      } else if (json.error) {
        push(json.error.message ?? "Generation failed.", "error");
      }
    } catch {
      push("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Base color
          </span>
          <span className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-raised p-2">
            <input
              type="color"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              aria-label="Pick base color"
              className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={base.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (/^#?[0-9a-fA-F]{6}$/.test(v)) setBase(v.startsWith("#") ? v : `#${v}`);
              }}
              aria-label="Base hex value"
              className="w-full bg-transparent font-mono text-sm outline-none"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Harmony
          </span>
          <select
            value={harmony}
            onChange={(e) => setHarmony(e.target.value as typeof harmony)}
            className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {HARMONIES.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => {
              const next = salt + 1;
              setSalt(next);
              void generate(next);
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Wand2 className="h-4 w-4" aria-hidden />
            )}
            Generate
          </button>
          {palette.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const next = salt + 1;
                setSalt(next);
                void generate(next);
              }}
              aria-label="Regenerate variation"
              title="New variation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-surface-raised hover:text-ink"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {palette.length > 0 && (
        <div className="mt-6">
          <div className="flex h-48 overflow-hidden rounded-2xl ring-1 ring-line">
            {palette.map((color, i) => (
              <div
                key={`${color.hex}-${i}`}
                className="relative flex flex-1 items-end justify-center pb-3"
                style={{ backgroundColor: color.hex }}
              >
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: color.textOn === "dark" ? "#0b1020" : "#ffffff" }}
                >
                  {color.hex.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <CopyButton
              value={palette.map((c) => c.hex.toUpperCase()).join(", ")}
              label="Copy palette"
              toastMessage="Generated palette copied to clipboard."
            />
            {palette.map((c, i) => (
              <CopyButton
                key={`${c.hex}-chip-${i}`}
                value={c.hex.toUpperCase()}
                label={c.hex.replace("#", "").toUpperCase()}
                toastMessage={`${c.hex.toUpperCase()} copied to clipboard.`}
                className="!px-2.5 !py-1.5 font-mono !text-[11px]"
              />
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-xs text-ink-faint sm:grid-cols-5">
            {palette.map((c, i) => (
              <div key={`${c.hex}-meta-${i}`} className={cn("rounded-lg bg-surface-raised p-2 font-mono")}>
                <p className="font-semibold text-ink-soft">{c.hex.toUpperCase()}</p>
                <p className="mt-0.5">{c.rgb}</p>
                <p>{c.hsl}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
