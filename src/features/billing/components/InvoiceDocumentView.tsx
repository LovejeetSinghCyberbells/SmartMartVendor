import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { InvoiceBillData } from '../utils/InvoiceDocumentGenerator';

const { width } = Dimensions.get('window');

interface InvoiceDocumentViewProps {
  bill: InvoiceBillData;
  isCompact?: boolean;
}

export const InvoiceDocumentView: React.FC<InvoiceDocumentViewProps> = ({
  bill,
  isCompact = false,
}) => {
  const cleanPhone = bill.customerPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10
    ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    : `+91 ${cleanPhone}`;

  return (
    <View style={[styles.outerFrame, isCompact && styles.outerFrameCompact]}>
      {/* Paper Card */}
      <View style={[styles.paperSheet, isCompact && styles.paperSheetCompact]}>
        {/* Top Header Ribbon Banner */}
        <View style={styles.headerRibbonContainer}>
          <View style={styles.ribbonBannerWrap}>
            <View style={styles.ribbonNotchLeft} />
            <View style={styles.ribbonBanner}>
              <LocalizedText style={styles.ribbonTitle}>SMARTMART MARKET</LocalizedText>
            </View>
            <View style={styles.ribbonNotchRight} />
          </View>
          <LocalizedText style={styles.ribbonSubtitle}>TAX INVOICE</LocalizedText>
        </View>

        {/* Two-Column Billing Meta */}
        <View style={styles.metaRow}>
          {/* Left Column: Customer */}
          <View style={styles.metaColLeft}>
            <LocalizedText style={styles.metaSectionTitle}>BILLING TO:</LocalizedText>
            <View style={styles.customerPhoneRow}>
              <Icon name="message-circle" size={11} color="#15803d" style={{ marginRight: 3 }} />
              <LocalizedText style={styles.customerPhoneText}>{formattedPhone}</LocalizedText>
            </View>
            <LocalizedText style={styles.metaLine}>
              Invoice: <LocalizedText style={styles.metaBold}>#{bill.invoiceNumber}</LocalizedText>
            </LocalizedText>
            <LocalizedText style={styles.metaLine}>
              Date: {bill.date} • {bill.time}
            </LocalizedText>
            <LocalizedText style={styles.metaLine} numberOfLines={1}>
              Cashier: {bill.cashier}
            </LocalizedText>
          </View>

          {/* Right Column: Store */}
          <View style={styles.metaColRight}>
            <LocalizedText style={styles.storeNameTitle}>SMARTMART SUPERMARKET</LocalizedText>
            <LocalizedText style={styles.metaLineRight}>Store ID: #SM-DL-8821</LocalizedText>
            <LocalizedText style={styles.metaLineRight}>GSTIN: 07AAACG1829K1Z4</LocalizedText>
            <LocalizedText style={styles.metaLineRight}>+91 98765 00000</LocalizedText>
            <LocalizedText style={styles.metaLineRight}>In-Store Counter Billing</LocalizedText>
          </View>
        </View>

        {/* Sage-Green Table Header */}
        <View style={styles.tableHeader}>
          <LocalizedText style={[styles.tableTh, styles.thProduct]}>PRODUCT</LocalizedText>
          <LocalizedText style={[styles.tableTh, styles.thPrice]}>PRICE</LocalizedText>
          <LocalizedText style={[styles.tableTh, styles.thQty]}>QTY</LocalizedText>
          <LocalizedText style={[styles.tableTh, styles.thTotal]}>TOTAL</LocalizedText>
        </View>

        {/* Table Rows */}
        <View style={styles.tableBody}>
          {bill.items.map((item, idx) => {
            const lineTotal = item.product.price * item.quantity;
            const hasDiscount = item.product.mrp && item.product.mrp > item.product.price;
            const itemSavings = hasDiscount
              ? (item.product.mrp! - item.product.price) * item.quantity
              : 0;

            return (
              <View key={item.product.id || String(idx)} style={styles.tableRow}>
                {/* Product Name & Unit */}
                <View style={styles.tdProductWrap}>
                  <LocalizedText style={styles.tdProductName} numberOfLines={1}>
                    {item.product.name}
                  </LocalizedText>
                  <View style={styles.tdSubWrap}>
                    <LocalizedText style={styles.tdProductUnit}>{item.product.unit}</LocalizedText>
                    {hasDiscount && (
                      <View style={styles.tdSaveBadge}>
                        <LocalizedText style={styles.tdSaveText}>Save ₹{itemSavings}</LocalizedText>
                      </View>
                    )}
                  </View>
                </View>

                {/* Price (with MRP strike) */}
                <View style={styles.tdPriceWrap}>
                  <LocalizedText style={styles.tdPrice}>₹{item.product.price}</LocalizedText>
                  {hasDiscount && (
                    <LocalizedText style={styles.tdMrp}>₹{item.product.mrp}</LocalizedText>
                  )}
                </View>

                {/* Qty */}
                <View style={styles.tdQtyWrap}>
                  <LocalizedText style={styles.tdQty}>{item.quantity}</LocalizedText>
                </View>

                {/* Total */}
                <View style={styles.tdTotalWrap}>
                  <LocalizedText style={styles.tdTotal}>₹{lineTotal}</LocalizedText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom Two-Column Summary & Terms */}
        <View style={styles.bottomSection}>
          {/* Left: Terms & Conditions */}
          <View style={styles.termsBox}>
            <LocalizedText style={styles.termsTitle}>TERMS & CONDITIONS:</LocalizedText>
            <LocalizedText style={styles.termsText}>
              Thank you for shopping at SmartMart! Retain this digital invoice for exchange or queries within 7 days.
            </LocalizedText>
            <View style={styles.ecoFriendlyBadge}>
              <Icon name="check-circle" size={10} color="#15803d" style={{ marginRight: 3 }} />
              <LocalizedText style={styles.ecoFriendlyText}>Paperless Digital Invoice</LocalizedText>
            </View>
          </View>

          {/* Right: Totals Box */}
          <View style={styles.summaryBox}>
            {bill.totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <LocalizedText style={styles.summaryLabel}>TOTAL MRP:</LocalizedText>
                <LocalizedText style={styles.summaryMrpVal}>₹{bill.totalMrp}</LocalizedText>
              </View>
            )}

            {bill.totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <LocalizedText style={styles.summaryDiscountLabel}>STORE DISCOUNT:</LocalizedText>
                <LocalizedText style={styles.summaryDiscountVal}>-₹{bill.totalDiscount}</LocalizedText>
              </View>
            )}

            <View style={styles.summaryRow}>
              <LocalizedText style={styles.summaryLabel}>SUB TOTAL:</LocalizedText>
              <LocalizedText style={styles.summaryVal}>₹{bill.subtotal}</LocalizedText>
            </View>

            <View style={styles.summaryRow}>
              <LocalizedText style={styles.summaryLabel}>TAX (5% GST):</LocalizedText>
              <LocalizedText style={styles.summaryVal}>+₹{bill.tax}</LocalizedText>
            </View>

            <View style={styles.grandTotalDivider} />

            <View style={styles.grandTotalRow}>
              <LocalizedText style={styles.grandTotalLabel}>TOTAL:</LocalizedText>
              <LocalizedText style={styles.grandTotalVal}>₹{bill.grandTotal}</LocalizedText>
            </View>

            <View style={styles.paymentTag}>
              <Icon name="check" size={11} color="#15803d" style={{ marginRight: 3 }} />
              <LocalizedText style={styles.paymentTagText}>PAID VIA {bill.paymentMode}</LocalizedText>
            </View>

            {bill.cashChange !== undefined && bill.cashChange > 0 && (
              <LocalizedText style={styles.cashTenderText}>
                Tendered: ₹{bill.cashTendered} • Change: ₹{bill.cashChange}
              </LocalizedText>
            )}
          </View>
        </View>

        {/* Bottom Market Veggies Illustration Footer */}
        <View style={styles.illustrationFooter}>
          <View style={styles.veggieIconsRow}>
            {/* Tomato */}
            <View style={[styles.veggiePill, { backgroundColor: '#ffe4e6' }]}>
              <LocalizedText style={styles.veggieEmoji}>🍅</LocalizedText>
              <LocalizedText style={[styles.veggieName, { color: '#be123c' }]}>Fresh</LocalizedText>
            </View>
            {/* Pumpkin */}
            <View style={[styles.veggiePill, { backgroundColor: '#ffedd5' }]}>
              <LocalizedText style={styles.veggieEmoji}>🎃</LocalizedText>
              <LocalizedText style={[styles.veggieName, { color: '#c2410c' }]}>Farm</LocalizedText>
            </View>
            {/* Greens */}
            <View style={[styles.veggiePill, { backgroundColor: '#dcfce7' }]}>
              <LocalizedText style={styles.veggieEmoji}>🥬</LocalizedText>
              <LocalizedText style={[styles.veggieName, { color: '#15803d' }]}>Organic</LocalizedText>
            </View>
            {/* Watermelon / Fruit */}
            <View style={[styles.veggiePill, { backgroundColor: '#fef3c7' }]}>
              <LocalizedText style={styles.veggieEmoji}>🍉</LocalizedText>
              <LocalizedText style={[styles.veggieName, { color: '#b45309' }]}>Pure</LocalizedText>
            </View>
          </View>
          <LocalizedText style={styles.footerTagline}>
            SmartMart Kirana & Supermarket • Fresh Produce & Daily Grocery
          </LocalizedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: '#2b553e',
    padding: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  outerFrameCompact: {
    padding: 8,
    borderRadius: 16,
  },
  paperSheet: {
    backgroundColor: '#fdfcf9',
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderWidth: 2,
    borderColor: '#739d84',
    overflow: 'hidden',
  },
  paperSheetCompact: {
    paddingTop: 14,
    paddingHorizontal: 10,
  },
  headerRibbonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ribbonBannerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbonNotchLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#ded7cb',
  },
  ribbonBanner: {
    backgroundColor: '#ded7cb',
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderRadius: 3,
  },
  ribbonNotchRight: {
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ded7cb',
  },
  ribbonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#2c1e2e',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ribbonSubtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#557d62',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede6',
  },
  metaColLeft: {
    flex: 1.2,
    paddingRight: 6,
  },
  metaColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaSectionTitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  customerPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  customerPhoneText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  metaLine: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#475569',
    lineHeight: 14,
  },
  metaBold: {
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  storeNameTitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'right',
  },
  metaLineRight: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#475569',
    textAlign: 'right',
    lineHeight: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#7ca189',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  tableTh: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  thProduct: {
    flex: 2.2,
  },
  thPrice: {
    flex: 1,
    textAlign: 'right',
  },
  thQty: {
    flex: 0.8,
    textAlign: 'center',
  },
  thTotal: {
    flex: 1.2,
    textAlign: 'right',
  },
  tableBody: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ebe8df',
  },
  tdProductWrap: {
    flex: 2.2,
    paddingRight: 4,
  },
  tdProductName: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  tdSubWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  tdProductUnit: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  tdSaveBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tdSaveText: {
    fontSize: 8.5,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  tdPriceWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tdPrice: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#334155',
  },
  tdMrp: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  tdQtyWrap: {
    flex: 0.8,
    alignItems: 'center',
  },
  tdQty: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  tdTotalWrap: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  tdTotal: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Bold',
    color: '#0f172a',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  termsBox: {
    flex: 1.1,
    backgroundColor: '#f6f4ee',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'space-between',
  },
  termsTitle: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  termsText: {
    fontSize: 8.5,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 12,
  },
  ecoFriendlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ecoFriendlyText: {
    fontSize: 8,
    fontFamily: 'Poppins-Medium',
    color: '#15803d',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
  },
  summaryVal: {
    fontSize: 9.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#334155',
  },
  summaryMrpVal: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  summaryDiscountLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#15803d',
  },
  summaryDiscountVal: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  grandTotalDivider: {
    height: 1.5,
    backgroundColor: '#2b553e',
    width: '100%',
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#0f172a',
  },
  grandTotalVal: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#2b553e',
  },
  paymentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf5ed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
  },
  paymentTagText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#15803d',
  },
  cashTenderText: {
    fontSize: 8,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginTop: 2,
  },
  illustrationFooter: {
    backgroundColor: '#ebe4d8',
    marginHorizontal: -16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#dcd3c4',
  },
  veggieIconsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  veggiePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  veggieEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  veggieName: {
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
  },
  footerTagline: {
    fontSize: 8.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    letterSpacing: 0.3,
  },
});

export default InvoiceDocumentView;

