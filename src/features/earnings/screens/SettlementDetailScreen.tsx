import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, SummaryRow, Divider } from '../../../shared/components/common';

const SettlementDetailScreen = ({ route, navigation }: any) => {
  const { settlementId } = route.params || {};
  const insets = useSafeAreaInsets();

  // Mock data
  const settlement = {
    id: settlementId || '1',
    period: '13 – 19 Oct 2026',
    status: 'Paid',
    gross: '₹21,840',
    commission: '₹2,620',
    refunds: '₹800',
    net: '₹18,420',
    paidOn: '21 Oct 2026',
    utr: 'UTR20261021003456',
    orders: 142,
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Settlement Details"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Icon name="check-circle" size={24} color="#059669" />
          <View style={{ marginLeft: 12 }}>
            <LocalizedText style={styles.statusTitle}>Payment Successful</LocalizedText>
            <LocalizedText style={styles.statusSubtitle}>
              Paid on {settlement.paidOn}
            </LocalizedText>
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <LocalizedText style={styles.amountLabel}>Net Amount Received</LocalizedText>
          <LocalizedText style={styles.amountValue}>{settlement.net}</LocalizedText>
          <LocalizedText style={styles.periodText}>{settlement.period}</LocalizedText>
        </View>

        {/* Breakdown */}
        <View style={styles.card}>
          <LocalizedText style={styles.sectionTitle}>Breakdown</LocalizedText>

          <SummaryRow label="Gross Sales" value={settlement.gross} />
          <SummaryRow
            label="Platform Commission (12%)"
            value={`- ${settlement.commission}`}
            color="#ef4444"
          />
          <SummaryRow
            label="Refunds"
            value={`- ${settlement.refunds}`}
            color="#ef4444"
          />

          <Divider marginVertical={8} />

          <SummaryRow label="Net Payable" value={settlement.net} isTotal />
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <LocalizedText style={styles.sectionTitle}>Payment Info</LocalizedText>
          <SummaryRow icon="hash" label="UTR" value={settlement.utr} />
          <SummaryRow
            icon="package"
            label="Orders in period"
            value={`${settlement.orders} orders`}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#065f46',
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#047857',
    marginTop: 2,
  },
  amountCard: {
    backgroundColor: '#258B3E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  amountValue: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 6,
  },
  periodText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  netLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  netValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginLeft: 10,
  },
});

export default SettlementDetailScreen;