import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocalizedText from '../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../shared/components/AnimatedTouchableOpacity';
import AnimatedTabIcon from './AnimatedTabIcon';
import {
  Badge,
  AnimatedEntranceView,
  FilterTabs,
  Avatar,
  ListItem,
  Divider,
} from '../../shared/components/common';
import LogoutBottomSheet from '../../features/account/components/LogoutBottomSheet';
import { EmployeeHomeScreen } from '../../features/home';
import { StoreBillingScreen } from '../../features/billing';
import { StoreProductsScreen } from '../../features/inventory';
import { useStaffRole, TeamAnalyticsScreen } from '../../features/team';
import { colors } from '../../shared/theme/colors';

const Tab = createBottomTabNavigator();

/* -------------------------------------------------------------------------- */
/*                          IN-STORE FULFILLMENT TAB                          */
/* -------------------------------------------------------------------------- */

type FulfillmentStage = 'All' | 'To Pick' | 'Packing' | 'Ready for Rider';

interface InStoreOrder {
  id: string;
  orderId: string;
  stage: 'To Pick' | 'Packing' | 'Ready for Rider';
  itemsCount: number;
  aisle: string;
  priority: 'Urgent' | 'High' | 'Normal';
  timeAgo: string;
  targetMinutes: string;
  riderInfo?: string;
}

const IN_STORE_ORDERS: InStoreOrder[] = [
  {
    id: '1',
    orderId: 'TK-1024',
    stage: 'To Pick',
    itemsCount: 8,
    aisle: 'Aisle 2 • Dairy & Bakery',
    priority: 'Urgent',
    timeAgo: '2m ago',
    targetMinutes: '4 mins target',
  },
  {
    id: '2',
    orderId: 'TK-1021',
    stage: 'To Pick',
    itemsCount: 5,
    aisle: 'Aisle 1 • Fresh Veggies',
    priority: 'High',
    timeAgo: '5m ago',
    targetMinutes: '6 mins target',
  },
  {
    id: '3',
    orderId: 'TK-1019',
    stage: 'Packing',
    itemsCount: 12,
    aisle: 'Packing Station #2',
    priority: 'High',
    timeAgo: '8m ago',
    targetMinutes: '3 mins target',
  },
  {
    id: '4',
    orderId: 'TK-1015',
    stage: 'Ready for Rider',
    itemsCount: 6,
    aisle: 'Staging Counter Bay #4',
    priority: 'Normal',
    timeAgo: '12m ago',
    targetMinutes: 'Bag #B-42 sealed',
    riderInfo: 'Blinkit Rider #BL-89 arriving in 2 mins',
  },
  {
    id: '5',
    orderId: 'TK-1012',
    stage: 'Ready for Rider',
    itemsCount: 4,
    aisle: 'Staging Counter Bay #1',
    priority: 'Normal',
    timeAgo: '15m ago',
    targetMinutes: 'Bag #B-38 sealed',
    riderInfo: 'Zomato Rider #ZM-14 assigned',
  },
];

const InStoreFulfillmentScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { permissions } = currentEmployee;

  const [activeStage, setActiveStage] = useState<FulfillmentStage>('All');
  const [orders, setOrders] = useState<InStoreOrder[]>(IN_STORE_ORDERS);

  const filteredOrders =
    activeStage === 'All'
      ? orders
      : orders.filter((o) => o.stage === activeStage);

  const handleAdvanceStage = (orderId: string) => {
    const current = orders.find((o) => o.orderId === orderId);
    if (!current) return;

    if (current.stage === 'To Pick' && !permissions.orders.create) {
      Alert.alert('Permission Restricted', 'You do not have permission to pick or pack orders.');
      return;
    }

    if (current.stage === 'Packing' && !permissions.orders.update) {
      Alert.alert('Permission Restricted', 'You do not have permission to dispatch orders to riders.');
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          if (o.stage === 'To Pick') return { ...o, stage: 'Packing', aisle: 'Packing Station #1' };
          if (o.stage === 'Packing') return { ...o, stage: 'Ready for Rider', aisle: 'Staging Bay #2', riderInfo: 'Delivery Rider notified' };
        }
        return o;
      })
    );
  };

  if (!permissions.orders.view) {
    return (
      <View style={[styles.screenRoot, styles.restrictedContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.restrictedCard}>
          <View style={styles.restrictedIconWrap}>
            <Icon name="lock" size={32} color="#9ca3af" />
          </View>
          <LocalizedText style={styles.restrictedTitle}>Order Fulfillment Restricted</LocalizedText>
          <LocalizedText style={styles.restrictedSub}>
            Your staff account ({currentEmployee.roleTitle}) does not have permission to view or fulfill online orders. Contact the store owner to request orders access.
          </LocalizedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screenRoot, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.screenHeader}>
        <View>
          <LocalizedText style={styles.screenHeaderTitle}>Store Fulfillment</LocalizedText>
          <LocalizedText style={styles.screenHeaderSubtitle}>
            Pick, pack &amp; stage orders for delivery boys
          </LocalizedText>
        </View>
        <TouchableOpacity
          style={styles.scanBtn}
          scaleTo={0.88}
          onPress={() => navigation.navigate('ScanBarcode')}
        >
          <Icon name="maximize" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrap}>
        <FilterTabs<FulfillmentStage>
          filters={[
            { key: 'All', label: 'All Orders' },
            { key: 'To Pick', label: 'To Pick' },
            { key: 'Packing', label: 'Packing' },
            { key: 'Ready for Rider', label: 'Ready for Rider' },
          ]}
          active={activeStage}
          onChange={(stage) => setActiveStage(stage)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 20 }]}
      >
        {filteredOrders.map((order, idx) => {
          const isToPick = order.stage === 'To Pick';
          const isPacking = order.stage === 'Packing';
          const isReady = order.stage === 'Ready for Rider';

          return (
            <AnimatedEntranceView
              key={order.id}
              delay={40 + idx * 60}
              direction="up"
              distance={14}
            >
              <View style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.orderIdGroup}>
                    <LocalizedText style={styles.orderIdText}>#{order.orderId}</LocalizedText>
                    <Badge
                      label={order.stage}
                      backgroundColor={
                        isToPick
                          ? '#e0f2fe'
                          : isPacking
                          ? '#fef3c7'
                          : colors.primaryLight
                      }
                      textColor={
                        isToPick
                          ? '#0284c7'
                          : isPacking
                          ? '#d97706'
                          : colors.primaryDark
                      }
                      size="sm"
                      style={{ marginLeft: 8 }}
                    />
                  </View>

                  {order.priority === 'Urgent' && (
                    <Badge label="URGENT" backgroundColor="#fee2e2" textColor="#dc2626" size="sm" />
                  )}
                </View>

                {/* Items & Location */}
                <View style={styles.orderMetaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="package" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <LocalizedText style={styles.metaText}>{order.itemsCount} items to verify</LocalizedText>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="map-pin" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <LocalizedText style={styles.metaText}>{order.aisle}</LocalizedText>
                  </View>
                </View>

                {/* Target Time / Rider Info */}
                <View style={styles.orderFooterRow}>
                  <View style={styles.timerWrap}>
                    <Icon
                      name={isReady ? 'truck' : 'clock'}
                      size={13}
                      color={isReady ? colors.primary : colors.warning}
                      style={{ marginRight: 5 }}
                    />
                    <LocalizedText
                      style={[
                        styles.timerText,
                        isReady && { color: colors.primaryDark, fontFamily: 'Poppins-Medium' },
                      ]}
                    >
                      {order.riderInfo || order.targetMinutes}
                    </LocalizedText>
                  </View>

                  {/* Advance Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionStepBtn,
                      isReady && styles.actionStepBtnReady,
                    ]}
                    scaleTo={0.92}
                    onPress={() => handleAdvanceStage(order.orderId)}
                  >
                    <Icon
                      name={isToPick ? 'check-square' : isPacking ? 'archive' : 'check'}
                      size={13}
                      color="#ffffff"
                      style={{ marginRight: 5 }}
                    />
                    <LocalizedText style={styles.actionStepBtnText}>
                      {isToPick ? 'Start Pick' : isPacking ? 'Mark Packed' : 'Rider Handover'}
                    </LocalizedText>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedEntranceView>
          );
        })}
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                       IN-STORE EMPLOYEE PROFILE TAB                        */
/* -------------------------------------------------------------------------- */

const StoreEmployeeProfileScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [showLogout, setShowLogout] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { currentEmployee, allStaff, switchEmployee, pendingLeaveCount } = useStaffRole();

  const handleLogout = () => {
    setShowLogout(false);
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const isStoreManager =
    currentEmployee.role === 'MANAGER' || currentEmployee.permissions.staff.manage;

  const PROFILE_OPTIONS = [
    ...(isStoreManager
      ? [
          {
            id: 'staff_analytics',
            title: 'Staff Work Analytics & Tasks',
            subtitle: 'Live staff metrics, tasks done, speed & accuracy',
            icon: 'bar-chart-2',
            color: '#258B3E',
            onPress: () => navigation.navigate('TeamAnalytics'),
          },
          {
            id: 'team_roster',
            title: 'Store Team Roster & Permissions',
            subtitle: 'Manage in-store employees and CRUD access roles',
            icon: 'users',
            color: '#0891b2',
            onPress: () => navigation.navigate('TeamManagement'),
          },
          {
            id: 'staff_leaves',
            title: 'Staff Leave Applications',
            subtitle:
              pendingLeaveCount > 0
                ? `${pendingLeaveCount} pending leave request${pendingLeaveCount > 1 ? 's' : ''}`
                : 'Review, approve, or reject employee leave requests',
            icon: 'calendar',
            color: '#d97706',
            badge: pendingLeaveCount > 0 ? `${pendingLeaveCount}` : undefined,
            onPress: () => navigation.navigate('EmployeeShiftAttendance'),
          },
        ]
      : []),
    {
      id: 'staff_chat',
      title: 'Store Floor Chat & Intercom',
      subtitle: 'Real-time messaging with manager and floor staff',
      icon: 'message-circle',
      color: '#2563eb',
      onPress: () => navigation.navigate('TeamChatList'),
    },
    {
      id: 'shift',
      title: 'My Shift & Attendance',
      subtitle: 'Clock in/out, weekly schedule & leave application',
      icon: 'calendar',
      color: '#0891b2',
      onPress: () => navigation.navigate('EmployeeShiftAttendance'),
    },
    {
      id: 'tasks',
      title: 'Shift Tasks & Activity Log',
      subtitle: 'Timeline of picked orders, bills & restocking',
      icon: 'activity',
      color: '#2563eb',
      onPress: () => navigation.navigate('EmployeeTasksActivity'),
    },
    {
      id: 'permissions',
      title: 'My Role & CRUD Access',
      subtitle: 'View allowed actions and request access elevation',
      icon: 'shield',
      color: '#258B3E',
      onPress: () => navigation.navigate('EmployeePermissionsGuide'),
    },
    ...(currentEmployee.permissions.billing.view
      ? [
          {
            id: 'billing',
            title: 'POS Billing Counter',
            subtitle: 'Create customer walk-in bills and receipts',
            icon: 'file-text',
            color: '#258B3E',
            onPress: () => navigation.navigate('Billing'),
          },
        ]
      : []),
    ...(currentEmployee.permissions.products.view
      ? [
          {
            id: 'products',
            title: 'Store Products & Shelf Stock',
            subtitle: 'Manage inventory, prices and shelf aisles',
            icon: 'grid',
            color: '#d97706',
            onPress: () => navigation.navigate('Products'),
          },
        ]
      : []),
    {
      id: 'scanner',
      title: 'Barcode Price Scanner',
      subtitle: 'Scan barcodes for instant MRP, store price & shelf stock',
      icon: 'maximize',
      color: '#7c3aed',
      onPress: () => navigation.navigate('ScanBarcode'),
    },
    {
      id: 'notice_board',
      title: 'Store Notice Board',
      subtitle: 'Daily store announcements, incentives & star staff',
      icon: 'bookmark',
      color: '#d97706',
      onPress: () => navigation.navigate('EmployeeNoticeBoard'),
    },
    {
      id: 'guidelines',
      title: 'In-Store SOP & Safety Rules',
      subtitle: 'Packing, cold-chain & hygiene standards',
      icon: 'book-open',
      color: '#059669',
      onPress: () => navigation.navigate('EmployeeGuidelinesSOP'),
    },
    {
      id: 'manager',
      title: 'Store Vendor & Cabin Intercom',
      subtitle: 'Rajesh Kumar • Call owner or page manager cabin',
      icon: 'phone',
      color: '#0891b2',
      onPress: () => navigation.navigate('StoreVendorContact'),
    },
    {
      id: 'preferences',
      title: 'App & Scanner Preferences',
      subtitle: 'Haptics, buzzer volume, multi-scan & languages',
      icon: 'sliders',
      color: '#475569',
      onPress: () => navigation.navigate('EmployeeAppPreferences'),
    },
    {
      id: 'help',
      title: 'Help & Staff Support',
      subtitle: 'Report an in-store application issue',
      icon: 'help-circle',
      color: '#2563eb',
      onPress: () => navigation.navigate('HelpScreen'),
    },
  ];

  return (
    <View style={[styles.screenRoot, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.screenHeader}>
        <LocalizedText style={styles.screenHeaderTitle}>Store Staff Profile</LocalizedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* Profile Hero Card */}
        <AnimatedEntranceView delay={40} direction="up" distance={16}>
          <View style={styles.empHeroCard}>
            <View style={styles.empAvatarRow}>
              <Avatar
                source={currentEmployee.avatarUrl}
                role={currentEmployee.role}
                permissions={currentEmployee.permissions}
                size={56}
                style={styles.empAvatar}
              />

              <View style={styles.empInfoCol}>
                <LocalizedText style={styles.empName}>{currentEmployee.name}</LocalizedText>
                <View style={styles.empRolePill}>
                  <Icon name="shield" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                  <LocalizedText style={styles.empRoleText}>{currentEmployee.roleTitle}</LocalizedText>
                </View>
                <LocalizedText style={styles.empStoreText}>Green Basket Kirana (#TK-VB-8821)</LocalizedText>
              </View>
            </View>

            {/* Shift Pill */}
            <TouchableOpacity
              style={styles.shiftBanner}
              scaleTo={0.96}
              onPress={() => navigation.navigate('EmployeeShiftAttendance')}
            >
              <Icon name="clock" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <LocalizedText style={styles.shiftBannerText}>{currentEmployee.shift}</LocalizedText>
              <View style={styles.onDutyTag}>
                <View style={styles.onDutyDot} />
                <LocalizedText style={styles.onDutyText}>On Duty</LocalizedText>
              </View>
            </TouchableOpacity>

            {/* Metrics */}
            <TouchableOpacity
              style={styles.metricsRow}
              scaleTo={0.97}
              onPress={() => navigation.navigate('EmployeeTasksActivity')}
            >
              <View style={styles.metricCol}>
                <LocalizedText style={styles.metricVal}>
                  {currentEmployee.permissions.canManageOrders ? '14' : '—'}
                </LocalizedText>
                <LocalizedText style={styles.metricLabel}>Tasks Picked</LocalizedText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <LocalizedText style={styles.metricVal}>
                  {currentEmployee.permissions.canCreateBills ? '18' : '—'}
                </LocalizedText>
                <LocalizedText style={styles.metricLabel}>Bills Made</LocalizedText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <LocalizedText style={styles.metricVal}>99.2%</LocalizedText>
                <LocalizedText style={styles.metricLabel}>Accuracy</LocalizedText>
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedEntranceView>

        {/* Assigned Permissions Card */}
        <AnimatedEntranceView delay={80} direction="up" distance={16}>
          <TouchableOpacity
            style={styles.permissionsCard}
            scaleTo={0.98}
            onPress={() => navigation.navigate('EmployeePermissionsGuide')}
          >
            <View style={styles.permissionsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="shield" size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <LocalizedText style={styles.permissionsHeaderTitle}>
                  Vendor-Assigned CRUD Permissions
                </LocalizedText>
              </View>
              <Icon name="chevron-right" size={16} color="#9ca3af" />
            </View>

            {/* Products CRUD */}
            <View style={styles.crudSection}>
              <View style={styles.crudSectionTitleRow}>
                <Icon name="grid" size={13} color="#d97706" style={{ marginRight: 5 }} />
                <LocalizedText style={styles.crudSectionName}>Products &amp; Inventory</LocalizedText>
              </View>
              <View style={styles.crudPillsRow}>
                <View style={[styles.crudPill, currentEmployee.permissions.products.view && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.products.view && styles.crudPillTextActive]}>
                    View {currentEmployee.permissions.products.view ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.products.create && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.products.create && styles.crudPillTextActive]}>
                    Add {currentEmployee.permissions.products.create ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.products.update && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.products.update && styles.crudPillTextActive]}>
                    Edit {currentEmployee.permissions.products.update ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.products.delete && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.products.delete && styles.crudPillTextActive]}>
                    Delete {currentEmployee.permissions.products.delete ? '✔' : '✕'}
                  </LocalizedText>
                </View>
              </View>
            </View>

            <View style={styles.permItemDivider} />

            {/* Billing CRUD */}
            <View style={styles.crudSection}>
              <View style={styles.crudSectionTitleRow}>
                <Icon name="file-text" size={13} color={colors.primary} style={{ marginRight: 5 }} />
                <LocalizedText style={styles.crudSectionName}>POS Walk-in Billing</LocalizedText>
              </View>
              <View style={styles.crudPillsRow}>
                <View style={[styles.crudPill, currentEmployee.permissions.billing.view && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.billing.view && styles.crudPillTextActive]}>
                    View {currentEmployee.permissions.billing.view ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.billing.create && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.billing.create && styles.crudPillTextActive]}>
                    Create {currentEmployee.permissions.billing.create ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.billing.update && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.billing.update && styles.crudPillTextActive]}>
                    Edit Cart {currentEmployee.permissions.billing.update ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.billing.delete && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.billing.delete && styles.crudPillTextActive]}>
                    Void {currentEmployee.permissions.billing.delete ? '✔' : '✕'}
                  </LocalizedText>
                </View>
              </View>
            </View>

            <View style={styles.permItemDivider} />

            {/* Orders CRUD */}
            <View style={styles.crudSection}>
              <View style={styles.crudSectionTitleRow}>
                <Icon name="package" size={13} color="#2563eb" style={{ marginRight: 5 }} />
                <LocalizedText style={styles.crudSectionName}>Online Orders Fulfillment</LocalizedText>
              </View>
              <View style={styles.crudPillsRow}>
                <View style={[styles.crudPill, currentEmployee.permissions.orders.view && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.orders.view && styles.crudPillTextActive]}>
                    View {currentEmployee.permissions.orders.view ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.orders.create && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.orders.create && styles.crudPillTextActive]}>
                    Pick/Pack {currentEmployee.permissions.orders.create ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.orders.update && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.orders.update && styles.crudPillTextActive]}>
                    Handover {currentEmployee.permissions.orders.update ? '✔' : '✕'}
                  </LocalizedText>
                </View>
                <View style={[styles.crudPill, currentEmployee.permissions.orders.delete && styles.crudPillActive]}>
                  <LocalizedText style={[styles.crudPillText, currentEmployee.permissions.orders.delete && styles.crudPillTextActive]}>
                    Cancel {currentEmployee.permissions.orders.delete ? '✔' : '✕'}
                  </LocalizedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedEntranceView>

        {/* Switch Persona / Test Staff Roles */}
        <AnimatedEntranceView delay={120} direction="up" distance={16}>
          <TouchableOpacity
            style={styles.switchRoleCard}
            scaleTo={0.97}
            onPress={() => setShowRoleModal(true)}
          >
            <View style={styles.switchRoleIcon}>
              <Icon name="refresh-cw" size={18} color="#258B3E" />
            </View>
            <View style={styles.switchRoleTexts}>
              <LocalizedText style={styles.switchRoleTitle}>Switch Active Staff Role</LocalizedText>
              <LocalizedText style={styles.switchRoleSubtitle}>
                Testing as: {currentEmployee.roleTitle} ({currentEmployee.name})
              </LocalizedText>
            </View>
            <Icon name="chevron-right" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </AnimatedEntranceView>

        {/* Options List */}
        <AnimatedEntranceView delay={160} direction="up" distance={16}>
          <View style={styles.card}>
            {PROFILE_OPTIONS.map((item, idx) => (
              <React.Fragment key={item.id}>
                <ListItem
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  iconColor={item.color}
                  iconBgColor={`${item.color}15`}
                  badge={item.badge}
                  onPress={item.onPress}
                />
                {idx < PROFILE_OPTIONS.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </View>
        </AnimatedEntranceView>

        {/* Logout */}
        <AnimatedEntranceView delay={200} direction="up" distance={16}>
          <TouchableOpacity
            style={styles.empLogoutBtn}
            scaleTo={0.96}
            onPress={() => setShowLogout(true)}
          >
            <Icon name="log-out" size={17} color={colors.danger} style={{ marginRight: 8 }} />
            <LocalizedText style={styles.empLogoutText}>Logout Employee Shift</LocalizedText>
          </TouchableOpacity>
        </AnimatedEntranceView>
      </ScrollView>

      {/* Switch Role Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <LocalizedText style={styles.modalTitle}>Switch Staff Persona</LocalizedText>
                <LocalizedText style={styles.modalSubtitle}>
                  Select an employee to simulate their floor access &amp; permissions:
                </LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                scaleTo={0.9}
                onPress={() => setShowRoleModal(false)}
              >
                <Icon name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {allStaff.map((staff) => {
                const isSelected = staff.id === currentEmployee.id;
                return (
                  <TouchableOpacity
                    key={staff.id}
                    style={[
                      styles.staffSelectRow,
                      isSelected && styles.staffSelectRowActive,
                    ]}
                    scaleTo={0.98}
                    onPress={() => {
                      switchEmployee(staff.id);
                      setShowRoleModal(false);
                    }}
                  >
                    <Avatar
                      source={staff.avatarUrl}
                      role={staff.role}
                      permissions={staff.permissions}
                      size={42}
                      style={styles.staffSelectAvatar}
                    />

                    <View style={styles.staffSelectInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <LocalizedText style={styles.staffSelectName}>{staff.name}</LocalizedText>
                        {isSelected && (
                          <Badge
                            label="ACTIVE"
                            backgroundColor="#EAF5ED"
                            textColor="#258B3E"
                            size="sm"
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>
                      <LocalizedText style={styles.staffSelectRole}>
                        {staff.roleTitle}
                      </LocalizedText>
                      <LocalizedText style={styles.staffSelectPerms}>
                        {staff.role === 'CUSTOM' || staff.isCustomRole
                          ? `Custom CRUD Permissions • ${staff.roleTitle}`
                          : staff.role === 'MANAGER'
                          ? 'Full CRUD (Orders, Bills, Stock)'
                          : staff.role === 'BILLER'
                          ? 'Walk-in Bills & POS Counter Only'
                          : staff.role === 'ORDERS'
                          ? 'Online Order Fulfillment Only'
                          : 'Inventory & Shelf Stock Only'}
                      </LocalizedText>
                    </View>

                    <Icon
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={18}
                      color={isSelected ? '#258B3E' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LogoutBottomSheet
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                         MAIN IN-STORE NAVIGATOR                            */
/* -------------------------------------------------------------------------- */

const CustomTabBarButton = ({ children, onPress, accessibilityState }: any) => {
  const isSelected = accessibilityState?.selected;
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.tabIconContainer}>
        {isSelected && (
          <View style={styles.activeGlowContainer}>
            <View style={styles.activeGlow} />
          </View>
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
};

export const DeliveryNavigation = () => {
  const { currentEmployee } = useStaffRole();
  const { permissions } = currentEmployee;
  const isStoreManager = currentEmployee.role === 'MANAGER' || permissions.staff.manage;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => {
          let iconName: React.ComponentProps<typeof Icon>['name'] = 'home';
          if (route.name === 'StoreHome') iconName = 'home';
          else if (route.name === 'Fulfillment') iconName = 'package';
          else if (route.name === 'Billing') iconName = 'file-text';
          else if (route.name === 'Products') iconName = 'grid';
          else if (route.name === 'StaffAnalytics') iconName = 'bar-chart-2';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <AnimatedTabIcon
              name={iconName}
              size={22}
              color={focused ? colors.primary : '#1a1a1a'}
              focused={focused}
            />
          );
        },
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 240 },
        },
      })}
    >
      <Tab.Screen name="StoreHome" component={EmployeeHomeScreen} />
      {permissions.orders.view && (
        <Tab.Screen name="Fulfillment" component={InStoreFulfillmentScreen} />
      )}
      {permissions.billing.view && (
        <Tab.Screen name="Billing">
          {(props) => <StoreBillingScreen {...props} isTab={true} />}
        </Tab.Screen>
      )}
      {permissions.products.view && (
        <Tab.Screen name="Products">
          {(props) => <StoreProductsScreen {...props} isTab={true} />}
        </Tab.Screen>
      )}
      {isStoreManager && (
        <Tab.Screen name="StaffAnalytics" component={TeamAnalyticsScreen} />
      )}
      <Tab.Screen name="Profile" component={StoreEmployeeProfileScreen} />
    </Tab.Navigator>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  screenHeaderSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Order Card
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8edea',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textSecondary,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  timerText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  actionStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  actionStepBtnReady: {
    backgroundColor: '#059669',
  },
  actionStepBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },

  // Employee Hero
  empHeroCard: {
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
  },
  empAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  empAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  empAvatarText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  empInfoCol: {
    flex: 1,
  },
  empName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  empRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginVertical: 3,
  },
  empRoleText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryDark,
  },
  empStoreText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
  },
  shiftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#edf2ee',
    marginBottom: 12,
  },
  shiftBannerText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
    flex: 1,
  },
  onDutyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 139, 62, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  onDutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 4,
  },
  onDutyText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryDark,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textMuted,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#e5e7eb',
  },

  // Options Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
    overflow: 'hidden',
  },

  // Permissions Card
  permissionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    padding: 14,
    marginBottom: 14,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionsHeaderTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  crudSection: {
    paddingVertical: 6,
  },
  crudSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  crudSectionName: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  crudPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  crudPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  crudPillActive: {
    backgroundColor: '#EAF5ED',
    borderColor: 'rgba(37, 139, 62, 0.3)',
  },
  crudPillText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
  },
  crudPillTextActive: {
    color: '#258B3E',
    fontFamily: 'Poppins-Bold',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  permLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permName: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  permItemDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },

  // Restricted Access View
  restrictedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restrictedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restrictedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  restrictedSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },

  // Switch Role Card
  switchRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 139, 62, 0.25)',
    padding: 14,
    marginBottom: 14,
  },
  switchRoleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchRoleTexts: {
    flex: 1,
  },
  switchRoleTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1A632C',
  },
  switchRoleSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#258B3E',
    marginTop: 1,
  },

  // Switch Role Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: '90%',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  staffSelectRowActive: {
    borderColor: '#258B3E',
    backgroundColor: '#EAF5ED',
  },
  staffSelectAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffSelectAvatarText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  staffSelectInfo: {
    flex: 1,
    marginRight: 8,
  },
  staffSelectName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  staffSelectRole: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
    marginTop: 1,
  },
  staffSelectPerms: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTexts: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 62,
  },
  empLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  empLogoutText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.danger,
  },

  // Tab bar
  tabBar: {
    backgroundColor: '#ffffff',
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  activeGlowContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? -25 : -15,
    width: 60,
    height: 40,
    alignItems: 'center',
  },
  activeGlow: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});

export default DeliveryNavigation;
