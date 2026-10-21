"use client";

import { createContext, useContext } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/toast";
import { AccessProvider } from "@/components/access-provider";
import { DICT, type Lang, categoryLabel } from "@/lib/i18n";

export { categoryLabel };

const LangContext = createContext<Lang>("en");

export function Providers({ children, lang = "en" }: { children: React.ReactNode; lang?: Lang }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ToastProvider>
        <AccessProvider>
          <LangContext.Provider value={lang}>{children}</LangContext.Provider>
        </AccessProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/** Current UI language (provided by the server layout). */
export function useLang(): Lang {
  return useContext(LangContext);
}

/** Typed dictionary for the active language. */
export function useDict() {
  const lang = useLang();
  return DICT[lang];
}

