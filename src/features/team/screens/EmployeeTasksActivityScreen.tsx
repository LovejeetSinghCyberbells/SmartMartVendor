import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, AnimatedEntranceView, Badge, StatCard } from '../../../shared/components/common';
import { useStaffRole } from '../context/StaffRoleContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

interface ShiftActivity {
  id: string;
  type: 'order' | 'billing' | 'restock' | 'shift';
  title: string;
  subtitle: string;
  time: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const ACTIVITIES: ShiftActivity[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order #TK-1024 Picked & Bagged',
    subtitle: '8 Items • Dairy, Amul Milk, Whole Wheat Bread • Bag #B-42',
    time: '12:45 PM',
    badge: 'Packed',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    icon: 'package',
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
  },
  {
    id: '2',
    type: 'billing',
    title: 'Walk-in Counter Checkout #INV-8891',
    subtitle: '12 Items • ₹1,240 Cash Collected • Customer Receipt printed',
    time: '11:30 AM',
    badge: 'Billed',
    badgeColor: '#258B3E',
    badgeBg: '#EAF5ED',
    icon: 'file-text',
    iconColor: '#258B3E',
    iconBg: '#EAF5ED',
  },
  {
    id: '3',
    type: 'restock',
    title: 'Aisle 3 Cooler Restocked',
    subtitle: 'Shelf barcode scanned • 24 Units Amul Butter placed',
    time: '10:15 AM',
    badge: 'Restocked',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    icon: 'grid',
    iconColor: '#d97706',
    iconBg: '#fef3c7',
  },
  {
    id: '4',
    type: 'order',
    title: 'Order #TK-1019 Picked & Staged',
    subtitle: '5 Items • Fresh Farm Veggies • Cold storage staging',
    time: '09:40 AM',
    badge: 'Staged',
    badgeColor: '#7c3aed',
    badgeBg: '#ede9fe',
    icon: 'package',
    iconColor: '#7c3aed',
    iconBg: '#ede9fe',
  },
  {
    id: '5',
    type: 'billing',
    title: 'Walk-in Counter Checkout #INV-8884',
    subtitle: '3 Items • ₹380 UPI Payment verified',
    time: '09:15 AM',
    badge: 'Billed',
    badgeColor: '#258B3E',
    badgeBg: '#EAF5ED',
    icon: 'file-text',
    iconColor: '#258B3E',
    iconBg: '#EAF5ED',
  },
  {
    id: '6',
    type: 'shift',
    title: 'Morning Shift Punch-In Verified',
    subtitle: 'Store Biometric terminal • On-time arrival (07:58 AM)',
    time: '08:00 AM',
    badge: 'On Duty',
    badgeColor: '#0891b2',
    badgeBg: '#cffafe',
    icon: 'clock',
    iconColor: '#0891b2',
    iconBg: '#cffafe',
  },
];

const FILTER_TABS = ['ALL', 'Orders', 'Billing', 'Restock'];

const EmployeeTasksActivityScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { showToast } = useFeedback();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredActivities = ACTIVITIES.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'Orders') return item.type === 'order';
    if (activeTab === 'Billing') return item.type === 'billing';
    if (activeTab === 'Restock') return item.type === 'restock';
    return true;
  });

  const handleExportSummary = () => {
    showToast('Daily Shift Summary generated! Sent to Store Manager.', 'success');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Tasks & Shift Activity"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= SHIFT KPI OVERVIEW ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeaderRow}>
              <View>
                <LocalizedText style={styles.kpiTitle}>Today's Fulfillment KPIs</LocalizedText>
                <LocalizedText style={styles.kpiSub}>
                  Logged for {currentEmployee.name} ({currentEmployee.roleTitle})
                </LocalizedText>
              </View>
              <Badge label="Active Shift" backgroundColor="#EAF5ED" textColor="#258B3E" size="sm" />
            </View>

            <View style={styles.kpiGrid}>
              <StatCard
                value={currentEmployee.permissions.canManageOrders ? '14' : '—'}
                label="Orders Picked"
                color="#2563eb"
                backgroundColor="#eff6ff"
                style={styles.kpiBox}
              />
              <StatCard
                value={currentEmployee.permissions.canCreateBills ? '18' : '—'}
                label="Bills Created"
                color="#16a34a"
                backgroundColor="#f0fdf4"
                style={styles.kpiBox}
              />
              <StatCard
                value="99.2%"
                label="Accuracy Rate"
                color="#7c3aed"
                backgroundColor="#faf5ff"
                style={styles.kpiBox}
              />
              <StatCard
                value="4.2m"
                label="Avg Pick Time"
                color="#d97706"
                backgroundColor="#fffbeb"
                style={styles.kpiBox}
              />
            </View>

            {/* Target Progress Bar */}
            <View style={styles.targetSection}>
              <View style={styles.targetLabelRow}>
                <LocalizedText style={styles.targetLabel}>Shift Target: 25 Tasks</LocalizedText>
                <LocalizedText style={styles.targetPercent}>22 / 25 Done (88%)</LocalizedText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '88%' }]} />
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= FILTER TABS ================= */}
        <AnimatedEntranceView delay={90} direction="up" distance={14}>
          <View style={styles.filterRow}>
            {FILTER_TABS.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  scaleTo={0.94}
                  onPress={() => setActiveTab(tab)}
                >
                  <LocalizedText
                    style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}
                  >
                    {tab}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedEntranceView>

        {/* ================= ACTIVITY TIMELINE ================= */}
        <AnimatedEntranceView delay={140} direction="up" distance={14}>
          <View style={styles.timelineCard}>
            <LocalizedText style={styles.timelineHeader}>Chronological Log</LocalizedText>

            {filteredActivities.map((act, idx) => (
              <View key={act.id} style={styles.timelineItem}>
                <View style={styles.timelineLeftCol}>
                  <View style={[styles.timelineIcon, { backgroundColor: act.iconBg }]}>
                    <Icon name={act.icon as any} size={15} color={act.iconColor} />
                  </View>
                  {idx < filteredActivities.length - 1 && <View style={styles.timelineConnector} />}
                </View>

                <View style={styles.timelineRightCol}>
                  <View style={styles.timelineTopRow}>
                    <LocalizedText style={styles.timelineTitle}>{act.title}</LocalizedText>
                    <LocalizedText style={styles.timelineTime}>{act.time}</LocalizedText>
                  </View>
                  <LocalizedText style={styles.timelineSub}>{act.subtitle}</LocalizedText>
                  <View style={{ marginTop: 4 }}>
                    <Badge
                      label={act.badge}
                      backgroundColor={act.badgeBg}
                      textColor={act.badgeColor}
                      size="sm"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </AnimatedEntranceView>

        {/* Export / Submit shift report */}
        <AnimatedEntranceView delay={180} direction="up" distance={14}>
          <TouchableOpacity
            style={styles.exportBtn}
            scaleTo={0.96}
            onPress={handleExportSummary}
          >
            <Icon name="file-text" size={17} color="#258B3E" style={{ marginRight: 8 }} />
            <LocalizedText style={styles.exportBtnText}>
              Export &amp; Submit Shift Activity Report
            </LocalizedText>
          </TouchableOpacity>
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
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  kpiTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  kpiSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  kpiNum: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  kpiLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
    marginTop: 2,
    textAlign: 'center',
  },
  targetSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  targetLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  targetLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  targetPercent: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#258B3E',
    borderRadius: 3,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  filterPillText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },

  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  timelineHeader: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineLeftCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 32,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  timelineRightCol: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timelineTime: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  timelineSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#258B3E',
    borderRadius: 16,
    paddingVertical: 14,
  },
  exportBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
});

export default EmployeeTasksActivityScreen;

