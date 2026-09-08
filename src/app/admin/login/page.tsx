"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

/**
 * Hidden admin login — reachable only by direct URL. Not linked anywhere.
 * POSTs to the existing /api/auth/login endpoint.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message ?? "Login failed.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-lifted"
      >
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-4 text-center text-xl font-bold tracking-tight">Admin access</h1>
        <p className="mt-1 text-center text-xs text-ink-faint">Restricted area — staff only.</p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-ink-faint">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-ink-faint">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>

        {error && <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Sign in
        </button>
      </form>
    </main>
  );
}
