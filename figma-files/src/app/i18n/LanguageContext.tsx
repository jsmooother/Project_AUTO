import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'sv' | 'de';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('agentic-ads-language');
    if (saved === 'en' || saved === 'sv' || saved === 'de') {
      return saved;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('sv')) return 'sv';
    if (browserLang.startsWith('de')) return 'de';
    return 'en';
  });

  useEffect(() => {
    // Save language preference
    localStorage.setItem('agentic-ads-language', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
