"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, Wand2, Menu, X, Lock, Heart } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccessBadge } from "@/components/copy-button";
import { LangToggle } from "@/components/lang-toggle";
import { DICT, type Lang } from "@/lib/i18n";

/** Navigation — no sign-in; access is guest-based and granted by watching the ad. */
export function Navbar({ lang = "en" }: { lang?: Lang }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = DICT[lang].nav;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
          {/* Brand mark — blue artist-palette logo, same artwork as src/app/icon.svg */}
          <span className="flex h-8 w-8 items-center justify-center shadow-soft">
            <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden>
              <path d="M32 6C17 6 5 17.5 5 32s12 26 27 26c4.5 0 7-2.6 7-6 0-3.2-2.4-4.7-2.4-7.6 0-3.1 2.5-5.4 6-5.4h5.6c6 0 10.8-4.8 10.8-10.9C59 15.8 46.9 6 32 6z" fill="#2563eb"/>
              <circle cx="17.5" cy="24" r="4" fill="currentColor" className="text-white"/>
              <circle cx="30" cy="17.5" r="4" fill="currentColor" className="text-white"/>
              <circle cx="43.5" cy="21.5" r="4" fill="currentColor" className="text-white"/>
              <circle cx="15.5" cy="37" r="4" fill="currentColor" className="text-white"/>
              <circle cx="41" cy="45.5" r="3.4" fill="#2563eb"/>
            </svg>
          </span>
          <span className="text-lg">
            Color<span className="text-brand-600 dark:text-brand-400">Flow</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {[
            { href: "/explore", label: t.explore, icon: LayoutGrid },
            { href: "/generator", label: t.generator, icon: Wand2 },
            { href: "/gradients", label: t.gradients, icon: LayoutGrid },
            { href: "/favorites", label: t.favorites, icon: Heart },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-surface-raised hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center px-2 lg:flex">
          <SearchBar className="w-full max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden sm:block">
            <AccessBadge />
          </div>
          <LangToggle current={lang} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft ring-1 ring-line md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <SearchBar className="mb-3" />
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {[
              { href: "/explore", label: t.explore, icon: LayoutGrid },
              { href: "/generator", label: t.generator, icon: Wand2 },
              { href: "/gradients", label: t.gradients, icon: LayoutGrid },
              { href: "/favorites", label: t.favorites, icon: Heart },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-surface-raised hover:text-ink"
              >
                <link.icon className="h-4 w-4" aria-hidden /> {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
