"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";

/** Toggles the UI language cookie (en ⇄ ar) and refreshes server components. */
export function LangToggle({ current }: { current: "en" | "ar" }) {
  const [pending, startTransition] = useTransition();
  const next = current === "ar" ? "en" : "ar";

  const onClick = () => {
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={current === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      title={current === "ar" ? "English" : "العربية"}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface-raised hover:text-ink disabled:opacity-50"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {current === "ar" ? "EN" : "ع"}
    </button>
  );
}
