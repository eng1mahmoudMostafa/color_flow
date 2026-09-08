import Link from "next/link";
import { Palette, MessageCircle } from "lucide-react";
import { CATEGORY_META } from "@/lib/data/palettes";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Palette className="h-3.5 w-3.5" aria-hidden />
              </span>
              Color<span className="text-brand-600 dark:text-brand-400">Flow</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-faint">
              10,000+ color palettes and a harmony generator for designers and developers —
              try any palette live on the site, and unlock color copying with a quick 30-second ad.
            </p>
          </div>
          <nav aria-label="Categories" className="grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-3">
            {CATEGORY_META.slice(0, 12).map((c) => (
              <Link
                key={c.key}
                href={`/explore?category=${c.key}`}
                className="text-sm text-ink-soft transition hover:text-brand-600 dark:hover:text-brand-400"
              >
                {c.label} palettes
              </Link>
            ))}
          </nav>
        </div>

        {/* Advertise-with-us banner — direct WhatsApp contact (AR + EN) */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 p-5 text-center sm:flex-row sm:justify-between sm:text-start dark:border-emerald-800 dark:bg-emerald-950/40">
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              📢 ضع إعلانك هنا — Your ad here
            </p>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">
              تواصل واتساب على هذا الرقم:{" "}
              <span dir="ltr" className="font-mono font-semibold">+20 113 027 8851</span>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href="https://wa.me/201130278851?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D9%88%D8%B6%D8%B9%20%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D9%8A%20%D8%B9%D9%84%D9%89%20%D9%85%D9%88%D9%82%D8%B9%20ColorFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              واتساب
            </a>
            <a
              href="https://wa.me/201130278851?text=Hello%2C%20I%20want%20to%20place%20my%20ad%20on%20the%20ColorFlow%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-line pt-6 text-xs text-ink-faint">
          © {new Date().getFullYear()} ColorFlow. All palettes are free to use in your projects.
          <span className="mx-1.5">·</span>
          Designed &amp; developed by <span className="font-semibold text-ink-soft">البشمهندس محمود مصطفى</span>
        </p>
      </div>
    </footer>
  );
}
