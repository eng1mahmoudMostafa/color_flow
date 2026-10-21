import type { Metadata } from "next";
import { Generator } from "@/components/generator";
import { DICT, getLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Color Generator",
  description: "Generate monochromatic, analogous, complementary, triadic and tetradic color harmonies.",
};

export default async function GeneratorPage() {
  const lang = await getLang();
  const t = DICT[lang].generator;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.sub}</p>
      </header>
      <Generator />
      <p className="mt-6 text-center text-xs text-ink-faint">{t.free}</p>
    </div>
  );
}
