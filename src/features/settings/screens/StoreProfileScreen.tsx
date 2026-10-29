import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
  Dialog,
  Avatar,
  Chip,
} from '../../../shared/components/common';
import { colors } from '../../../shared/theme/colors';
import ImagePath from '../../../shared/constants/ImagePath';

const CATEGORIES = [
  { id: 'kirana', label: 'Daily Kirana', icon: 'shopping-bag' },
  { id: 'grocery', label: 'Grocery & Staples', icon: 'package' },
  { id: 'fruits_veg', label: 'Fresh Fruits & Veg', icon: 'sun' },
  { id: 'dairy', label: 'Dairy & Bakery', icon: 'coffee' },
  { id: 'organic', label: 'Organic & Gourmet', icon: 'feather' },
];

export const StoreProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  // Store form state
  const [storeName, setStoreName] = useState('Green Basket Kirana');
  const [tagline, setTagline] = useState('Fresh daily groceries delivered to your doorstep in 15 minutes.');
  const [selectedCategory, setSelectedCategory] = useState('kirana');
  const [ownerName, setOwnerName] = useState('Rajesh Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('greenbasket.orders@smartmart.in');
  const [altPhone, setAltPhone] = useState('+91 98123 45678');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [fssai, setFssai] = useState('10019011000123');
  const [isOpen, setIsOpen] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for live status badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fill progress bar animation
    Animated.timing(progressAnim, {
      toValue: 0.92,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, progressAnim]);

  const handleSave = () => {
    setShowSuccessDialog(true);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Store Profile"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* ===== HERO STORE BANNER & AVATAR ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.heroCard}>
            <View style={styles.heroPatternOverlay} />

            <View style={styles.avatarRow}>
              <Avatar
                source={ImagePath.AppIcon}
                icon="shopping-bag"
                size={70}
                backgroundColor={colors.primary}
                textColor="#ffffff"
                style={{ marginRight: 14 }}
                badge={
                  <TouchableOpacity
                    style={styles.cameraBtn}
                    scaleTo={0.85}
                    accessibilityLabel="Change Store Photo"
                  >
                    <Icon name="camera" size={13} color="#ffffff" />
                  </TouchableOpacity>
                }
              />

              <View style={styles.storeHeroInfo}>
                <View style={styles.storeBadgeRow}>
                  <LocalizedText style={styles.storeHeroName}>{storeName}</LocalizedText>
                  <Animated.View
                    style={[
                      styles.verifiedBadge,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <Icon name="check" size={12} color="#ffffff" />
                  </Animated.View>
                </View>

                <LocalizedText style={styles.storeIdText}>Store ID: #TK-VB-8821</LocalizedText>

                {/* Status chip */}
                <View style={styles.statusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOpen ? colors.primary : colors.warning },
                    ]}
                  />
                  <LocalizedText style={styles.statusPillText}>
                    {isOpen ? 'Open & Accepting Orders' : 'Store Paused'}
                  </LocalizedText>
                </View>
              </View>
            </View>

            {/* Completion Meter */}
            <View style={styles.meterContainer}>
              <View style={styles.meterHeader}>
                <LocalizedText style={styles.meterTitle}>Profile Health</LocalizedText>
                <LocalizedText style={styles.meterScore}>92% • Gold Verified</LocalizedText>
              </View>
              <View style={styles.meterTrack}>
                <Animated.View
                  style={[
                    styles.meterFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <LocalizedText style={styles.meterSubtitle}>
                Add trade license document to reach 100% Top Vendor status.
              </LocalizedText>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== STORE STATUS TOGGLE CARD ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View
                  style={[
                    styles.toggleIconWrap,
                    { backgroundColor: isOpen ? colors.primaryLight : colors.warningLight },
                  ]}
                >
                  <Icon
                    name={isOpen ? 'power' : 'pause-circle'}
                    size={20}
                    color={isOpen ? colors.primary : colors.warning}
                  />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>
                    {isOpen ? 'Store is Open' : 'Store is Paused'}
                  </LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    {isOpen
                      ? 'Customers can see your catalog and place orders'
                      : 'Store hidden from search; no new orders received'}
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={isOpen ? colors.primary : '#f3f4f6'}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== STORE DETAILS ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="briefcase" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>General Details</LocalizedText>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Store Legal Name</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="shopping-bag" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="Enter store name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Category selection chips */}
            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Primary Category</LocalizedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      icon={cat.icon}
                      selected={active}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={styles.categoryChip}
                    />
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <LocalizedText style={styles.inputLabel}>Store Tagline / Bio</LocalizedText>
                <LocalizedText style={styles.charCount}>{tagline.length}/150</LocalizedText>
              </View>
              <View style={[styles.inputWrap, styles.textAreaWrap]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={tagline}
                  onChangeText={setTagline}
                  maxLength={150}
                  multiline
                  numberOfLines={3}
                  placeholder="Tell customers about your store specialty..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== OWNER & CONTACT ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="user" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Owner & Contact</LocalizedText>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Store Owner / Partner Name</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="user" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholder="Primary contact person"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Primary Business Phone</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="phone" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Business contact number"
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.verifiedTag}>
                  <Icon name="check-circle" size={12} color={colors.primary} />
                  <LocalizedText style={styles.verifiedTagText}>Verified</LocalizedText>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Business Email</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="mail" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Email for monthly statements"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Alternate / WhatsApp Dispatch Number</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="message-square" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={altPhone}
                  onChangeText={setAltPhone}
                  keyboardType="phone-pad"
                  placeholder="For urgent order dispatch updates"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== TAX & REGULATORY LICENSES ===== */}
        <AnimatedEntranceView delay={280} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="shield" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Regulatory & Compliance</LocalizedText>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>GSTIN Identification</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="file-text" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={[styles.textInput, { textTransform: 'uppercase' }]}
                  value={gstin}
                  onChangeText={setGstin}
                  placeholder="15-digit GSTIN"
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.verifiedTag}>
                  <Icon name="check-circle" size={12} color={colors.primary} />
                  <LocalizedText style={styles.verifiedTagText}>Active</LocalizedText>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>FSSAI Food Safety License</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="award" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={fssai}
                  onChangeText={setFssai}
                  placeholder="14-digit FSSAI number"
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.verifiedTag}>
                  <Icon name="calendar" size={12} color={colors.primary} />
                  <LocalizedText style={styles.verifiedTagText}>Exp 2027</LocalizedText>
                </View>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>
      </ScrollView>

      {/* ===== STICKY FLOATING SAVE BAR ===== */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          scaleTo={0.95}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Icon name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <LocalizedText style={styles.saveBtnText}>Save Profile Changes</LocalizedText>
        </TouchableOpacity>
      </View>

      {/* Confirmation Dialog */}
      <Dialog
        visible={showSuccessDialog}
        type="success"
        title="Profile Updated!"
        message="Your store information and compliance details have been securely synchronized."
        confirmText="Done"
        onConfirm={() => setShowSuccessDialog(false)}
        onClose={() => setShowSuccessDialog(false)}
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
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
    shadowColor: '#1A632C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  heroPatternOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    borderBottomLeftRadius: 140,
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storeHeroInfo: {
    flex: 1,
  },
  storeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeHeroName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    marginRight: 6,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIdText: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  meterContainer: {
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#edf2ee',
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meterTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  meterScore: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
  },
  meterTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  meterSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginTop: 6,
  },
  sectionCard: {
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleTexts: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    minHeight: 46,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
    marginLeft: 4,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default StoreProfileScreen;
