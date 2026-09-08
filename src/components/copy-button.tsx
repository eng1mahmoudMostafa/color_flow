"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Loader2, Lock } from "lucide-react";
import { useToast } from "@/components/toast";
import { useAccess } from "@/components/access-provider";
import { copyToClipboard, cn } from "@/lib/utils";

type Props = {
  /** Text placed on the clipboard (e.g. "#3B82F6"). */
  value: string;
  /** Toast body after a successful copy. */
  toastMessage?: string;
  className?: string;
  label?: string;
  variant?: "icon" | "button";
};

/**
 * Copy control gated by the 30-second rewarded ad.
 * Every click re-checks access via requestCopy() which confirms with the
 * server (/api/access/status). When locked, the ad modal opens and the
 * copy is cancelled — the grant itself is decided server-side.
 */
export function CopyButton({ value, toastMessage, className, label = "Copy", variant = "button" }: Props) {
  const { push } = useToast();
  const { requestCopy } = useAccess();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const allowed = await requestCopy();
      if (!allowed) {
        push("Watch the 30-second ad to unlock copying for 24 hours.", "info");
        return;
      }
      const success = await copyToClipboard(value);
      if (success) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
        push(toastMessage ?? `${value} copied to clipboard.`, "success");
      } else {
        push("Could not access the clipboard. Please copy manually.", "error");
      }
    } catch (err) {
      // Never let an unexpected error crash the whole app — surface a toast.
      console.error("Copy failed:", err);
      push("Something went wrong while copying. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={`Copy ${value}`}
        title="Copy color code"
        className={cn(
          "inline-flex items-center justify-center rounded-full p-2 backdrop-blur transition hover:scale-110 active:scale-95 disabled:opacity-50",
          className
        )}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : copied ? (
          <Check className={cn("h-3.5 w-3.5 text-emerald-400")} aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`${label}: ${value}`}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
        "bg-surface text-ink shadow-soft ring-1 ring-line hover:bg-surface-raised",
        className
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Copy className={cn("h-4 w-4", copied && "text-emerald-500")} aria-hidden />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

/** Navbar badge — shows lock state and live remaining time for unlocked access. */
export function AccessBadge() {
  const { status, openUnlock } = useAccess();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!status?.unlocked) return;
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, [status?.unlocked]);

  if (status?.unlocked && status.expiresAt) {
    const remainingMs = new Date(status.expiresAt).getTime() - now;
    const hours = Math.max(0, Math.floor(remainingMs / 3_600_000));
    const minutes = Math.max(0, Math.floor((remainingMs % 3_600_000) / 60_000));
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900">
        <Check className="h-3 w-3" aria-hidden />
        Copy unlocked · {hours}h {minutes}m
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={openUnlock}
      title="Unlock copying by watching a 30-second ad"
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900 dark:hover:bg-amber-950"
    >
      <Lock className="h-3 w-3" aria-hidden />
      Copy locked · watch ad
    </button>
  );
}
