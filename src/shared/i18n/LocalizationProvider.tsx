import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LANGUAGE,
  isLanguageCode,
  type LanguageCode,
} from './languages';
import { translate } from './translations';

const LANGUAGE_STORAGE_KEY = '@smart-mart/language';

type LocalizationContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (source: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export const LocalizationProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((storedLanguage) => {
        if (isMounted && storedLanguage && isLanguageCode(storedLanguage)) {
          setLanguageState(storedLanguage);
        }
      })
      .catch((error: unknown) => {
        console.error('Unable to load the saved language preference.', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (source: string) => translate(language, source),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used inside LocalizationProvider.');
  }
  return context;
};
