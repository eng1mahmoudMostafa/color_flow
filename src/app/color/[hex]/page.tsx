import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hexSchema } from "@/lib/validation";
import { normalizeHex, contrastRatio, contrastGrade, bestTextColor } from "@/lib/colors";
import { findColorInPalettes, listPalettes } from "@/lib/palettes";
import { PaletteCard } from "@/components/palette-card";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

type Params = Promise<{ hex: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hex } = await params;
  return { title: `Color ${decodeURIComponent(hex).toUpperCase()} — Details & Contrast` };
}

export default async function ColorPage({ params }: { params: Params }) {
  const raw = (await params).hex;
  const parsed = hexSchema.safeParse(decodeURIComponent(raw));
  if (!parsed.success) notFound();
  const hex = normalizeHex(parsed.data ?? "#000000");

  const rgb = await import("@/lib/colors").then((m) => m.hexToRgb(hex));
  const hsl = await import("@/lib/colors").then((m) => m.rgbToHsl(rgb));
  const cmyk = await import("@/lib/colors").then((m) => m.rgbToCmyk(rgb));
  const fmt = await import("@/lib/colors");
  const hslComp = fmt.hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
  const compHex = fmt.rgbToHex(hslComp);

  const onWhite = contrastRatio(hex, "#ffffff");
  const onBlack = contrastRatio(hex, "#0b1020");
  const best = bestTextColor(hex);

  const foundIn = await findColorInPalettes(hex);
  const { palettes: related } = await listPalettes({ perPage: 4 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-line shadow-lifted">
        <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-end" style={{ backgroundColor: hex, color: best === "#0b1020" ? "#0b1020" : "#ffffff" }}>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{hex.toUpperCase()}</h1>
            <p className="mt-1 text-sm opacity-80">{foundIn[0]?.color.name ?? "Color detail"}</p>
          </div>
          <CopyButton
            value={hex.toUpperCase()}
            label="Copy HEX"
            toastMessage={`${hex.toUpperCase()} copied to clipboard.`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          ["RGB", fmt.formatRgb(rgb)],
          ["HSL", fmt.formatHsl(hsl)],
          ["CMYK", fmt.formatCmyk(cmyk)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-faint">{label}</span>
            <span className="font-mono text-sm">{value}</span>
          </div>
        ))}
        <Link
          href={`/color/${compHex.replace("#", "")}`}
          className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition hover:bg-surface-raised"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Complementary</span>
          <span className="flex items-center gap-2 font-mono text-sm">
            <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: compHex }} aria-hidden />
            {compHex.toUpperCase()}
          </span>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Contrast on white</p>
          <p className="mt-1.5 font-mono text-lg">{onWhite.toFixed(2)}:1 — {contrastGrade(onWhite)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Contrast on black</p>
          <p className="mt-1.5 font-mono text-lg">{onBlack.toFixed(2)}:1 — {contrastGrade(onBlack)}</p>
        </div>
      </div>

      {foundIn.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">Found in palettes</h2>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {foundIn.map((m) => (
              <li key={m.palette.slug}>
                <Link
                  href={`/palette/${m.palette.slug}`}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-raised"
                >
                  {m.palette.name} — as {m.color.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-5 text-xl font-bold tracking-tight">Explore more palettes</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <PaletteCard key={p.slug} palette={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
