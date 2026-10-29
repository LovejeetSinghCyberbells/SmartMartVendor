export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const isLanguageCode = (value: string): value is LanguageCode =>
  SUPPORTED_LANGUAGES.some((language) => language.code === value);
