import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
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

const RINGTONES = [
  { id: 'smart_siren', name: 'SmartMart Urgent Siren', tag: 'Recommended' },
  { id: 'chime', name: 'High-Pitch Electronic Chime', tag: 'Crisp' },
  { id: 'bell', name: 'Traditional Kirana Counter Bell', tag: 'Classic' },
  { id: 'vibrant', name: 'Upbeat Multi-Tone', tag: 'Gentle' },
];

export const NotificationPreferencesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  // Notification state
  const [selectedTone, setSelectedTone] = useState('smart_siren');
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [repeatUntilAccepted, setRepeatUntilAccepted] = useState(true);
  const [loudOverride, setLoudOverride] = useState(true);
  const [vibrationUrgent, setVibrationUrgent] = useState(true);

  // Channels
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsFallback, setSmsFallback] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);

  // Categories
  const [newOrderAlert, setNewOrderAlert] = useState(true);
  const [cancelAlert, setCancelAlert] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [payoutAlert, setPayoutAlert] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Audio wave animations
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.7)).current;
  const wave3 = useRef(new Animated.Value(0.5)).current;
  const wave4 = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isPlayingTest) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(wave1, { toValue: 0.2, duration: 250, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(wave2, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            Animated.timing(wave2, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(wave3, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(wave3, { toValue: 0.4, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(wave4, { toValue: 0.2, duration: 220, useNativeDriver: true }),
            Animated.timing(wave4, { toValue: 0.9, duration: 220, useNativeDriver: true }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      wave1.setValue(0.3);
      wave2.setValue(0.7);
      wave3.setValue(0.5);
      wave4.setValue(0.9);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isPlayingTest, wave1, wave2, wave3, wave4]);

  const toggleTestSound = () => {
    if (isPlayingTest) {
      setIsPlayingTest(false);
    } else {
      setIsPlayingTest(true);
      setTimeout(() => {
        setIsPlayingTest(false);
      }, 4000);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Notification Settings"
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
        {/* ===== AUDIO TESTER HERO CARD ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.heroAudioCard}>
            <View style={styles.heroAudioTop}>
              <View style={styles.heroLeft}>
                <View style={styles.soundIconWrap}>
                  <Icon
                    name={isPlayingTest ? 'volume-2' : 'volume-1'}
                    size={20}
                    color="#ffffff"
                  />
                </View>
                <View>
                  <LocalizedText style={styles.audioTitle}>Incoming Order Siren</LocalizedText>
                  <LocalizedText style={styles.audioSub}>
                    {isPlayingTest ? 'Playing test audio sample...' : 'Loud repeating audio alert'}
                  </LocalizedText>
                </View>
              </View>

              {/* Animated Equalizer Waves */}
              <View style={styles.equalizerRow}>
                {[wave1, wave2, wave3, wave4].map((w, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.eqBar,
                      {
                        transform: [{ scaleY: isPlayingTest ? w : 0.4 }],
                        backgroundColor: isPlayingTest ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.testSoundBtn,
                isPlayingTest && styles.testSoundBtnPlaying,
              ]}
              onPress={toggleTestSound}
              scaleTo={0.94}
            >
              <Icon
                name={isPlayingTest ? 'square' : 'play'}
                size={14}
                color={isPlayingTest ? colors.primaryDark : '#ffffff'}
                style={{ marginRight: 6 }}
              />
              <LocalizedText
                style={[
                  styles.testSoundBtnText,
                  isPlayingTest && styles.testSoundBtnTextPlaying,
                ]}
              >
                {isPlayingTest ? 'Stop Sound Test' : 'Play Siren Test (4s)'}
              </LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* ===== RINGTONE TONE SELECTOR ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="music" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Order Alert Tone</LocalizedText>
            </View>

            {RINGTONES.map((tone, idx) => {
              const active = selectedTone === tone.id;
              return (
                <TouchableOpacity
                  key={tone.id}
                  style={[
                    styles.toneRow,
                    active && styles.toneRowActive,
                    idx === RINGTONES.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => setSelectedTone(tone.id)}
                  scaleTo={0.97}
                >
                  <View style={styles.toneLeft}>
                    <View
                      style={[
                        styles.radioCircle,
                        active && styles.radioCircleActive,
                      ]}
                    >
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <View>
                      <LocalizedText style={[styles.toneName, active && styles.toneNameActive]}>
                        {tone.name}
                      </LocalizedText>
                      <LocalizedText style={styles.toneTag}>{tone.tag}</LocalizedText>
                    </View>
                  </View>

                  <Icon
                    name={active ? 'volume-2' : 'volume'}
                    size={16}
                    color={active ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedEntranceView>

        {/* ===== URGENT ALERT BEHAVIOR ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="bell" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Order Urgency Controls</LocalizedText>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Repeat Every 15 Seconds</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>
                  Keep ringing until an employee accepts or dismisses order
                </LocalizedText>
              </View>
              <Switch
                value={repeatUntilAccepted}
                onValueChange={setRepeatUntilAccepted}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={repeatUntilAccepted ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Override Silent / Vibrate Mode</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>
                  Ring at maximum volume for incoming new orders
                </LocalizedText>
              </View>
              <Switch
                value={loudOverride}
                onValueChange={setLoudOverride}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={loudOverride ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Continuous Haptic Vibration</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>
                  Distinct pulsating vibration pattern for handheld devices
                </LocalizedText>
              </View>
              <Switch
                value={vibrationUrgent}
                onValueChange={setVibrationUrgent}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={vibrationUrgent ? colors.primary : '#f3f4f6'}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== NOTIFICATION CHANNELS ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="send" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Delivery Channels</LocalizedText>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.channelLeft}>
                <View style={styles.channelIcon}>
                  <Icon name="smartphone" size={16} color={colors.primary} />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>Device Push Notifications</LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    Heads-up banners with customer address preview
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={pushEnabled ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.channelLeft}>
                <View style={styles.channelIcon}>
                  <Icon name="message-square" size={16} color={colors.primary} />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>SMS Backup Alerts</LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    Send SMS when vendor device is offline for 2+ mins
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={smsFallback}
                onValueChange={setSmsFallback}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={smsFallback ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.channelLeft}>
                <View style={styles.channelIcon}>
                  <Icon name="share-2" size={16} color="#059669" />
                </View>
                <View style={styles.toggleTexts}>
                  <LocalizedText style={styles.toggleTitle}>WhatsApp Daily Summary</LocalizedText>
                  <LocalizedText style={styles.toggleSubtitle}>
                    EOD sales &amp; settlement report on WhatsApp
                  </LocalizedText>
                </View>
              </View>
              <Switch
                value={whatsappAlerts}
                onValueChange={setWhatsappAlerts}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={whatsappAlerts ? colors.primary : '#f3f4f6'}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== CATEGORIES & QUIET HOURS ===== */}
        <AnimatedEntranceView delay={280} direction="up" distance={16}>
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="layers" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Alert Categories</LocalizedText>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>New Order Placement</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>Instant sound &amp; banner for new orders</LocalizedText>
              </View>
              <Switch
                value={newOrderAlert}
                onValueChange={setNewOrderAlert}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={newOrderAlert ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Order Cancellation Alerts</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>Immediate notice when customer cancels</LocalizedText>
              </View>
              <Switch
                value={cancelAlert}
                onValueChange={setCancelAlert}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={cancelAlert ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Low Stock &amp; Inventory Alerts</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>Notifies when products drop below threshold</LocalizedText>
              </View>
              <Switch
                value={lowStockAlert}
                onValueChange={setLowStockAlert}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={lowStockAlert ? colors.primary : '#f3f4f6'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <LocalizedText style={styles.toggleTitle}>Settlement &amp; Bank Credit</LocalizedText>
                <LocalizedText style={styles.toggleSubtitle}>Direct notification when daily payout is credited</LocalizedText>
              </View>
              <Switch
                value={payoutAlert}
                onValueChange={setPayoutAlert}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={payoutAlert ? colors.primary : '#f3f4f6'}
              />
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
          <LocalizedText style={styles.saveBtnText}>Save Notification Preferences</LocalizedText>
        </TouchableOpacity>
      </View>

      <Dialog
        visible={showSuccessDialog}
        type="success"
        title="Preferences Saved"
        message="Loud order siren tones, vibration patterns, and alert channels have been updated."
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
  heroAudioCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroAudioTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  audioSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    paddingHorizontal: 6,
  },
  eqBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  testSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  testSoundBtnPlaying: {
    backgroundColor: '#ffffff',
  },
  testSoundBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  testSoundBtnTextPlaying: {
    color: colors.primaryDark,
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
  toneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toneRowActive: {
    backgroundColor: '#fafcfb',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  toneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  toneName: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  toneNameActive: {
    color: colors.primaryDark,
    fontFamily: 'Poppins-SemiBold',
  },
  toneTag: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTexts: {
    flex: 1,
    marginRight: 12,
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
    marginVertical: 10,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  channelIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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

export default NotificationPreferencesScreen;
