import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import {
  ScreenHeader,
  AnimatedEntranceView,
  Badge,
  Chip,
  CalendarPicker,
  formatReadableDate,
  Divider,
} from '../../../shared/components/common';
import {
  useStaffRole,
  LeaveRequest,
  isLeaveReasonRequired,
} from '../context/StaffRoleContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

const DAYS_OF_WEEK = [
  { day: 'Mon', date: '21', status: 'present', hours: '8.2h' },
  { day: 'Tue', date: '22', status: 'present', hours: '8.0h' },
  { day: 'Wed', date: '23', status: 'present', hours: '8.5h' },
  { day: 'Thu', date: '24', status: 'present', hours: '8.1h' },
  { day: 'Fri', date: '25', status: 'present', hours: '7.8h' },
  { day: 'Sat', date: '26', status: 'present', hours: '9.0h' },
  { day: 'Sun', date: '27', status: 'today', hours: '5.4h' },
];

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Shift Swap', 'Emergency'];

const REJECT_PRESET_REASONS = [
  'Store peak hours staffing required.',
  'Overlap with existing on-leave staff.',
  'Critical fulfillment shift duties.',
  'Advance notice required for planned leave.',
  'Inventory stock audit scheduled.',
];

const EmployeeShiftAttendanceScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    currentEmployee,
    leaveRequests,
    applyLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useStaffRole();
  const { showToast } = useFeedback();

  const isManager =
    currentEmployee.role === 'MANAGER' || Boolean(currentEmployee.permissions?.staff?.manage);
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [secondsOnDuty, setSecondsOnDuty] = useState(19450); // ~5h 24m
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('Casual Leave');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState('1');
  const [leaveStartDate, setLeaveStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [showCalendar, setShowCalendar] = useState(false);

  // Rejection sheet state for Manager review
  const [rejectingItem, setRejectingItem] = useState<LeaveRequest | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  const myLeaves = useMemo(
    () => leaveRequests.filter((r) => r.employeeId === currentEmployee.id),
    [leaveRequests, currentEmployee.id]
  );

  const displayedRecords = useMemo(() => {
    if (isManager && viewScope === 'all') {
      return leaveRequests;
    }
    return myLeaves;
  }, [isManager, viewScope, leaveRequests, myLeaves]);

  const leaveEndDate = useMemo(() => {
    const numDays = parseInt(leaveDays, 10) || 1;
    const end = new Date(leaveStartDate);
    end.setDate(end.getDate() + numDays - 1);
    return end;
  }, [leaveStartDate, leaveDays]);

  // Pulse animation for live duty indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isOnDuty) {
      interval = setInterval(() => {
        setSecondsOnDuty((prev) => prev + 1);
      }, 1000);

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
      return () => {
        if (interval) clearInterval(interval);
        pulseLoop.stop();
      };
    }
  }, [isOnDuty]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins
      .toString()
      .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleToggleDuty = () => {
    if (isOnDuty) {
      setIsOnDuty(false);
      showToast('Shift punched out successfully. Good job today!', 'info');
    } else {
      setIsOnDuty(true);
      showToast('Shift punched in! Ready for store fulfillment.', 'success');
    }
  };

  const isReasonMandatory = isLeaveReasonRequired(selectedLeaveType);

  const handleApplyLeave = () => {
    if (isReasonMandatory && !leaveReason.trim()) {
      showToast(`Please state a reason for your ${selectedLeaveType} request.`, 'info');
      return;
    }
    const numDays = parseInt(leaveDays, 10) || 1;
    const startStr = formatReadableDate(leaveStartDate);
    const endStr = formatReadableDate(leaveEndDate);

    applyLeaveRequest({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: currentEmployee.roleTitle,
      type: selectedLeaveType,
      startDate: startStr,
      endDate: endStr,
      days: numDays,
      reason:
        leaveReason.trim() ||
        (selectedLeaveType.toLowerCase().includes('sick')
          ? 'Medical rest / Sick leave'
          : 'Emergency leave'),
    });

    setShowLeaveModal(false);
    setLeaveReason('');
    setShowCalendar(false);

    showToast(
      `Leave request submitted for ${startStr}${numDays > 1 ? ` to ${endStr}` : ''} (${numDays} day${numDays > 1 ? 's' : ''}). Awaiting Manager approval.`,
      'success'
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Shift & Attendance"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= LIVE SHIFT HERO CARD ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.dutyBadgeWrap}>
                <Animated.View
                  style={[
                    styles.dutyPulseDot,
                    {
                      backgroundColor: isOnDuty ? '#22c55e' : '#9ca3af',
                      transform: isOnDuty ? [{ scale: pulseAnim }] : [],
                    },
                  ]}
                />
                <LocalizedText
                  style={[
                    styles.dutyStatusText,
                    { color: isOnDuty ? '#15803d' : '#6b7280' },
                  ]}
                >
                  {isOnDuty ? 'ACTIVE ON DUTY' : 'SHIFT OFF DUTY'}
                </LocalizedText>
              </View>

              <Badge
                label={currentEmployee.shift}
                backgroundColor="#EAF5ED"
                textColor="#258B3E"
                size="sm"
              />
            </View>

            <View style={styles.timerCenter}>
              <LocalizedText style={styles.timerSubtitle}>Elapsed Shift Time</LocalizedText>
              <LocalizedText style={styles.timerDisplay}>
                {formatTimer(secondsOnDuty)}
              </LocalizedText>
              <LocalizedText style={styles.shiftTimeRange}>
                Scheduled: 08:00 AM – 04:00 PM • Morning Store Shift
              </LocalizedText>
            </View>

            {/* Punch In / Out Button */}
            <TouchableOpacity
              style={[
                styles.punchBtn,
                { backgroundColor: isOnDuty ? '#fef2f2' : '#258B3E', borderColor: isOnDuty ? '#fecaca' : '#258B3E' },
              ]}
              scaleTo={0.96}
              onPress={handleToggleDuty}
            >
              <Icon
                name={isOnDuty ? 'log-out' : 'check-circle'}
                size={18}
                color={isOnDuty ? '#dc2626' : '#ffffff'}
                style={{ marginRight: 8 }}
              />
              <LocalizedText
                style={[
                  styles.punchBtnText,
                  { color: isOnDuty ? '#dc2626' : '#ffffff' },
                ]}
              >
                {isOnDuty ? 'Punch Out & End Shift' : 'Punch In & Begin Shift'}
              </LocalizedText>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* ================= MONTHLY ATTENDANCE STATS ================= */}
        <AnimatedEntranceView delay={90} direction="up" distance={14}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeaderRow}>
              <View>
                <LocalizedText style={styles.statsTitle}>October 2026 Attendance</LocalizedText>
                <LocalizedText style={styles.statsSub}>Store Staff Punctuality &amp; Hours</LocalizedText>
              </View>
              <View style={styles.scorePill}>
                <Icon name="award" size={13} color="#258B3E" style={{ marginRight: 4 }} />
                <LocalizedText style={styles.scoreText}>98.5% Score</LocalizedText>
              </View>
            </View>

            <View style={styles.statGrid}>
              <View style={[styles.statBox, { backgroundColor: '#f0fdf4' }]}>
                <LocalizedText style={[styles.statNum, { color: '#16a34a' }]}>26</LocalizedText>
                <LocalizedText style={styles.statLabel}>Days Present</LocalizedText>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
                <LocalizedText style={[styles.statNum, { color: '#2563eb' }]}>208h</LocalizedText>
                <LocalizedText style={styles.statLabel}>Hours Worked</LocalizedText>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fef3c7' }]}>
                <LocalizedText style={[styles.statNum, { color: '#d97706' }]}>1</LocalizedText>
                <LocalizedText style={styles.statLabel}>Planned Leave</LocalizedText>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#ede9fe' }]}>
                <LocalizedText style={[styles.statNum, { color: '#7c3aed' }]}>₹450</LocalizedText>
                <LocalizedText style={styles.statLabel}>OT Bonus</LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= WEEKLY TIMELINE STRIP ================= */}
        <AnimatedEntranceView delay={140} direction="up" distance={14}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <LocalizedText style={styles.calendarTitle}>Current Week Timeline</LocalizedText>
              <LocalizedText style={styles.calendarWeek}>Week 43 • Mon - Sun</LocalizedText>
            </View>

            <View style={styles.weekStrip}>
              {DAYS_OF_WEEK.map((item, idx) => {
                const isToday = item.status === 'today';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.dayCol,
                      isToday && styles.dayColToday,
                    ]}
                  >
                    <LocalizedText
                      style={[styles.dayText, isToday && styles.dayTextToday]}
                    >
                      {item.day}
                    </LocalizedText>
                    <View
                      style={[
                        styles.dateCircle,
                        isToday && styles.dateCircleToday,
                      ]}
                    >
                      <LocalizedText
                        style={[styles.dateText, isToday && styles.dateTextToday]}
                      >
                        {item.date}
                      </LocalizedText>
                    </View>
                    <View style={styles.statusIndicator}>
                      <Icon
                        name={isToday ? 'clock' : 'check'}
                        size={12}
                        color={isToday ? '#258B3E' : '#16a34a'}
                      />
                    </View>
                    <LocalizedText style={styles.hourText}>{item.hours}</LocalizedText>
                  </View>
                );
              })}
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= SCHEDULED BREAKS & OVERTIME ================= */}
        <AnimatedEntranceView delay={180} direction="up" distance={14}>
          <View style={styles.scheduleCard}>
            <LocalizedText style={styles.scheduleTitle}>Shift Schedule &amp; Breaks</LocalizedText>

            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#EAF5ED' }]}>
                <Icon name="sun" size={16} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.scheduleItemName}>Floor Zone Allocation</LocalizedText>
                <LocalizedText style={styles.scheduleItemTime}>
                  Aisle 1 &amp; 2 (Fresh Groceries &amp; Dairy Cooler)
                </LocalizedText>
              </View>
              <Badge label="Assigned" backgroundColor="#EAF5ED" textColor="#258B3E" size="sm" />
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#fef3c7' }]}>
                <Icon name="coffee" size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.scheduleItemName}>Lunch Break</LocalizedText>
                <LocalizedText style={styles.scheduleItemTime}>01:00 PM – 01:45 PM (45 Minutes)</LocalizedText>
              </View>
              <Badge label="Scheduled" backgroundColor="#fef3c7" textColor="#b45309" size="sm" />
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: '#ede9fe' }]}>
                <Icon name="zap" size={16} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.scheduleItemName}>Sunday Rush Overtime</LocalizedText>
                <LocalizedText style={styles.scheduleItemTime}>+1.5 Hours • ₹300/hr peak incentive</LocalizedText>
              </View>
              <Badge label="Approved" backgroundColor="#ede9fe" textColor="#6d28d9" size="sm" />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= LEAVE APPLICATIONS HISTORY ================= */}
        <AnimatedEntranceView delay={220} direction="up" distance={14}>
          <View style={styles.leaveHistoryCard}>
            <View style={styles.leaveHistoryHeader}>
              <View>
                <LocalizedText style={styles.leaveHistoryTitle}>
                  {isManager && viewScope === 'all' ? 'All Staff Leave Requests' : 'My Leave Applications'}
                </LocalizedText>
                <LocalizedText style={styles.leaveHistorySub}>
                  {isManager && viewScope === 'all'
                    ? 'Review, approve, or reject employee leave requests'
                    : 'Planned leaves and manager approval records'}
                </LocalizedText>
              </View>
              <Badge
                label={`${displayedRecords.length} Requests`}
                backgroundColor="#EAF5ED"
                textColor="#258B3E"
                size="sm"
              />
            </View>

            {/* Manager View Scope Switcher */}
            {isManager && (
              <View style={styles.scopeSwitcherRow}>
                <TouchableOpacity
                  style={[styles.scopeBtn, viewScope === 'my' && styles.scopeBtnActive]}
                  scaleTo={0.95}
                  onPress={() => setViewScope('my')}
                >
                  <LocalizedText
                    style={[styles.scopeBtnText, viewScope === 'my' && styles.scopeBtnTextActive]}
                  >
                    My Leaves ({myLeaves.length})
                  </LocalizedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scopeBtn, viewScope === 'all' && styles.scopeBtnActive]}
                  scaleTo={0.95}
                  onPress={() => setViewScope('all')}
                >
                  <LocalizedText
                    style={[styles.scopeBtnText, viewScope === 'all' && styles.scopeBtnTextActive]}
                  >
                    All Staff ({leaveRequests.length})
                  </LocalizedText>
                </TouchableOpacity>
              </View>
            )}

            {displayedRecords.length === 0 ? (
              <View style={styles.emptyLeaveHistoryBox}>
                <Icon name="calendar" size={24} color="#9ca3af" />
                <LocalizedText style={styles.emptyLeaveHistoryText}>
                  No leave requests found.
                </LocalizedText>
              </View>
            ) : (
              displayedRecords.map((item, idx) => {
                const isPending = item.status === 'Pending';
                const isApproved = item.status === 'Approved';
                const isRejected = item.status === 'Rejected';

                return (
                  <View key={item.id} style={styles.leaveRecordItem}>
                    <View style={styles.leaveRecordTop}>
                      <View style={styles.leaveRecordTypeRow}>
                        <Icon
                          name={item.type.includes('Sick') ? 'activity' : 'calendar'}
                          size={15}
                          color={isApproved ? '#16a34a' : isPending ? '#d97706' : '#dc2626'}
                          style={{ marginRight: 6 }}
                        />
                        <LocalizedText style={styles.leaveRecordType}>
                          {item.type} • {item.days} Day{item.days > 1 ? 's' : ''}
                        </LocalizedText>
                        {isManager && viewScope === 'all' && (
                          <LocalizedText style={styles.leaveEmpTag}>
                            ({item.employeeName})
                          </LocalizedText>
                        )}
                      </View>
                      <Badge
                        label={item.status}
                        backgroundColor={isApproved ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2'}
                        textColor={isApproved ? '#059669' : isPending ? '#d97706' : '#dc2626'}
                        size="sm"
                      />
                    </View>

                    <View style={styles.leaveDatesRow}>
                      <Icon name="clock" size={13} color="#6b7280" style={{ marginRight: 6 }} />
                      <LocalizedText style={styles.leaveDatesText}>
                        {item.startDate}{item.days > 1 ? ` → ${item.endDate}` : ''}
                      </LocalizedText>
                    </View>

                    {item.reason ? (
                      <LocalizedText style={styles.leaveReasonText} numberOfLines={2}>
                        "{item.reason}"
                      </LocalizedText>
                    ) : (
                      <LocalizedText style={[styles.leaveReasonText, { color: '#9ca3af' }]}>
                        Sick / Emergency Leave — Reason not required
                      </LocalizedText>
                    )}

                    {/* Rejection reason banner */}
                    {isRejected && (
                      <View style={styles.rejectionNoticeBox}>
                        <View style={styles.rejectionNoticeHeader}>
                          <Icon name="alert-circle" size={13} color="#dc2626" style={{ marginRight: 5 }} />
                          <LocalizedText style={styles.rejectionNoticeTitle}>
                            Rejection Reason ({item.reviewedBy || 'Manager'}):
                          </LocalizedText>
                        </View>
                        <LocalizedText style={styles.rejectionNoticeText}>
                          {item.rejectionReason || 'No specific reason entered.'}
                        </LocalizedText>
                      </View>
                    )}

                    {/* Approved confirmation */}
                    {isApproved && item.reviewedBy && (
                      <View style={styles.approvalNoticeBox}>
                        <Icon name="check-circle" size={12} color="#059669" style={{ marginRight: 5 }} />
                        <LocalizedText style={styles.approvalNoticeText}>
                          Confirmed by {item.reviewedBy}
                        </LocalizedText>
                      </View>
                    )}

                    {/* Manager action buttons if pending */}
                    {isManager && isPending && (
                      <View style={styles.managerActionRow}>
                        <TouchableOpacity
                          style={styles.managerConfirmBtn}
                          scaleTo={0.94}
                          onPress={() => {
                            approveLeaveRequest(item.id, 'Manager');
                            showToast(`Leave approved for ${item.employeeName}!`, 'success');
                          }}
                        >
                          <Icon name="check" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.managerConfirmBtnText}>
                            Approve
                          </LocalizedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.managerRejectBtn}
                          scaleTo={0.94}
                          onPress={() => {
                            setRejectingItem(item);
                            setRejectReasonText('');
                          }}
                        >
                          <Icon name="x" size={13} color="#dc2626" style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.managerRejectBtnText}>
                            Reject with Reason
                          </LocalizedText>
                        </TouchableOpacity>
                      </View>
                    )}

                    {idx < displayedRecords.length - 1 && <View style={styles.leaveItemDivider} />}
                  </View>
                );
              })
            )}
          </View>
        </AnimatedEntranceView>

        {/* ================= APPLY FOR LEAVE BUTTON ================= */}
        <AnimatedEntranceView delay={250} direction="up" distance={14}>
          <TouchableOpacity
            style={styles.leaveActionBtn}
            scaleTo={0.96}
            onPress={() => setShowLeaveModal(true)}
          >
            <Icon name="calendar" size={18} color="#258B3E" style={{ marginRight: 8 }} />
            <LocalizedText style={styles.leaveActionBtnText}>
              Apply for Leave / Pick Dates
            </LocalizedText>
          </TouchableOpacity>
        </AnimatedEntranceView>
      </ScrollView>

      {/* ================= LEAVE REQUEST MODAL WITH DATE PICKER ================= */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <LocalizedText style={styles.modalTitle}>Request Store Leave</LocalizedText>
                  <LocalizedText style={styles.modalSubtitle}>
                    Pick leave dates & submit to Store Manager
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.88}
                  onPress={() => setShowLeaveModal(false)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                style={{ maxHeight: 520 }}
              >
              {/* Leave Type Chips */}
              <LocalizedText style={styles.modalFieldLabel}>Select Leave Category:</LocalizedText>
              <View style={styles.modalChipsRow}>
                {LEAVE_TYPES.map((type) => {
                  const isSelected = selectedLeaveType === type;
                  return (
                    <Chip
                      key={type}
                      label={type}
                      selected={isSelected}
                      size="sm"
                      onPress={() => setSelectedLeaveType(type)}
                    />
                  );
                })}
              </View>

              {/* Duration (Days) */}
              <LocalizedText style={[styles.modalFieldLabel, { marginTop: 12 }]}>
                Duration (Days):
              </LocalizedText>
              <View style={styles.durationRow}>
                {['1', '2', '3', '5', '7'].map((d) => (
                  <Chip
                    key={d}
                    label={`${d} Day${d !== '1' ? 's' : ''}`}
                    selected={leaveDays === d}
                    size="sm"
                    onPress={() => setLeaveDays(d)}
                  />
                ))}
              </View>

              {/* DATE PICKER SECTION */}
              <LocalizedText style={[styles.modalFieldLabel, { marginTop: 14 }]}>
                Pick Leave Date:
              </LocalizedText>

              {/* Quick date presets */}
              <View style={styles.presetDateRow}>
                <Chip
                  label="Tomorrow"
                  size="sm"
                  onPress={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setLeaveStartDate(d);
                    setShowCalendar(false);
                  }}
                />
                <Chip
                  label="In 2 Days"
                  size="sm"
                  onPress={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    setLeaveStartDate(d);
                    setShowCalendar(false);
                  }}
                />
                <Chip
                  label="Next Monday"
                  size="sm"
                  onPress={() => {
                    const d = new Date();
                    const day = d.getDay();
                    const diff = day === 0 ? 1 : 8 - day;
                    d.setDate(d.getDate() + diff);
                    setLeaveStartDate(d);
                    setShowCalendar(false);
                  }}
                />
              </View>

              {/* Date Box Trigger */}
              <TouchableOpacity
                style={[styles.dateSelectorBox, showCalendar && styles.dateSelectorBoxActive]}
                scaleTo={0.98}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                <View style={styles.dateSelectorLeft}>
                  <View style={styles.calendarIconCircle}>
                    <Icon name="calendar" size={18} color="#258B3E" />
                  </View>
                  <View>
                    <LocalizedText style={styles.dateSelectorLabel}>Selected Start Date</LocalizedText>
                    <LocalizedText style={styles.dateSelectorVal}>
                      {formatReadableDate(leaveStartDate)}
                    </LocalizedText>
                  </View>
                </View>
                <View style={styles.changeDatePill}>
                  <LocalizedText style={styles.changeDatePillText}>
                    {showCalendar ? 'Close' : 'Pick on Calendar'}
                  </LocalizedText>
                  <Icon
                    name={showCalendar ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color="#258B3E"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Interactive Calendar Dropdown */}
              {showCalendar && (
                <View style={styles.calendarWrapper}>
                  <CalendarPicker
                    selectedDate={leaveStartDate}
                    onSelectDate={(d) => {
                      setLeaveStartDate(d);
                      setShowCalendar(false);
                    }}
                    endDate={leaveEndDate}
                    minDate={new Date()}
                  />
                </View>
              )}

              {/* Leave Period Coverage Summary Card */}
              <View style={styles.leaveCoverageBox}>
                <View style={styles.leaveCoverageHeader}>
                  <Icon name="check-circle" size={14} color="#258B3E" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.leaveCoverageTitle}>
                    Leave Period Summary
                  </LocalizedText>
                </View>
                <View style={styles.leaveCoverageDatesRow}>
                  <View style={styles.periodCol}>
                    <LocalizedText style={styles.periodColLabel}>FROM</LocalizedText>
                    <LocalizedText style={styles.periodColDate}>
                      {formatReadableDate(leaveStartDate)}
                    </LocalizedText>
                  </View>
                  <Icon name="arrow-right" size={14} color="#9ca3af" style={{ marginHorizontal: 8 }} />
                  <View style={styles.periodCol}>
                    <LocalizedText style={styles.periodColLabel}>TO</LocalizedText>
                    <LocalizedText style={styles.periodColDate}>
                      {formatReadableDate(leaveEndDate)}
                    </LocalizedText>
                  </View>
                </View>
                <View style={styles.coverageTotalPill}>
                  <LocalizedText style={styles.coverageTotalText}>
                    Total Absence: {leaveDays} Day{leaveDays !== '1' ? 's' : ''} ({selectedLeaveType})
                  </LocalizedText>
                </View>
              </View>

              {/* Reason Input */}
              <View style={styles.reasonHeaderRow}>
                <LocalizedText style={[styles.modalFieldLabel, { marginTop: 14 }]}>
                  {isReasonMandatory ? 'Reason for Leave (Required)*' : `Reason (Optional for ${selectedLeaveType})`}
                </LocalizedText>
                {!isReasonMandatory && (
                  <Badge
                    label="Optional"
                    backgroundColor="#EAF5ED"
                    textColor="#258B3E"
                    size="sm"
                    style={{ marginTop: 14 }}
                  />
                )}
              </View>
              <TextInput
                style={styles.modalReasonInput}
                value={leaveReason}
                onChangeText={setLeaveReason}
                placeholder={
                  isReasonMandatory
                    ? 'Please explain the reason for your leave (e.g. Family event, travel)...'
                    : 'Optional (e.g. Doctor consultation, rest)...'
                }
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                scaleTo={0.96}
                onPress={handleApplyLeave}
              >
                <LocalizedText style={styles.modalSubmitBtnText}>
                  Submit Leave Application
                </LocalizedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* REJECTION REASON MODAL (MANDATORY REASON INPUT)            */}
      {/* ========================================================== */}
      {rejectingItem && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setRejectingItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.rejectModalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.rejectIconWrap}>
                  <Icon name="x-circle" size={20} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <LocalizedText style={styles.rejectModalTitle}>
                    Reject Leave Request
                  </LocalizedText>
                  <LocalizedText style={styles.rejectModalSub}>
                    {rejectingItem.employeeName} • {rejectingItem.type} ({rejectingItem.days} day{rejectingItem.days > 1 ? 's' : ''})
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.9}
                  onPress={() => setRejectingItem(null)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <LocalizedText style={styles.rejectWarningText}>
                Please state the reason for rejection. This explanation will be delivered directly to the employee.
              </LocalizedText>

              {/* Quick Preset Rejection Reasons */}
              <LocalizedText style={styles.fieldLabel}>Quick Reason Presets:</LocalizedText>
              <View style={styles.chipsRow}>
                {REJECT_PRESET_REASONS.map((preset) => {
                  const isSelected = rejectReasonText === preset;
                  return (
                    <Chip
                      key={preset}
                      label={preset}
                      selected={isSelected}
                      onPress={() => setRejectReasonText(preset)}
                      style={{ marginBottom: 6, marginRight: 6 }}
                    />
                  );
                })}
              </View>

              {/* Mandatory Reason Input */}
              <LocalizedText style={[styles.fieldLabel, { marginTop: 10 }]}>
                Reason for Rejection (Required)*
              </LocalizedText>
              <TextInput
                style={styles.rejectInput}
                placeholder="State why this leave cannot be approved..."
                placeholderTextColor="#9ca3af"
                value={rejectReasonText}
                onChangeText={setRejectReasonText}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rejectButtonRow}>
                <TouchableOpacity
                  style={styles.rejectCancelBtn}
                  scaleTo={0.95}
                  onPress={() => setRejectingItem(null)}
                >
                  <LocalizedText style={styles.rejectCancelBtnText}>Cancel</LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rejectSubmitBtn,
                    !rejectReasonText.trim() && { opacity: 0.6 },
                  ]}
                  scaleTo={0.95}
                  onPress={() => {
                    if (!rejectReasonText.trim()) {
                      showToast('Please provide a reason for rejecting this leave request.', 'info');
                      return;
                    }
                    rejectLeaveRequest(rejectingItem.id, rejectReasonText.trim(), 'Manager');
                    showToast(`Leave rejected for ${rejectingItem.employeeName}. Reason sent.`, 'success');
                    setRejectingItem(null);
                  }}
                >
                  <Icon name="x" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.rejectSubmitBtnText}>
                    Confirm Rejection
                  </LocalizedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dutyBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dutyPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dutyStatusText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  timerCenter: {
    alignItems: 'center',
    marginBottom: 18,
  },
  timerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  timerDisplay: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    letterSpacing: 1,
  },
  shiftTimeRange: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  punchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  punchBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },

  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  statsSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    marginTop: 2,
    textAlign: 'center',
  },

  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  calendarWeek: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  dayColToday: {
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#258B3E',
  },
  dayText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  dayTextToday: {
    color: '#258B3E',
    fontFamily: 'Poppins-SemiBold',
  },
  dateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateCircleToday: {
    backgroundColor: '#258B3E',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  dateTextToday: {
    color: '#ffffff',
  },
  statusIndicator: {
    marginVertical: 2,
  },
  hourText: {
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },

  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  scheduleTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  scheduleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleItemName: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  scheduleItemTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },

  leaveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#258B3E',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  leaveActionBtnText: {
    fontSize: 13.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },

  // Leave History Section
  leaveHistoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  leaveHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  leaveHistoryTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  leaveHistorySub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  leaveRecordItem: {
    paddingVertical: 6,
  },
  leaveRecordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leaveRecordTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveRecordType: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  leaveDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  leaveDatesText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  leaveReasonText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  leaveItemDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  // Date picker in modal
  presetDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dateSelectorBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  dateSelectorBoxActive: {
    borderColor: '#258B3E',
    backgroundColor: '#fbfdfb',
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateSelectorLabel: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  dateSelectorVal: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  changeDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  changeDatePillText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  calendarWrapper: {
    marginBottom: 14,
  },

  // Leave coverage summary
  leaveCoverageBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  leaveCoverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveCoverageTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#166534',
  },
  leaveCoverageDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  periodCol: {
    flex: 1,
  },
  periodColLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  periodColDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 1,
  },
  coverageTotalPill: {
    alignSelf: 'flex-start',
  },
  coverageTotalText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#15803d',
  },

  modalReasonInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    textAlignVertical: 'top',
    height: 70,
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#258B3E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Scope switcher
  scopeSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  scopeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 1,
  },
  scopeBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  scopeBtnTextActive: {
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyLeaveHistoryBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLeaveHistoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 6,
  },
  leaveEmpTag: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  rejectionNoticeBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  rejectionNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejectionNoticeTitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  rejectionNoticeText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#991b1b',
    marginTop: 2,
  },
  approvalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  approvalNoticeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#059669',
  },
  managerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  managerConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#258B3E',
    borderRadius: 10,
    paddingVertical: 8,
  },
  managerConfirmBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  managerRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingVertical: 8,
  },
  managerRejectBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Reject Modal styles
  rejectModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 440,
    width: '90%',
    alignSelf: 'center',
  },
  rejectIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rejectModalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  rejectModalSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  rejectWarningText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    marginVertical: 10,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    height: 80,
    textAlignVertical: 'top',
    marginTop: 4,
    backgroundColor: '#f9fafb',
  },
  rejectButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  rejectCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  rejectCancelBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
  },
  rejectSubmitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectSubmitBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default EmployeeShiftAttendanceScreen;
