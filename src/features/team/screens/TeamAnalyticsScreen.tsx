import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, Badge, Avatar, StatCard } from '../../../shared/components/common';
import RoleBadge from '../components/RoleBadge';
import { useStaffRole, EmployeeRole } from '../context/StaffRoleContext';
import { useFloorPager } from '../context/FloorPagerContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

interface StaffWorkMetrics {
  employeeId: string;
  shiftHours: string;
  tasksCompleted: number;
  taskBreakdown: string;
  accuracy: string;
  avgSpeed: string;
  attendanceScore: string;
  recentTasks: { title: string; time: string; badge: string; badgeBg: string; badgeColor: string }[];
}

const MOCK_METRICS: Record<string, StaffWorkMetrics> = {
  'emp-1': {
    employeeId: 'emp-1',
    shiftHours: '06h 15m',
    tasksCompleted: 34,
    taskBreakdown: 'Floor supervision, 12 bills approved, 22 stock audits',
    accuracy: '99.8%',
    avgSpeed: '2.4 mins',
    attendanceScore: '26/26 days (100%)',
    recentTasks: [
      { title: 'Approved POS Bill Void #INV-8821', time: '12:30 PM', badge: 'Admin', badgeBg: '#fef3c7', badgeColor: '#d97706' },
      { title: 'Aisle 3 Dairy Cooler Inspection', time: '11:15 AM', badge: 'Audit', badgeBg: '#EAF5ED', badgeColor: '#258B3E' },
      { title: 'Morning Staff Shift Briefing', time: '08:00 AM', badge: 'Roster', badgeBg: '#eff6ff', badgeColor: '#2563eb' },
    ],
  },
  'emp-2': {
    employeeId: 'emp-2',
    shiftHours: '05h 42m',
    tasksCompleted: 26,
    taskBreakdown: '26 walk-in customer bills • ₹18,420 total revenue billed',
    accuracy: '99.6%',
    avgSpeed: '1.2 mins / bill',
    attendanceScore: '26/26 days (100%)',
    recentTasks: [
      { title: 'Walk-in Checkout #INV-8891 (12 items)', time: '12:45 PM', badge: '₹1,240 Cash', badgeBg: '#EAF5ED', badgeColor: '#258B3E' },
      { title: 'Walk-in Checkout #INV-8884 (4 items)', time: '11:50 AM', badge: '₹480 UPI', badgeBg: '#eff6ff', badgeColor: '#2563eb' },
      { title: 'Walk-in Checkout #INV-8879 (8 items)', time: '10:20 AM', badge: '₹890 UPI', badgeBg: '#eff6ff', badgeColor: '#2563eb' },
    ],
  },
  'emp-3': {
    employeeId: 'emp-3',
    shiftHours: '05h 18m',
    tasksCompleted: 16,
    taskBreakdown: '16 online orders picked & packed • 112 total SKUs',
    accuracy: '99.1%',
    avgSpeed: '3.8 mins / order',
    attendanceScore: '25/26 days (96%)',
    recentTasks: [
      { title: 'Order #TK-1024 Sealed & Staged', time: '12:40 PM', badge: 'Blinkit Rider', badgeBg: '#f0fdf4', badgeColor: '#16a34a' },
      { title: 'Order #TK-1019 Picked from Aisle 2', time: '11:30 AM', badge: 'Swiggy', badgeBg: '#fff7ed', badgeColor: '#ea580c' },
      { title: 'Order #TK-1015 Verified & Sealed', time: '10:10 AM', badge: 'Zomato', badgeBg: '#fef2f2', badgeColor: '#dc2626' },
    ],
  },
  'emp-4': {
    employeeId: 'emp-4',
    shiftHours: '04h 50m',
    tasksCompleted: 22,
    taskBreakdown: '22 shelf barcode scans • 140 FMCG items replenished',
    accuracy: '98.9%',
    avgSpeed: '2.8 mins / SKU',
    attendanceScore: '26/26 days (100%)',
    recentTasks: [
      { title: 'Aisle 1 Fresh Produce Restocked', time: '12:15 PM', badge: 'Restocked', badgeBg: '#fef3c7', badgeColor: '#d97706' },
      { title: 'Aisle 4 Dry Grocery Inventory Scan', time: '11:00 AM', badge: 'Audit', badgeBg: '#ede9fe', badgeColor: '#7c3aed' },
      { title: 'Expired Bread & Dairy Purged', time: '09:30 AM', badge: 'Cleaned', badgeBg: '#f3f4f6', badgeColor: '#4b5563' },
    ],
  },
  'emp-5': {
    employeeId: 'emp-5',
    shiftHours: '04h 10m',
    tasksCompleted: 18,
    taskBreakdown: '18 custom tasks • Cash reconciliation & Aisle 3 checks',
    accuracy: '99.0%',
    avgSpeed: '3.5 mins',
    attendanceScore: '24/26 days (92%)',
    recentTasks: [
      { title: 'Register #2 Cash Drawer Count', time: '12:00 PM', badge: 'Verified', badgeBg: '#EAF5ED', badgeColor: '#258B3E' },
      { title: 'Restock Milk Chiller Shelves', time: '10:45 AM', badge: 'Completed', badgeBg: '#eff6ff', badgeColor: '#2563eb' },
      { title: 'Aisle 3 Price Tag Verification', time: '09:15 AM', badge: 'Price Tag', badgeBg: '#fffbeb', badgeColor: '#d97706' },
    ],
  },
};

const FILTER_TABS = ['ALL', 'Billers', 'Online Orders', 'Inventory', 'Managers'];

const TeamAnalyticsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { allStaff } = useStaffRole();
  const { ringEmployeePhone, sendCabinNotification } = useFloorPager();
  const { showToast } = useFeedback();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedStaffForNotice, setSelectedStaffForNotice] = useState<any | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Manager Cabin #1');

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return allStaff.filter((staff) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'Billers') return staff.role === 'BILLER';
      if (activeFilter === 'Online Orders') return staff.role === 'ORDERS';
      if (activeFilter === 'Inventory') return staff.role === 'INVENTORY';
      if (activeFilter === 'Managers') return staff.role === 'MANAGER';
      return true;
    });
  }, [allStaff, activeFilter]);

  // Aggregate store-wide metrics
  const storeTotals = useMemo(() => {
    let totalTasks = 0;
    let onDutyCount = 0;
    allStaff.forEach((s) => {
      const m = MOCK_METRICS[s.id];
      if (m) totalTasks += m.tasksCompleted;
      if (s.status === 'Active') onDutyCount += 1;
    });
    return {
      totalStaff: allStaff.length,
      onDutyCount,
      totalTasks,
      avgAccuracy: '99.3%',
      totalRevenue: '₹42,850',
    };
  }, [allStaff]);

  // Handle direct notification
  const handleOpenNoticeModal = (staff: any) => {
    setSelectedStaffForNotice(staff);
    setNotificationMsg(`Please report to ${selectedLocation} when available.`);
  };

  const handleSendNotice = () => {
    if (!selectedStaffForNotice) return;
    sendCabinNotification(
      selectedStaffForNotice.id,
      selectedLocation,
      notificationMsg
    );
    showToast(`Notification sent to ${selectedStaffForNotice.name}!`, 'success');
    setSelectedStaffForNotice(null);
  };

  // Handle direct urgent alert (20s)
  const handleTriggerUrgentAlert = (staff: any) => {
    ringEmployeePhone(
      staff.id,
      'Manager Cabin #1',
      `Urgent store floor summon for ${staff.name}. Please come to Manager Cabin #1 immediately.`
    );
    showToast(`🚨 Ringing ${staff.name}'s phone for 20 seconds!`, 'success');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Employee Work Analytics"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= STORE-WIDE WORK KPI SUMMARY ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <View>
                <LocalizedText style={styles.summaryTitle}>Store Staff Performance</LocalizedText>
                <LocalizedText style={styles.summarySub}>
                  Today's live floor output • Green Basket Kirana
                </LocalizedText>
              </View>
              <Badge label="Live Shift" backgroundColor="#EAF5ED" textColor="#258B3E" size="sm" />
            </View>

            <View style={styles.summaryGrid}>
              <StatCard
                value={`${storeTotals.onDutyCount}/${storeTotals.totalStaff}`}
                label="Staff on Duty"
                color="#16a34a"
                backgroundColor="#f0fdf4"
                style={styles.summaryBox}
              />
              <StatCard
                value={storeTotals.totalTasks}
                label="Tasks Completed"
                color="#2563eb"
                backgroundColor="#eff6ff"
                style={styles.summaryBox}
              />
              <StatCard
                value={storeTotals.totalRevenue}
                label="Revenue Billed"
                color="#7c3aed"
                backgroundColor="#faf5ff"
                style={styles.summaryBox}
              />
              <StatCard
                value={storeTotals.avgAccuracy}
                label="Store Accuracy"
                color="#d97706"
                backgroundColor="#fffbeb"
                style={styles.summaryBox}
              />
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= ROLE FILTER TABS ================= */}
        <AnimatedEntranceView delay={80} direction="up" distance={14}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  scaleTo={0.94}
                  onPress={() => setActiveFilter(tab)}
                >
                  <LocalizedText
                    style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
                  >
                    {tab}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AnimatedEntranceView>

        {/* ================= EMPLOYEE CARDS WITH WORK DATA & ACTIONS ================= */}
        {filteredStaff.map((staff, idx) => {
          const metrics = MOCK_METRICS[staff.id] || {
            employeeId: staff.id,
            shiftHours: '04h 30m',
            tasksCompleted: 18,
            taskBreakdown: `${staff.roleTitle} shift responsibilities`,
            accuracy: '99.0%',
            avgSpeed: '3.0 mins',
            attendanceScore: '25/26 days (96%)',
            recentTasks: [
              { title: 'Floor activity logged', time: '11:00 AM', badge: 'Active', badgeBg: '#EAF5ED', badgeColor: '#258B3E' },
            ],
          };

          const isOnDuty = staff.status === 'Active';

          return (
            <AnimatedEntranceView
              key={staff.id}
              delay={120 + idx * 30}
              direction="up"
              distance={16}
            >
              <View style={styles.staffCard}>
                {/* Top Profile Header */}
                <View style={styles.staffTopRow}>
                  <Avatar
                    source={staff.avatarUrl}
                    role={staff.role}
                    permissions={staff.permissions}
                    size={44}
                    showStatus
                    status={isOnDuty ? 'online' : 'offline'}
                    style={styles.staffAvatar}
                  />

                  <View style={styles.staffMainInfo}>
                    <View style={styles.nameRow}>
                      <LocalizedText style={styles.staffName}>{staff.name}</LocalizedText>
                      <RoleBadge
                        role={
                          staff.role === 'MANAGER'
                            ? 'Manager'
                            : staff.role === 'BILLER'
                            ? 'Biller'
                            : staff.role === 'ORDERS'
                            ? 'Online Orders'
                            : staff.role === 'INVENTORY'
                            ? 'Inventory'
                            : 'Custom'
                        }
                        customLabel={staff.roleTitle}
                      />
                    </View>
                    <LocalizedText style={styles.staffPhone}>{staff.phone}</LocalizedText>
                    <LocalizedText style={styles.staffShiftText}>
                      {staff.shift} •{' '}
                      <LocalizedText
                        style={{
                          fontFamily: 'Poppins-SemiBold',
                          color: isOnDuty ? '#16a34a' : '#6b7280',
                        }}
                      >
                        {isOnDuty ? 'Active on Duty' : staff.status}
                      </LocalizedText>
                    </LocalizedText>
                  </View>
                </View>

                {/* Analytical Metrics Grid */}
                <View style={styles.metricsBox}>
                  <View style={styles.metricItem}>
                    <LocalizedText style={styles.metricItemVal}>{metrics.shiftHours}</LocalizedText>
                    <LocalizedText style={styles.metricItemLabel}>Shift Time</LocalizedText>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <LocalizedText style={[styles.metricItemVal, { color: '#2563eb' }]}>
                      {metrics.tasksCompleted}
                    </LocalizedText>
                    <LocalizedText style={styles.metricItemLabel}>Tasks Done</LocalizedText>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <LocalizedText style={[styles.metricItemVal, { color: '#16a34a' }]}>
                      {metrics.accuracy}
                    </LocalizedText>
                    <LocalizedText style={styles.metricItemLabel}>Accuracy</LocalizedText>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <LocalizedText style={[styles.metricItemVal, { color: '#d97706' }]}>
                      {metrics.avgSpeed}
                    </LocalizedText>
                    <LocalizedText style={styles.metricItemLabel}>Avg Speed</LocalizedText>
                  </View>
                </View>

                {/* Task Breakdown description */}
                <View style={styles.taskBreakdownRow}>
                  <Icon name="check-circle" size={13} color="#258B3E" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.taskBreakdownText}>
                    {metrics.taskBreakdown}
                  </LocalizedText>
                </View>

                {/* Recent Tasks List */}
                <View style={styles.recentTasksList}>
                  <LocalizedText style={styles.recentTasksHeader}>
                    Recent Logged Work:
                  </LocalizedText>
                  {metrics.recentTasks.map((task, tIdx) => (
                    <View key={tIdx} style={styles.recentTaskRow}>
                      <View style={styles.taskBullet} />
                      <LocalizedText style={styles.taskTitle} numberOfLines={1}>
                        {task.title}
                      </LocalizedText>
                      <LocalizedText style={styles.taskTime}>{task.time}</LocalizedText>
                      <Badge
                        label={task.badge}
                        backgroundColor={task.badgeBg}
                        textColor={task.badgeColor}
                        size="sm"
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  ))}
                </View>

                {/* ================= DIRECT MANAGER ACTIONS ================= */}
                <View style={styles.actionButtonsRow}>
                  {/* Action 1: Send Direct Notification */}
                  <TouchableOpacity
                    style={styles.notifyBtn}
                    scaleTo={0.96}
                    onPress={() => handleOpenNoticeModal(staff)}
                  >
                    <Icon name="message-square" size={14} color="#258B3E" style={{ marginRight: 6 }} />
                    <LocalizedText style={styles.notifyBtnText}>Notify</LocalizedText>
                  </TouchableOpacity>

                  {/* Action 2: Urgent Floor Alert (20s Ringer & Buzzer) */}
                  <TouchableOpacity
                    style={styles.alertBuzzerBtn}
                    scaleTo={0.96}
                    onPress={() => handleTriggerUrgentAlert(staff)}
                  >
                    <Icon name="bell" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                    <LocalizedText style={styles.alertBuzzerBtnText}>
                      🚨 Ring Phone (20s)
                    </LocalizedText>
                  </TouchableOpacity>

                  {/* Action 3: View Full Profile & Permissions */}
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    scaleTo={0.96}
                    onPress={() =>
                      navigation.navigate('EmployeeDetail', { employeeId: staff.id })
                    }
                  >
                    <Icon name="eye" size={14} color="#4b5563" style={{ marginRight: 5 }} />
                    <LocalizedText style={styles.detailsBtnText}>Details</LocalizedText>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedEntranceView>
          );
        })}
      </ScrollView>

      {/* ================= DIRECT NOTIFICATION MODAL ================= */}
      <Modal
        visible={!!selectedStaffForNotice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStaffForNotice(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <LocalizedText style={styles.modalTitle}>
                  Send In-Store Notification
                </LocalizedText>
                <LocalizedText style={styles.modalSubtitle}>
                  Direct dispatch to: {selectedStaffForNotice?.name} (
                  {selectedStaffForNotice?.roleTitle})
                </LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                scaleTo={0.88}
                onPress={() => setSelectedStaffForNotice(null)}
              >
                <Icon name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Quick Destination Chips */}
            <LocalizedText style={styles.modalFieldLabel}>Report Location:</LocalizedText>
            <View style={styles.destChipsRow}>
              {['Manager Cabin #1', 'Main Office', 'Billing Counter #1', 'Stock Warehouse'].map(
                (loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <TouchableOpacity
                      key={loc}
                      style={[styles.destChip, isSelected && styles.destChipActive]}
                      scaleTo={0.94}
                      onPress={() => {
                        setSelectedLocation(loc);
                        setNotificationMsg(`Please come to ${loc} when available.`);
                      }}
                    >
                      <LocalizedText
                        style={[styles.destChipText, isSelected && styles.destChipTextActive]}
                      >
                        {loc}
                      </LocalizedText>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            {/* Message Input */}
            <LocalizedText style={[styles.modalFieldLabel, { marginTop: 12 }]}>
              Notification Message:
            </LocalizedText>
            <TextInput
              style={styles.modalInput}
              value={notificationMsg}
              onChangeText={setNotificationMsg}
              placeholder="Type message to employee..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />

            {/* Submit */}
            <TouchableOpacity
              style={styles.modalSendBtn}
              scaleTo={0.96}
              onPress={handleSendNotice}
            >
              <Icon name="send" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <LocalizedText style={styles.modalSendBtnText}>
                Send Notification to Employee
              </LocalizedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  summarySub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryNum: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  summaryLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    marginTop: 2,
    textAlign: 'center',
  },

  filterScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  filterChipText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },

  staffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  staffTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  staffAvatarText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  avatarDutyDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  staffMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  staffName: {
    fontSize: 14.5,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  staffPhone: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  staffShiftText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    marginTop: 2,
  },

  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricItemVal: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  metricItemLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 2,
  },

  taskBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskBreakdownText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    flex: 1,
  },

  recentTasksList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 14,
  },
  recentTasksHeader: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
    marginBottom: 6,
  },
  recentTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  taskBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
  },
  taskTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },

  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#258B3E',
    borderRadius: 12,
    paddingVertical: 9,
  },
  notifyBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  alertBuzzerBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 9,
  },
  alertBuzzerBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
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
    maxHeight: '80%',
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
    marginBottom: 6,
  },
  destChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  destChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  destChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  destChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  destChipTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  modalInput: {
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
  modalSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#258B3E',
    borderRadius: 14,
    paddingVertical: 13,
  },
  modalSendBtnText: {
    fontSize: 13.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default TeamAnalyticsScreen;

