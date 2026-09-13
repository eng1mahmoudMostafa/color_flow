"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { CrashBoundary } from "@/components/crash-boundary";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<{ push: (message: string, variant?: ToastVariant) => void }>({
  push: () => undefined,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, message, variant }]);
    window.setTimeout(() => {
      // Plain state removal — no exit animation, so Translate-rewritten text
      // nodes are simply dropped by React instead of measured/animated.
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts live in their own crash boundary: even if auto-translate
          rewrites a toast node, only the toast subtree resets — the page
          (and the copy result) is never replaced by an error page. */}
      <CrashBoundary>
        <div
          aria-live="polite"
          aria-atomic="false"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      </CrashBoundary>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div
      role="status"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
        transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
      }}
      className={cn(
        "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lifted backdrop-blur",
        toast.variant === "success" &&
          "border-emerald-200/60 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/90 dark:text-emerald-100",
        toast.variant === "error" &&
          "border-red-200/60 bg-red-50/95 text-red-900 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100",
        toast.variant === "info" &&
          "border-line bg-surface-raised/95 text-ink"
      )}
    >
      {toast.variant === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
      {toast.variant === "error" && <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />}
      {toast.variant === "info" && <Info className="h-4 w-4 shrink-0" aria-hidden />}
      {/* notranslate: the toast carries technical code values (HEX/RGB) that
          must never be rewritten in place — the one rewrite that crashed React. */}
      <span translate="no" className="notranslate">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="ml-1 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

