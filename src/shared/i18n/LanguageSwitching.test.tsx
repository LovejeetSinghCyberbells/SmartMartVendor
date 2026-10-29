jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { LocalizationProvider, useLocalization } from './LocalizationProvider';
import LocalizedText from './LocalizedText';
import OrderStatusBadge from '../../features/orders/components/OrderStatusBadge';
import StockBadge from '../../features/inventory/components/StockBadge';
import { translate } from './translations';
import { SUPPORTED_LANGUAGES, type LanguageCode } from './languages';

describe('Full-App Language Switching Engine', () => {
  it('supports all 5 app languages (English, Hindi, Punjabi, Gujarati, Marathi)', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('pa');
    expect(codes).toContain('gu');
    expect(codes).toContain('mr');
  });

  it('translates core vendor home metrics across all 4 Indic languages', () => {
    const languages: LanguageCode[] = ['hi', 'pa', 'gu', 'mr'];
    for (const lang of languages) {
      expect(translate(lang, "Today's Orders")).not.toBe("Today's Orders");
      expect(translate(lang, "Today’s Orders")).not.toBe("Today’s Orders");
      expect(translate(lang, "Pending Orders")).not.toBe("Pending Orders");
      expect(translate(lang, "Quick Actions")).not.toBe("Quick Actions");
      expect(translate(lang, "Low Stock Alert")).not.toBe("Low Stock Alert");
      expect(translate(lang, "Operating Hours")).not.toBe("Operating Hours");
      expect(translate(lang, "POS Counter Billing")).not.toBe("POS Counter Billing");
    }
  });

  it('dynamically translates OrderStatusBadge and StockBadge', () => {
    expect(translate('hi', 'NEW')).toBe('नया');
    expect(translate('gu', 'NEW')).toBe('નવું');
    expect(translate('mr', 'NEW')).toBe('नवीन');
    expect(translate('pa', 'NEW')).toBe('ਨਵਾਂ');

    expect(translate('hi', 'READY')).toBe('तैयार');
    expect(translate('gu', 'READY')).toBe('તૈયાર');
    expect(translate('mr', 'READY')).toBe('तयार');

    expect(translate('hi', 'DELIVERED')).toBe('डिलीवर हुआ');
    expect(translate('gu', 'DELIVERED')).toBe('ડિલિવર થયું');
    expect(translate('mr', 'DELIVERED')).toBe('वितरित');

    expect(translate('hi', 'In Stock (24)')).toBe('स्टॉक में (24)');
    expect(translate('gu', 'In Stock (24)')).toBe('સ્ટોકમાં (24)');
    expect(translate('mr', 'In Stock (24)')).toBe('स्टॉकमध्ये (24)');
    expect(translate('pa', 'In Stock (24)')).toBe('ਸਟਾਕ ਵਿੱਚ (24)');
  });

  it('re-renders LocalizedText component when setLanguage is called', async () => {
    let contextHelper: any;
    const TestConsumer = () => {
      contextHelper = useLocalization();
      return (
        <>
          <LocalizedText testID="stats-title">Today’s Orders</LocalizedText>
          <LocalizedText testID="pending-title">Pending Orders</LocalizedText>
          <OrderStatusBadge status="READY" />
          <StockBadge stock={15} />
        </>
      );
    };

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocalizationProvider>
          <TestConsumer />
        </LocalizationProvider>
      );
    });

    // Initial language is English
    expect(contextHelper.language).toBe('en');

    // Change to Gujarati
    await act(async () => {
      await contextHelper.setLanguage('gu');
    });

    expect(contextHelper.language).toBe('gu');
    const root = renderer!.root;
    const nativeTexts = root.findAllByType('Text' as any);
    const renderedTexts = nativeTexts.map((t) => t.props.children).flat();
    expect(renderedTexts).toContain('આજના ઓર્ડર');
    expect(renderedTexts).toContain('બાકી ઓર્ડર');

    // Change to Marathi
    await act(async () => {
      await contextHelper.setLanguage('mr');
    });

    expect(contextHelper.language).toBe('mr');
    const marathiTexts = root.findAllByType('Text' as any).map((t) => t.props.children).flat();
    expect(marathiTexts).toContain('आजच्या ऑर्डर्स');
    expect(marathiTexts).toContain('प्रलंबित ऑर्डर्स');

    // Change to Hindi
    await act(async () => {
      await contextHelper.setLanguage('hi');
    });

    expect(contextHelper.language).toBe('hi');
    const hindiTexts = root.findAllByType('Text' as any).map((t) => t.props.children).flat();
    expect(hindiTexts).toContain('आज के ऑर्डर');
    expect(hindiTexts).toContain('लंबित ऑर्डर');

    // Change to Punjabi
    await act(async () => {
      await contextHelper.setLanguage('pa');
    });

    expect(contextHelper.language).toBe('pa');
    const punjabiTexts = root.findAllByType('Text' as any).map((t) => t.props.children).flat();
    expect(punjabiTexts).toContain('ਅੱਜ ਦੇ ਆਰਡਰ');
    expect(punjabiTexts).toContain('ਬਕਾਇਆ ਆਰਡਰ');
  });
});
