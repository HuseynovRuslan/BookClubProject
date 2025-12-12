import { createContext, useContext, useState, useEffect } from "react";

const LANGUAGES = {
  en: { code: "en", name: "English", nativeName: "English" },
  ru: { code: "ru", name: "Russian", nativeName: "Русский" },
  tr: { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  az: { code: "az", name: "Azerbaijani", nativeName: "Azərbaycanca" }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("bookverse_language");
    return saved && LANGUAGES[saved] ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("bookverse_language", language);
  }, [language]);

  const changeLanguage = (langCode) => {
    if (LANGUAGES[langCode]) {
      setLanguage(langCode);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
