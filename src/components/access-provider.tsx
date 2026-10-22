"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AccessStatusResponse } from "@/types";
import { AdModal } from "@/components/ad-modal";

type AccessContextValue = {
  /** UI cache of the server's authoritative state — never a permission source. */
  status: AccessStatusResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /**
   * Gate every copy action. Returns true when access is already unlocked.
   * When locked it opens the 30-second rewarded-ad modal and returns false —
   * the actual grant is verified server-side (POST /api/ad/verify).
   *
   * `onUnlocked` is optional: it runs automatically once the visitor finishes
   * watching the ad, so the action they originally requested completes
   * without a second click.
   */
  requestCopy: (onUnlocked?: () => void) => Promise<boolean>;
  openUnlock: () => void;
};

const AccessContext = createContext<AccessContextValue>({
  status: null,
  loading: true,
  refresh: async () => undefined,
  requestCopy: async () => false,
  openUnlock: () => undefined,
});

export function useAccess() {
  return useContext(AccessContext);
}

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AccessStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [adOpen, setAdOpen] = useState(false);
  /** Action to run once the ad grants access (e.g. the pending clipboard write). */
  const pendingAction = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/access/status", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        const data = json.data as AccessStatusResponse;
        setStatus(data);
        // A pending action (copy) resumes as soon as the server confirms access.
        if (data.unlocked && data.remainingMs > 0 && pendingAction.current) {
          const action = pendingAction.current;
          pendingAction.current = null;
          action();
        }
      }
    } catch {
      // Network failures leave the UI in its previous state.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Re-validate against the server when the tab regains focus.
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const openUnlock = useCallback(() => setAdOpen(true), []);

  const requestCopy = useCallback(
    async (onUnlocked?: () => void) => {
      // Always confirm against the server before allowing the copy.
      try {
        const res = await fetch("/api/access/status", { cache: "no-store" });
        const json = await res.json();
        if (json.ok) {
          const data = json.data as AccessStatusResponse;
          setStatus(data);
          if (data.unlocked && data.remainingMs > 0) return true;
        }
      } catch {
        // fall through to lock
      }
      // Remember what the visitor wanted to copy so it runs right after the ad.
      pendingAction.current = onUnlocked ?? null;
      setAdOpen(true);
      return false;
    },
    []
  );

  const value = useMemo(
    () => ({
      status,
      loading,
      refresh,
      requestCopy,
      openUnlock,
    }),
    [status, loading, refresh, requestCopy, openUnlock]
  );

  return (
    <AccessContext.Provider value={value}>
      {children}
      <AdModal
        open={adOpen}
        onClose={() => {
          setAdOpen(false);
          void refresh();
        }}
        onComplete={refresh}
      />
    </AccessContext.Provider>
  );
}
