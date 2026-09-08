"use client";

/**
 * Guest favorites — stored in localStorage. The site has no accounts, so
 * favorites work instantly for every visitor without any sign-in.
 */

const STORAGE_KEY = "colorflow:favorites";
const CHANGE_EVENT = "colorflow:favorites-changed";

export function getFavoriteSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return getFavoriteSlugs().includes(slug);
}

export function toggleFavorite(slug: string): boolean {
  const slugs = getFavoriteSlugs();
  const exists = slugs.includes(slug);
  const next = exists ? slugs.filter((s) => s !== slug) : [...slugs, slug];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-500)));
  } catch {
    // storage full/blocked — ignore
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  return !exists;
}

/** Subscribe to favorites changes; returns an unsubscribe function. */
export function onFavoritesChange(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
