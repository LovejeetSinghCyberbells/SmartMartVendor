import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, Badge } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { useFloorPager } from '../context/FloorPagerContext';
import { useStaffRole } from '../context/StaffRoleContext';
import { colors } from '../../../shared/theme/colors';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

const EmployeeAppPreferencesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();
  const { ringEmployeePhone } = useFloorPager();
  const { currentEmployee } = useStaffRole();

  // Preferences state
  const [scanHaptics, setScanHaptics] = useState(true);
  const [scanBeep, setScanBeep] = useState(true);
  const [continuousScan, setContinuousScan] = useState(true);
  const [autoTorch, setAutoTorch] = useState(false);
  const [screenAwake, setScreenAwake] = useState(true);
  const [urgentPagerBuzzer, setUrgentPagerBuzzer] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleTestBuzzer = () => {
    ringEmployeePhone(currentEmployee.id, 'Manager Cabin #1', 'Testing 20-second Floor Pager Buzzer');
    showToast('Testing floor buzzer ringer on your device!', 'info');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="App & Scanner Settings"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= BARCODE SCANNER PREFERENCES ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#ede9fe' }]}>
                <Icon name="maximize" size={17} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.cardTitle}>
                  Barcode Scanner Hardware
                </LocalizedText>
                <LocalizedText style={styles.cardSub}>
                  Camera feedback &amp; high-speed scanner mode
                </LocalizedText>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>Haptic Vibration on Scan</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Vibrates when valid barcode is detected
                </LocalizedText>
              </View>
              <Switch
                value={scanHaptics}
                onValueChange={setScanHaptics}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={scanHaptics ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>Audio Beep Chime</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Plays confirmation chime on price tag lookup
                </LocalizedText>
              </View>
              <Switch
                value={scanBeep}
                onValueChange={setScanBeep}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={scanBeep ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>Rapid Multi-Scan Mode</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Automatically scans next SKU without closing viewfinder
                </LocalizedText>
              </View>
              <Switch
                value={continuousScan}
                onValueChange={setContinuousScan}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={continuousScan ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>Auto-Torch in Dark Aisles</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Turns on camera flash when low lighting is detected
                </LocalizedText>
              </View>
              <Switch
                value={autoTorch}
                onValueChange={setAutoTorch}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={autoTorch ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= FLOOR PAGER & CABIN RINGER ================= */}
        <AnimatedEntranceView delay={90} direction="up" distance={14}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#fee2e2' }]}>
                <Icon name="bell" size={17} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.cardTitle}>
                  Floor Pager &amp; Cabin Alerts
                </LocalizedText>
                <LocalizedText style={styles.cardSub}>
                  Manager urgent summon notification &amp; buzzer
                </LocalizedText>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>20-Second Urgent Buzzer</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Plays long ringing vibration pattern when summoned
                </LocalizedText>
              </View>
              <Switch
                value={urgentPagerBuzzer}
                onValueChange={setUrgentPagerBuzzer}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={urgentPagerBuzzer ? colors.primary : '#9ca3af'}
              />
            </View>

            {/* Test Buzzer Button */}
            <TouchableOpacity
              style={styles.testBuzzerBtn}
              scaleTo={0.96}
              onPress={handleTestBuzzer}
            >
              <Icon name="volume-2" size={16} color="#dc2626" style={{ marginRight: 6 }} />
              <LocalizedText style={styles.testBuzzerBtnText}>
                Test Incoming Ring &amp; Vibration Buzzer
              </LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* ================= SHIFT DISPLAY & KEEP AWAKE ================= */}
        <AnimatedEntranceView delay={140} direction="up" distance={14}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#EAF5ED' }]}>
                <Icon name="smartphone" size={17} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.cardTitle}>Device &amp; Shift Screen</LocalizedText>
                <LocalizedText style={styles.cardSub}>
                  Screen timeout and energy management
                </LocalizedText>
              </View>
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.toggleInfo}>
                <LocalizedText style={styles.toggleTitle}>Keep Screen Awake on Duty</LocalizedText>
                <LocalizedText style={styles.toggleSub}>
                  Prevents screen locking during picking &amp; billing
                </LocalizedText>
              </View>
              <Switch
                value={screenAwake}
                onValueChange={setScreenAwake}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={screenAwake ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= STORE LANGUAGE ================= */}
        <AnimatedEntranceView delay={180} direction="up" distance={14}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#eff6ff' }]}>
                <Icon name="globe" size={17} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.cardTitle}>In-Store Interface Language</LocalizedText>
                <LocalizedText style={styles.cardSub}>
                  Choose your preferred regional staff language
                </LocalizedText>
              </View>
            </View>

            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langCard, isSelected && styles.langCardActive]}
                    scaleTo={0.94}
                    onPress={() => {
                      setSelectedLanguage(lang.code);
                      showToast(`Language switched to ${lang.name}`, 'info');
                    }}
                  >
                    <LocalizedText
                      style={[styles.langNative, isSelected && styles.langNativeActive]}
                    >
                      {lang.native}
                    </LocalizedText>
                    <LocalizedText
                      style={[styles.langName, isSelected && styles.langNameActive]}
                    >
                      {lang.name}
                    </LocalizedText>
                  </TouchableOpacity>
                );
              })}
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  cardSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  toggleSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  testBuzzerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 11,
    marginTop: 12,
  },
  testBuzzerBtnText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },

  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  langCardActive: {
    backgroundColor: '#EAF5ED',
    borderColor: '#258B3E',
  },
  langNative: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  langNativeActive: {
    color: '#258B3E',
  },
  langName: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  langNameActive: {
    color: '#258B3E',
  },
});

export default EmployeeAppPreferencesScreen;

