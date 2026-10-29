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
} from '../../../shared/components/common';
import { colors } from '../../../shared/theme/colors';

const RADIUS_OPTIONS = [
  { km: 2, households: '4,800', avgTime: '12 - 15 mins', tag: 'Fast Hyperlocal' },
  { km: 5, households: '14,200', avgTime: '18 - 25 mins', tag: 'Recommended' },
  { km: 8, households: '32,500', avgTime: '28 - 35 mins', tag: 'City Reach' },
  { km: 12, households: '58,000', avgTime: '40 - 50 mins', tag: 'Max Coverage' },
];

export const StoreAddressScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  // Form State
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [shopNo, setShopNo] = useState('Shop #14, Ground Floor');
  const [building, setBuilding] = useState('Sunrise Commercial Plaza');
  const [street, setStreet] = useState('Main Ring Road, Sector 18');
  const [landmark, setLandmark] = useState('Opposite Metro Pillar 142');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('201301');
  const [instantDelivery, setInstantDelivery] = useState(true);
  const [partnerFleet, setPartnerFleet] = useState(true);
  const [minOrderFree, setMinOrderFree] = useState(299);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Animations
  const radarWave1 = useRef(new Animated.Value(0.4)).current;
  const radarWave2 = useRef(new Animated.Value(0.4)).current;
  const radarOpacity1 = useRef(new Animated.Value(0.8)).current;
  const radarOpacity2 = useRef(new Animated.Value(0.8)).current;
  const locatingSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Looping radar wave animation
    const animateWaves = () => {
      radarWave1.setValue(0.4);
      radarOpacity1.setValue(0.8);
      radarWave2.setValue(0.4);
      radarOpacity2.setValue(0.8);

      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(radarWave1, {
                toValue: 1.6,
                duration: 2200,
                useNativeDriver: true,
              }),
              Animated.timing(radarOpacity1, {
                toValue: 0,
                duration: 2200,
                useNativeDriver: true,
              }),
            ]),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.delay(1100),
            Animated.parallel([
              Animated.timing(radarWave2, {
                toValue: 1.6,
                duration: 2200,
                useNativeDriver: true,
              }),
              Animated.timing(radarOpacity2, {
                toValue: 0,
                duration: 2200,
                useNativeDriver: true,
              }),
            ]),
          ])
        ),
      ]).start();
    };

    animateWaves();
  }, [radarWave1, radarWave2, radarOpacity1, radarOpacity2]);

  const handleLocateMe = () => {
    setIsLocating(true);
    Animated.loop(
      Animated.timing(locatingSpin, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      setIsLocating(false);
      locatingSpin.stopAnimation();
      locatingSpin.setValue(0);
    }, 1800);
  };

  const currentOption =
    RADIUS_OPTIONS.find((r) => r.km === selectedRadius) || RADIUS_OPTIONS[1];

  const handleAdjustMinOrder = (delta: number) => {
    setMinOrderFree((prev) => Math.max(99, prev + delta));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Store Address & Delivery"
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
        {/* ===== RADAR & MAP VISUALIZATION CARD ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.mapCard}>
            {/* Animated Radar Pulse */}
            <View style={styles.radarContainer}>
              <Animated.View
                style={[
                  styles.radarCircle,
                  {
                    transform: [{ scale: radarWave1 }],
                    opacity: radarOpacity1,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.radarCircle,
                  {
                    transform: [{ scale: radarWave2 }],
                    opacity: radarOpacity2,
                  },
                ]}
              />
              {/* Store Center Pin */}
              <View style={styles.pinWrapper}>
                <View style={styles.storePin}>
                  <Icon name="map-pin" size={18} color="#ffffff" />
                </View>
                <View style={styles.pinShadow} />
              </View>
            </View>

            <View style={styles.mapInfo}>
              <View style={styles.pinBadgeRow}>
                <View style={styles.gpsDot} />
                <LocalizedText style={styles.gpsText}>
                  GPS: 28.6139° N, 77.2090° E • Precision &lt; 5m
                </LocalizedText>
              </View>

              <TouchableOpacity
                style={styles.gpsButton}
                onPress={handleLocateMe}
                disabled={isLocating}
                scaleTo={0.92}
              >
                <Animated.View
                  style={
                    isLocating
                      ? {
                          transform: [
                            {
                              rotate: locatingSpin.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        }
                      : null
                  }
                >
                  <Icon
                    name={isLocating ? 'refresh-cw' : 'crosshair'}
                    size={14}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                </Animated.View>
                <LocalizedText style={styles.gpsButtonText}>
                  {isLocating ? 'Pinpointing GPS...' : 'Update via GPS'}
                </LocalizedText>
              </TouchableOpacity>
            </View>

            {/* Radius Selector Row */}
            <View style={styles.radiusSelectorSection}>
              <LocalizedText style={styles.radiusSectionTitle}>
                Fulfillment Radius: <LocalizedText style={styles.radiusHighlight}>{selectedRadius} km</LocalizedText>
              </LocalizedText>

              <View style={styles.radiusChipsRow}>
                {RADIUS_OPTIONS.map((opt) => {
                  const active = selectedRadius === opt.km;
                  return (
                    <TouchableOpacity
                      key={opt.km}
                      style={[styles.radiusChip, active && styles.radiusChipActive]}
                      onPress={() => setSelectedRadius(opt.km)}
                      scaleTo={0.92}
                    >
                      <LocalizedText
                        style={[styles.radiusChipKm, active && styles.radiusChipKmActive]}
                      >
                        {opt.km} km
                      </LocalizedText>
                      {active && (
                        <View style={styles.activeCheck}>
                          <Icon name="check" size={10} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dynamic live estimate banner */}
              <View style={styles.estimateBanner}>
                <View style={styles.estimateCol}>
                  <View style={styles.estimateIconWrap}>
                    <Icon name="users" size={15} color={colors.primary} />
                  </View>
                  <View>
                    <LocalizedText style={styles.estimateValue}>{currentOption.households}</LocalizedText>
                    <LocalizedText style={styles.estimateLabel}>Households Reached</LocalizedText>
                  </View>
                </View>

                <View style={styles.estimateDivider} />

                <View style={styles.estimateCol}>
                  <View style={styles.estimateIconWrap}>
                    <Icon name="clock" size={15} color={colors.primary} />
                  </View>
                  <View>
                    <LocalizedText style={styles.estimateValue}>{currentOption.avgTime}</LocalizedText>
                    <LocalizedText style={styles.estimateLabel}>Avg Delivery Time</LocalizedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== STORE PHYSICAL ADDRESS FIELDS ===== */}
        <AnimatedEntranceView delay={120} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="home" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Physical Address</LocalizedText>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Shop / Unit / Floor</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="tag" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={shopNo}
                  onChangeText={setShopNo}
                  placeholder="e.g. Shop #14, Ground Floor"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Building / Market Name</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="grid" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={building}
                  onChangeText={setBuilding}
                  placeholder="e.g. Sunrise Plaza"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Street / Area</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="map" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Street or locality name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>Nearby Landmark</LocalizedText>
              <View style={styles.inputWrap}>
                <Icon name="navigation" size={17} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="Prominent landmark for delivery drivers"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <LocalizedText style={styles.inputLabel}>City</LocalizedText>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <LocalizedText style={styles.inputLabel}>Pincode</LocalizedText>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.textInput}
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="6 digits"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LocalizedText style={styles.inputLabel}>State</LocalizedText>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.textInput}
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== FULFILLMENT & DELIVERY PREFERENCES ===== */}
        <AnimatedEntranceView delay={180} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="truck" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Fulfillment Options</LocalizedText>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIconWrap}>
                  <Icon name="zap" size={18} color="#d97706" />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>Instant Express Delivery</LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    Enable 15-minute quick delivery tag on customer app
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={instantDelivery}
                onValueChange={setInstantDelivery}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={instantDelivery ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIconWrap}>
                  <Icon name="navigation" size={18} color={colors.primary} />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>SmartMart Rider Network</LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    Dispatch orders via shared platform delivery partners
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={partnerFleet}
                onValueChange={setPartnerFleet}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={partnerFleet ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            {/* Stepper for Free Delivery Order Value */}
            <View style={styles.stepperRow}>
              <View style={styles.stepperLeft}>
                <LocalizedText style={styles.toggleTitle}>Free Delivery Threshold</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>
                  Orders above this value receive free delivery
                </LocalizedText>
              </View>

              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleAdjustMinOrder(-50)}
                  scaleTo={0.88}
                >
                  <Icon name="minus" size={14} color={colors.textPrimary} />
                </TouchableOpacity>

                <LocalizedText style={styles.stepperValue}>₹{minOrderFree}</LocalizedText>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleAdjustMinOrder(50)}
                  scaleTo={0.88}
                >
                  <Icon name="plus" size={14} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>
      </ScrollView>

      {/* ===== STICKY BOTTOM SAVE BAR ===== */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          scaleTo={0.95}
          onPress={() => setShowSuccessDialog(true)}
          activeOpacity={0.9}
        >
          <Icon name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <LocalizedText style={styles.saveBtnText}>Save Address & Delivery Zone</LocalizedText>
        </TouchableOpacity>
      </View>

      <Dialog
        visible={showSuccessDialog}
        type="success"
        title="Delivery Settings Saved"
        message={`Store address and ${selectedRadius} km delivery zone updated successfully.`}
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
  mapCard: {
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
    overflow: 'hidden',
  },
  radarContainer: {
    height: 140,
    backgroundColor: '#EAF5ED',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  radarCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(37, 139, 62, 0.12)',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  storePin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginTop: 4,
  },
  mapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pinBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  gpsText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gpsButtonText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  radiusSelectorSection: {
    marginTop: 12,
  },
  radiusSectionTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  radiusHighlight: {
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  radiusChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  radiusChipKm: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textSecondary,
  },
  radiusChipKmActive: {
    color: '#ffffff',
  },
  activeCheck: {
    marginLeft: 4,
  },
  estimateBanner: {
    flexDirection: 'row',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  estimateCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  estimateValue: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  estimateLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
  },
  estimateDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
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
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
    marginBottom: 6,
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
  twoColRow: {
    flexDirection: 'row',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  toggleTexts: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stepperLeft: {
    flex: 1,
    marginRight: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
    paddingHorizontal: 12,
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

export default StoreAddressScreen;
