"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Palette, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchResult = {
  results: { type: string; slug: string; name: string; colors: string[] }[];
  categories: { key: string; label: string }[];
  rateLimited: boolean;
};

/** Debounced search with a results dropdown. */
export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      setOpen(false);
      return;
    }
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.ok) {
          setData(json.data as SearchResult);
          setOpen(true);
        }
      } catch {
        // Keep previous results on network errors.
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  // Dismiss on outside click / Escape.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hasResults = (data?.results.length ?? 0) > 0 || (data?.categories.length ?? 0) > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && hasResults}
          aria-label="Search palettes and colors"
          placeholder="Search palettes, colors, hex…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          className="w-full rounded-xl border border-line bg-surface-raised py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-ink-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" aria-hidden />
        )}
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lifted"
        >
          {hasResults ? (
            <ul className="max-h-96 overflow-auto py-1.5">
              {(data?.results ?? []).map((r) => (
                <li key={r.slug}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      router.push(`/palette/${r.slug}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-raised"
                  >
                    <Palette className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                    <span className="flex-1 truncate text-sm font-medium">{r.name}</span>
                    <span className="flex shrink-0 -space-x-1">
                      {r.colors.map((c) => (
                        <span
                          key={c}
                          className="h-4 w-4 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: c }}
                          aria-hidden
                        />
                      ))}
                    </span>
                  </button>
                </li>
              ))}
              {(data?.categories ?? []).map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      router.push(`/explore?category=${c.key}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-raised"
                  >
                    <span className="flex-1 text-sm font-medium">
                      Category: <span className="text-brand-600 dark:text-brand-400">{c.label}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && query.trim() && (
              <p className="px-4 py-3 text-sm text-ink-faint">No results for “{query.trim()}”.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
