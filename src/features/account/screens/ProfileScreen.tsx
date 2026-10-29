import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { AnimatedEntranceView, Avatar, ListItem, Divider } from '../../../shared/components/common';
import LogoutBottomSheet from '../components/LogoutBottomSheet';
import ImagePath from '../../../shared/constants/ImagePath';
import { colors } from '../../../shared/theme/colors';

const APP_VERSION = 'SmartMart Vendor • v1.0.0 (Build 24)';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  badge?: string;
}

const STORE_OPS_ITEMS: MenuItem[] = [
  {
    id: 'store_profile',
    title: 'Store Profile',
    subtitle: 'Legal name, category & branding',
    icon: 'shopping-bag',
    color: '#258B3E',
    route: 'StoreProfile',
  },
  {
    id: 'store_address',
    title: 'Store Address & Fulfillment',
    subtitle: 'Radius & delivery coverage zone',
    icon: 'map-pin',
    color: '#0891b2',
    route: 'StoreAddress',
  },
  {
    id: 'working_hours',
    title: 'Operating Hours',
    subtitle: 'Weekly timings & holiday pause',
    icon: 'clock',
    color: '#d97706',
    route: 'WorkingHours',
  },
  {
    id: 'inventory',
    title: 'Product Catalog & Inventory',
    subtitle: 'Manage items, prices & stock levels',
    icon: 'archive',
    color: '#7c3aed',
    route: 'Inventory',
  },
  {
    id: 'low_stock',
    title: 'Low Stock Alerts',
    subtitle: 'Monitor items running out of stock',
    icon: 'alert-triangle',
    color: '#ea580c',
    route: 'LowStock',
  },
];

const COMMERCIALS_ITEMS: MenuItem[] = [
  {
    id: 'team',
    title: 'Team & Staff Management',
    subtitle: 'Pickers, packers & employee roles',
    icon: 'users',
    color: '#2563eb',
    route: 'TeamManagement',
  },
  {
    id: 'earnings',
    title: 'Settlements & Earnings',
    subtitle: 'Daily auto-payouts & statement history',
    icon: 'dollar-sign',
    color: '#059669',
    route: 'Earnings',
  },
  {
    id: 'commission',
    title: 'Commission Slabs & Rates',
    subtitle: '12% platform fee • Silver Partner',
    icon: 'percent',
    color: '#d97706',
    route: 'CommissionRate',
  },
];

const SUPPORT_ITEMS: MenuItem[] = [
  {
    id: 'settings',
    title: 'Settings & Preferences',
    subtitle: 'Sound siren, biometrics & language',
    icon: 'settings',
    color: '#475569',
    route: 'VendorSettings',
  },
  {
    id: 'notifications',
    title: 'Notifications & Dispatch',
    subtitle: 'Order updates and system notices',
    icon: 'bell',
    color: '#ca8a04',
    route: 'NotificationsScreen',
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'Merchant guide, FAQs & helpline',
    icon: 'help-circle',
    color: '#0284c7',
    route: 'HelpScreen',
  },
  {
    id: 'live_chat',
    title: 'Live Merchant Chat',
    subtitle: 'Direct support with partner desk',
    icon: 'message-circle',
    color: '#16a34a',
    route: 'LiveChatScreen',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Merchant data & platform policy',
    icon: 'shield',
    color: '#64748b',
    route: 'PrivacyPolicyScreen',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Rules, compliance & obligations',
    icon: 'file-text',
    color: '#64748b',
    route: 'TermsOfServiceScreen',
  },
];

export const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Vendor Data
  const vendor = {
    storeName: 'Green Basket Kirana',
    merchantId: '#TK-VB-8821',
    ownerName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'greenbasket.orders@smartmart.in',
    rating: '4.9',
    ordersCompleted: '1,420+',
    tier: 'Silver (12%)',
  };

  const handleSwitchToEmployee = () => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.reset({
        index: 0,
        routes: [{ name: 'DeliveryNavigation' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'DeliveryNavigation' }],
      });
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      setShowLogout(false);
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    } finally {
      setLoggingOut(false);
    }
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <View style={styles.menuSection}>
      <LocalizedText style={styles.sectionHeaderTitle}>{title}</LocalizedText>
      <View style={styles.card}>
        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            <ListItem
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              iconColor={item.color}
              iconBgColor={`${item.color}15`}
              onPress={() => navigation.navigate(item.route)}
            />
            {idx < items.length - 1 && <Divider style={{ marginLeft: 68 }} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <LocalizedText style={styles.headerTitle}>Vendor Profile</LocalizedText>
        <TouchableOpacity
          style={styles.headerSettingsBtn}
          scaleTo={0.88}
          onPress={() => navigation.navigate('VendorSettings')}
        >
          <Icon name="settings" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* ===== VENDOR HERO PROFILE CARD ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.profileHeroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.avatarContainer}>
                <Avatar
                  source={ImagePath.AppIcon}
                  icon="shopping-bag"
                  size={64}
                  backgroundColor={colors.primary}
                  textColor="#ffffff"
                  badge={
                    <TouchableOpacity
                      style={styles.avatarCameraBadge}
                      scaleTo={0.85}
                      onPress={() => navigation.navigate('StoreProfile')}
                      accessibilityLabel="Edit Store Photo"
                    >
                      <Icon name="camera" size={11} color="#ffffff" />
                    </TouchableOpacity>
                  }
                />
              </View>

              <View style={styles.heroTextInfo}>
                <View style={styles.nameRow}>
                  <LocalizedText style={styles.storeName}>{vendor.storeName}</LocalizedText>
                  <View style={styles.verifiedCheck}>
                    <Icon name="check" size={10} color="#ffffff" />
                  </View>
                </View>

                <LocalizedText style={styles.merchantId}>
                  Store ID: {vendor.merchantId}
                </LocalizedText>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <LocalizedText style={styles.statusText}>Open • Accepting Orders</LocalizedText>
                </View>
              </View>
            </View>

            {/* Owner Details */}
            <View style={styles.ownerDetailsRow}>
              <View style={styles.ownerDetailItem}>
                <Icon name="user" size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <LocalizedText style={styles.ownerDetailText}>{vendor.ownerName} (Owner)</LocalizedText>
              </View>
              <View style={styles.ownerDetailItem}>
                <Icon name="phone" size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <LocalizedText style={styles.ownerDetailText}>{vendor.phone}</LocalizedText>
              </View>
            </View>

            {/* Key Metrics Strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statCol}>
                <LocalizedText style={styles.statVal}>{vendor.rating} ★</LocalizedText>
                <LocalizedText style={styles.statLabel}>Store Rating</LocalizedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <LocalizedText style={styles.statVal}>{vendor.ordersCompleted}</LocalizedText>
                <LocalizedText style={styles.statLabel}>Orders Delivered</LocalizedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <LocalizedText style={styles.statVal}>{vendor.tier}</LocalizedText>
                <LocalizedText style={styles.statLabel}>Partner Tier</LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== SWITCH TO EMPLOYEE APP BUTTON ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <TouchableOpacity
            style={styles.switchEmployeeCard}
            scaleTo={0.97}
            onPress={handleSwitchToEmployee}
            activeOpacity={0.88}
          >
            <View style={styles.switchIconWrap}>
              <Icon name="users" size={22} color="#ffffff" />
            </View>
            <View style={styles.switchTextWrap}>
              <View style={styles.switchTitleRow}>
                <LocalizedText style={styles.switchTitle}>Switch to Employee App</LocalizedText>
                <View style={styles.switchBadge}>
                  <LocalizedText style={styles.switchBadgeText}>In-Store Staff</LocalizedText>
                </View>
              </View>
              <LocalizedText style={styles.switchSubtitle}>
                Open in-store picking, packing &amp; employee floor tasks
              </LocalizedText>
            </View>
            <Icon name="arrow-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </AnimatedEntranceView>

        {/* ===== SECTION 1: STORE & CATALOG ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          {renderMenuSection('Store & Catalog Operations', STORE_OPS_ITEMS)}
        </AnimatedEntranceView>

        {/* ===== SECTION 2: TEAM & FINANCES ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          {renderMenuSection('Staff & Commercials', COMMERCIALS_ITEMS)}
        </AnimatedEntranceView>

        {/* ===== SECTION 3: APP & SUPPORT ===== */}
        <AnimatedEntranceView delay={280} direction="up" distance={16}>
          {renderMenuSection('Settings & Support', SUPPORT_ITEMS)}
        </AnimatedEntranceView>

        {/* ===== LOGOUT BUTTON ===== */}
        <AnimatedEntranceView delay={340} direction="up" distance={16}>
          <View style={styles.logoutWrapper}>
            <TouchableOpacity
              style={styles.logoutBtn}
              scaleTo={0.96}
              onPress={() => setShowLogout(true)}
            >
              <Icon name="log-out" size={18} color={colors.danger} style={{ marginRight: 8 }} />
              <LocalizedText style={styles.logoutText}>Logout Vendor Account</LocalizedText>
            </TouchableOpacity>
            <LocalizedText style={styles.versionText}>{APP_VERSION}</LocalizedText>
          </View>
        </AnimatedEntranceView>
      </ScrollView>

      {/* Logout confirmation sheet */}
      <LogoutBottomSheet
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  headerSettingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Hero Card
  profileHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
    shadowColor: '#1A632C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarCameraBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  heroTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    marginRight: 6,
  },
  verifiedCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantId: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  ownerDetailsRow: {
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#edf2ee',
    marginBottom: 12,
  },
  ownerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  ownerDetailText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },

  // Switch to Employee Card
  switchEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1faf3',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#d2ecd7',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  switchIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
    marginRight: 6,
  },
  switchBadge: {
    backgroundColor: 'rgba(37, 139, 62, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  switchBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
  switchSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#3d6148',
    marginTop: 2,
  },

  // Menu sections
  menuSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
    marginRight: 8,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 62,
  },

  // Logout section
  logoutWrapper: {
    marginTop: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 14,
    paddingVertical: 13,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.danger,
  },
  versionText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginTop: 12,
  },
});

export default ProfileScreen;
