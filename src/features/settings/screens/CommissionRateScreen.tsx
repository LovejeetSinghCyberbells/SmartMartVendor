import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
} from '../../../shared/components/common';
import { colors } from '../../../shared/theme/colors';

const PRESET_AMOUNTS = [250, 500, 1000, 2000, 5000];

const TIERS = [
  { name: 'Bronze', fee: '15%', orders: '0 - 100', color: '#b45309', active: false },
  { name: 'Silver', fee: '12%', orders: '101 - 500', color: colors.primary, active: true },
  { name: 'Gold', fee: '9%', orders: '501 - 1,500', color: '#eab308', active: false },
  { name: 'Platinum', fee: '6%', orders: '1,500+', color: '#6366f1', active: false },
];

export const CommissionRateScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [orderAmount, setOrderAmount] = useState(1000);

  // Animated progress bar for tier progression
  const tierProgress = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(tierProgress, {
      toValue: 0.684, // 342 / 500 = 68.4%
      duration: 1200,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [tierProgress, shimmerAnim]);

  // Calculations
  const platformFeeRate = 0.12; // 12%
  const pgFeeRate = 0.018; // 1.8%
  const gstRate = 0.18; // 18% on platform fee

  const platformFee = orderAmount * platformFeeRate;
  const pgFee = orderAmount * pgFeeRate;
  const gstOnFee = platformFee * gstRate;
  const totalDeduction = platformFee + pgFee + gstOnFee;
  const netTakeHome = Math.max(0, orderAmount - totalDeduction);

  const handleAdjustAmount = (delta: number) => {
    setOrderAmount((prev) => Math.max(100, Math.min(25000, prev + delta)));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Commission & Payouts"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* ===== VENDOR TIER HERO CARD ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.tierHeroCard}>
            <View style={styles.tierHeroTop}>
              <View style={styles.tierBadgeRow}>
                <View style={styles.tierIconBadge}>
                  <Icon name="award" size={20} color="#ffffff" />
                </View>
                <View>
                  <LocalizedText style={styles.tierTitle}>Silver Tier Partner</LocalizedText>
                  <LocalizedText style={styles.tierSub}>Active Platform Rate: 12%</LocalizedText>
                </View>
              </View>

              <View style={styles.activeRatePill}>
                <LocalizedText style={styles.activeRateText}>12% Fee</LocalizedText>
              </View>
            </View>

            {/* Progress to next tier */}
            <View style={styles.tierTrackCard}>
              <View style={styles.tierTrackHeader}>
                <LocalizedText style={styles.trackLabel}>Progress to Gold Tier (9% fee)</LocalizedText>
                <LocalizedText style={styles.trackScore}>342 / 500 Orders</LocalizedText>
              </View>

              <View style={styles.trackBar}>
                <Animated.View
                  style={[
                    styles.trackFill,
                    {
                      width: tierProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>

              <View style={styles.trackFooter}>
                <Icon name="trending-up" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                <LocalizedText style={styles.trackNote}>
                  158 more orders to unlock Gold Tier (save 3% extra on all orders)
                </LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== COMMISSION SLAB LADDER ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <View style={styles.ladderCard}>
            <LocalizedText style={styles.ladderTitle}>Commission Slab Structure</LocalizedText>

            <View style={styles.ladderRow}>
              {TIERS.map((tier) => (
                <View
                  key={tier.name}
                  style={[
                    styles.tierStep,
                    tier.active && styles.tierStepActive,
                  ]}
                >
                  {tier.active && (
                    <View style={styles.currentBadge}>
                      <LocalizedText style={styles.currentBadgeText}>YOU</LocalizedText>
                    </View>
                  )}
                  <LocalizedText
                    style={[
                      styles.tierStepName,
                      tier.active && styles.tierStepNameActive,
                    ]}
                  >
                    {tier.name}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.tierStepFee,
                      tier.active && styles.tierStepFeeActive,
                    ]}
                  >
                    {tier.fee}
                  </LocalizedText>
                  <LocalizedText style={styles.tierStepOrders}>
                    {tier.orders} ord
                  </LocalizedText>
                </View>
              ))}
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== INTERACTIVE REAL-TIME PAYOUT CALCULATOR ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.calcCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="pie-chart" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Order Payout Simulator</LocalizedText>
            </View>

            <LocalizedText style={styles.calcIntro}>
              Select or adjust order value to simulate exact net earnings:
            </LocalizedText>

            {/* Presets */}
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((amt) => {
                const active = orderAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.presetChip, active && styles.presetChipActive]}
                    onPress={() => setOrderAmount(amt)}
                    scaleTo={0.92}
                  >
                    <LocalizedText
                      style={[
                        styles.presetChipText,
                        active && styles.presetChipTextActive,
                      ]}
                    >
                      ₹{amt}
                    </LocalizedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Amount stepper */}
            <View style={styles.amountBox}>
              <TouchableOpacity
                style={styles.amountBtn}
                onPress={() => handleAdjustAmount(-100)}
                scaleTo={0.88}
              >
                <Icon name="minus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.amountDisplay}>
                <LocalizedText style={styles.amountCurrency}>₹</LocalizedText>
                <LocalizedText style={styles.amountVal}>{orderAmount.toLocaleString('en-IN')}</LocalizedText>
              </View>

              <TouchableOpacity
                style={styles.amountBtn}
                onPress={() => handleAdjustAmount(100)}
                scaleTo={0.88}
              >
                <Icon name="plus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Net Payout Hero Result Banner */}
            <View style={styles.payoutResultCard}>
              <View style={styles.payoutResultTop}>
                <LocalizedText style={styles.payoutLabel}>Your Net Bank Payout</LocalizedText>
                <View style={styles.payoutPercentTag}>
                  <LocalizedText style={styles.payoutPercentText}>
                    {((netTakeHome / orderAmount) * 100).toFixed(1)}% of Order
                  </LocalizedText>
                </View>
              </View>

              <LocalizedText style={styles.payoutAmount}>
                ₹{netTakeHome.toFixed(2)}
              </LocalizedText>

              <LocalizedText style={styles.payoutSubtext}>
                Deposited directly to your linked bank account on T+1 schedule
              </LocalizedText>
            </View>

            {/* Detailed itemized deductions table */}
            <View style={styles.deductionsTable}>
              <View style={styles.tableRow}>
                <LocalizedText style={styles.tableLabel}>Gross Customer Order</LocalizedText>
                <LocalizedText style={styles.tableVal}>₹{orderAmount.toFixed(2)}</LocalizedText>
              </View>

              <View style={styles.tableRow}>
                <LocalizedText style={styles.tableLabelDeduct}>
                  Platform Fee (12%)
                </LocalizedText>
                <LocalizedText style={styles.tableValDeduct}>
                  -₹{platformFee.toFixed(2)}
                </LocalizedText>
              </View>

              <View style={styles.tableRow}>
                <LocalizedText style={styles.tableLabelDeduct}>
                  Payment Gateway (1.8%)
                </LocalizedText>
                <LocalizedText style={styles.tableValDeduct}>
                  -₹{pgFee.toFixed(2)}
                </LocalizedText>
              </View>

              <View style={styles.tableRow}>
                <LocalizedText style={styles.tableLabelDeduct}>
                  GST on Platform Service (18%)
                </LocalizedText>
                <LocalizedText style={styles.tableValDeduct}>
                  -₹{gstOnFee.toFixed(2)}
                </LocalizedText>
              </View>

              <View style={styles.tableDivider} />

              <View style={styles.tableRowTotal}>
                <LocalizedText style={styles.tableTotalLabel}>Total Platform Cut</LocalizedText>
                <LocalizedText style={styles.tableTotalVal}>
                  -₹{totalDeduction.toFixed(2)}
                </LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== LINKED BANK ACCOUNT & SETTLEMENT INFO ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          <View style={styles.bankCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="credit-card" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Auto-Settlement Account</LocalizedText>
            </View>

            <View style={styles.bankInfoRow}>
              <View style={styles.bankLogoWrap}>
                <Icon name="check-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.bankDetails}>
                <View style={styles.bankNameRow}>
                  <LocalizedText style={styles.bankName}>HDFC Bank Ltd</LocalizedText>
                  <View style={styles.verifiedTag}>
                    <LocalizedText style={styles.verifiedTagText}>Active</LocalizedText>
                  </View>
                </View>
                <LocalizedText style={styles.accountNumber}>A/C: •••• •••• 8842</LocalizedText>
                <LocalizedText style={styles.ifscCode}>IFSC: HDFC0001234 • Branch Sector 18</LocalizedText>
              </View>
            </View>

            <View style={styles.settlementCycleBanner}>
              <Icon name="zap" size={14} color="#d97706" style={{ marginRight: 6 }} />
              <LocalizedText style={styles.settlementCycleText}>
                Daily Auto-Settlement executes at 06:00 AM every business day.
              </LocalizedText>
            </View>
          </View>
        </AnimatedEntranceView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tierHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
    shadowColor: '#1A632C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tierHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tierTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  tierSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  activeRatePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeRateText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
  },
  tierTrackCard: {
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#edf2ee',
  },
  tierTrackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  trackScore: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
  },
  trackBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  trackFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trackNote: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  ladderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  ladderTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  ladderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierStep: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  tierStepActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  tierStepName: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  tierStepNameActive: {
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
  },
  tierStepFee: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  tierStepFeeActive: {
    color: colors.primary,
  },
  tierStepOrders: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
  },
  calcCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  calcIntro: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: '#ffffff',
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
  },
  amountBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCurrency: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.textSecondary,
    marginRight: 2,
  },
  amountVal: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  payoutResultCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payoutResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  payoutLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  payoutPercentTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  payoutPercentText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  payoutAmount: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  payoutSubtext: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  deductionsTable: {
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tableLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  tableVal: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  tableLabelDeduct: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  tableValDeduct: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.danger,
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 6,
  },
  tableRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  tableTotalLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  tableTotalVal: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: colors.danger,
  },
  bankCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  bankLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
    marginRight: 8,
  },
  verifiedTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  accountNumber: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  ifscCode: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginTop: 1,
  },
  settlementCycleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  settlementCycleText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#92400e',
    flexShrink: 1,
  },
});

export default CommissionRateScreen;

