"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang, TranslationKey } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  toggleLang: () => {},
  t: (key) => translate(key, "ar"),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(key, lang),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
