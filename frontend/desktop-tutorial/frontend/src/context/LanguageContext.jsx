import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTranslations } from '../api/cropApi';

const LanguageContext = createContext();
const STORAGE_KEY = 'fasal-sathi-language';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'bn', label: 'বাংলা', short: 'বাং' },
  { code: 'hi', label: 'हिन्दी', short: 'हिं' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage access issues on restricted browsers.
    }
    document.documentElement.lang = language;
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    getTranslations()
      .then((res) => {
        if (!cancelled) setTranslations(res.data);
      })
      .catch(() => {
        // Translations are nice-to-have; fall back to keys
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = useCallback(
    (key) => {
      if (!key) return '';
      return translations[language]?.[key] || translations['en']?.[key] || key;
    },
    [language, translations],
  );

  const value = {
    language,
    setLanguage,
    t,
    translations,
    loading,
    languages: LANGUAGE_OPTIONS,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
