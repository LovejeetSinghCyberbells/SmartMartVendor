import { DEFAULT_LANGUAGE, isLanguageCode } from './languages';
import { translate } from './translations';

describe('app localization', () => {
  it('translates supported phrases for each registered language', () => {
    expect(translate('hi', 'Settings')).toBe('सेटिंग्स');
    expect(translate('pa', 'Settings')).toBe('ਸੈਟਿੰਗਾਂ');
    expect(translate('gu', 'Settings')).toBe('સેટિંગ્સ');
    expect(translate('mr', 'Settings')).toBe('सेटिंग्ज');
    expect(translate('gu', 'Working Hours')).toBe('કામકાજના કલાકો');
    expect(translate('mr', 'Working Hours')).toBe('कामकाजाचे तास');
    expect(translate('hi', "Today's Orders")).toBe('आज के ऑर्डर');
    expect(translate('hi', "Today’s Orders")).toBe('आज के ऑर्डर');
    expect(translate('gu', "Today’s Orders")).toBe('આજના ઓર્ડર');
    expect(translate('mr', "Today’s Orders")).toBe('आजच्या ऑर्डर्स');
    expect(translate('pa', "Today’s Orders")).toBe('ਅੱਜ ਦੇ ਆਰਡਰ');
    expect(translate('hi', 'Pending Orders')).toBe('लंबित ऑर्डर');
    expect(translate('gu', 'Pending Orders')).toBe('બાકી ઓર્ડર');
    expect(translate('mr', 'Pending Orders')).toBe('प्रलंबित ऑर्डर्स');
    expect(translate('pa', 'Pending Orders')).toBe('ਬਕਾਇਆ ਆਰਡਰ');
    expect(translate('hi', 'Open • Accepting Orders')).toBe('खुला • ऑर्डर स्वीकार रहे हैं');
    expect(translate('hi', 'In Stock (24)')).toContain('स्टॉक में');
  });

  it('falls back to the English source phrase when a translation is missing', () => {
    expect(translate('hi', 'A phrase not yet translated')).toBe(
      'A phrase not yet translated',
    );
    expect(translate('en', 'Settings')).toBe('Settings');
  });

  it('validates language codes against the supported language registry', () => {
    expect(isLanguageCode('hi')).toBe(true);
    expect(isLanguageCode('pa')).toBe(true);
    expect(isLanguageCode('gu')).toBe(true);
    expect(isLanguageCode('mr')).toBe(true);
    expect(isLanguageCode('fr')).toBe(false);
  });

  it('uses English as the default language', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
  });
});
