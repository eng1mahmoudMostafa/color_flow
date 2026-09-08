"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
   */
  requestCopy: () => Promise<boolean>;
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

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/access/status", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setStatus(json.data as AccessStatusResponse);
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

  const requestCopy = useCallback(async () => {
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
    setAdOpen(true);
    return false;
  }, []);

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
