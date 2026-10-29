import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert, Linking, Share, Platform } from 'react-native';
import RNShare from 'react-native-share';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  Social: {
    Whatsapp: 'whatsapp',
  },
  default: {
    open: jest.fn().mockResolvedValue({ success: true, message: 'OK' }),
    shareSingle: jest.fn().mockResolvedValue({ success: true, message: 'OK' }),
    Social: {
      WHATSAPP: 'whatsapp',
    },
  },
}));

jest.mock('react-native-html-to-pdf', () => ({
  __esModule: true,
  generatePDF: jest.fn().mockResolvedValue({ filePath: '/mock/path/SmartMart_Invoice_INV-123456.pdf' }),
}));

import { StaffRoleProvider } from '../../team/context/StaffRoleContext';
import { FeedbackProvider } from '../../../shared/components/feedback/FeedbackProvider';
import { LocalizationProvider } from '../../../shared/i18n/LocalizationProvider';
import StoreBillingScreen from './StoreBillingScreen';

describe('StoreBillingScreen POS Counter Billing', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const renderScreen = () => {
    let renderer: any;
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocalizationProvider>
          <FeedbackProvider>
            <StaffRoleProvider>
              <StoreBillingScreen navigation={mockNavigation} />
            </StaffRoleProvider>
          </FeedbackProvider>
        </LocalizationProvider>
      );
    });
    return renderer;
  };

  it('renders POS Counter Billing screen with SmartMart branding', () => {
    const component = renderScreen();
    const tree = JSON.stringify(component.toJSON());

    expect(tree).toContain('POS Counter Billing');
    expect(tree).toContain('SmartMart Supermarket');
    expect(tree).toContain('Customer Mobile Number');
    expect(tree).toContain('Required for WhatsApp Bill');
  });

  it('shows WhatsApp ready status when 10-digit mobile number is entered', () => {
    const component = renderScreen();
    const root = component.root;

    // Find phone input
    const phoneInputs = root.findAll((node: any) =>
      node.props?.placeholder === 'Enter 10-digit mobile number'
    );
    expect(phoneInputs.length).toBeGreaterThan(0);

    // Enter 10-digit phone
    act(() => {
      phoneInputs[0].props.onChangeText('9876543210');
    });

    const tree = JSON.stringify(component.toJSON());
    expect(tree).toContain('WhatsApp Ready');
  });

  it('displays MRP, discount, subtotal and GST in bill summary', () => {
    const component = renderScreen();
    const tree = JSON.stringify(component.toJSON());

    // Initially has 2 Amul Milk and 3 Maggi in cart
    expect(tree).toContain('Bill Summary');
    expect(tree).toContain('Total MRP (Gross)');
    expect(tree).toContain('Store Discount / Savings');
    expect(tree).toContain('Grand Total');
  });

  it('requires customer mobile number before generating bill', () => {
    const component = renderScreen();
    const root = component.root;

    // Find "Complete & Generate Bill" button
    const generateBtns = root.findAll((node: any) =>
      node.props?.children?.some?.((c: any) =>
        c?.props?.children === 'Generate & WhatsApp Bill'
      )
    );
    expect(generateBtns.length).toBeGreaterThan(0);

    // Click without entering phone
    act(() => {
      generateBtns[0].props.onPress();
    });

    const tree = JSON.stringify(component.toJSON());
    expect(tree).toContain('Customer 10-digit mobile number is mandatory to send WhatsApp bill.');
  });

  it('generates bill with item details, discount and payment method and triggers WhatsApp link', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);

    const component = renderScreen();
    const root = component.root;

    // Enter valid 10-digit customer mobile
    const phoneInput = root.find((node: any) =>
      node.props?.placeholder === 'Enter 10-digit mobile number'
    );
    act(() => {
      phoneInput.props.onChangeText('9876543210');
    });

    // Tap generate bill
    const generateBtn = root.find((node: any) =>
      node.props?.children?.some?.((c: any) =>
        c?.props?.children === 'Generate & WhatsApp Bill'
      )
    );
    act(() => {
      generateBtn.props.onPress();
    });

    const tree = JSON.stringify(component.toJSON());
    // In default DOCUMENT mode, it renders the Market Invoice Document
    expect(tree).toContain('SMARTMART MARKET');
    expect(tree).toContain('TAX INVOICE');
    expect(tree).toContain('9876543210');
    expect(tree).toContain('PAID VIA');
    expect(tree).toContain('CASH');
    expect(tree).toContain('Doc Converted');
    expect(tree).toContain('Send Invoice Doc to WhatsApp');
    expect(tree).toContain('Send via SMS');
    expect(tree).toContain('Share Doc File');

    jest.spyOn(Alert, 'alert');

    // Trigger Send Bill on WhatsApp (iOS presents choice: Share PDF or Open Direct Chat)
    const whatsappBtn = root.find((node: any) =>
      node.props?.children?.some?.((c: any) => {
        const text = Array.isArray(c?.props?.children)
          ? c.props.children.join('')
          : typeof c?.props?.children === 'string'
          ? c.props.children
          : '';
        return text.includes('Send Invoice Doc to WhatsApp');
      })
    );

    await act(async () => {
      await whatsappBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Send Invoice to WhatsApp',
      expect.stringContaining('9876543210'),
      expect.any(Array)
    );

    // Trigger "📄 Share PDF File" option
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const whatsAppDialog = alertCalls.find((call) => call[0] === 'Send Invoice to WhatsApp');
    const sharePdfAction = whatsAppDialog[2].find((btn: any) => btn.text.includes('Share PDF File'));

    await act(async () => {
      await sharePdfAction.onPress();
    });

    expect(RNShare.open).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'application/pdf',
        filename: expect.stringContaining('SmartMart_Invoice_'),
      })
    );

    // Trigger Send via SMS (short text format, not PDF)
    const smsBtn = root.find((node: any) =>
      node.props?.children?.some?.((c: any) =>
        c?.props?.children === 'Send via SMS'
      )
    );
    await act(async () => {
      await smsBtn.props.onPress();
    });
    expect(Linking.openURL).toHaveBeenCalled();
    const calledSmsUrl = (Linking.openURL as jest.Mock).mock.calls[0][0];
    expect(calledSmsUrl).toContain('sms:+919876543210');
    expect(calledSmsUrl).toContain('Thank%20you%20for%20shopping%20at%20SmartMart');

    // Trigger Share Doc File
    const shareBtn = root.find((node: any) =>
      node.props?.children?.some?.((c: any) =>
        c?.props?.children === 'Share Doc File'
      )
    );
    await act(async () => {
      await shareBtn.props.onPress();
    });
    expect(RNShare.open).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'application/pdf',
        filename: expect.stringContaining('SmartMart_Invoice_'),
      })
    );

    // Switch to compact slip tab
    const compactTab = root.find((node: any) =>
      node.props?.children?.some?.((c: any) =>
        c?.props?.children === 'Compact Slip'
      )
    );
    act(() => {
      compactTab.props.onPress();
    });

    const compactTree = JSON.stringify(component.toJSON());
    expect(compactTree).toContain('Bill Generated Successfully!');
  });

  it('shares directly to WhatsApp number on Android as a PDF file', async () => {
    const origPlatform = Platform.OS;
    (Platform as any).OS = 'android';
    try {
      const component = renderScreen();
      const root = component.root;
      const phoneInput = root.find((node: any) =>
        node.props?.placeholder === 'Enter 10-digit mobile number'
      );
      act(() => {
        phoneInput.props.onChangeText('9876543210');
      });
      const generateBtn = root.find((node: any) =>
        node.props?.children?.some?.((c: any) =>
          c?.props?.children === 'Generate & WhatsApp Bill'
        )
      );
      act(() => {
        generateBtn.props.onPress();
      });
      const whatsappBtn = root.find((node: any) =>
        node.props?.children?.some?.((c: any) => {
          const text = Array.isArray(c?.props?.children)
            ? c.props.children.join('')
            : typeof c?.props?.children === 'string'
            ? c.props.children
            : '';
          return text.includes('Send Invoice Doc to WhatsApp');
        })
      );
      await act(async () => {
        await whatsappBtn.props.onPress();
      });
      expect(RNShare.shareSingle).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/pdf',
          social: 'whatsapp',
          whatsAppNumber: '919876543210',
          filename: expect.stringContaining('SmartMart_Invoice_'),
        })
      );
    } finally {
      (Platform as any).OS = origPlatform;
    }
  });
});
