import { createContext, useContext, useState } from "react";
import { translations, type UILocale } from "./i18n";

interface LocaleContextValue {
  locale: UILocale;
  setLocale: (code: UILocale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<UILocale>("en");
  const t = (key: string) => translations[locale][key] ?? translations.en[key] ?? key;
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
