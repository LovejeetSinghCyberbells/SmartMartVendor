import { DEFAULT_LANGUAGE, isLanguageCode } from './languages';
import { translate } from './translations';

describe('app localization', () => {
  it('translates supported phrases for each registered language', () => {
    expect(translate('hi', 'Settings')).toBe('सेटिंग्स');
    expect(translate('pa', 'Settings')).toBe('ਸੈਟਿੰਗਾਂ');
  });

  it('falls back to the English source phrase when a translation is missing', () => {
    expect(translate('hi', 'A phrase not yet translated')).toBe(
      'A phrase not yet translated',
    );
    expect(translate('en', 'Settings')).toBe('Settings');
  });

  it('validates language codes against the supported language registry', () => {
    expect(isLanguageCode('hi')).toBe(true);
    expect(isLanguageCode('fr')).toBe(false);
  });

  it('uses English as the default language', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
  });
});
