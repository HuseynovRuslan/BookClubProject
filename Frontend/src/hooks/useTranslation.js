import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

export function useTranslation() {
  const { language } = useLanguage();
  
  return (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
}
