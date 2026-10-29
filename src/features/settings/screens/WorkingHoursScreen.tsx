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

interface DaySchedule {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart?: string;
  breakEnd?: string;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { id: 'mon', day: 'Monday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'tue', day: 'Tuesday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'wed', day: 'Wednesday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'thu', day: 'Thursday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'fri', day: 'Friday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'sat', day: 'Saturday', isOpen: true, openTime: '08:00 AM', closeTime: '11:00 PM', hasBreak: false },
  { id: 'sun', day: 'Sunday', isOpen: true, openTime: '09:00 AM', closeTime: '09:30 PM', hasBreak: false },
];

export const WorkingHoursScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [vacationMode, setVacationMode] = useState(false);
  const [bufferTime, setBufferTime] = useState(15);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  // Pulse animation for live status badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [pulseAnim]);

  const toggleDayOpen = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const toggleBreak = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              hasBreak: !item.hasBreak,
              breakStart: item.hasBreak ? undefined : '02:00 PM',
              breakEnd: item.hasBreak ? undefined : '03:30 PM',
            }
          : item
      )
    );
  };

  const applyMondayToAll = () => {
    const monday = schedule[0];
    setSchedule((prev) =>
      prev.map((item) => ({
        ...item,
        isOpen: monday.isOpen,
        openTime: monday.openTime,
        closeTime: monday.closeTime,
      }))
    );
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 2400);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Working Hours"
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
        {/* ===== LIVE STORE STATUS HERO BANNER ===== */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.liveHeroCard}>
            <View style={styles.liveHeroTop}>
              <View style={styles.liveIndicatorRow}>
                <Animated.View
                  style={[
                    styles.liveDotRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.liveDotCore} />
                <LocalizedText style={styles.liveTagText}>STORE IS CURRENTLY OPEN</LocalizedText>
              </View>

              <View style={styles.todayPill}>
                <LocalizedText style={styles.todayPillText}>Today • 8 AM - 10 PM</LocalizedText>
              </View>
            </View>

            <View style={styles.timeRemainingRow}>
              <Icon name="clock" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <LocalizedText style={styles.timeRemainingText}>
                Accepting orders for the next <LocalizedText style={styles.boldTime}>4 hrs 45 mins</LocalizedText>
              </LocalizedText>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ===== QUICK ACTIONS & AUTOMATION ===== */}
        <AnimatedEntranceView delay={100} direction="up" distance={16}>
          <View style={styles.quickCard}>
            <View style={styles.quickLeft}>
              <View style={styles.quickIconWrap}>
                <Icon name="copy" size={16} color={colors.primary} />
              </View>
              <View style={styles.quickTextWrap}>
                <LocalizedText style={styles.quickTitle}>Apply Monday to All Days</LocalizedText>
                <LocalizedText style={styles.quickSubtitle}>
                  Set 08:00 AM - 10:00 PM for Tue through Sun
                </LocalizedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={applyMondayToAll}
              scaleTo={0.92}
            >
              <LocalizedText style={styles.applyBtnText}>Apply All</LocalizedText>
            </TouchableOpacity>
          </View>

          {showAppliedToast && (
            <View style={styles.toastBanner}>
              <Icon name="check-circle" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <LocalizedText style={styles.toastText}>Applied Monday schedule to all 7 days!</LocalizedText>
            </View>
          )}
        </AnimatedEntranceView>

        {/* ===== DAY-BY-DAY SCHEDULE LIST ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.sectionHeaderRow}>
            <LocalizedText style={styles.sectionTitle}>Weekly Operating Schedule</LocalizedText>
            <LocalizedText style={styles.sectionSubtitle}>7 days configured</LocalizedText>
          </View>

          {schedule.map((dayItem, index) => {
            return (
              <View key={dayItem.id} style={styles.dayCard}>
                <View style={styles.dayTopRow}>
                  <View style={styles.dayNameGroup}>
                    <LocalizedText style={styles.dayName}>{dayItem.day}</LocalizedText>
                    <View
                      style={[
                        styles.dayStatusPill,
                        {
                          backgroundColor: dayItem.isOpen
                            ? colors.primaryLight
                            : '#f3f4f6',
                        },
                      ]}
                    >
                      <LocalizedText
                        style={[
                          styles.dayStatusPillText,
                          {
                            color: dayItem.isOpen
                              ? colors.primaryDark
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {dayItem.isOpen ? 'Open • 14h' : 'Closed'}
                      </LocalizedText>
                    </View>
                  </View>

                  <Switch
                    value={dayItem.isOpen}
                    onValueChange={() => toggleDayOpen(dayItem.id)}
                    trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                    thumbColor={dayItem.isOpen ? colors.primary : '#f3f4f6'}
                  />
                </View>

                {dayItem.isOpen && (
                  <View style={styles.timeSlotWrapper}>
                    <View style={styles.timeChipsRow}>
                      <View style={styles.timeChip}>
                        <LocalizedText style={styles.timeChipLabel}>Opens</LocalizedText>
                        <View style={styles.timeValWrap}>
                          <Icon name="sun" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.timeChipValue}>{dayItem.openTime}</LocalizedText>
                        </View>
                      </View>

                      <View style={styles.timeArrow}>
                        <Icon name="arrow-right" size={14} color={colors.textMuted} />
                      </View>

                      <View style={styles.timeChip}>
                        <LocalizedText style={styles.timeChipLabel}>Closes</LocalizedText>
                        <View style={styles.timeValWrap}>
                          <Icon name="moon" size={13} color="#9333ea" style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.timeChipValue}>{dayItem.closeTime}</LocalizedText>
                        </View>
                      </View>
                    </View>

                    {/* Afternoon Break Slot */}
                    <TouchableOpacity
                      style={styles.breakRow}
                      onPress={() => toggleBreak(dayItem.id)}
                      scaleTo={0.96}
                    >
                      <Icon
                        name={dayItem.hasBreak ? 'coffee' : 'plus-circle'}
                        size={14}
                        color={dayItem.hasBreak ? colors.warning : colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <LocalizedText style={styles.breakRowText}>
                        {dayItem.hasBreak
                          ? `Break: ${dayItem.breakStart} – ${dayItem.breakEnd}`
                          : 'Add Afternoon Lunch Break'}
                      </LocalizedText>
                      {dayItem.hasBreak && (
                        <Icon name="x" size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </AnimatedEntranceView>

        {/* ===== ADVANCED TIMING SETTINGS ===== */}
        <AnimatedEntranceView delay={220} direction="up" distance={16}>
          <View style={styles.advancedCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Icon name="sliders" size={16} color={colors.primary} />
              </View>
              <LocalizedText style={styles.cardSectionTitle}>Order Acceptance Settings</LocalizedText>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTexts}>
                <LocalizedText style={styles.settingTitle}>Closing Buffer Time</LocalizedText>
                <LocalizedText style={styles.settingSubtitle}>
                  Stop accepting delivery orders {bufferTime} mins before store close
                </LocalizedText>
              </View>
              <View style={styles.bufferPill}>
                <LocalizedText style={styles.bufferText}>{bufferTime} mins</LocalizedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTexts}>
                <LocalizedText style={styles.settingTitle}>Vacation / Holiday Pause</LocalizedText>
                <LocalizedText style={styles.settingSubtitle}>
                  Temporarily pause all store operations for holidays
                </LocalizedText>
              </View>
              <Switch
                value={vacationMode}
                onValueChange={setVacationMode}
                trackColor={{ false: '#e5e7eb', true: colors.dangerLight }}
                thumbColor={vacationMode ? colors.danger : '#f3f4f6'}
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
          <LocalizedText style={styles.saveBtnText}>Save Working Hours</LocalizedText>
        </TouchableOpacity>
      </View>

      <Dialog
        visible={showSuccessDialog}
        type="success"
        title="Operating Hours Saved"
        message="Store timings and automatic order dispatch schedules have been updated."
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
  liveHeroCard: {
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
  liveHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  liveDotRing: {
    position: 'absolute',
    left: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(37, 139, 62, 0.3)',
  },
  liveDotCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  liveTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
    letterSpacing: 0.4,
  },
  todayPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  timeRemainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#edf2ee',
  },
  timeRemainingText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  boldTime: {
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
  },
  quickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickTextWrap: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  quickSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  applyBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  toastText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8edea',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
    marginRight: 10,
  },
  dayStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayStatusPillText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  timeSlotWrapper: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  timeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeChip: {
    flex: 1,
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeChipLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginBottom: 2,
  },
  timeValWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeChipValue: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  timeArrow: {
    paddingHorizontal: 10,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#edf0ed',
  },
  breakRowText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  advancedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingTexts: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  bufferPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bufferText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
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

export default WorkingHoursScreen;
