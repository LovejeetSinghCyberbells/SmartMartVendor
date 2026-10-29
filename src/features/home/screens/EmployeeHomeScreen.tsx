// EmployeeHomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { Badge, AnimatedEntranceView, Avatar } from '../../../shared/components/common';
import {
  EmployeeHomeSkeleton,
  useEmployeeEntranceAnimation,
  AnimatedSectionWrapper,
} from '../components/animations';
import { useStaffRole, RoleBadge, useFloorPager, useStaffChat } from '../../team';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

const STAFF_CURRENT_TASKS: Record<
  string,
  {
    currentTask: string;
    currentZone: string;
    tasksToday: number;
    hours: string;
    accuracy: string;
  }
> = {
  'emp-1': {
    currentTask: 'General Store Floor Supervision & Quality Audit',
    currentZone: 'Manager Cabin #1',
    tasksToday: 34,
    hours: '06h 15m',
    accuracy: '99.8%',
  },
  'emp-2': {
    currentTask: 'Walk-in POS Checkout • Scanning Customer Basket (12 items)',
    currentZone: 'Billing Counter Register #1',
    tasksToday: 26,
    hours: '05h 42m',
    accuracy: '99.6%',
  },
  'emp-3': {
    currentTask: 'Picking Order #TK-1024 • Dairy, Milk & Bread (8 items)',
    currentZone: 'Aisle 2 Dairy Chiller',
    tasksToday: 16,
    hours: '05h 18m',
    accuracy: '99.1%',
  },
  'emp-4': {
    currentTask: 'Restocking Fresh Produce & Shelf Barcode Verification',
    currentZone: 'Aisle 1 Farm Produce',
    tasksToday: 22,
    hours: '04h 50m',
    accuracy: '98.9%',
  },
  'emp-5': {
    currentTask: 'Register #2 Cash Drawer Count & Aisle 3 Restocking',
    currentZone: 'Billing Counter #2',
    tasksToday: 18,
    hours: '04h 10m',
    accuracy: '99.0%',
  },
};

const TASKS = [
  { id: '1', orderId: 'TK-1024', type: 'Pick', items: 8, aisle: 'Aisle 2 • Dairy', priority: 'High', time: '2 min' },
  { id: '2', orderId: 'TK-1021', type: 'Pack', items: 5, aisle: 'Packing Station #1', priority: 'Normal', time: '8 min' },
  { id: '3', orderId: 'TK-1019', type: 'Pick', items: 12, aisle: 'Aisle 4 • Staples', priority: 'High', time: '12 min' },
];

const EmployeeHomeScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { currentEmployee, allStaff } = useStaffRole();
  const { permissions } = currentEmployee;
  const {
    ringEmployeePhone,
    sendCabinNotification,
    recentAlerts,
    acknowledgeAlert,
  } = useFloorPager();
  const { showToast } = useFeedback();
  const { totalUnreadCount } = useStaffChat();
  const [showNotifSheet, setShowNotifSheet] = useState(false);

  const employeeAlerts = recentAlerts.filter(
    (a) => a.targetEmployeeId === currentEmployee.id
  );
  const unreadAlertsCount = employeeAlerts.filter(
    (a) => a.status === 'NOTIFIED' || a.status === 'RINGING'
  ).length;

  const activeSummonForMe = employeeAlerts.find(
    (a) => a.status === 'NOTIFIED' || a.status === 'RINGING'
  );

  const { headerStyle, getSectionStyle, getStatCardStyle, isHeaderLanded } =
    useEmployeeEntranceAnimation(isLoading, insets.top);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) {
    return <EmployeeHomeSkeleton />;
  }

  // Dynamic stats according to assigned staff persona
  const stats =
    currentEmployee.role === 'BILLER'
      ? [
          { number: '24', label: 'Bills Made' },
          { number: '₹18,450', label: 'Cash & UPI' },
          { number: '1.8m', label: 'Avg Speed' },
        ]
      : currentEmployee.role === 'ORDERS'
      ? [
          { number: '14', label: 'Picked' },
          { number: '3', label: 'In Packing' },
          { number: '5', label: 'Rider Ready' },
        ]
      : currentEmployee.role === 'INVENTORY'
      ? [
          { number: '48', label: 'Audited' },
          { number: '6', label: 'Low Stock' },
          { number: '12', label: 'Aisles' },
        ]
      : currentEmployee.role === 'MANAGER'
      ? [
          { number: '4/5', label: 'On Duty' },
          { number: '116', label: 'Tasks Done' },
          { number: '₹42,850', label: 'Revenue' },
        ]
      : [
          { number: '14', label: 'Tasks Done' },
          { number: '3', label: 'Pending' },
          { number: '18', label: 'Bills Made' },
        ];

  return (
    <View style={[styles.root, { backgroundColor: isHeaderLanded ? '#258B3E' : '#ffffff' }]}>
      <StatusBar barStyle={isHeaderLanded ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== HEADER ===== */}
        <Animated.View style={[styles.header, { paddingTop: insets.top + 12 }, headerStyle]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <LocalizedText style={styles.greeting}>Store Operations Floor 👋</LocalizedText>
              <LocalizedText style={styles.name}>{currentEmployee.name}</LocalizedText>
              <View style={styles.roleHeaderPill}>
                <Icon name="shield" size={11} color="#ffffff" style={{ marginRight: 4 }} />
                <LocalizedText style={styles.roleHeaderText}>
                  {currentEmployee.roleTitle}
                </LocalizedText>
              </View>
              <LocalizedText style={styles.storeSub}>Green Basket Kirana • #TK-VB-8821</LocalizedText>
            </View>
            <View style={styles.headerRightActions}>
              {/* Staff Floor Chat Button */}
              <TouchableOpacity
                style={styles.notifBtn}
                scaleTo={0.88}
                onPress={() => navigation.navigate('TeamChatList')}
                accessibilityLabel="Staff Floor Chat"
              >
                <Icon name="message-circle" size={19} color="#258B3E" />
                {totalUnreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <LocalizedText style={styles.notifBadgeText}>
                      {totalUnreadCount}
                    </LocalizedText>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notifBtn}
                scaleTo={0.88}
                onPress={() => setShowNotifSheet(true)}
                accessibilityLabel="Notifications"
              >
                <Icon name="bell" size={19} color="#258B3E" />
                {unreadAlertsCount > 0 && (
                  <View style={styles.notifBadge}>
                    <LocalizedText style={styles.notifBadgeText}>
                      {unreadAlertsCount}
                    </LocalizedText>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileBtn}
                scaleTo={0.88}
                onPress={() => navigation.navigate('Profile')}
              >
                <Icon name="user" size={19} color="#258B3E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Manager Summon Banner on Home Screen */}
          {activeSummonForMe && (
            <View style={styles.activeSummonBanner}>
              <View style={styles.activeSummonIconWrap}>
                <Icon
                  name={activeSummonForMe.isUrgentRing ? 'alert-triangle' : 'bell'}
                  size={18}
                  color={activeSummonForMe.isUrgentRing ? '#dc2626' : '#258B3E'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.activeSummonTagRow}>
                  <LocalizedText style={styles.activeSummonTag}>
                    {activeSummonForMe.isUrgentRing
                      ? '🚨 URGENT FLOOR SUMMON'
                      : 'MANAGER CABIN SUMMON'}
                  </LocalizedText>
                  <LocalizedText style={styles.activeSummonSender}>
                    • {activeSummonForMe.senderName}
                  </LocalizedText>
                </View>
                <LocalizedText style={styles.activeSummonLocation}>
                  📍 Destination: {activeSummonForMe.location}
                </LocalizedText>
                <LocalizedText style={styles.activeSummonMsg} numberOfLines={2}>
                  "{activeSummonForMe.message}"
                </LocalizedText>

                <View style={styles.activeSummonBtnRow}>
                  <TouchableOpacity
                    style={styles.activeSummonAckBtn}
                    scaleTo={0.94}
                    onPress={() => {
                      acknowledgeAlert(activeSummonForMe.id);
                      showToast(
                        "Acknowledged! Manager informed you're on the way.",
                        'success'
                      );
                    }}
                  >
                    <Icon name="navigation" size={13} color="#ffffff" style={{ marginRight: 5 }} />
                    <LocalizedText style={styles.activeSummonAckText}>
                      I'm On My Way
                    </LocalizedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.shiftCard}>
            <View>
              <LocalizedText style={styles.shiftLabel}>Today’s Shift Schedule</LocalizedText>
              <LocalizedText style={styles.shiftTime}>{currentEmployee.shift}</LocalizedText>
            </View>
            <View style={styles.shiftStatus}>
              <View style={styles.onlineDot} />
              <LocalizedText style={styles.onlineText}>On Duty</LocalizedText>
            </View>
          </View>
        </Animated.View>

        {/* ===== STATS ===== */}
        <AnimatedSectionWrapper animStyle={getSectionStyle(0)}>
          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
              <Animated.View
                key={stat.label}
                style={[styles.statBoxContainer, getStatCardStyle(idx)]}
              >
                <TouchableOpacity
                  style={styles.statBox}
                  scaleTo={0.92}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (stat.label === 'Bills Made' && permissions.billing.view) {
                      navigation.navigate('Billing');
                    } else if (permissions.orders.view) {
                      navigation.navigate('Fulfillment');
                    } else if (permissions.products.view) {
                      navigation.navigate('Products');
                    }
                  }}
                >
                  <LocalizedText style={styles.statNumber}>{stat.number}</LocalizedText>
                  <LocalizedText style={styles.statLabel}>{stat.label}</LocalizedText>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </AnimatedSectionWrapper>

        {/* ===== CORE EMPLOYEE POWERS GRID ===== */}
        <AnimatedSectionWrapper animStyle={getSectionStyle(1)}>
          <View style={styles.sectionHeader}>
            <LocalizedText style={styles.sectionTitle}>Store Floor Tools</LocalizedText>
          </View>

          <View style={styles.toolsGrid}>
            {/* Make Bill (POS) - Accessible if billing.view */}
            {permissions.billing.view && (
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: '#EAF5ED' }]}
                scaleTo={0.94}
                onPress={() => navigation.navigate('Billing')}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: '#258B3E' }]}>
                  <Icon name="file-text" size={20} color="#ffffff" />
                </View>
                <LocalizedText style={styles.toolTitle}>Make Bill (POS)</LocalizedText>
                <LocalizedText style={styles.toolSub}>Counter billing &amp; customer receipt</LocalizedText>
              </TouchableOpacity>
            )}

            {/* Manage Orders - Accessible if orders.view */}
            {permissions.orders.view && (
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: '#eff6ff' }]}
                scaleTo={0.94}
                onPress={() => navigation.navigate('Fulfillment')}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: '#2563eb' }]}>
                  <Icon name="package" size={20} color="#ffffff" />
                </View>
                <LocalizedText style={styles.toolTitle}>Manage Orders</LocalizedText>
                <LocalizedText style={styles.toolSub}>Picking &amp; packing queue</LocalizedText>
              </TouchableOpacity>
            )}

            {/* Store Products - Accessible if products.view */}
            {permissions.products.view && (
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: '#fffbeb' }]}
                scaleTo={0.94}
                onPress={() => navigation.navigate('Products')}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: '#d97706' }]}>
                  <Icon name="grid" size={20} color="#ffffff" />
                </View>
                <LocalizedText style={styles.toolTitle}>Store Products</LocalizedText>
                <LocalizedText style={styles.toolSub}>Shelf stock &amp; price updates</LocalizedText>
              </TouchableOpacity>
            )}

            {/* Scan Barcode - Accessible to all floor staff */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: '#f5f3ff' }]}
              scaleTo={0.94}
              onPress={() => navigation.navigate('ScanBarcode')}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: '#7c3aed' }]}>
                <Icon name="maximize" size={20} color="#ffffff" />
              </View>
              <LocalizedText style={styles.toolTitle}>Scan Barcode</LocalizedText>
              <LocalizedText style={styles.toolSub}>Instant price &amp; stock scanner</LocalizedText>
            </TouchableOpacity>

            {/* Staff Floor Chat - Accessible to all staff */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: '#eff6ff' }]}
              scaleTo={0.94}
              onPress={() => navigation.navigate('TeamChatList')}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: '#2563eb' }]}>
                <Icon name="message-circle" size={20} color="#ffffff" />
              </View>
              <LocalizedText style={styles.toolTitle}>Staff Floor Chat</LocalizedText>
              <LocalizedText style={styles.toolSub}>Live chat with team &amp; manager</LocalizedText>
            </TouchableOpacity>

            {/* Staff Work Analytics - Accessible to Store Manager */}
            {(currentEmployee.role === 'MANAGER' || permissions.staff.manage) && (
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: '#f0fdf4' }]}
                scaleTo={0.94}
                onPress={() => navigation.navigate('TeamAnalytics')}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: '#16a34a' }]}>
                  <Icon name="bar-chart-2" size={20} color="#ffffff" />
                </View>
                <LocalizedText style={styles.toolTitle}>Staff Analytics</LocalizedText>
                <LocalizedText style={styles.toolSub}>Floor work &amp; task history</LocalizedText>
              </TouchableOpacity>
            )}
          </View>
        </AnimatedSectionWrapper>

        {/* ===== STORE MANAGER FLOOR CONTROL & STAFF SUPERVISION ===== */}
        {(currentEmployee.role === 'MANAGER' || permissions.staff.manage) && (
          <AnimatedSectionWrapper animStyle={getSectionStyle(2)}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LocalizedText style={styles.sectionTitle}>
                  Floor Staff Supervision &amp; Output
                </LocalizedText>
                <Badge
                  label="4 on duty"
                  backgroundColor="#EAF5ED"
                  textColor="#258B3E"
                  size="sm"
                  style={{ marginLeft: 8 }}
                />
              </View>
              <TouchableOpacity
                scaleTo={0.92}
                onPress={() => navigation.navigate('TeamAnalytics')}
              >
                <LocalizedText style={styles.seeAllText}>Full Analytics &gt;</LocalizedText>
              </TouchableOpacity>
            </View>

            {/* Staff list cards */}
            {allStaff
              .filter((emp) => emp.id !== currentEmployee.id)
              .map((staff, idx) => {
                const info = STAFF_CURRENT_TASKS[staff.id] || {
                  currentTask: 'General Store Floor Operations',
                  currentZone: 'Store Floor',
                  tasksToday: 18,
                  hours: '04h 30m',
                  accuracy: '99.0%',
                };
                const isOnDuty = staff.status === 'Active';

                return (
                  <AnimatedEntranceView
                    key={staff.id}
                    delay={320 + idx * 50}
                    direction="up"
                    distance={16}
                  >
                    <View style={styles.managerStaffCard}>
                      {/* Top Header */}
                      <View style={styles.staffCardHeader}>
                        <Avatar
                          source={staff.avatarUrl}
                          role={staff.role}
                          permissions={staff.permissions}
                          size={42}
                          showStatus
                          status={isOnDuty ? 'online' : 'offline'}
                          style={styles.managerStaffAvatar}
                        />

                        <View style={styles.staffCardMain}>
                          <View style={styles.staffCardTitleRow}>
                            <LocalizedText style={styles.staffCardName}>{staff.name}</LocalizedText>
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
                          <View style={styles.staffLocationRow}>
                            <Icon name="map-pin" size={11} color="#15803d" style={{ marginRight: 4 }} />
                            <LocalizedText style={styles.staffLocationText}>
                              {info.currentZone}
                            </LocalizedText>
                          </View>
                        </View>
                      </View>

                      {/* Current Active Task Box */}
                      <View style={styles.currentTaskBox}>
                        <View style={styles.currentTaskTag}>
                          <View style={styles.pulsingGreenDot} />
                          <LocalizedText style={styles.currentTaskTagText}>
                            CURRENT ACTIVE TASK
                          </LocalizedText>
                        </View>
                        <LocalizedText style={styles.currentTaskDesc}>
                          {info.currentTask}
                        </LocalizedText>
                      </View>

                      {/* Metrics Line */}
                      <View style={styles.staffMetricsLine}>
                        <LocalizedText style={styles.staffMetricsText}>
                          Tasks Today:{' '}
                          <LocalizedText style={{ fontFamily: 'Poppins-Bold', color: '#111827' }}>
                            {info.tasksToday}
                          </LocalizedText>{' '}
                          • Shift:{' '}
                          <LocalizedText style={{ fontFamily: 'Poppins-Bold', color: '#111827' }}>
                            {info.hours}
                          </LocalizedText>{' '}
                          • Accuracy:{' '}
                          <LocalizedText style={{ fontFamily: 'Poppins-Bold', color: '#16a34a' }}>
                            {info.accuracy}
                          </LocalizedText>
                        </LocalizedText>
                      </View>

                      {/* Direct Store Manager Actions */}
                      <View style={styles.staffCardActions}>
                        {/* Notify */}
                        <TouchableOpacity
                          style={styles.staffActionNotifyBtn}
                          scaleTo={0.94}
                          onPress={() => {
                            sendCabinNotification(
                              staff.id,
                              'Manager Cabin #1',
                              `Store Manager summon: Please come to Cabin #1 when available.`
                            );
                            showToast(
                              `Notification sent to ${staff.name}: Report to Cabin #1`,
                              'success'
                            );
                          }}
                        >
                          <Icon name="message-square" size={13} color="#258B3E" style={{ marginRight: 5 }} />
                          <LocalizedText style={styles.staffActionNotifyText}>Notify</LocalizedText>
                        </TouchableOpacity>

                        {/* 20s Urgent Alert */}
                        <TouchableOpacity
                          style={styles.staffActionAlertBtn}
                          scaleTo={0.94}
                          onPress={() => {
                            ringEmployeePhone(
                              staff.id,
                              'Manager Cabin #1',
                              `Urgent floor summon for ${staff.name}. Please come to Manager Cabin #1 immediately.`
                            );
                            showToast(`🚨 Ringing ${staff.name}'s phone for 20 seconds!`, 'success');
                          }}
                        >
                          <Icon name="bell" size={13} color="#ffffff" style={{ marginRight: 5 }} />
                          <LocalizedText style={styles.staffActionAlertText}>
                            🚨 Ring (20s)
                          </LocalizedText>
                        </TouchableOpacity>

                        {/* Details */}
                        <TouchableOpacity
                          style={styles.staffActionDetailBtn}
                          scaleTo={0.94}
                          onPress={() =>
                            navigation.navigate('EmployeeDetail', { employeeId: staff.id })
                          }
                        >
                          <Icon name="eye" size={13} color="#4b5563" style={{ marginRight: 4 }} />
                          <LocalizedText style={styles.staffActionDetailText}>Details</LocalizedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </AnimatedEntranceView>
                );
              })}
          </AnimatedSectionWrapper>
        )}

        {/* ===== ACTIVE FULFILLMENT TASKS (Visible if orders.view) ===== */}
        {permissions.orders.view && (
          <AnimatedSectionWrapper animStyle={getSectionStyle(2)}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LocalizedText style={styles.sectionTitle}>Active Order Tasks</LocalizedText>
                <Badge
                  label="3 pending"
                  backgroundColor="#fef3c7"
                  textColor="#d97706"
                  size="sm"
                  style={{ marginLeft: 8 }}
                />
              </View>
              <TouchableOpacity
                scaleTo={0.92}
                onPress={() => navigation.navigate('Fulfillment')}
              >
                <LocalizedText style={styles.seeAllText}>Open Orders &gt;</LocalizedText>
              </TouchableOpacity>
            </View>

            {TASKS.map((task, idx) => (
              <AnimatedEntranceView
                key={task.id}
                delay={320 + idx * 60}
                direction="up"
                distance={16}
              >
                <TouchableOpacity
                  style={styles.taskCard}
                  activeOpacity={0.85}
                  scaleTo={0.96}
                  onPress={() => navigation.navigate('Fulfillment')}
                >
                  <Badge
                    label={task.type}
                    backgroundColor={task.type === 'Pick' ? '#dbeafe' : '#fef3c7'}
                    textColor={task.type === 'Pick' ? '#2563eb' : '#d97706'}
                    style={styles.taskType}
                  />

                  <View style={styles.taskInfo}>
                    <LocalizedText style={styles.taskOrder}>{task.orderId}</LocalizedText>
                    <LocalizedText style={styles.taskMeta}>
                      {task.items} items • {task.aisle} • {task.time} ago
                    </LocalizedText>
                  </View>

                  <View style={styles.taskRight}>
                    {task.priority === 'High' && (
                      <Badge
                        label="URGENT"
                        backgroundColor="#fee2e2"
                        textColor="#dc2626"
                        size="sm"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Icon name="chevron-right" size={18} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              </AnimatedEntranceView>
            ))}
          </AnimatedSectionWrapper>
        )}

        {/* ===== WALK-IN POS QUICK BANNER (Visible if billing.view) ===== */}
        {permissions.billing.view && (
          <AnimatedSectionWrapper animStyle={getSectionStyle(2)}>
            <View style={styles.posBanner}>
              <View style={styles.posBannerLeft}>
                <View style={styles.posBadge}>
                  <Icon name="zap" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.posBadgeText}>WALK-IN CHECKOUT</LocalizedText>
                </View>
                <LocalizedText style={styles.posTitle}>Need to make a bill?</LocalizedText>
                <LocalizedText style={styles.posSubtitle}>
                  Add items, accept Cash/UPI and generate bill receipts instantly.
                </LocalizedText>
              </View>

              <TouchableOpacity
                style={styles.posActionBtn}
                scaleTo={0.92}
                onPress={() => navigation.navigate('Billing')}
              >
                <Icon name="plus" size={15} color={colors.primary} style={{ marginRight: 4 }} />
                <LocalizedText style={styles.posActionBtnText}>New Bill</LocalizedText>
              </TouchableOpacity>
            </View>
          </AnimatedSectionWrapper>
        )}

        {/* ===== SHELF STOCK ALERT BANNER (Visible if products.view) ===== */}
        {permissions.products.view && (
          <AnimatedSectionWrapper animStyle={getSectionStyle(2)}>
            <View style={styles.inventoryBanner}>
              <View style={styles.inventoryBannerLeft}>
                <View style={styles.inventoryBadge}>
                  <Icon name="alert-triangle" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.inventoryBadgeText}>INVENTORY AUDIT</LocalizedText>
                </View>
                <LocalizedText style={styles.inventoryTitle}>6 Items Low on Shelf</LocalizedText>
                <LocalizedText style={styles.inventorySubtitle}>
                  Amul Butter and Fortune Oil need replenishment from store backroom.
                </LocalizedText>
              </View>

              <TouchableOpacity
                style={styles.inventoryActionBtn}
                scaleTo={0.92}
                onPress={() => navigation.navigate('Products')}
              >
                <Icon name="grid" size={14} color="#d97706" style={{ marginRight: 4 }} />
                <LocalizedText style={styles.inventoryActionBtnText}>Audit Stock</LocalizedText>
              </TouchableOpacity>
            </View>
          </AnimatedSectionWrapper>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* In-Store Staff Notifications & Summons Sheet */}
      {showNotifSheet && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNotifSheet(false)}
        >
          <View style={styles.notifSheetBackdrop}>
            <View style={[styles.notifSheetCard, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.notifSheetHeader}>
                <View style={styles.notifSheetIconWrap}>
                  <Icon name="bell" size={18} color="#258B3E" />
                </View>
                <View style={{ flex: 1 }}>
                  <LocalizedText style={styles.notifSheetTitle}>
                    In-Store Staff Notifications
                  </LocalizedText>
                  <LocalizedText style={styles.notifSheetSub}>
                    Cabin summons &amp; floor operational alerts
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.notifSheetCloseBtn}
                  scaleTo={0.9}
                  onPress={() => setShowNotifSheet(false)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {employeeAlerts.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <LocalizedText style={{ color: '#9ca3af', fontFamily: 'Poppins-Regular' }}>
                      No summons received today. All clear on your station!
                    </LocalizedText>
                  </View>
                ) : (
                  employeeAlerts.map((alert) => (
                    <View key={alert.id} style={styles.notifItemCard}>
                      <View style={styles.notifItemTop}>
                        <View style={styles.notifSenderRow}>
                          <Icon
                            name={alert.isUrgentRing ? 'alert-triangle' : 'bell'}
                            size={14}
                            color={alert.isUrgentRing ? '#dc2626' : '#258B3E'}
                            style={{ marginRight: 6 }}
                          />
                          <LocalizedText style={styles.notifSenderText}>
                            {alert.senderName} ({alert.senderRole})
                          </LocalizedText>
                        </View>
                        <Badge
                          label={
                            alert.status === 'ACKNOWLEDGED'
                              ? 'On The Way'
                              : alert.status === 'RINGING'
                              ? 'Ringing...'
                              : alert.status === 'DISMISSED'
                              ? 'Silenced'
                              : 'Pending'
                          }
                          backgroundColor={
                            alert.status === 'ACKNOWLEDGED'
                              ? '#EAF5ED'
                              : alert.status === 'RINGING'
                              ? '#fee2e2'
                              : '#f3f4f6'
                          }
                          textColor={
                            alert.status === 'ACKNOWLEDGED'
                              ? '#258B3E'
                              : alert.status === 'RINGING'
                              ? '#dc2626'
                              : '#6b7280'
                          }
                          size="sm"
                        />
                      </View>

                      <LocalizedText style={styles.notifItemLocation}>
                        📍 Destination: {alert.location}
                      </LocalizedText>

                      <LocalizedText style={styles.notifItemMsg}>
                        "{alert.message}"
                      </LocalizedText>

                      {alert.status !== 'ACKNOWLEDGED' && (
                        <TouchableOpacity
                          style={styles.notifItemAckBtn}
                          scaleTo={0.94}
                          onPress={() => {
                            acknowledgeAlert(alert.id);
                            showToast(
                              "Acknowledged! Manager informed you're on the way.",
                              'success'
                            );
                          }}
                        >
                          <Icon name="navigation" size={13} color="#ffffff" style={{ marginRight: 5 }} />
                          <LocalizedText style={styles.notifItemAckText}>
                            I'm On My Way
                          </LocalizedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: {
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#258B3E',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  name: {
    fontSize: 19,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginTop: 1,
  },
  roleHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleHeaderText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  storeSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  notifBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  shiftTime: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    marginTop: 2,
  },
  shiftStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  statBoxContainer: {
    flex: 1,
    height: 86,
  },
  statBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  toolCard: {
    width: '48.2%',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
  },
  toolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  toolSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 14,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 12,
  },
  taskInfo: { flex: 1 },
  taskOrder: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  taskMeta: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posBannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  posBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  posBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  posTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  posSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 15,
  },
  posActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  posActionBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  inventoryBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inventoryBannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  inventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d97706',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  inventoryBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  inventoryTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#92400e',
  },
  inventorySubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#b45309',
    marginTop: 2,
    lineHeight: 15,
  },
  inventoryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fcd34d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  inventoryActionBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#d97706',
  },

  // Store Manager Floor Supervision Styles
  managerStaffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e8edea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  managerStaffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  managerStaffAvatarText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  staffDutyDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  staffCardMain: {
    flex: 1,
  },
  staffCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  staffCardName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  staffLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffLocationText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#15803d',
  },
  currentTaskBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  currentTaskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  currentTaskTagText: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Bold',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  currentTaskDesc: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 16,
  },
  staffMetricsLine: {
    marginBottom: 10,
  },
  staffMetricsText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  staffCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  staffActionNotifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#258B3E',
    borderRadius: 10,
    paddingVertical: 8,
  },
  staffActionNotifyText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  staffActionAlertBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 8,
  },
  staffActionAlertText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  staffActionDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffActionDetailText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },

  /* Active Summon Banner */
  activeSummonBanner: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  activeSummonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeSummonTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeSummonTag: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Bold',
    color: '#dc2626',
    letterSpacing: 0.4,
  },
  activeSummonSender: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  activeSummonLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  activeSummonMsg: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    lineHeight: 16,
    marginBottom: 8,
  },
  activeSummonBtnRow: {
    alignItems: 'flex-start',
  },
  activeSummonAckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#258B3E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeSummonAckText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },

  /* Notifications Sheet Modal */
  notifSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  notifSheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  notifSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  notifSheetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notifSheetTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  notifSheetSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  notifSheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifItemCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notifItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifSenderText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  notifItemLocation: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
    marginBottom: 2,
  },
  notifItemMsg: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    lineHeight: 16,
    marginBottom: 8,
  },
  notifItemAckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#258B3E',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  notifItemAckText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default EmployeeHomeScreen;
