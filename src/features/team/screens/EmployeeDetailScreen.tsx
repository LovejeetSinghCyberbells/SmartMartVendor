import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader, Badge, Avatar, Chip } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import RoleBadge from '../components/RoleBadge';
import {
  useStaffRole,
  EmployeeRole,
  ROLE_PERMISSIONS,
  EmployeePermissions,
  createPermissions,
} from '../context/StaffRoleContext';
import { useFloorPager } from '../context/FloorPagerContext';
import { useStaffChat } from '../context/StaffChatContext';
import { colors } from '../../../shared/theme/colors';

const CABIN_LOCATIONS = [
  'Manager Cabin #1',
  'Main Office',
  'Billing Counter',
  'Stock Warehouse',
];

const QUICK_MESSAGES = [
  'Please come to the cabin immediately.',
  'Need assistance at checkout counter.',
  'Aisle inventory check required.',
  'Shift briefing in office.',
];

const ROLE_OPTIONS: { key: EmployeeRole; title: string }[] = [
  { key: 'MANAGER', title: 'Store Manager' },
  { key: 'BILLER', title: 'Biller / Cashier' },
  { key: 'ORDERS', title: 'Online Orders Specialist' },
  { key: 'INVENTORY', title: 'Inventory Manager' },
  { key: 'CUSTOM', title: 'Custom Role' },
];

const EmployeeDetailScreen = ({ route, navigation }: any) => {
  const { employeeId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { showConfirm, showToast } = useFeedback();
  const { allStaff, updateEmployeePermissions } = useStaffRole();
  const { openDirectChatWithStaff } = useStaffChat();
  const {
    ringEmployeePhone,
    sendCabinNotification,
    activeOutgoingCall,
    cancelOutgoingCall,
    recentAlerts,
  } = useFloorPager();

  const currentEmp = allStaff.find((e) => e.id === employeeId) || allStaff[0];

  const [role, setRole] = useState<EmployeeRole>(currentEmp.role);
  const [customRoleTitle, setCustomRoleTitle] = useState(
    currentEmp.isCustomRole ? currentEmp.roleTitle : ''
  );
  const [permissions, setPermissions] = useState<EmployeePermissions>(
    currentEmp.permissions
  );

  // Floor pager summon controls
  const [selectedLocation, setSelectedLocation] = useState('Manager Cabin #1');
  const [summonMessage, setSummonMessage] = useState(
    'Please come to Manager Cabin #1 immediately.'
  );

  const isCallingThisEmployee =
    activeOutgoingCall &&
    activeOutgoingCall.status === 'RINGING' &&
    activeOutgoingCall.targetEmployeeId === currentEmp.id;

  const employeeAlertHistory = recentAlerts.filter(
    (a) => a.targetEmployeeId === currentEmp.id
  );

  const handleSendNotification = () => {
    sendCabinNotification(currentEmp.id, selectedLocation, summonMessage);
    showToast(`In-store notification sent to ${currentEmp.name}`, 'info');
  };

  const handleRingPhone = () => {
    ringEmployeePhone(currentEmp.id, selectedLocation, summonMessage);
    showToast(`🚨 Ringing ${currentEmp.name}'s phone for 20 seconds!`, 'success');
  };

  const handleSelectRolePreset = (newRole: EmployeeRole) => {
    setRole(newRole);
    if (newRole !== 'CUSTOM') {
      const presetPerms = ROLE_PERMISSIONS[newRole];
      setPermissions(presetPerms);
      updateEmployeePermissions(currentEmp.id, presetPerms, newRole);
      showToast(`Role changed to ${newRole}`, 'info');
    } else {
      if (!customRoleTitle) setCustomRoleTitle(currentEmp.roleTitle || 'Custom Role');
      updateEmployeePermissions(currentEmp.id, permissions, 'CUSTOM', customRoleTitle || 'Custom Role');
    }
  };

  const handleToggleCrud = (
    moduleKey: 'products' | 'billing' | 'orders' | 'staff',
    crudKey: string
  ) => {
    const moduleObj = { ...(permissions[moduleKey] as any) };
    moduleObj[crudKey] = !moduleObj[crudKey];

    const updated = createPermissions({
      products: moduleKey === 'products' ? moduleObj : permissions.products,
      billing: moduleKey === 'billing' ? moduleObj : permissions.billing,
      orders: moduleKey === 'orders' ? moduleObj : permissions.orders,
      staff: moduleKey === 'staff' ? moduleObj : permissions.staff,
    });

    setPermissions(updated);

    // If changing individual permission, set to CUSTOM role if not already
    const effectiveRole = role === 'CUSTOM' ? 'CUSTOM' : 'CUSTOM';
    const effectiveTitle = customRoleTitle || `${currentEmp.roleTitle} (Customized)`;
    if (role !== 'CUSTOM') {
      setRole('CUSTOM');
      setCustomRoleTitle(effectiveTitle);
    }

    updateEmployeePermissions(currentEmp.id, updated, effectiveRole, effectiveTitle);
    showToast('Permission updated in real time', 'success');
  };

  const handleUpdateCustomTitle = (text: string) => {
    setCustomRoleTitle(text);
    if (role === 'CUSTOM') {
      updateEmployeePermissions(currentEmp.id, permissions, 'CUSTOM', text);
    }
  };

  const handleRemove = () => {
    showConfirm({
      title: 'Remove Staff Member',
      message: `Are you sure you want to remove ${currentEmp.name}? This employee will immediately lose in-store app access.`,
      type: 'destructive',
      confirmText: 'Remove Staff',
      cancelText: 'Cancel',
      onConfirm: () => {
        showToast('Staff member removed successfully', 'info');
        navigation.goBack();
      },
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Staff & Permissions"
        onBack={() => navigation.goBack()}
        showBorder={false}
        rightElement={
          <TouchableOpacity
            style={styles.headerChatBtn}
            scaleTo={0.88}
            onPress={() => {
              const convId = openDirectChatWithStaff(currentEmp.id);
              navigation.navigate('TeamChatConversation', { conversationId: convId });
            }}
            accessibilityLabel="Chat with Employee"
          >
            <Icon name="message-circle" size={19} color="#258B3E" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            source={currentEmp.avatarUrl}
            role={currentEmp.role}
            permissions={currentEmp.permissions}
            size={72}
            style={styles.avatarLarge}
          />
          <LocalizedText style={styles.name}>{currentEmp.name}</LocalizedText>
          <View style={{ marginTop: 6, marginBottom: 8 }}>
            <RoleBadge
              role={
                currentEmp.role === 'MANAGER'
                  ? 'Manager'
                  : currentEmp.role === 'BILLER'
                  ? 'Biller'
                  : currentEmp.role === 'ORDERS'
                  ? 'Online Orders'
                  : currentEmp.role === 'INVENTORY'
                  ? 'Inventory'
                  : 'Custom'
              }
              customLabel={currentEmp.roleTitle}
            />
          </View>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <LocalizedText style={styles.statusText}>{currentEmp.status}</LocalizedText>
          </View>
        </View>

        {/* ================= WORK ANALYSIS & TODAY'S TASKS ================= */}
        <View style={styles.card}>
          <View style={styles.workAnalysisHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Icon name="activity" size={17} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.workAnalysisTitle}>
                Today's Work Analysis &amp; Tasks
              </LocalizedText>
              <LocalizedText style={styles.workAnalysisSub}>
                Real-time shift output logged on shop floor
              </LocalizedText>
            </View>
            <Badge
              label="Live Shift"
              backgroundColor="#EAF5ED"
              textColor="#258B3E"
              size="sm"
            />
          </View>

          {/* Current Active Task */}
          <View style={styles.activeTaskBox}>
            <View style={styles.activeTaskHeaderRow}>
              <View style={styles.livePulseDot} />
              <LocalizedText style={styles.activeTaskHeading}>
                CURRENT ACTIVE TASK
              </LocalizedText>
            </View>
            <LocalizedText style={styles.activeTaskName}>
              {currentEmp.role === 'BILLER'
                ? 'Scanning at POS Terminal #1 (Walk-in Cart)'
                : currentEmp.role === 'ORDERS'
                ? 'Picking 8 items for Blinkit #TK-1024 (Aisle 2)'
                : currentEmp.role === 'INVENTORY'
                ? 'Restocking Dairy & Fresh Produce (Aisle 4)'
                : currentEmp.role === 'MANAGER'
                ? 'Store Floor Supervision & Shift Roster'
                : 'Staging Order #TK-1015 at Bay #4'}
            </LocalizedText>
          </View>

          {/* Metric grid */}
          <View style={styles.workMetricsGrid}>
            <View style={styles.workMetricCol}>
              <LocalizedText style={styles.workMetricVal}>
                {currentEmp.role === 'BILLER'
                  ? '26'
                  : currentEmp.role === 'ORDERS'
                  ? '16'
                  : currentEmp.role === 'INVENTORY'
                  ? '22'
                  : '34'}
              </LocalizedText>
              <LocalizedText style={styles.workMetricLabel}>Tasks Done</LocalizedText>
            </View>
            <View style={styles.workMetricDivider} />
            <View style={styles.workMetricCol}>
              <LocalizedText style={styles.workMetricVal}>
                {currentEmp.role === 'BILLER'
                  ? '05h 42m'
                  : currentEmp.role === 'ORDERS'
                  ? '05h 18m'
                  : '04h 50m'}
              </LocalizedText>
              <LocalizedText style={styles.workMetricLabel}>Shift Hours</LocalizedText>
            </View>
            <View style={styles.workMetricDivider} />
            <View style={styles.workMetricCol}>
              <LocalizedText style={[styles.workMetricVal, { color: '#16a34a' }]}>
                {currentEmp.role === 'BILLER' ? '99.6%' : '99.2%'}
              </LocalizedText>
              <LocalizedText style={styles.workMetricLabel}>Accuracy</LocalizedText>
            </View>
            <View style={styles.workMetricDivider} />
            <View style={styles.workMetricCol}>
              <LocalizedText style={[styles.workMetricVal, { color: '#d97706' }]}>
                {currentEmp.role === 'BILLER' ? '1.2m' : '3.8m'}
              </LocalizedText>
              <LocalizedText style={styles.workMetricLabel}>Avg Speed</LocalizedText>
            </View>
          </View>

          {/* Recent tasks list */}
          <View style={styles.detailTasksList}>
            <LocalizedText style={styles.detailTasksHeader}>
              Completed Tasks Today:
            </LocalizedText>

            {currentEmp.role === 'BILLER' ? (
              <>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Walk-in Checkout #INV-8891 (12 items)
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>12:45 PM</LocalizedText>
                  <Badge
                    label="₹1,240 Cash"
                    backgroundColor="#EAF5ED"
                    textColor="#258B3E"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Walk-in Checkout #INV-8884 (4 items)
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>11:50 AM</LocalizedText>
                  <Badge
                    label="₹480 UPI"
                    backgroundColor="#eff6ff"
                    textColor="#2563eb"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </>
            ) : currentEmp.role === 'ORDERS' ? (
              <>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Order #TK-1024 Sealed &amp; Staged (8 items)
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>12:40 PM</LocalizedText>
                  <Badge
                    label="Blinkit"
                    backgroundColor="#f0fdf4"
                    textColor="#16a34a"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Order #TK-1019 Picked from Aisle 2
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>11:30 AM</LocalizedText>
                  <Badge
                    label="Swiggy"
                    backgroundColor="#fff7ed"
                    textColor="#ea580c"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Aisle 1 Fresh Produce Restocked (24 items)
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>12:15 PM</LocalizedText>
                  <Badge
                    label="Restocked"
                    backgroundColor="#fef3c7"
                    textColor="#d97706"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <View style={styles.detailTaskRow}>
                  <View style={styles.taskDot} />
                  <LocalizedText style={styles.detailTaskTitle} numberOfLines={1}>
                    Aisle 4 Dry Grocery Barcode Audit
                  </LocalizedText>
                  <LocalizedText style={styles.detailTaskTime}>11:00 AM</LocalizedText>
                  <Badge
                    label="Audited"
                    backgroundColor="#ede9fe"
                    textColor="#7c3aed"
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* ===================== IN-STORE FLOOR PAGER & CABIN SUMMON ===================== */}
        <View style={styles.card}>
          <View style={styles.pagerHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#fee2e2' }]}>
              <Icon name="bell" size={18} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.pagerTitle}>
                In-Store Floor Pager &amp; Cabin Summon
              </LocalizedText>
              <LocalizedText style={styles.pagerSub}>
                Page staff to cabin or ring phone when out of physical hearing range
              </LocalizedText>
            </View>
          </View>

          {/* Active Outgoing Call Live Banner */}
          {isCallingThisEmployee && (
            <View style={styles.outgoingCallingBanner}>
              <View style={styles.callingHeaderRow}>
                <View style={styles.callingPulsingDot} />
                <LocalizedText style={styles.callingTitle}>
                  RINGING PHONE • {activeOutgoingCall.remainingSeconds}s LEFT
                </LocalizedText>
              </View>
              <LocalizedText style={styles.callingEmpText}>
                Active 20-second ringer buzzer sent to {currentEmp.name}
              </LocalizedText>
              <View style={styles.callingProgressTrack}>
                <View
                  style={[
                    styles.callingProgressFill,
                    {
                      width: `${(activeOutgoingCall.remainingSeconds / 20) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.cancelCallBtn}
                scaleTo={0.94}
                onPress={cancelOutgoingCall}
              >
                <Icon name="phone-off" size={14} color="#dc2626" style={{ marginRight: 6 }} />
                <LocalizedText style={styles.cancelCallBtnText}>
                  Cancel Ringing / Stop Call
                </LocalizedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Destination Selector */}
          <LocalizedText style={styles.fieldLabel}>Report To Destination:</LocalizedText>
          <View style={styles.chipsRow}>
            {CABIN_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <Chip
                  key={loc}
                  label={loc}
                  icon="map-pin"
                  selected={isSelected}
                  size="sm"
                  onPress={() => {
                    setSelectedLocation(loc);
                    setSummonMessage(`Please come to ${loc} immediately.`);
                  }}
                  style={styles.locationChip}
                />
              );
            })}
          </View>

          {/* Message Input */}
          <LocalizedText style={[styles.fieldLabel, { marginTop: 12 }]}>
            Summon Message:
          </LocalizedText>
          <TextInput
            style={styles.messageInput}
            value={summonMessage}
            onChangeText={setSummonMessage}
            placeholder="Type notification message..."
            placeholderTextColor="#9ca3af"
          />

          {/* Quick preset message chips */}
          <View style={styles.quickMsgRow}>
            {QUICK_MESSAGES.map((msg, i) => (
              <Chip
                key={i}
                label={`"${msg}"`}
                size="sm"
                onPress={() => setSummonMessage(msg)}
                style={styles.quickMsgChip}
              />
            ))}
          </View>

          {/* Summon Buttons */}
          <View style={styles.summonActionCol}>
            {/* 1. Ring Phone Button (20 Seconds) */}
            <TouchableOpacity
              style={styles.ringPhoneBtn}
              scaleTo={0.96}
              onPress={handleRingPhone}
            >
              <View style={styles.ringIconWrap}>
                <Icon name="bell" size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.ringPhoneBtnText}>
                  🚨 Ring Phone (20s Urgent Alert)
                </LocalizedText>
                <LocalizedText style={styles.ringPhoneBtnSub}>
                  Plays ringer &amp; continuous buzzer for 20 seconds
                </LocalizedText>
              </View>
            </TouchableOpacity>

            {/* 2. Send Cabin Notification */}
            <TouchableOpacity
              style={styles.notifyBtn}
              scaleTo={0.96}
              onPress={handleSendNotification}
            >
              <Icon name="send" size={16} color="#258B3E" style={{ marginRight: 8 }} />
              <LocalizedText style={styles.notifyBtnText}>
                Send In-Store Cabin Notification
              </LocalizedText>
            </TouchableOpacity>

            {/* 3. Direct Staff Chat */}
            <TouchableOpacity
              style={styles.chatStaffBtn}
              scaleTo={0.96}
              onPress={() => {
                const convId = openDirectChatWithStaff(currentEmp.id);
                navigation.navigate('TeamChatConversation', { conversationId: convId });
              }}
            >
              <Icon name="message-circle" size={16} color="#2563eb" style={{ marginRight: 8 }} />
              <LocalizedText style={styles.chatStaffBtnText}>
                Chat with {currentEmp.name}
              </LocalizedText>
            </TouchableOpacity>
          </View>

          {/* Recent Summon Activity */}
          {employeeAlertHistory.length > 0 && (
            <View style={styles.historyBox}>
              <LocalizedText style={styles.historyHeader}>
                Recent In-Store Floor Summons:
              </LocalizedText>
              {employeeAlertHistory.slice(0, 3).map((alert) => (
                <View key={alert.id} style={styles.historyRow}>
                  <Icon
                    name={alert.isUrgentRing ? 'bell' : 'message-square'}
                    size={13}
                    color={
                      alert.status === 'ACKNOWLEDGED'
                        ? '#16a34a'
                        : alert.isUrgentRing
                        ? '#dc2626'
                        : '#258B3E'
                    }
                    style={{ marginRight: 6 }}
                  />
                  <LocalizedText style={styles.historyText} numberOfLines={1}>
                    {alert.isUrgentRing ? 'Urgent Ring' : 'Notice'} • {alert.location} •{' '}
                    <LocalizedText
                      style={{
                        fontFamily: 'Poppins-Bold',
                        color:
                          alert.status === 'ACKNOWLEDGED'
                            ? '#16a34a'
                            : alert.status === 'RINGING'
                            ? '#dc2626'
                            : '#6b7280',
                      }}
                    >
                      {alert.status === 'ACKNOWLEDGED'
                        ? "Acknowledged (On the way)"
                        : alert.status === 'DISMISSED'
                        ? 'Dismissed / Silenced'
                        : alert.status}
                    </LocalizedText>
                  </LocalizedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Change Role Tier & Preset */}
        <View style={styles.card}>
          <LocalizedText style={styles.sectionTitle}>Assign Role Tier</LocalizedText>
          <LocalizedText style={styles.sectionSubtitle}>
            Switch role presets or configure as custom:
          </LocalizedText>

          <View style={styles.rolePickerRow}>
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = role === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.rolePill, isSelected && styles.rolePillActive]}
                  scaleTo={0.94}
                  onPress={() => handleSelectRolePreset(opt.key)}
                >
                  <LocalizedText
                    style={[styles.rolePillText, isSelected && styles.rolePillTextActive]}
                  >
                    {opt.title}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {role === 'CUSTOM' && (
            <View style={styles.customBox}>
              <LocalizedText style={styles.customLabel}>Custom Role Title *</LocalizedText>
              <TextInput
                style={styles.customInput}
                value={customRoleTitle}
                onChangeText={handleUpdateCustomTitle}
                placeholder="e.g. Senior Floor Lead, Stock Auditor"
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}
        </View>

        {/* ===================== CRUD PERMISSIONS TOGGLES ===================== */}

        {/* 1. Products CRUD */}
        <View style={styles.card}>
          <View style={styles.crudHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#fffbeb' }]}>
              <Icon name="grid" size={16} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Products &amp; Inventory CRUD
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Shelf stock, prices, adding and deleting SKUs
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Products (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>View product list, stock &amp; aisles</LocalizedText>
              </View>
              <Switch
                value={permissions.products.view}
                onValueChange={() => handleToggleCrud('products', 'view')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.products.view ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Add Products (Create)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Add new SKU items and barcodes</LocalizedText>
              </View>
              <Switch
                value={permissions.products.create}
                onValueChange={() => handleToggleCrud('products', 'create')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.products.create ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Update Stock &amp; Price (Update)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Adjust shelf stock count &amp; edit price tags</LocalizedText>
              </View>
              <Switch
                value={permissions.products.update}
                onValueChange={() => handleToggleCrud('products', 'update')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.products.update ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={[styles.crudRow, { borderBottomWidth: 0 }]}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Delete Products (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Remove or archive product SKUs</LocalizedText>
              </View>
              <Switch
                value={permissions.products.delete}
                onValueChange={() => handleToggleCrud('products', 'delete')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.products.delete ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* 2. Walk-in POS Billing CRUD */}
        <View style={styles.card}>
          <View style={styles.crudHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#EAF5ED' }]}>
              <Icon name="file-text" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Walk-in POS Billing CRUD
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Customer bills, cart adjustments &amp; voiding transactions
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View POS Counter (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Open billing register and view prices</LocalizedText>
              </View>
              <Switch
                value={permissions.billing.view}
                onValueChange={() => handleToggleCrud('billing', 'view')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.billing.view ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Create Bills &amp; Receipts (Create)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Generate bills, collect cash/UPI &amp; receipt</LocalizedText>
              </View>
              <Switch
                value={permissions.billing.create}
                onValueChange={() => handleToggleCrud('billing', 'create')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.billing.create ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Edit Cart &amp; Discounts (Update)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Change quantities &amp; apply item discounts</LocalizedText>
              </View>
              <Switch
                value={permissions.billing.update}
                onValueChange={() => handleToggleCrud('billing', 'update')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.billing.update ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={[styles.crudRow, { borderBottomWidth: 0 }]}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Void / Delete Bills (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Cancel or void bill transactions</LocalizedText>
              </View>
              <Switch
                value={permissions.billing.delete}
                onValueChange={() => handleToggleCrud('billing', 'delete')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.billing.delete ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* 3. Online Orders CRUD */}
        <View style={styles.card}>
          <View style={styles.crudHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Icon name="package" size={16} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Online Orders Fulfillment CRUD
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Queue view, picking, packing &amp; rider handover
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Orders Queue (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>View incoming customer orders</LocalizedText>
              </View>
              <Switch
                value={permissions.orders.view}
                onValueChange={() => handleToggleCrud('orders', 'view')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.orders.view ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Pick &amp; Pack Items (Create)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Start item picking &amp; seal order bags</LocalizedText>
              </View>
              <Switch
                value={permissions.orders.create}
                onValueChange={() => handleToggleCrud('orders', 'create')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.orders.create ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Rider Handover (Update)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Verify rider OTP &amp; hand over bags</LocalizedText>
              </View>
              <Switch
                value={permissions.orders.update}
                onValueChange={() => handleToggleCrud('orders', 'update')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.orders.update ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={[styles.crudRow, { borderBottomWidth: 0 }]}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Cancel Orders (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Cancel or reject unfulfillable orders</LocalizedText>
              </View>
              <Switch
                value={permissions.orders.delete}
                onValueChange={() => handleToggleCrud('orders', 'delete')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.orders.delete ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* 4. Staff Management CRUD */}
        <View style={styles.card}>
          <View style={styles.crudHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#ede9fe' }]}>
              <Icon name="users" size={16} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Store Staff &amp; Team CRUD
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Roster viewing &amp; team management privileges
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Team Roster (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>View fellow staff shifts &amp; schedules</LocalizedText>
              </View>
              <Switch
                value={permissions.staff.view}
                onValueChange={() => handleToggleCrud('staff', 'view')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.staff.view ? colors.primary : '#9ca3af'}
              />
            </View>

            <View style={[styles.crudRow, { borderBottomWidth: 0 }]}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>Manage Staff Permissions (Admin)</LocalizedText>
                <LocalizedText style={styles.crudSub}>Add or change staff member permissions</LocalizedText>
              </View>
              <Switch
                value={permissions.staff.manage}
                onValueChange={() => handleToggleCrud('staff', 'manage')}
                trackColor={{ false: '#e5e7eb', true: colors.primaryLight }}
                thumbColor={permissions.staff.manage ? colors.primary : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeBtn}
          scaleTo={0.96}
          onPress={handleRemove}
        >
          <Icon name="user-x" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <LocalizedText style={styles.removeText}>Remove Staff Member</LocalizedText>
        </TouchableOpacity>
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#059669',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 12,
  },
  rolePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rolePillActive: {
    backgroundColor: '#EAF5ED',
    borderColor: '#258B3E',
  },
  rolePillText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  rolePillTextActive: {
    color: '#258B3E',
    fontFamily: 'Poppins-Bold',
  },
  customBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  customLabel: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 6,
  },
  customInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#258B3E',
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },

  // CRUD Section
  crudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  crudIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  crudSectionTitle: {
    fontSize: 13.5,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
  },
  crudSectionSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  crudList: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  crudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  crudInfo: {
    flex: 1,
    marginRight: 10,
  },
  crudTitle: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  crudSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },

  // Work Analysis Styles
  workAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workAnalysisTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  workAnalysisSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  activeTaskBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3.5,
    borderLeftColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  activeTaskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginRight: 6,
  },
  activeTaskHeading: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Bold',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  activeTaskName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#1e293b',
  },
  workMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  workMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  workMetricVal: {
    fontSize: 13.5,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  workMetricLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  workMetricDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 2,
  },
  detailTasksList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailTasksHeader: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
    marginBottom: 6,
  },
  detailTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#258B3E',
    marginRight: 8,
  },
  detailTaskTitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
  },
  detailTaskTime: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },

  // Floor Pager & Summon Styles
  pagerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pagerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  pagerSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  outgoingCallingBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  callingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  callingPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    marginRight: 6,
  },
  callingTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  callingEmpText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  callingProgressTrack: {
    height: 5,
    backgroundColor: '#fee2e2',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  callingProgressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
  cancelCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 8,
  },
  cancelCallBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
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
    gap: 6,
    marginBottom: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  locationChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  locationChipTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  messageInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  quickMsgRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 14,
  },
  quickMsgChip: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickMsgText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  summonActionCol: {
    gap: 8,
  },
  ringPhoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ringIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ringPhoneBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  ringPhoneBtnSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#258B3E',
    borderRadius: 12,
    paddingVertical: 10,
  },
  notifyBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },
  headerChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatStaffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  chatStaffBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },
  historyBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  historyHeader: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  historyText: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    flex: 1,
  },

  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  removeText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ef4444',
  },
});

export default EmployeeDetailScreen;
