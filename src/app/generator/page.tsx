import type { Metadata } from "next";
import { Generator } from "@/components/generator";

export const metadata: Metadata = {
  title: "Color Generator",
  description: "Generate monochromatic, analogous, complementary, triadic and tetradic color harmonies.",
};

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Harmony generator</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Pick a base color and a harmony rule — we generate mathematically balanced palettes.
          Every generated shade is deterministic, so the same inputs always produce the same set.
        </p>
      </header>
      <Generator />
      <p className="mt-6 text-center text-xs text-ink-faint">
        Copying generated colors is completely free — no ads, no lock.
      </p>
    </div>
  );
}
