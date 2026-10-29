import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  Text as NativeText,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
  BottomSheet,
  Dialog,
  ListItem,
  Divider,
} from '../../../shared/components/common';
import LogoutBottomSheet from '../../account/components/LogoutBottomSheet';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../../shared/i18n/languages';
import { useLocalization } from '../../../shared/i18n/LocalizationProvider';
import { useBiometricLock } from '../../auth/biometrics/BiometricLockProvider';
import { colors } from '../../../shared/theme/colors';

const APP_VERSION = 'SmartMart Vendor • v1.0.0 (Build 24)';

export const VendorSettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useLocalization();
  const { enabled: biometric, setEnabled: setBiometric } = useBiometricLock();

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  // Sheets & Dialogs
  const [showLanguage, setShowLanguage] = useState(false);
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ??
    SUPPORTED_LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!;

  const handleLogout = () => {
    setShowLogoutSheet(true);
  };

  const confirmLogout = () => {
    setShowLogoutSheet(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const confirmDeleteAccount = () => {
    setShowDeleteDialog(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const SettingItem = ({
    icon,
    iconColor,
    iconBgColor,
    title,
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: string;
    iconColor?: string;
    iconBgColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <ListItem
      icon={icon}
      iconColor={iconColor}
      iconBgColor={iconBgColor}
      title={title}
      subtitle={subtitle}
      onPress={onPress}
      rightElement={rightElement}
      danger={danger}
      style={styles.settingItem}
      titleStyle={styles.settingTitle}
      subtitleStyle={styles.settingSubtitle}
    />
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Settings"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
      >
        {/* ===== 1. STORE OPERATIONS ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Store Operations</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="shopping-bag"
                iconColor="#258B3E"
                iconBgColor="#EAF5ED"
                title="Store Profile"
                subtitle="Green Basket Kirana • Profile 92% complete"
                onPress={() => navigation.navigate('StoreProfile')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="map-pin"
                iconColor="#0891b2"
                iconBgColor="#e0f2fe"
                title="Store Address & Delivery Zone"
                subtitle="Sector 18 • 5 km active delivery radius"
                onPress={() => navigation.navigate('StoreAddress')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="clock"
                iconColor="#d97706"
                iconBgColor="#fef3c7"
                title="Working Hours"
                subtitle="Mon - Sun • 08:00 AM - 10:00 PM"
                onPress={() => navigation.navigate('WorkingHours')}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== 2. ORDERS & COMMISSION ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Orders & Commercials</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="zap"
                iconColor="#16a34a"
                iconBgColor="#dcfce7"
                title="Auto Accept Orders"
                subtitle="Automatically accept incoming new orders"
                rightElement={
                  <Switch
                    value={autoAccept}
                    onValueChange={setAutoAccept}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={autoAccept ? colors.primary : '#f3f4f6'}
                  />
                }
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="percent"
                iconColor="#7c3aed"
                iconBgColor="#f3e8ff"
                title="Commission & Payouts"
                subtitle="12% platform rate • Silver Partner Tier"
                onPress={() => navigation.navigate('CommissionRate')}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== 3. NOTIFICATIONS & ALERTS ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Notifications & Alerts</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="bell"
                iconColor="#2563eb"
                iconBgColor="#eff6ff"
                title="Push Notifications"
                subtitle="Receive alerts on this device"
                rightElement={
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={notifications ? colors.primary : '#f3f4f6'}
                  />
                }
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="volume-2"
                iconColor="#ea580c"
                iconBgColor="#ffedd5"
                title="New Order Siren Alerts"
                subtitle="Loud ringtone for incoming orders"
                rightElement={
                  <Switch
                    value={orderAlerts}
                    onValueChange={setOrderAlerts}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={orderAlerts ? colors.primary : '#f3f4f6'}
                  />
                }
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="alert-triangle"
                iconColor="#d97706"
                iconBgColor="#fef3c7"
                title="Low Stock Alerts"
                subtitle="Warn when inventory drops below 5 units"
                rightElement={
                  <Switch
                    value={lowStockAlerts}
                    onValueChange={setLowStockAlerts}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={lowStockAlerts ? colors.primary : '#f3f4f6'}
                  />
                }
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="sliders"
                iconColor="#0d9488"
                iconBgColor="#ccfbf1"
                title="Detailed Siren & Channel Settings"
                subtitle="Configure repeating sirens, SMS & WhatsApp"
                onPress={() => navigation.navigate('NotificationPreferences')}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== 4. PREFERENCES & SECURITY ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Preferences & Security</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="globe"
                iconColor="#4f46e5"
                iconBgColor="#eef2ff"
                title="App Language"
                subtitle="Choose your preferred app language"
                onPress={() => setShowLanguage(true)}
                rightElement={
                  <View style={styles.trailingBadge}>
                    <LocalizedText style={styles.trailingBadgeText}>
                      {currentLanguage.nativeName}
                    </LocalizedText>
                    <Icon name="chevron-right" size={18} color="#9ca3af" />
                  </View>
                }
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="lock"
                iconColor="#059669"
                iconBgColor="#ecfdf5"
                title="Biometric Lock"
                subtitle="Require Face ID or fingerprint to open"
                rightElement={
                  <Switch
                    value={biometric}
                    onValueChange={(val) => {
                      void setBiometric(val);
                    }}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={biometric ? colors.primary : '#f3f4f6'}
                  />
                }
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== 5. SUPPORT & LEGAL ===== */}
        <AnimatedEntranceView delay={280} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Account & Legal</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="user"
                iconColor="#475569"
                iconBgColor="#f1f5f9"
                title="Account Details"
                subtitle="Owner name, phone & linked bank details"
                onPress={() => navigation.navigate('EditProfileScreen')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="help-circle"
                iconColor="#0284c7"
                iconBgColor="#e0f2fe"
                title="Help & Support"
                subtitle="FAQs and contact customer care"
                onPress={() => navigation.navigate('HelpScreen')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="message-circle"
                iconColor="#10b981"
                iconBgColor="#d1fae5"
                title="Live Chat Support"
                subtitle="Chat with a merchant support executive"
                onPress={() => navigation.navigate('LiveChatScreen')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="file-text"
                iconColor="#64748b"
                iconBgColor="#f1f5f9"
                title="Privacy Policy"
                onPress={() => navigation.navigate('PrivacyPolicyScreen')}
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="book-open"
                iconColor="#64748b"
                iconBgColor="#f1f5f9"
                title="Terms of Service"
                onPress={() => navigation.navigate('TermsOfServiceScreen')}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== 6. ACCOUNT ACTIONS & DANGER ZONE ===== */}
        <AnimatedEntranceView delay={340} direction="up" distance={16}>
          <View style={styles.section}>
            <LocalizedText style={styles.sectionTitle}>Account Actions</LocalizedText>
            <View style={styles.card}>
              <SettingItem
                icon="log-out"
                title="Logout"
                subtitle="Sign out from this device"
                onPress={handleLogout}
                danger
              />
              <Divider style={{ marginLeft: 68 }} />
              <SettingItem
                icon="trash-2"
                title="Delete Account"
                subtitle="Permanently remove vendor account and store"
                onPress={() => setShowDeleteDialog(true)}
                danger
              />
            </View>
          </View>
        </AnimatedEntranceView>

        <LocalizedText style={styles.version}>{APP_VERSION}</LocalizedText>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ==================== LANGUAGE BOTTOM SHEET ==================== */}
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

      {/* ==================== LOGOUT SHEET ==================== */}
      <LogoutBottomSheet
        visible={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
        onConfirm={confirmLogout}
      />

      {/* ==================== DELETE ACCOUNT CONFIRM DIALOG ==================== */}
      <Dialog
        visible={showDeleteDialog}
        type="destructive"
        title="Delete Vendor Account?"
        message="This will permanently delete your store, catalog, and past orders. This action cannot be reversed."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onClose={() => setShowDeleteDialog(false)}
      />
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
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapperDanger: {
    backgroundColor: colors.dangerLight,
  },
  settingContent: {
    flex: 1,
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerText: {
    color: colors.danger,
  },
  trailingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailingBadgeText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.primary,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 68,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 8,
  },

  // Language sheet styles
  sheetHeading: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sheetSubheading: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langRowSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  langLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
});

export default VendorSettingsScreen;
