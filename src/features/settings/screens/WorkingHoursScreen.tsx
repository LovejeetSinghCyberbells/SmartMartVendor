import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
  Dialog,
  LivePulseBeacon,
} from '../../../shared/components/common';
import { colors } from '../../../shared/theme/colors';

export interface DaySchedule {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart?: string;
  breakEnd?: string;
}

const STORAGE_KEY_SCHEDULE = '@smartmart_working_hours_schedule';
const STORAGE_KEY_BUFFER = '@smartmart_working_hours_buffer';
const STORAGE_KEY_VACATION = '@smartmart_working_hours_vacation';

const INITIAL_SCHEDULE: DaySchedule[] = [
  { id: 'mon', day: 'Monday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'tue', day: 'Tuesday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'wed', day: 'Wednesday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'thu', day: 'Thursday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'fri', day: 'Friday', isOpen: true, openTime: '08:00 AM', closeTime: '10:00 PM', hasBreak: false },
  { id: 'sat', day: 'Saturday', isOpen: true, openTime: '08:00 AM', closeTime: '11:00 PM', hasBreak: false },
  { id: 'sun', day: 'Sunday', isOpen: true, openTime: '09:00 AM', closeTime: '09:30 PM', hasBreak: false },
];

const BUFFER_OPTIONS = [0, 15, 30, 45, 60];

const OPENING_PRESETS = ['06:00 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '10:00 AM'];
const CLOSING_PRESETS = ['08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'];
const BREAK_START_PRESETS = ['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM'];
const BREAK_END_PRESETS = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

const HOURS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_LIST = [0, 15, 30, 45];

// Helper: Convert time string "HH:MM AM/PM" to minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const [time, period] = parts;
  const [rawH, rawM] = time.split(':').map(Number);
  let h = rawH % 12;
  if (period.toUpperCase() === 'PM') h += 12;
  return h * 60 + (rawM || 0);
};

// Helper: Format hour, minute, period to standard "HH:MM AM/PM"
export const formatTimeString = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
  const padH = hour < 10 ? `0${hour}` : `${hour}`;
  const padM = minute < 10 ? `0${minute}` : `${minute}`;
  return `${padH}:${padM} ${period}`;
};

// Helper: Parse "08:00 AM" to { hour: 8, minute: 0, period: 'AM' }
export const parseTimeString = (timeStr: string): { hour: number; minute: number; period: 'AM' | 'PM' } => {
  if (!timeStr) return { hour: 8, minute: 0, period: 'AM' };
  const parts = timeStr.trim().split(' ');
  const period = (parts[1]?.toUpperCase() === 'PM' ? 'PM' : 'AM') as 'AM' | 'PM';
  const time = parts[0] || '08:00';
  const [h, m] = time.split(':').map(Number);
  return {
    hour: h >= 1 && h <= 12 ? h : 8,
    minute: m >= 0 && m <= 59 ? m : 0,
    period,
  };
};

// Helper: Compute dynamic duration between open and close time
export const calculateOperatingDuration = (
  openStr: string,
  closeStr: string,
  hasBreak: boolean,
  breakStart?: string,
  breakEnd?: string
): string => {
  const openMin = timeToMinutes(openStr);
  const closeMin = timeToMinutes(closeStr);
  let totalMin = closeMin - openMin;
  if (totalMin < 0) totalMin += 24 * 60; // Crosses midnight

  if (hasBreak && breakStart && breakEnd) {
    const bStartMin = timeToMinutes(breakStart);
    const bEndMin = timeToMinutes(breakEnd);
    let bTotal = bEndMin - bStartMin;
    if (bTotal > 0 && bTotal < totalMin) {
      totalMin -= bTotal;
    }
  }

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

interface EditingModalState {
  dayId: string;
  dayName: string;
  target: 'open' | 'close' | 'breakStart' | 'breakEnd';
  selectedHour: number;
  selectedMinute: number;
  selectedPeriod: 'AM' | 'PM';
  applyToAllOpenDays: boolean;
}

export const WorkingHoursScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [vacationMode, setVacationMode] = useState(false);
  const [bufferTime, setBufferTime] = useState(15);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Operating schedule updated!');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<EditingModalState | null>(null);
  const [bufferModalOpen, setBufferModalOpen] = useState(false);

  // Pulse animation for live status badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load persisted working hours on mount
  useEffect(() => {
    const loadPersistedSettings = async () => {
      try {
        const storedSchedule = await AsyncStorage.getItem(STORAGE_KEY_SCHEDULE);
        if (storedSchedule) {
          const parsed = JSON.parse(storedSchedule);
          if (Array.isArray(parsed) && parsed.length === 7) {
            setSchedule(parsed);
          }
        }
        const storedBuffer = await AsyncStorage.getItem(STORAGE_KEY_BUFFER);
        if (storedBuffer !== null) {
          setBufferTime(Number(storedBuffer));
        }
        const storedVacation = await AsyncStorage.getItem(STORAGE_KEY_VACATION);
        if (storedVacation !== null) {
          setVacationMode(storedVacation === 'true');
        }
      } catch (err) {
        // Fallback to initial values
      }
    };
    loadPersistedSettings();
  }, []);

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

  // Compute live store status based on current device time
  const liveStatus = useMemo(() => {
    if (vacationMode) {
      return {
        isOpen: false,
        tag: 'STORE IS ON VACATION PAUSE',
        pill: 'Vacation Mode',
        message: 'All incoming online & delivery orders are temporarily paused.',
      };
    }

    const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayName = DAYS_ORDER[now.getDay()];
    const today = schedule.find((s) => s.day === currentDayName);

    if (!today || !today.isOpen) {
      return {
        isOpen: false,
        tag: 'STORE IS CLOSED TODAY',
        pill: 'Today • Closed',
        message: `Store closed on ${currentDayName}. Will resume on next operating day.`,
      };
    }

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins = timeToMinutes(today.openTime);
    const closeMins = timeToMinutes(today.closeTime);

    // Check afternoon break
    if (today.hasBreak && today.breakStart && today.breakEnd) {
      const bStartMins = timeToMinutes(today.breakStart);
      const bEndMins = timeToMinutes(today.breakEnd);
      if (currentMins >= bStartMins && currentMins < bEndMins) {
        const remainingBreak = bEndMins - currentMins;
        const bh = Math.floor(remainingBreak / 60);
        const bm = remainingBreak % 60;
        const breakText = bh > 0 ? `${bh}h ${bm}m` : `${bm}m`;
        return {
          isOpen: false,
          tag: 'AFTERNOON LUNCH BREAK',
          pill: `Break until ${today.breakEnd}`,
          message: `Store operations resume in ${breakText} at ${today.breakEnd}.`,
        };
      }
    }

    if (currentMins < openMins) {
      const untilOpen = openMins - currentMins;
      const oh = Math.floor(untilOpen / 60);
      const om = untilOpen % 60;
      const openText = oh > 0 ? `${oh} hrs ${om} mins` : `${om} mins`;
      return {
        isOpen: false,
        tag: 'STORE CURRENTLY CLOSED',
        pill: `Opens at ${today.openTime}`,
        message: `Store opens today at ${today.openTime} (in ${openText}).`,
      };
    }

    const cutoffMins = closeMins - bufferTime;
    if (currentMins >= cutoffMins && currentMins < closeMins) {
      return {
        isOpen: true,
        tag: 'CLOSING SOON (BUFFER)',
        pill: `Closes at ${today.closeTime}`,
        message: `Orders stopped ${bufferTime}m early for cashier reconciliation.`,
      };
    }

    if (currentMins < closeMins) {
      const remaining = cutoffMins - currentMins;
      const rh = Math.floor(remaining / 60);
      const rm = remaining % 60;
      const remainText = rh > 0 ? `${rh} hrs ${rm} mins` : `${rm} mins`;
      return {
        isOpen: true,
        tag: 'STORE IS CURRENTLY OPEN',
        pill: `Today • ${today.openTime} - ${today.closeTime}`,
        message: `Accepting orders for the next ${remainText}.`,
      };
    }

    return {
      isOpen: false,
      tag: 'STORE CLOSED FOR THE DAY',
      pill: `Closed at ${today.closeTime}`,
      message: 'Store is closed for tonight. Re-opens tomorrow morning.',
    };
  }, [schedule, bufferTime, vacationMode]);

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
        hasBreak: monday.hasBreak,
        breakStart: monday.breakStart,
        breakEnd: monday.breakEnd,
      }))
    );
    setToastMessage('Applied Monday timings to all 7 days!');
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 2400);
  };

  // Open Time Editor Modal for a specific day and target
  const openTimePicker = useCallback(
    (dayItem: DaySchedule, target: 'open' | 'close' | 'breakStart' | 'breakEnd') => {
      let initialTimeString = dayItem.openTime;
      if (target === 'close') initialTimeString = dayItem.closeTime;
      else if (target === 'breakStart') initialTimeString = dayItem.breakStart || '02:00 PM';
      else if (target === 'breakEnd') initialTimeString = dayItem.breakEnd || '03:30 PM';

      const parsed = parseTimeString(initialTimeString);
      setEditingState({
        dayId: dayItem.id,
        dayName: dayItem.day,
        target,
        selectedHour: parsed.hour,
        selectedMinute: parsed.minute,
        selectedPeriod: parsed.period,
        applyToAllOpenDays: false,
      });
      setIsEditingModalOpen(true);
    },
    []
  );

  // Switch target within the open modal (e.g. from Opens to Closes)
  const switchTargetInModal = (newTarget: 'open' | 'close' | 'breakStart' | 'breakEnd') => {
    if (!editingState) return;
    const dayItem = schedule.find((s) => s.id === editingState.dayId);
    if (!dayItem) return;

    let timeString = dayItem.openTime;
    if (newTarget === 'close') timeString = dayItem.closeTime;
    else if (newTarget === 'breakStart') timeString = dayItem.breakStart || '02:00 PM';
    else if (newTarget === 'breakEnd') timeString = dayItem.breakEnd || '03:30 PM';

    const parsed = parseTimeString(timeString);
    setEditingState({
      ...editingState,
      target: newTarget,
      selectedHour: parsed.hour,
      selectedMinute: parsed.minute,
      selectedPeriod: parsed.period,
    });
  };

  // Select a preset time pill in modal
  const selectPresetInModal = (preset: string) => {
    const parsed = parseTimeString(preset);
    if (editingState) {
      setEditingState({
        ...editingState,
        selectedHour: parsed.hour,
        selectedMinute: parsed.minute,
        selectedPeriod: parsed.period,
      });
    }
  };

  // Save timing changes from modal
  const handleConfirmModalTime = () => {
    if (!editingState) return;
    const formatted = formatTimeString(
      editingState.selectedHour,
      editingState.selectedMinute,
      editingState.selectedPeriod
    );

    setSchedule((prev) =>
      prev.map((item) => {
        const matchesDay = item.id === editingState.dayId;
        const shouldApply = matchesDay || (editingState.applyToAllOpenDays && item.isOpen);

        if (!shouldApply) return item;

        if (editingState.target === 'open') {
          return { ...item, openTime: formatted };
        } else if (editingState.target === 'close') {
          return { ...item, closeTime: formatted };
        } else if (editingState.target === 'breakStart') {
          return { ...item, breakStart: formatted, hasBreak: true };
        } else if (editingState.target === 'breakEnd') {
          return { ...item, breakEnd: formatted, hasBreak: true };
        }
        return item;
      })
    );

    setIsEditingModalOpen(false);
    setEditingState(null);
    setToastMessage(
      editingState.applyToAllOpenDays
        ? `Updated ${editingState.target.toUpperCase()} time across all operating days!`
        : `Updated ${editingState.dayName} timings successfully!`
    );
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 2400);
  };

  // Persist all working hours to AsyncStorage
  const handleSaveWorkingHours = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
      await AsyncStorage.setItem(STORAGE_KEY_BUFFER, String(bufferTime));
      await AsyncStorage.setItem(STORAGE_KEY_VACATION, String(vacationMode));
      setShowSuccessDialog(true);
    } catch (err) {
      setShowSuccessDialog(true);
    }
  };

  // Current day schedule being edited in modal
  const activeEditingDay = useMemo(() => {
    if (!editingState) return null;
    return schedule.find((s) => s.id === editingState.dayId) || null;
  }, [editingState, schedule]);

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
                <LivePulseBeacon
                  color={liveStatus.isOpen ? colors.primary : colors.danger}
                  size={9}
                  pulseRadius={16}
                  style={{ marginRight: 6 }}
                />
                <LocalizedText
                  style={[
                    styles.liveTagText,
                    { color: liveStatus.isOpen ? colors.primaryDark : colors.danger },
                  ]}
                >
                  {liveStatus.tag}
                </LocalizedText>
              </View>

              <View
                style={[
                  styles.todayPill,
                  {
                    backgroundColor: liveStatus.isOpen ? colors.primaryLight : '#FEE2E2',
                  },
                ]}
              >
                <LocalizedText
                  style={[
                    styles.todayPillText,
                    { color: liveStatus.isOpen ? colors.primaryDark : colors.danger },
                  ]}
                >
                  {liveStatus.pill}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.timeRemainingRow}>
              <Icon
                name={liveStatus.isOpen ? 'clock' : 'alert-circle'}
                size={18}
                color={liveStatus.isOpen ? colors.primary : colors.danger}
                style={{ marginRight: 8 }}
              />
              <LocalizedText style={styles.timeRemainingText}>
                {liveStatus.message}
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
                  Set {schedule[0].openTime} – {schedule[0].closeTime} for Tue through Sun
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
              <LocalizedText style={styles.toastText}>{toastMessage}</LocalizedText>
            </View>
          )}
        </AnimatedEntranceView>

        {/* ===== DAY-BY-DAY SCHEDULE LIST ===== */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.sectionHeaderRow}>
            <LocalizedText style={styles.sectionTitle}>Weekly Operating Schedule</LocalizedText>
            <LocalizedText style={styles.sectionSubtitle}>Tap time chips to edit hours</LocalizedText>
          </View>

          {schedule.map((dayItem) => {
            const operatingDuration = calculateOperatingDuration(
              dayItem.openTime,
              dayItem.closeTime,
              dayItem.hasBreak,
              dayItem.breakStart,
              dayItem.breakEnd
            );

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
                        {dayItem.isOpen ? `Open • ${operatingDuration}` : 'Closed'}
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
                      {/* OPENS CHIP (INTERACTIVE TOUCHABLE) */}
                      <TouchableOpacity
                        style={styles.timeChip}
                        scaleTo={0.97}
                        onPress={() => openTimePicker(dayItem, 'open')}
                      >
                        <View style={styles.timeChipHeader}>
                          <LocalizedText style={styles.timeChipLabel}>Opens</LocalizedText>
                          <Icon name="edit-2" size={10} color={colors.primary} />
                        </View>
                        <View style={styles.timeValWrap}>
                          <Icon name="sun" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.timeChipValue}>{dayItem.openTime}</LocalizedText>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.timeArrow}>
                        <Icon name="arrow-right" size={14} color={colors.textMuted} />
                      </View>

                      {/* CLOSES CHIP (INTERACTIVE TOUCHABLE) */}
                      <TouchableOpacity
                        style={styles.timeChip}
                        scaleTo={0.97}
                        onPress={() => openTimePicker(dayItem, 'close')}
                      >
                        <View style={styles.timeChipHeader}>
                          <LocalizedText style={styles.timeChipLabel}>Closes</LocalizedText>
                          <Icon name="edit-2" size={10} color="#9333ea" />
                        </View>
                        <View style={styles.timeValWrap}>
                          <Icon name="moon" size={13} color="#9333ea" style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.timeChipValue}>{dayItem.closeTime}</LocalizedText>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Afternoon Break Slot */}
                    <View style={styles.breakContainer}>
                      <TouchableOpacity
                        style={[
                          styles.breakRow,
                          dayItem.hasBreak && styles.breakRowActive,
                        ]}
                        onPress={() => {
                          if (dayItem.hasBreak) {
                            openTimePicker(dayItem, 'breakStart');
                          } else {
                            toggleBreak(dayItem.id);
                          }
                        }}
                        scaleTo={0.98}
                      >
                        <Icon
                          name={dayItem.hasBreak ? 'coffee' : 'plus-circle'}
                          size={14}
                          color={dayItem.hasBreak ? colors.warning : colors.primary}
                          style={{ marginRight: 6 }}
                        />
                        <LocalizedText style={styles.breakRowText}>
                          {dayItem.hasBreak
                            ? `Break: ${dayItem.breakStart} – ${dayItem.breakEnd} (Tap to edit)`
                            : 'Add Afternoon Lunch Break'}
                        </LocalizedText>
                        {dayItem.hasBreak && (
                          <TouchableOpacity
                            onPress={() => toggleBreak(dayItem.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={{ marginLeft: 'auto', padding: 2 }}
                          >
                            <Icon name="x" size={14} color={colors.textMuted} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </View>
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

            {/* CLOSING BUFFER TIME SELECTOR */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setBufferModalOpen(true)}
              scaleTo={0.98}
            >
              <View style={styles.settingTexts}>
                <LocalizedText style={styles.settingTitle}>Closing Buffer Time</LocalizedText>
                <LocalizedText style={styles.settingSubtitle}>
                  Stop accepting delivery orders {bufferTime} mins before store close
                </LocalizedText>
              </View>
              <View style={styles.bufferPill}>
                <LocalizedText style={styles.bufferText}>{bufferTime} mins</LocalizedText>
                <Icon name="chevron-down" size={12} color={colors.primaryDark} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* VACATION / HOLIDAY PAUSE */}
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
          onPress={handleSaveWorkingHours}
          activeOpacity={0.9}
        >
          <Icon name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <LocalizedText style={styles.saveBtnText}>Save Working Hours</LocalizedText>
        </TouchableOpacity>
      </View>

      {/* ===== INTERACTIVE TIME PICKER MODAL ===== */}
      <Modal
        visible={isEditingModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <LocalizedText style={styles.modalTitle}>
                  Edit {editingState?.dayName} Operating Hours
                </LocalizedText>
                <LocalizedText style={styles.modalSubtitle}>
                  Select custom time or pick quick common presets
                </LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsEditingModalOpen(false)}
              >
                <Icon name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Target Switcher Tabs */}
            <View style={styles.modalTabRow}>
              <TouchableOpacity
                style={[
                  styles.modalTab,
                  editingState?.target === 'open' && styles.modalTabActive,
                ]}
                onPress={() => switchTargetInModal('open')}
              >
                <Icon
                  name="sun"
                  size={12}
                  color={editingState?.target === 'open' ? '#ffffff' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <LocalizedText
                  style={[
                    styles.modalTabText,
                    editingState?.target === 'open' && styles.modalTabTextActive,
                  ]}
                >
                  Opens ({activeEditingDay?.openTime})
                </LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalTab,
                  editingState?.target === 'close' && styles.modalTabActive,
                ]}
                onPress={() => switchTargetInModal('close')}
              >
                <Icon
                  name="moon"
                  size={12}
                  color={editingState?.target === 'close' ? '#ffffff' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <LocalizedText
                  style={[
                    styles.modalTabText,
                    editingState?.target === 'close' && styles.modalTabTextActive,
                  ]}
                >
                  Closes ({activeEditingDay?.closeTime})
                </LocalizedText>
              </TouchableOpacity>
            </View>

            {/* Optional Break Tabs if break is active */}
            {activeEditingDay?.hasBreak && (
              <View style={[styles.modalTabRow, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalTab,
                    editingState?.target === 'breakStart' && styles.modalTabActive,
                  ]}
                  onPress={() => switchTargetInModal('breakStart')}
                >
                  <Icon
                    name="coffee"
                    size={12}
                    color={editingState?.target === 'breakStart' ? '#ffffff' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <LocalizedText
                    style={[
                      styles.modalTabText,
                      editingState?.target === 'breakStart' && styles.modalTabTextActive,
                    ]}
                  >
                    Break Start ({activeEditingDay.breakStart})
                  </LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalTab,
                    editingState?.target === 'breakEnd' && styles.modalTabActive,
                  ]}
                  onPress={() => switchTargetInModal('breakEnd')}
                >
                  <Icon
                    name="check-circle"
                    size={12}
                    color={editingState?.target === 'breakEnd' ? '#ffffff' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <LocalizedText
                    style={[
                      styles.modalTabText,
                      editingState?.target === 'breakEnd' && styles.modalTabTextActive,
                    ]}
                  >
                    Break End ({activeEditingDay.breakEnd})
                  </LocalizedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Time Large Digital Clock Display */}
            {editingState && (
              <View style={styles.digitalClockWrap}>
                <View style={styles.digitalClockTimeBox}>
                  <LocalizedText style={styles.digitalClockText}>
                    {editingState.selectedHour < 10
                      ? `0${editingState.selectedHour}`
                      : `${editingState.selectedHour}`}
                    :
                    {editingState.selectedMinute < 10
                      ? `0${editingState.selectedMinute}`
                      : `${editingState.selectedMinute}`}
                  </LocalizedText>
                </View>

                <View style={styles.ampmToggleWrap}>
                  <TouchableOpacity
                    style={[
                      styles.ampmBtn,
                      editingState.selectedPeriod === 'AM' && styles.ampmBtnActive,
                    ]}
                    onPress={() => setEditingState({ ...editingState, selectedPeriod: 'AM' })}
                  >
                    <LocalizedText
                      style={[
                        styles.ampmBtnText,
                        editingState.selectedPeriod === 'AM' && styles.ampmBtnTextActive,
                      ]}
                    >
                      AM
                    </LocalizedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.ampmBtn,
                      editingState.selectedPeriod === 'PM' && styles.ampmBtnActive,
                    ]}
                    onPress={() => setEditingState({ ...editingState, selectedPeriod: 'PM' })}
                  >
                    <LocalizedText
                      style={[
                        styles.ampmBtnText,
                        editingState.selectedPeriod === 'PM' && styles.ampmBtnTextActive,
                      ]}
                    >
                      PM
                    </LocalizedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Presets Pills */}
            <View style={styles.presetSection}>
              <LocalizedText style={styles.pickerSectionLabel}>Quick Presets:</LocalizedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {(editingState?.target === 'open'
                  ? OPENING_PRESETS
                  : editingState?.target === 'close'
                  ? CLOSING_PRESETS
                  : editingState?.target === 'breakStart'
                  ? BREAK_START_PRESETS
                  : BREAK_END_PRESETS
                ).map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={styles.presetChip}
                    onPress={() => selectPresetInModal(preset)}
                  >
                    <LocalizedText style={styles.presetChipText}>{preset}</LocalizedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Hour Dial Selector */}
            <View style={styles.dialSection}>
              <LocalizedText style={styles.pickerSectionLabel}>Select Hour:</LocalizedText>
              <View style={styles.dialRow}>
                {HOURS_LIST.map((h) => {
                  const isSelected = editingState?.selectedHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.hourBubble, isSelected && styles.hourBubbleActive]}
                      onPress={() => editingState && setEditingState({ ...editingState, selectedHour: h })}
                    >
                      <LocalizedText
                        style={[styles.hourBubbleText, isSelected && styles.hourBubbleTextActive]}
                      >
                        {h}
                      </LocalizedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Minute Selector */}
            <View style={styles.dialSection}>
              <LocalizedText style={styles.pickerSectionLabel}>Select Minutes:</LocalizedText>
              <View style={styles.minuteRow}>
                {MINUTES_LIST.map((m) => {
                  const isSelected = editingState?.selectedMinute === m;
                  const label = m < 10 ? `:0${m}` : `:${m}`;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.minuteBubble, isSelected && styles.minuteBubbleActive]}
                      onPress={() => editingState && setEditingState({ ...editingState, selectedMinute: m })}
                    >
                      <LocalizedText
                        style={[styles.minuteBubbleText, isSelected && styles.minuteBubbleTextActive]}
                      >
                        {label}
                      </LocalizedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Apply to All Open Days Option */}
            <View style={styles.applyAllOptionRow}>
              <View style={styles.applyAllTexts}>
                <LocalizedText style={styles.applyAllTitle}>Apply to All Open Days</LocalizedText>
                <LocalizedText style={styles.applyAllSubtitle}>
                  Update this {editingState?.target} time for the whole operating week
                </LocalizedText>
              </View>
              <Switch
                value={editingState?.applyToAllOpenDays || false}
                onValueChange={(val) => {
                  if (editingState) {
                    setEditingState({ ...editingState, applyToAllOpenDays: val });
                  }
                }}
                trackColor={{ false: '#e5e7eb', true: colors.primaryMuted }}
                thumbColor={editingState?.applyToAllOpenDays ? colors.primary : '#f3f4f6'}
              />
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditingModalOpen(false)}
              >
                <LocalizedText style={styles.modalCancelBtnText}>Cancel</LocalizedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmModalTime}
              >
                <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.modalConfirmBtnText}>Apply Timing</LocalizedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== BUFFER TIME SELECTION MODAL ===== */}
      <Modal
        visible={bufferModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBufferModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 360 }]}>
            <View style={styles.modalHeader}>
              <LocalizedText style={styles.modalTitle}>Order Closing Buffer</LocalizedText>
              <TouchableOpacity onPress={() => setBufferModalOpen(false)}>
                <Icon name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <LocalizedText style={[styles.modalSubtitle, { marginBottom: 16 }]}>
              Choose how many minutes before store close the system stops accepting delivery orders to give cashiers time to pack and close registers.
            </LocalizedText>

            {BUFFER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.bufferOptionRow,
                  bufferTime === opt && styles.bufferOptionRowActive,
                ]}
                onPress={() => {
                  setBufferTime(opt);
                  setBufferModalOpen(false);
                }}
              >
                <LocalizedText
                  style={[
                    styles.bufferOptionText,
                    bufferTime === opt && styles.bufferOptionTextActive,
                  ]}
                >
                  {opt === 0 ? 'No Buffer (Stop at closing)' : `${opt} Minutes Before Close`}
                </LocalizedText>
                {bufferTime === opt && (
                  <Icon name="check" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== SUCCESS SAVE DIALOG ===== */}
      <Dialog
        visible={showSuccessDialog}
        type="success"
        title="Operating Hours Saved"
        message="Store timings and automatic order dispatch schedules have been updated in local storage and synced with store POS."
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
  },
  liveDotCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  liveTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.4,
  },
  todayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
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
  timeChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  timeChipLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
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
  breakContainer: {
    marginTop: 8,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#edf0ed',
  },
  breakRowActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  breakRowText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
    flexShrink: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  modalTabActive: {
    backgroundColor: colors.primary,
  },
  modalTabText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  modalTabTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  digitalClockWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9F3',
    borderRadius: 16,
    paddingVertical: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#D2EBD9',
  },
  digitalClockTimeBox: {
    marginRight: 16,
  },
  digitalClockText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
    letterSpacing: 2,
  },
  ampmToggleWrap: {
    flexDirection: 'column',
    gap: 4,
  },
  ampmBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  ampmBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ampmBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textSecondary,
  },
  ampmBtnTextActive: {
    color: '#ffffff',
  },
  presetSection: {
    marginVertical: 8,
  },
  presetsScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  presetChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  presetChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  dialSection: {
    marginTop: 8,
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textMuted,
    marginBottom: 6,
  },
  dialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hourBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourBubbleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hourBubbleText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  hourBubbleTextActive: {
    color: '#ffffff',
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minuteBubble: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minuteBubbleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  minuteBubbleText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  minuteBubbleTextActive: {
    color: '#ffffff',
  },
  applyAllOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  applyAllTexts: {
    flex: 1,
    marginRight: 10,
  },
  applyAllTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  applyAllSubtitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Buffer Modal Styles
  bufferOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#f9fafb',
  },
  bufferOptionRowActive: {
    backgroundColor: colors.primaryLight,
  },
  bufferOptionText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  bufferOptionTextActive: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
});

export default WorkingHoursScreen;
