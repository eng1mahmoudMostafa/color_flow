"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const push = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts live in their own crash boundary: even if auto-translate
          rewrites a toast node mid-animation, only the toast subtree resets —
          the page (and the copy result) is never replaced by an error page.
          The container itself stays translatable; only the technical code
          value inside keeps translate="no". */}
      <CrashBoundary>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              // layout={false} + no manual DOM reads: keeps framer-motion from
              // touching nodes Translate may have rewritten.
              layout={false}
              className={cn(
                "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lifted backdrop-blur",
                toast.variant === "success" &&
                  "border-emerald-200/60 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/90 dark:text-emerald-100",
                toast.variant === "error" &&
                  "border-red-200/60 bg-red-50/95 text-red-900 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100",
                toast.variant === "info" &&
                  "border-line bg-surface-raised/95 text-ink"
              )}
              role="status"
            >
              {toast.variant === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
              {toast.variant === "error" && <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />}
              {toast.variant === "info" && <Info className="h-4 w-4 shrink-0" aria-hidden />}
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
                aria-label="Dismiss notification"
                className="ml-1 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </CrashBoundary>
    </ToastContext.Provider>
  );
}
