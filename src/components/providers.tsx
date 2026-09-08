"use client";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/toast";
import { AccessProvider } from "@/components/access-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ToastProvider>
        <AccessProvider>{children}</AccessProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
