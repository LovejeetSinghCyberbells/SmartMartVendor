// VendorHomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Text as NativeText,
} from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import OrderStatusBadge from '../../orders/components/OrderStatusBadge';
import { AnimatedEntranceView, LivePulseBeacon, BottomSheet } from '../../../shared/components/common';
import { useLocalization } from '../../../shared/i18n/LocalizationProvider';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../../shared/i18n/languages';
import { colors } from '../../../shared/theme/colors';
import {
  VendorHomeSkeleton,
  useVendorEntranceAnimation,
  AnimatedSectionWrapper,
} from '../components/animations';

const PENDING_ORDERS = [
  { id: 'TK-1024', items: 8, amount: '₹420', time: '2 min ago', status: 'NEW' },
  { id: 'TK-1023', items: 5, amount: '₹280', time: '6 min ago', status: 'PACKING' },
  { id: 'TK-1022', items: 12, amount: '₹650', time: '11 min ago', status: 'READY' },
];

const QUICK_STATS = [
  { id: '1', label: 'Today’s Orders', value: '47', icon: 'shopping-bag' },
  { id: '2', label: 'Pending', value: '3', icon: 'clock' },
  { id: '3', label: 'Ready', value: '5', icon: 'check-circle' },
  { id: '4', label: 'Earnings', value: '₹12.4k', icon: 'trending-up' },
];

const LOW_STOCK = [
  { id: '1', name: 'Amul Milk 1L', stock: 4 },
  { id: '2', name: 'Fortune Oil 1L', stock: 2 },
  { id: '3', name: 'Aashirvaad Atta 5kg', stock: 6 },
];

const VendorHomeScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [showLanguage, setShowLanguage] = useState(false);
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useLocalization();

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ??
    SUPPORTED_LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!;

  const { headerStyle, getSectionStyle, getStatCardStyle, isHeaderLanded } =
    useVendorEntranceAnimation(isLoading, insets.top);

  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (storeOpen) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dotScale, {
            toValue: 1.35,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(dotScale, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      dotScale.setValue(1);
    }
  }, [storeOpen, dotScale]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <VendorHomeSkeleton />;
  }

  return (
    <View style={[styles.root, { backgroundColor: isHeaderLanded ? '#258B3E' : '#ffffff' }]}>
      <StatusBar barStyle={isHeaderLanded ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ===== HEADER ===== */}
        <Animated.View style={[styles.header, { paddingTop: insets.top + 10 }, headerStyle]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.storeName}>Green Basket Kirana</LocalizedText>
              <LocalizedText style={styles.storeId}>Store ID: #TK-VB-8821</LocalizedText>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.langButton}
                scaleTo={0.90}
                onPress={() => setShowLanguage(true)}
                accessibilityLabel="Change Language"
              >
                <Icon name="globe" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                <NativeText style={styles.langButtonText}>
                  {currentLanguage.code.toUpperCase()}
                </NativeText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggle,
                  { backgroundColor: storeOpen ? '#ffffff' : 'rgba(255,255,255,0.25)' },
                ]}
                scaleTo={0.92}
                onPress={() => setStoreOpen(!storeOpen)}
              >
                <LivePulseBeacon
                  color={storeOpen ? '#258B3E' : '#ef4444'}
                  size={8}
                  pulseRadius={14}
                  active={storeOpen}
                  style={{ marginRight: 6 }}
                />
                <LocalizedText
                  style={[
                    styles.statusText,
                    { color: storeOpen ? '#1a1a1a' : '#ffffff' },
                  ]}
                >
                  {storeOpen ? 'Open' : 'Closed'}
                </LocalizedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            {QUICK_STATS.map((stat, idx) => (
              <Animated.View
                key={stat.id}
                style={[styles.statCardContainer, getStatCardStyle(idx)]}
              >
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  scaleTo={0.92}
                  onPress={() => {
                    if (stat.label === 'Earnings') navigation.navigate('Earnings');
                    else navigation.navigate('Orders');
                  }}
                >
                  <Icon name={stat.icon as any} size={20} color="#ffffff" />
                  <LocalizedText
                    style={styles.statValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {stat.value}
                  </LocalizedText>
                  <View style={styles.statLabelWrapper}>
                    <LocalizedText
                      style={styles.statLabel}
                      numberOfLines={2}
                      adjustsFontSizeToFit={true}
                    >
                      {stat.label}
                    </LocalizedText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ===== PENDING ORDERS ===== */}
        <AnimatedSectionWrapper animStyle={getSectionStyle(0)}>
          <View style={styles.sectionHeader}>
            <LocalizedText style={styles.sectionTitle}>Pending Orders</LocalizedText>
            <TouchableOpacity scaleTo={0.92} onPress={() => navigation.navigate('Orders')}>
              <LocalizedText style={styles.seeAll}>See All</LocalizedText>
            </TouchableOpacity>
          </View>

          {PENDING_ORDERS.map((order, idx) => (
            <AnimatedEntranceView
              key={order.id}
              delay={400 + idx * 75}
              direction="up"
              distance={20}
            >
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.85}
                scaleTo={0.96}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                <View style={styles.orderLeft}>
                  <LocalizedText style={styles.orderId}>{order.id}</LocalizedText>
                  <LocalizedText style={styles.orderMeta}>
                    {order.items} items • {order.time}
                  </LocalizedText>
                </View>
                <View style={styles.orderRight}>
                  <LocalizedText style={styles.orderAmount}>{order.amount}</LocalizedText>
                  <OrderStatusBadge status={order.status as any} size="sm" />
                </View>
              </TouchableOpacity>
            </AnimatedEntranceView>
          ))}
        </AnimatedSectionWrapper>

        {/* ===== QUICK ACTIONS ===== */}
        <AnimatedSectionWrapper animStyle={getSectionStyle(1)}>
          <View style={styles.sectionHeader}>
            <LocalizedText style={styles.sectionTitle}>Quick Actions</LocalizedText>
          </View>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'package', label: 'Orders', screen: 'Orders' },
              { icon: 'box', label: 'Inventory', screen: 'Inventory' },
              { icon: 'users', label: 'Team', screen: 'TeamManagement' },
              { icon: 'bar-chart-2', label: 'Earnings', screen: 'Earnings' },
              { icon: 'settings', label: 'Settings', screen: 'VendorSettings' },
              { icon: 'help-circle', label: 'Support', screen: 'HelpScreen' },
            ].map((item, idx) => (
              <AnimatedEntranceView
                key={item.label}
                delay={480 + idx * 50}
                direction="scale"
                bouncy
                style={styles.actionCardWrapper}
              >
                <TouchableOpacity
                  style={styles.actionCard}
                  scaleTo={0.90}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.actionIcon}>
                    <Icon name={item.icon as any} size={22} color="#258B3E" />
                  </View>
                  <LocalizedText style={styles.actionLabel}>{item.label}</LocalizedText>
                </TouchableOpacity>
              </AnimatedEntranceView>
            ))}
          </View>
        </AnimatedSectionWrapper>

        {/* ===== LOW STOCK ALERT ===== */}
        <AnimatedSectionWrapper animStyle={getSectionStyle(2)}>
          <View style={styles.sectionHeader}>
            <LocalizedText style={styles.sectionTitle}>Low Stock Alert</LocalizedText>
            <TouchableOpacity scaleTo={0.92} onPress={() => navigation.navigate('LowStock')}>
              <LocalizedText style={styles.seeAll}>Manage</LocalizedText>
            </TouchableOpacity>
          </View>

          {LOW_STOCK.map((item, idx) => (
            <AnimatedEntranceView
              key={item.id}
              delay={560 + idx * 65}
              direction="up"
              distance={16}
            >
              <TouchableOpacity
                style={styles.stockRow}
                activeOpacity={0.8}
                scaleTo={0.96}
                onPress={() => navigation.navigate('LowStock')}
              >
                <Icon name="alert-triangle" size={18} color="#f59e0b" />
                <LocalizedText style={styles.stockName}>{item.name}</LocalizedText>
                <LocalizedText style={styles.stockCount}>Only {item.stock} left</LocalizedText>
              </TouchableOpacity>
            </AnimatedEntranceView>
          ))}
        </AnimatedSectionWrapper>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ==================== QUICK LANGUAGE SELECTOR BOTTOM SHEET ==================== */}
      <BottomSheet visible={showLanguage} onClose={() => setShowLanguage(false)}>
        <LocalizedText style={styles.sheetHeading}>Select Language</LocalizedText>
        <LocalizedText style={styles.sheetSubheading}>
          Choose the language you are most comfortable with
        </LocalizedText>

        {SUPPORTED_LANGUAGES.map((lang) => {
          const selected = lang.code === language;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, selected && styles.langRowSelected]}
              scaleTo={0.96}
              onPress={() => {
                void setLanguage(lang.code)
                  .then(() => setShowLanguage(false))
                  .catch((error: unknown) => {
                    console.error('Unable to update the app language.', error);
                  });
              }}
            >
              <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                {selected && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.langNative}>{lang.nativeName}</LocalizedText>
                <NativeText style={styles.langLabel}>{lang.label}</NativeText>
              </View>
              {selected && <Icon name="check" size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { backgroundColor: '#ffffff', flexGrow: 1 },
  header: {
    backgroundColor: '#258B3E',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 22,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  langButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  storeId: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statCardContainer: {
    flex: 1,
    height: 96,
  },
  statCard: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabelWrapper: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    width: '100%',
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
  },
  orderLeft: { flex: 1 },
  orderId: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  orderMeta: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 3,
  },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  actionCardWrapper: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 18,
  },
  actionCard: {
    width: '100%',
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  stockName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
    marginLeft: 10,
  },
  stockCount: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#d97706',
  },
  sheetHeading: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sheetSubheading: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 20,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  langRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  langNative: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  langLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
});

export default VendorHomeScreen;