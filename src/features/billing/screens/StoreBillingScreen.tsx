import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Modal,
  Share,
  Dimensions,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import LocalizedTextInput from '../../../shared/i18n/LocalizedTextInput';
import {
  ScreenHeader,
  SearchBar,
  Badge,
  AnimatedEntranceView,
} from '../../../shared/components/common';
import { useStaffRole } from '../../team';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';
import { InvoiceDocumentView } from '../components/InvoiceDocumentView';
import {
  generateInvoiceHtml,
  generateInvoicePdf,
  generateInvoicePdfDataUri,
  generateInvoiceFileName,
  generateInvoiceSmsMessage,
  generateInvoiceWhatsAppMessage,
} from '../utils/InvoiceDocumentGenerator';
import { createInvoicePdf, buildInvoiceHtml, buildWhatsAppInvoiceMessage } from '../../../utils/invoicePdf';

interface SafeRNShare {
  open: (options: any) => Promise<any>;
  shareSingle?: (options: any) => Promise<any>;
  Social?: any;
}

let cachedRNShare: SafeRNShare | null = null;
let hasCheckedRNShare = false;

function getSafeRNShare(): SafeRNShare | null {
  if (hasCheckedRNShare) return cachedRNShare;
  hasCheckedRNShare = true;
  try {
    const mod = require('react-native-share');
    cachedRNShare = mod.default || mod;
  } catch (err) {
    console.warn(
      '[StoreBillingScreen] react-native-share is not registered in the currently running native binary. Rebuild app (e.g. npx react-native run-ios) to enable native PDF sharing.',
      err
    );
  }
  return cachedRNShare;
}

const { width } = Dimensions.get('window');

interface BillingProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  unit: string;
  stock: number;
  barcode: string;
}

interface CartItem {
  product: BillingProduct;
  quantity: number;
}

const STORE_CATALOG: BillingProduct[] = [
  { id: '1', name: 'Amul Taaza Toned Milk', category: 'Dairy', price: 54, mrp: 58, unit: '1L', stock: 24, barcode: '890126201015' },
  { id: '2', name: 'Fortune Sunlite Refined Oil', category: 'Pantry', price: 145, mrp: 165, unit: '1L', stock: 12, barcode: '890600728101' },
  { id: '3', name: 'Aashirvaad Shudh Chakki Atta', category: 'Flours', price: 280, mrp: 310, unit: '5kg', stock: 8, barcode: '890103038291' },
  { id: '4', name: 'Tata Salt Vacuum Evaporated', category: 'Pantry', price: 28, mrp: 30, unit: '1kg', stock: 45, barcode: '890400440021' },
  { id: '5', name: 'Maggi 2-Minute Masala Noodles', category: 'Snacks', price: 14, mrp: 16, unit: '70g', stock: 60, barcode: '890105885220' },
  { id: '6', name: 'Coca-Cola Original Taste', category: 'Beverages', price: 40, mrp: 45, unit: '750ml', stock: 18, barcode: '890176401221' },
  { id: '7', name: 'Britannia Good Day Butter', category: 'Bakery', price: 30, mrp: 35, unit: '120g', stock: 32, barcode: '890106301112' },
  { id: '8', name: 'Fresh Farm Tomatoes (Local)', category: 'Veggies', price: 35, mrp: 42, unit: '1kg', stock: 15, barcode: '890100010001' },
  { id: '9', name: 'Fresh Red Onions', category: 'Veggies', price: 42, mrp: 50, unit: '1kg', stock: 20, barcode: '890100010002' },
  { id: '10', name: 'Colgate Strong Teeth Toothpaste', category: 'Care', price: 95, mrp: 110, unit: '150g', stock: 14, barcode: '890131401019' },
];

const CATEGORIES = ['All', 'Dairy', 'Pantry', 'Flours', 'Snacks', 'Beverages', 'Veggies', 'Bakery', 'Care'];

type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export const StoreBillingScreen: React.FC<{ navigation?: any; isTab?: boolean }> = ({
  navigation,
  isTab = false,
}) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { permissions } = currentEmployee;
  const { showToast } = useFeedback();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([
    { product: STORE_CATALOG[0], quantity: 2 },
    { product: STORE_CATALOG[4], quantity: 3 },
  ]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [cashTendered, setCashTendered] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptViewMode, setReceiptViewMode] = useState<'DOCUMENT' | 'COMPACT'>('DOCUMENT');
  const [lastBill, setLastBill] = useState<any>(null);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  // Filter Catalog
  const filteredProducts = useMemo(() => {
    return STORE_CATALOG.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  // Cart Calculations
  const totalMrp = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.mrp || item.product.price) * item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalDiscount = useMemo(() => {
    return Math.max(0, totalMrp - subtotal);
  }, [totalMrp, subtotal]);

  const taxAmount = useMemo(() => {
    return Math.round(subtotal * 0.05); // 5% GST
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const cashChange = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0;
    return Math.max(0, tendered - grandTotal);
  }, [cashTendered, grandTotal]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const isPhoneValid = customerPhone.replace(/\D/g, '').length === 10;

  const handlePhoneChange = (val: string) => {
    const numericOnly = val.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(numericOnly);
    if (phoneError) setPhoneError(null);
  };

  // Handlers with CRUD permission checks
  const handleAddToCart = (product: any) => {
    if (!permissions.billing.update) {
      Alert.alert('Permission Restricted', 'You do not have permission to modify billing cart.');
      return;
    }
    const normalizedProduct: BillingProduct = {
      id: String(product.id),
      name: product.name,
      category: product.category || 'Grocery',
      price: product.price ?? product.storePrice ?? 0,
      mrp: product.mrp ?? product.price ?? product.storePrice ?? 0,
      unit: product.unit || '1 unit',
      stock: product.stock ?? product.shelfStock ?? 10,
      barcode: product.barcode || '',
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === normalizedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: normalizedProduct, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    if (!permissions.billing.update) {
      Alert.alert('Permission Restricted', 'You do not have permission to adjust item quantities.');
      return;
    }
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    if (!permissions.billing.delete) {
      Alert.alert('Permission Restricted', 'You do not have permission to remove items from bill.');
      return;
    }
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (!permissions.billing.delete) {
      Alert.alert('Permission Restricted', 'You do not have permission to void billing carts.');
      return;
    }
    setCart([]);
    setCustomerPhone('');
    setPhoneError(null);
    setCashTendered('');
  };

  const handleGenerateBill = () => {
    if (!permissions.billing.create) {
      Alert.alert('Permission Restricted', 'You do not have permission to finalize or create bills.');
      return;
    }
    if (cart.length === 0) {
      showToast('Billing cart is empty. Add products to continue.', 'info');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setPhoneError('Customer 10-digit mobile number is mandatory to send WhatsApp bill.');
      showToast('Customer mobile number is required for WhatsApp billing.', 'error');
      return;
    }
    setPhoneError(null);

    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const billData = {
      invoiceNumber,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      cashier: currentEmployee.name ? `${currentEmployee.name} (${currentEmployee.roleTitle})` : 'Rahul Sharma (Store Associate)',
      customerPhone: cleanPhone,
      items: [...cart],
      totalMrp,
      totalDiscount,
      subtotal,
      tax: taxAmount,
      grandTotal,
      paymentMode,
      cashTendered: paymentMode === 'CASH' ? parseFloat(cashTendered) || grandTotal : undefined,
      cashChange: paymentMode === 'CASH' ? cashChange : undefined,
    };

    setLastBill(billData);
    setShowReceiptModal(true);
  };

  const handleFinishAndNewBill = () => {
    setShowReceiptModal(false);
    handleClearCart();
  };

  const openDirectWhatsAppChat = async (bill = lastBill) => {
    if (!bill) return;
    const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert('Mobile Number Required', 'A valid 10-digit mobile number is required to send the bill on WhatsApp.');
      return;
    }

    const phoneWithCountry = `91${cleanPhone}`;
    const message = buildWhatsAppInvoiceMessage(bill);
    const nativeUrl = `whatsapp://send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(nativeUrl);
      if (canOpen) {
        await Linking.openURL(nativeUrl);
        showToast(`Opening WhatsApp for +91 ${cleanPhone}`, 'success');
      } else {
        await Linking.openURL(webUrl);
        showToast(`Opening WhatsApp Web for +91 ${cleanPhone}`, 'success');
      }
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert(
          'WhatsApp Notice',
          `Could not open WhatsApp for +91 ${cleanPhone}. Please ensure WhatsApp is installed.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share Doc File', onPress: () => handleShareReceipt() },
          ]
        );
      }
    }
  };

  const handleSendOnWhatsApp = async (bill = lastBill) => {
    if (!bill || isSharingPdf) return;
    const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert('Mobile Number Required', 'A valid 10-digit mobile number is required to send the bill on WhatsApp.');
      return;
    }

    setIsSharingPdf(true);
    try {
      // 1. Generate the real physical PDF document on device
      const pdfPath = await createInvoicePdf(bill);
      const safeInvoiceId = (bill.invoiceNumber || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `SmartMart_Invoice_${safeInvoiceId}`;
      const phoneWithCountry = `91${cleanPhone}`;
      const rnShare = getSafeRNShare();

      // 2. On Android: Send the PDF file directly to that customer's WhatsApp chat
      if (Platform.OS === 'android') {
        if (rnShare && typeof rnShare.shareSingle === 'function') {
          try {
            await rnShare.shareSingle({
              title: `SmartMart Invoice #${bill.invoiceNumber}`,
              subject: `SmartMart Invoice #${bill.invoiceNumber}`,
              url: pdfPath,
              type: 'application/pdf',
              social: 'whatsapp',
              whatsAppNumber: phoneWithCountry,
              recipient: phoneWithCountry,
              filename: fileName,
            });
            showToast('Invoice PDF shared to WhatsApp!', 'success');
            return;
          } catch (androidErr: any) {
            if (androidErr?.message && androidErr.message.includes('User did not share')) {
              return;
            }
            console.warn('[WhatsApp Share] Android shareSingle fallback:', androidErr);
          }
        }
        await openDirectWhatsAppChat(bill);
        return;
      }

      // 3. On iOS: Present clear choice to share the PDF document file or open direct chat
      Alert.alert(
        'Send Invoice to WhatsApp',
        `Customer: +91 ${cleanPhone}`,
        [
          {
            text: '📄 Share PDF File',
            onPress: async () => {
              const rn = getSafeRNShare();
              if (rn && pdfPath.startsWith('file://')) {
                try {
                  await rn.open({
                    title: `SmartMart Invoice #${bill.invoiceNumber}`,
                    subject: `SmartMart Invoice #${bill.invoiceNumber}`,
                    url: pdfPath,
                    type: 'application/pdf',
                    filename: fileName,
                    failOnCancel: false,
                  });
                } catch (err: any) {
                  if (err?.message && (err.message.includes('User did not share') || err.message.includes('DISMISSED'))) {
                    return;
                  }
                  showToast('Could not open share dialog.', 'error');
                }
              } else {
                Alert.alert(
                  'Rebuild Required for PDF Sharing',
                  'To share physical PDF files on iOS, newly installed native pods must be compiled.\n\nPlease run in your terminal:\nnpm run ios\n\nOpening WhatsApp direct chat for now...',
                  [{ text: 'Open WhatsApp', onPress: () => openDirectWhatsAppChat(bill) }]
                );
              }
            },
          },
          {
            text: '💬 Open Direct Chat',
            onPress: () => openDirectWhatsAppChat(bill),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      if (err?.message && (err.message.includes('User did not share') || err.message.includes('DISMISSED'))) {
        return;
      }
      console.warn('[Invoice WhatsApp] Sharing error:', err);
      await openDirectWhatsAppChat(bill);
    } finally {
      setIsSharingPdf(false);
    }
  };

  const handleSendViaSms = async (bill = lastBill) => {
    if (!bill) return;
    const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      Alert.alert('Mobile Number Required', 'A valid 10-digit mobile number is required to send the invoice.');
      return;
    }

    // SMS cannot carry a PDF attachment reliably. Send a concise text summary.
    let smsMessage = `Thank you for shopping at SmartMart! Invoice #${bill.invoiceNumber}, Total ₹${bill.grandTotal}.`;
    if (bill.hostedUrl) {
      smsMessage += ` View your digital invoice: ${bill.hostedUrl}`;
    } else {
      // TODO: Queue invoice upload to Cloud Storage/Firestore when device is back online to generate public view link.
      // queueOfflineInvoiceSync(bill);
    }

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:+91${cleanPhone}${separator}body=${encodeURIComponent(smsMessage)}`;

    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        await Share.share({
          title: generateInvoiceFileName(bill),
          message: smsMessage,
        });
      }
    } catch {
      await Share.share({
        title: generateInvoiceFileName(bill),
        message: smsMessage,
      });
    }
  };

  const handleShareReceipt = async () => {
    if (!lastBill || isSharingPdf) return;
    setIsSharingPdf(true);
    try {
      const pdfPath = await createInvoicePdf(lastBill);
      const safeInvoiceId = (lastBill.invoiceNumber || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `SmartMart_Invoice_${safeInvoiceId}`;
      const rnShare = getSafeRNShare();

      if (rnShare) {
        await rnShare.open({
          title: `SmartMart Invoice #${lastBill.invoiceNumber}`,
          subject: `SmartMart Invoice #${lastBill.invoiceNumber}`,
          url: pdfPath,
          type: 'application/pdf',
          filename: fileName,
          failOnCancel: false,
        });
      } else {
        await Share.share({
          title: `SmartMart Invoice #${lastBill.invoiceNumber}`,
          url: pdfPath,
          message: `SmartMart Tax Invoice #${lastBill.invoiceNumber} (Total ₹${lastBill.grandTotal})`,
        });
      }
    } catch (err: any) {
      if (err?.message && (err.message.includes('User did not share') || err.message.includes('DISMISSED'))) {
        return;
      }
      console.warn('[Share Receipt] Share failed:', err);
      showToast('Could not open share dialog.', 'error');
    } finally {
      setIsSharingPdf(false);
    }
  };

  // If user has no permission to view POS billing counter
  if (!permissions.billing.view) {
    return (
      <View style={[styles.root, styles.restrictedContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.restrictedCard}>
          <View style={styles.restrictedIconWrap}>
            <Icon name="lock" size={32} color="#9ca3af" />
          </View>
          <LocalizedText style={styles.restrictedTitle}>POS Billing Restricted</LocalizedText>
          <LocalizedText style={styles.restrictedSub}>
            Your staff account ({currentEmployee.roleTitle}) does not have permission to access the in-store billing register. Contact the store owner to request counter access.
          </LocalizedText>
          {!isTab && navigation?.canGoBack() && (
            <TouchableOpacity
              style={styles.restrictedBackBtn}
              scaleTo={0.92}
              onPress={() => navigation.goBack()}
            >
              <LocalizedText style={styles.restrictedBackBtnText}>Go Back</LocalizedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        {!isTab && navigation?.canGoBack() ? (
          <TouchableOpacity
            style={styles.backBtn}
            scaleTo={0.88}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#1a1a1a" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIconWrap}>
            <Icon name="printer" size={19} color={colors.primary} />
          </View>
        )}

        <View style={styles.headerTitleWrap}>
          <LocalizedText style={styles.headerTitle}>POS Counter Billing</LocalizedText>
          <LocalizedText style={styles.headerSubtitle}>
            SmartMart Supermarket • Store Checkout
          </LocalizedText>
        </View>

        {cart.length > 0 && (
          <TouchableOpacity
            style={styles.clearHeaderBtn}
            scaleTo={0.92}
            onPress={handleClearCart}
          >
            <Icon name="trash-2" size={16} color={colors.danger} />
            <LocalizedText style={styles.clearHeaderText}>Clear</LocalizedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Customer Mobile Number Card (Mandatory for WhatsApp bill) */}
        <AnimatedEntranceView delay={40} direction="up" distance={12}>
          <View style={[styles.customerSectionCard, phoneError ? styles.customerCardError : null]}>
            <View style={styles.customerCardHeader}>
              <View style={styles.customerTitleRow}>
                <Icon name="message-circle" size={16} color="#25D366" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.customerSectionTitle}>Customer Mobile Number</LocalizedText>
                <LocalizedText style={styles.requiredAsterisk}> *</LocalizedText>
              </View>
              <View style={[styles.whatsappBadge, isPhoneValid ? styles.whatsappBadgeReady : null]}>
                <Icon
                  name={isPhoneValid ? 'check' : 'send'}
                  size={10}
                  color={isPhoneValid ? '#15803d' : '#2563eb'}
                  style={{ marginRight: 4 }}
                />
                <LocalizedText
                  style={[styles.whatsappBadgeText, isPhoneValid ? styles.whatsappBadgeTextReady : null]}
                >
                  {isPhoneValid ? 'WhatsApp Ready' : 'Required for WhatsApp Bill'}
                </LocalizedText>
              </View>
            </View>

            <View style={[styles.customerInputWrap, phoneError ? styles.customerInputWrapError : null]}>
              <View style={styles.countryCodePill}>
                <LocalizedText style={styles.countryFlag}>🇮🇳</LocalizedText>
                <LocalizedText style={styles.countryCodeText}>+91</LocalizedText>
              </View>
              <LocalizedTextInput
                style={styles.customerInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
              {customerPhone.length > 0 && (
                <TouchableOpacity
                  style={styles.clearPhoneBtn}
                  onPress={() => {
                    setCustomerPhone('');
                    setPhoneError(null);
                  }}
                  scaleTo={0.88}
                >
                  <Icon name="x-circle" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
              {isPhoneValid && (
                <View style={styles.phoneVerifiedIcon}>
                  <Icon name="check-circle" size={18} color="#16a34a" />
                </View>
              )}
            </View>

            {phoneError ? (
              <View style={styles.phoneErrorRow}>
                <Icon name="alert-circle" size={12} color="#dc2626" style={{ marginRight: 4 }} />
                <LocalizedText style={styles.phoneErrorText}>{phoneError}</LocalizedText>
              </View>
            ) : (
              <LocalizedText style={styles.customerHelpText}>
                Tax invoice with itemized savings will be sent directly via WhatsApp to this number.
              </LocalizedText>
            )}
          </View>
        </AnimatedEntranceView>

        {/* Product Catalog Search */}
        <AnimatedEntranceView delay={80} direction="up" distance={12}>
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <View style={{ flex: 1 }}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search product or SKU..."
                  onClear={() => setSearch('')}
                />
              </View>
              <TouchableOpacity
                style={styles.scanBarcodeTriggerBtn}
                scaleTo={0.92}
                onPress={() =>
                  navigation?.navigate('ScanBarcode', {
                    mode: 'BILLING',
                    onScanned: (item: any) => handleAddToCart(item),
                  })
                }
              >
                <Icon name="maximize" size={19} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Categories horizontal list */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                    scaleTo={0.94}
                    onPress={() => setActiveCategory(cat)}
                  >
                    <LocalizedText
                      style={[styles.categoryText, isActive && styles.categoryTextActive]}
                    >
                      {cat}
                    </LocalizedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </AnimatedEntranceView>

        {/* Quick Product Pick Grid */}
        <AnimatedEntranceView delay={120} direction="up" distance={12}>
          <View style={styles.sectionHeaderRow}>
            <LocalizedText style={styles.sectionTitle}>Add Store Items to Bill</LocalizedText>
            <LocalizedText style={styles.itemCountBadge}>
              {filteredProducts.length} items
            </LocalizedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catalogCardsScroll}
          >
            {filteredProducts.map((p) => {
              const inCart = cart.find((i) => i.product.id === p.id);
              const hasDiscount = p.mrp > p.price;
              return (
                <View key={p.id} style={styles.catalogCard}>
                  <View style={styles.catalogCardTop}>
                    <LocalizedText style={styles.catalogCategoryBadge}>
                      {p.category}
                    </LocalizedText>
                    <LocalizedText style={styles.catalogStockText}>
                      Stock: {p.stock}
                    </LocalizedText>
                  </View>

                  <LocalizedText style={styles.catalogName} numberOfLines={2}>
                    {p.name}
                  </LocalizedText>

                  {hasDiscount && (
                    <View style={styles.catalogSavePill}>
                      <LocalizedText style={styles.catalogSavePillText}>
                        Save ₹{p.mrp - p.price}
                      </LocalizedText>
                    </View>
                  )}

                  <View style={styles.catalogCardBottom}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <LocalizedText style={styles.catalogPrice}>₹{p.price}</LocalizedText>
                        {hasDiscount && (
                          <LocalizedText style={styles.catalogMrp}>₹{p.mrp}</LocalizedText>
                        )}
                      </View>
                      <LocalizedText style={styles.catalogUnit}>/{p.unit}</LocalizedText>
                    </View>

                    {inCart ? (
                      <View style={styles.cartStepperMini}>
                        <TouchableOpacity
                          style={styles.stepperMiniBtn}
                          scaleTo={0.88}
                          onPress={() => handleUpdateQty(p.id, -1)}
                        >
                          <Icon name="minus" size={12} color="#ffffff" />
                        </TouchableOpacity>
                        <LocalizedText style={styles.stepperMiniCount}>
                          {inCart.quantity}
                        </LocalizedText>
                        <TouchableOpacity
                          style={styles.stepperMiniBtn}
                          scaleTo={0.88}
                          onPress={() => handleUpdateQty(p.id, 1)}
                        >
                          <Icon name="plus" size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        scaleTo={0.92}
                        onPress={() => handleAddToCart(p)}
                      >
                        <Icon name="plus" size={14} color="#ffffff" style={{ marginRight: 2 }} />
                        <LocalizedText style={styles.addBtnText}>Add</LocalizedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </AnimatedEntranceView>

        {/* Current Bill Cart */}
        <AnimatedEntranceView delay={160} direction="up" distance={12}>
          <View style={styles.cartSection}>
            <View style={styles.cartHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="shopping-cart" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <LocalizedText style={styles.sectionTitle}>Current Bill Items</LocalizedText>
              </View>
              <Badge
                label={`${totalItemsCount} items`}
                backgroundColor={colors.primaryLight}
                textColor={colors.primaryDark}
                size="sm"
              />
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCartCard}>
                <Icon name="inbox" size={36} color="#d1d5db" />
                <LocalizedText style={styles.emptyCartTitle}>No items in bill yet</LocalizedText>
                <LocalizedText style={styles.emptyCartSubtitle}>
                  Search products above or tap "Add" to start billing
                </LocalizedText>
              </View>
            ) : (
              <View style={styles.cartList}>
                {cart.map((item, index) => {
                  const hasDiscount = item.product.mrp && item.product.mrp > item.product.price;
                  const itemSavings = hasDiscount ? (item.product.mrp - item.product.price) * item.quantity : 0;
                  return (
                    <View key={item.product.id} style={styles.cartRow}>
                      <View style={styles.cartIndexPill}>
                        <LocalizedText style={styles.cartIndexText}>{index + 1}</LocalizedText>
                      </View>

                      <View style={styles.cartItemInfo}>
                        <LocalizedText style={styles.cartItemName} numberOfLines={1}>
                          {item.product.name}
                        </LocalizedText>
                        <View style={styles.cartPriceLine}>
                          <LocalizedText style={styles.cartItemRate}>
                            ₹{item.product.price} /{item.product.unit}
                          </LocalizedText>
                          {hasDiscount && (
                            <>
                              <LocalizedText style={styles.cartItemMrp}>
                                ₹{item.product.mrp}
                              </LocalizedText>
                              <View style={styles.cartSaveTag}>
                                <LocalizedText style={styles.cartSaveTagText}>
                                  Save ₹{itemSavings}
                                </LocalizedText>
                              </View>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Stepper */}
                      <View style={styles.cartStepper}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          scaleTo={0.88}
                          onPress={() => handleUpdateQty(item.product.id, -1)}
                        >
                          <Icon name="minus" size={14} color="#374151" />
                        </TouchableOpacity>
                        <LocalizedText style={styles.stepperText}>{item.quantity}</LocalizedText>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          scaleTo={0.88}
                          onPress={() => handleUpdateQty(item.product.id, 1)}
                        >
                          <Icon name="plus" size={14} color="#374151" />
                        </TouchableOpacity>
                      </View>

                      {/* Line Total */}
                      <View style={styles.cartLineTotalWrap}>
                        <LocalizedText style={styles.cartLineTotal}>
                          ₹{item.product.price * item.quantity}
                        </LocalizedText>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          scaleTo={0.86}
                          onPress={() => handleRemoveItem(item.product.id)}
                        >
                          <Icon name="x" size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </AnimatedEntranceView>

        {/* Payment Mode Selector */}
        {cart.length > 0 && (
          <AnimatedEntranceView delay={200} direction="up" distance={12}>
            <View style={styles.paymentSection}>
              <LocalizedText style={styles.sectionTitle}>Payment Method</LocalizedText>
              <View style={styles.paymentModeRow}>
                {(['CASH', 'UPI', 'CARD'] as PaymentMode[]).map((mode) => {
                  const isSelected = paymentMode === mode;
                  const iconName = mode === 'CASH' ? 'dollar-sign' : mode === 'UPI' ? 'smartphone' : 'credit-card';
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.paymentModeBtn, isSelected && styles.paymentModeBtnActive]}
                      scaleTo={0.94}
                      onPress={() => setPaymentMode(mode)}
                    >
                      <Icon
                        name={iconName}
                        size={18}
                        color={isSelected ? '#ffffff' : '#4b5563'}
                        style={{ marginBottom: 4 }}
                      />
                      <LocalizedText
                        style={[styles.paymentModeText, isSelected && styles.paymentModeTextActive]}
                      >
                        {mode === 'CASH' ? 'Cash' : mode === 'UPI' ? 'UPI / QR' : 'Card'}
                      </LocalizedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {paymentMode === 'CASH' && (
                <View style={styles.cashTenderedWrap}>
                  <View style={styles.cashInputRow}>
                    <LocalizedText style={styles.cashInputLabel}>Cash Tendered (₹):</LocalizedText>
                    <LocalizedTextInput
                      style={styles.cashInput}
                      placeholder={grandTotal.toString()}
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      value={cashTendered}
                      onChangeText={setCashTendered}
                    />
                  </View>

                  {parseFloat(cashTendered) > grandTotal && (
                    <View style={styles.changeDueRow}>
                      <LocalizedText style={styles.changeDueLabel}>Change to Return:</LocalizedText>
                      <LocalizedText style={styles.changeDueValue}>₹{cashChange}</LocalizedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </AnimatedEntranceView>
        )}

        {/* Bill Summary Card */}
        {cart.length > 0 && (
          <AnimatedEntranceView delay={240} direction="up" distance={12}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <LocalizedText style={styles.summaryTitle}>Bill Summary</LocalizedText>
                {totalDiscount > 0 && (
                  <View style={styles.totalSavingsPill}>
                    <Icon name="tag" size={11} color="#15803d" style={{ marginRight: 4 }} />
                    <LocalizedText style={styles.totalSavingsPillText}>
                      Save ₹{totalDiscount}
                    </LocalizedText>
                  </View>
                )}
              </View>

              {totalDiscount > 0 && (
                <View style={styles.summaryLine}>
                  <LocalizedText style={styles.summaryLineLabel}>Total MRP (Gross)</LocalizedText>
                  <LocalizedText style={styles.summaryLineMrpVal}>₹{totalMrp}</LocalizedText>
                </View>
              )}

              {totalDiscount > 0 && (
                <View style={styles.summaryLine}>
                  <LocalizedText style={[styles.summaryLineLabel, { color: '#16a34a' }]}>
                    Store Discount / Savings
                  </LocalizedText>
                  <LocalizedText style={styles.summaryDiscountVal}>
                    -₹{totalDiscount}
                  </LocalizedText>
                </View>
              )}

              <View style={styles.summaryLine}>
                <LocalizedText style={styles.summaryLineLabel}>Items Subtotal</LocalizedText>
                <LocalizedText style={styles.summaryLineVal}>₹{subtotal}</LocalizedText>
              </View>

              <View style={styles.summaryLine}>
                <LocalizedText style={styles.summaryLineLabel}>GST / Taxes (5%)</LocalizedText>
                <LocalizedText style={styles.summaryLineVal}>+₹{taxAmount}</LocalizedText>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotalRow}>
                <View>
                  <LocalizedText style={styles.summaryTotalLabel}>Grand Total</LocalizedText>
                  <LocalizedText style={styles.summaryTotalItemsSubtitle}>
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • Incl. GST
                  </LocalizedText>
                </View>
                <LocalizedText style={styles.summaryTotalVal}>₹{grandTotal}</LocalizedText>
              </View>

              {totalDiscount > 0 && (
                <View style={styles.savingsBanner}>
                  <Icon name="check-circle" size={14} color="#16a34a" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.savingsBannerText}>
                    Customer saves ₹{totalDiscount} on this SmartMart bill!
                  </LocalizedText>
                </View>
              )}
            </View>
          </AnimatedEntranceView>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      {cart.length > 0 && (
        <View style={[styles.bottomActionBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.bottomPriceInfo}>
            <LocalizedText style={styles.bottomTotalLabel}>Total to Collect</LocalizedText>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <LocalizedText style={styles.bottomTotalVal}>₹{grandTotal}</LocalizedText>
              {totalDiscount > 0 && (
                <LocalizedText style={styles.bottomSavedSubtitle}>
                  (Save ₹{totalDiscount})
                </LocalizedText>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.generateBillBtn,
              !permissions.billing.create && { backgroundColor: '#9ca3af' },
            ]}
            scaleTo={permissions.billing.create ? 0.94 : 1}
            onPress={handleGenerateBill}
          >
            <Icon
              name={permissions.billing.create ? 'message-circle' : 'lock'}
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <LocalizedText style={styles.generateBillBtnText}>
              {permissions.billing.create
                ? 'Generate & WhatsApp Bill'
                : 'Bill Creation Restricted'}
            </LocalizedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Bill Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            {/* Converted Document Representation Card */}
            {lastBill && (
              <View style={styles.documentFileCard}>
                <View style={styles.docIconSquare}>
                  <Icon name="file-text" size={20} color="#dc2626" />
                  <View style={styles.pdfTag}>
                    <LocalizedText style={styles.pdfTagText}>PDF</LocalizedText>
                  </View>
                </View>
                <View style={styles.documentFileInfo}>
                  <LocalizedText style={styles.documentFileName} numberOfLines={1}>
                    {generateInvoiceFileName(lastBill)}
                  </LocalizedText>
                  <LocalizedText style={styles.documentFileSub}>
                    SmartMart Market Tax Invoice • 1 Page A4
                  </LocalizedText>
                  <View style={styles.docMetaBadgesRow}>
                    <View style={[styles.docMetaBadge, { backgroundColor: '#dcfce7' }]}>
                      <Icon name="check-circle" size={9} color="#15803d" style={{ marginRight: 3 }} />
                      <LocalizedText style={[styles.docMetaBadgeText, { color: '#15803d', fontFamily: 'Poppins-Bold' }]}>
                        Doc Converted
                      </LocalizedText>
                    </View>
                    <View style={styles.docMetaBadge}>
                      <LocalizedText style={styles.docMetaBadgeText}>~124 KB</LocalizedText>
                    </View>
                    <View style={styles.docMetaBadge}>
                      <LocalizedText style={styles.docMetaBadgeText}>+91 {lastBill.customerPhone}</LocalizedText>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* View Mode Toggle: Document / PDF vs Compact Slip */}
            <View style={styles.viewModeToggleRow}>
              <TouchableOpacity
                style={[styles.viewModeTab, receiptViewMode === 'DOCUMENT' && styles.viewModeTabActive]}
                scaleTo={0.95}
                onPress={() => setReceiptViewMode('DOCUMENT')}
              >
                <Icon
                  name="file-text"
                  size={13}
                  color={receiptViewMode === 'DOCUMENT' ? '#ffffff' : '#4b5563'}
                  style={{ marginRight: 6 }}
                />
                <LocalizedText
                  style={[styles.viewModeTabText, receiptViewMode === 'DOCUMENT' && styles.viewModeTabTextActive]}
                >
                  Market Invoice Doc (PDF)
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.viewModeTab, receiptViewMode === 'COMPACT' && styles.viewModeTabActive]}
                scaleTo={0.95}
                onPress={() => setReceiptViewMode('COMPACT')}
              >
                <Icon
                  name="printer"
                  size={13}
                  color={receiptViewMode === 'COMPACT' ? '#ffffff' : '#4b5563'}
                  style={{ marginRight: 6 }}
                />
                <LocalizedText
                  style={[styles.viewModeTabText, receiptViewMode === 'COMPACT' && styles.viewModeTabTextActive]}
                >
                  Compact Slip
                </LocalizedText>
              </TouchableOpacity>
            </View>

            {lastBill && receiptViewMode === 'DOCUMENT' ? (
              /* Full Local Market Invoice Document (PDF View) */
              <ScrollView style={styles.receiptScrollDoc} showsVerticalScrollIndicator={false}>
                <InvoiceDocumentView bill={lastBill} />
              </ScrollView>
            ) : lastBill ? (
              /* Compact Thermal / POS Slip */
              <ScrollView style={styles.receiptScroll} showsVerticalScrollIndicator={false}>
                {/* Store Receipt Top */}
                <View style={styles.receiptHeader}>
                  <View style={styles.receiptCheckCircle}>
                    <Icon name="check" size={26} color="#ffffff" />
                  </View>
                  <LocalizedText style={styles.receiptSuccessText}>Bill Generated Successfully!</LocalizedText>
                  <LocalizedText style={styles.receiptStoreName}>SMARTMART SUPERMARKET</LocalizedText>
                  <LocalizedText style={styles.receiptStoreId}>Store ID: #SM-DL-8821 • GSTIN: 07AAACG1829K1Z4</LocalizedText>
                </View>

                <View style={styles.receiptDashedLine} />

                {/* Bill Meta */}
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>Invoice No:</LocalizedText>
                  <LocalizedText style={styles.receiptMetaVal}>{lastBill.invoiceNumber}</LocalizedText>
                </View>
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>Date & Time:</LocalizedText>
                  <LocalizedText style={styles.receiptMetaVal}>
                    {lastBill.date} • {lastBill.time}
                  </LocalizedText>
                </View>
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>Staff Cashier:</LocalizedText>
                  <LocalizedText style={styles.receiptMetaVal}>{lastBill.cashier}</LocalizedText>
                </View>
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>Customer Mobile:</LocalizedText>
                  <View style={styles.receiptCustomerPhoneWrap}>
                    <Icon name="message-circle" size={13} color="#25D366" style={{ marginRight: 4 }} />
                    <LocalizedText style={styles.receiptCustomerPhoneVal}>
                      +91 {lastBill.customerPhone}
                    </LocalizedText>
                  </View>
                </View>

                <View style={styles.receiptDashedLine} />

                {/* Items Table */}
                <View style={styles.receiptTable}>
                  <View style={styles.receiptTableHeader}>
                    <LocalizedText style={[styles.receiptTableTh, { flex: 2.2 }]}>Item</LocalizedText>
                    <LocalizedText style={[styles.receiptTableTh, { flex: 0.8, textAlign: 'center' }]}>
                      Qty
                    </LocalizedText>
                    <LocalizedText style={[styles.receiptTableTh, { flex: 1, textAlign: 'right' }]}>
                      Rate
                    </LocalizedText>
                    <LocalizedText style={[styles.receiptTableTh, { flex: 1.2, textAlign: 'right' }]}>
                      Amount
                    </LocalizedText>
                  </View>

                  {lastBill.items.map((it: CartItem) => {
                    const hasDiscount = it.product.mrp && it.product.mrp > it.product.price;
                    return (
                      <View key={it.product.id} style={styles.receiptTableRow}>
                        <View style={{ flex: 2.2, paddingRight: 4 }}>
                          <LocalizedText style={styles.receiptTableTd} numberOfLines={1}>
                            {it.product.name}
                          </LocalizedText>
                          {hasDiscount && (
                            <LocalizedText style={styles.receiptItemSavingsSub}>
                              Save ₹{(it.product.mrp - it.product.price) * it.quantity}
                            </LocalizedText>
                          )}
                        </View>
                        <LocalizedText style={[styles.receiptTableTd, { flex: 0.8, textAlign: 'center' }]}>
                          {it.quantity}
                        </LocalizedText>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <LocalizedText style={styles.receiptTableTd}>
                            ₹{it.product.price}
                          </LocalizedText>
                          {hasDiscount && (
                            <LocalizedText style={styles.receiptItemMrpSub}>
                              ₹{it.product.mrp}
                            </LocalizedText>
                          )}
                        </View>
                        <LocalizedText style={[styles.receiptTableTdBold, { flex: 1.2, textAlign: 'right' }]}>
                          ₹{it.quantity * it.product.price}
                        </LocalizedText>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.receiptDashedLine} />

                {/* Calculation */}
                {lastBill.totalDiscount > 0 && (
                  <View style={styles.receiptMetaRow}>
                    <LocalizedText style={styles.receiptMetaKey}>Total MRP (Gross):</LocalizedText>
                    <LocalizedText style={styles.receiptMetaMrpVal}>₹{lastBill.totalMrp}</LocalizedText>
                  </View>
                )}
                {lastBill.totalDiscount > 0 && (
                  <View style={styles.receiptMetaRow}>
                    <LocalizedText style={[styles.receiptMetaKey, { color: '#16a34a', fontFamily: 'Poppins-SemiBold' }]}>
                      Store Discount:
                    </LocalizedText>
                    <LocalizedText style={[styles.receiptMetaVal, { color: '#16a34a', fontFamily: 'Poppins-Bold' }]}>
                      -₹{lastBill.totalDiscount}
                    </LocalizedText>
                  </View>
                )}
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>Subtotal:</LocalizedText>
                  <LocalizedText style={styles.receiptMetaVal}>₹{lastBill.subtotal}</LocalizedText>
                </View>
                <View style={styles.receiptMetaRow}>
                  <LocalizedText style={styles.receiptMetaKey}>GST (5%):</LocalizedText>
                  <LocalizedText style={styles.receiptMetaVal}>₹{lastBill.tax}</LocalizedText>
                </View>
                <View style={[styles.receiptMetaRow, { marginTop: 4 }]}>
                  <LocalizedText style={styles.receiptTotalKey}>TOTAL PAID:</LocalizedText>
                  <LocalizedText style={styles.receiptTotalVal}>₹{lastBill.grandTotal}</LocalizedText>
                </View>

                {lastBill.totalDiscount > 0 && (
                  <View style={styles.receiptSavingsCallout}>
                    <Icon name="tag" size={13} color="#15803d" style={{ marginRight: 5 }} />
                    <LocalizedText style={styles.receiptSavingsCalloutText}>
                      Customer Saved ₹{lastBill.totalDiscount} on this bill!
                    </LocalizedText>
                  </View>
                )}

                <View style={styles.receiptPaymentTag}>
                  <Icon name="check" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.receiptPaymentTagText}>
                    Paid via {lastBill.paymentMode}
                  </LocalizedText>
                </View>

                {lastBill.cashChange !== undefined && lastBill.cashChange > 0 && (
                  <View style={styles.receiptChangeRow}>
                    <LocalizedText style={styles.receiptChangeText}>
                      Cash Tendered: ₹{lastBill.cashTendered} • Change Returned: ₹{lastBill.cashChange}
                    </LocalizedText>
                  </View>
                )}
              </ScrollView>
            ) : null}

            {/* Modal Actions */}
            <View style={styles.receiptActionsColumn}>
              {/* WhatsApp Document Share */}
              <TouchableOpacity
                style={[styles.whatsAppReceiptBtn, isSharingPdf && styles.btnDisabled]}
                scaleTo={0.94}
                disabled={isSharingPdf}
                onPress={() => handleSendOnWhatsApp(lastBill)}
              >
                {isSharingPdf ? (
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="message-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                )}
                <LocalizedText style={styles.whatsAppReceiptBtnText}>
                  {isSharingPdf
                    ? 'Generating Invoice PDF...'
                    : `Send Invoice Doc to WhatsApp (+91 ${lastBill?.customerPhone})`}
                </LocalizedText>
              </TouchableOpacity>

              {/* Message / SMS & Share File Row */}
              <View style={styles.receiptSecondaryActions}>
                <TouchableOpacity
                  style={styles.smsReceiptBtn}
                  scaleTo={0.92}
                  onPress={() => handleSendViaSms(lastBill)}
                >
                  <Icon name="message-square" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.smsReceiptBtnText}>Send via SMS</LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareReceiptBtn, isSharingPdf && styles.btnDisabled]}
                  scaleTo={0.92}
                  disabled={isSharingPdf}
                  onPress={handleShareReceipt}
                >
                  {isSharingPdf ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
                  ) : (
                    <Icon name="share-2" size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  )}
                  <LocalizedText style={styles.shareReceiptBtnText}>Share Doc File</LocalizedText>
                </TouchableOpacity>
              </View>

              {/* Finish & Start New Bill */}
              <TouchableOpacity
                style={styles.newBillBtnFull}
                scaleTo={0.94}
                onPress={handleFinishAndNewBill}
              >
                <Icon name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.newBillBtnText}>Finish & Start New Bill</LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  clearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearHeaderText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.danger,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  customerSectionCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  customerCardError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  customerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerSectionTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  requiredAsterisk: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ef4444',
  },
  whatsappBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  whatsappBadgeReady: {
    backgroundColor: '#dcfce7',
  },
  whatsappBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#2563eb',
  },
  whatsappBadgeTextReady: {
    color: '#15803d',
    fontFamily: 'Poppins-SemiBold',
  },
  customerInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 46,
  },
  customerInputWrapError: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  countryFlag: {
    fontSize: 13,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  customerInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
    paddingVertical: 0,
    letterSpacing: 0.5,
  },
  clearPhoneBtn: {
    padding: 4,
  },
  phoneVerifiedIcon: {
    marginLeft: 6,
  },
  phoneErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  phoneErrorText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#dc2626',
  },
  customerHelpText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 6,
    lineHeight: 15,
  },
  searchSection: {
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanBarcodeTriggerBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  itemCountBadge: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  catalogCardsScroll: {
    paddingBottom: 8,
    gap: 10,
  },
  catalogCard: {
    width: 140,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
  },
  catalogCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catalogCategoryBadge: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catalogStockText: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  catalogName: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    minHeight: 32,
    lineHeight: 16,
  },
  catalogSavePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 2,
  },
  catalogSavePillText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  catalogCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  catalogPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  catalogMrp: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  catalogUnit: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  cartStepperMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperMiniBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperMiniCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  cartSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    marginBottom: 12,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyCartCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyCartTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginTop: 8,
  },
  emptyCartSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
  },
  cartList: {
    gap: 8,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
  },
  cartIndexPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cartIndexText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#4b5563',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 6,
  },
  cartItemName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  cartPriceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cartItemRate: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  cartItemMrp: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  cartSaveTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cartSaveTagText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  cartStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 4,
    height: 32,
    marginRight: 10,
  },
  stepperBtn: {
    width: 24,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    paddingHorizontal: 6,
  },
  cartLineTotalWrap: {
    alignItems: 'flex-end',
    minWidth: 54,
  },
  cartLineTotal: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  removeBtn: {
    marginTop: 2,
    padding: 2,
  },
  paymentSection: {
    marginBottom: 12,
  },
  paymentModeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  paymentModeBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentModeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  paymentModeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  paymentModeTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
  },
  cashTenderedWrap: {
    marginTop: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
  },
  cashInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cashInputLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  cashInput: {
    width: 100,
    height: 38,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  changeDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  changeDueLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
  },
  changeDueValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  summaryCard: {
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e2ece4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  totalSavingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  totalSavingsPillText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLineLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  summaryLineVal: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  summaryLineMrpVal: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  summaryDiscountVal: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#16a34a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  summaryTotalItemsSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  summaryTotalVal: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  savingsBannerText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803d',
    flex: 1,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  bottomTotalVal: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  bottomSavedSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#16a34a',
  },
  generateBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  generateBillBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptContainer: {
    width: width - 20,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  viewModeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
  },
  viewModeTabActive: {
    backgroundColor: '#2b553e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeTabText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  viewModeTabTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
  },
  receiptScrollDoc: {
    maxHeight: 440,
    marginBottom: 4,
  },
  receiptHeader: {
    alignItems: 'center',
  },
  receiptCheckCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  receiptSuccessText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  receiptStoreName: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  receiptStoreId: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  receiptDashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptScroll: {
    maxHeight: 280,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptMetaKey: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  receiptMetaVal: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  receiptMetaMrpVal: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  receiptCustomerPhoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  receiptCustomerPhoneVal: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  receiptTable: {
    marginVertical: 6,
  },
  receiptTableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  receiptTableTh: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  receiptTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptTableTd: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  receiptTableTdBold: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  receiptItemSavingsSub: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803d',
  },
  receiptItemMrpSub: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  receiptTotalKey: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  receiptTotalVal: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  receiptSavingsCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  receiptSavingsCalloutText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  receiptPaymentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  receiptPaymentTagText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
  receiptChangeRow: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  receiptChangeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    textAlign: 'center',
  },
  receiptActionsColumn: {
    marginTop: 14,
    gap: 8,
  },
  whatsAppReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsAppReceiptBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  receiptSecondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smsReceiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    borderRadius: 12,
  },
  smsReceiptBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  shareReceiptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 11,
    borderRadius: 12,
  },
  shareReceiptBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  newBillBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 2,
  },
  newBillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newBillBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Document File Card Representation
  documentFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  docIconSquare: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  pdfTag: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    backgroundColor: '#dc2626',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pdfTagText: {
    fontSize: 7,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  documentFileInfo: {
    flex: 1,
  },
  documentFileName: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#0f172a',
  },
  documentFileSub: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginTop: 1,
  },
  docMetaBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  docMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  docMetaBadgeText: {
    fontSize: 8.5,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
  },

  // Restricted Access View
  restrictedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restrictedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  restrictedSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  restrictedBackBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  restrictedBackBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default StoreBillingScreen;
