import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Formats remaining milliseconds as "23h 41m" / "58m" / "42s". */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "expired";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((ms % 60_000) / 1000);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const fallback = (): boolean => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      // Keep it out of view WITHOUT display:none (some browsers + translate
      // extensions refuse to select hidden nodes, which used to throw during copy).
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      textarea.setAttribute("translate", "no");
      document.body.appendChild(textarea);
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      // Last resort: never throw — a failed copy must show a toast, not crash.
      try {
        const stray = document.querySelectorAll("textarea[data-cf-copy]");
        stray.forEach((n) => n.parentNode?.removeChild(n));
      } catch {
        /* ignore */
      }
      return false;
    }
  };
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof window !== "undefined" && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallback();
  } catch {
    return fallback();
  }
}
