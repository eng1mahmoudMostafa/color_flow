"use client";

import Link from "next/link";
import { useState } from "react";
import { Palette, LayoutGrid, Wand2, Menu, X, Lock, Heart } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccessBadge } from "@/components/copy-button";

const NAV_LINKS = [
  { href: "/explore", label: "Explore", icon: LayoutGrid },
  { href: "/generator", label: "Generator", icon: Wand2 },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

/** Navigation — no sign-in; access is guest-based and granted by watching the ad. */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Palette className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg">
            Color<span className="text-brand-600 dark:text-brand-400">Flow</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
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
            {NAV_LINKS.map((link) => (
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
