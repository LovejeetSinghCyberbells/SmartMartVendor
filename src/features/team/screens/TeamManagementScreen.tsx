import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import {
  ScreenHeader,
  SearchBar,
  AnimatedEntranceView,
  getStaggerDelay,
  Badge,
  Chip,
  Avatar,
} from '../../../shared/components/common';
import EmployeeCard from '../components/EmployeeCard';
import TeamFilterTabs from '../components/TeamFilterTabs';
import EmptyTeam from '../components/EmptyTeam';
import { useStaffRole, LeaveRequest } from '../context/StaffRoleContext';
import { useFloorPager } from '../context/FloorPagerContext';
import { useStaffChat } from '../context/StaffChatContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { TeamRole } from '../components/RoleBadge';

const DESTINATION_LOCATIONS = [
  'Manager Cabin #1',
  'POS Counter #1',
  'Dispatch Bay #4',
  'Produce Aisle #1',
  'Dairy & Cold Storage',
];

const QUICK_PRESET_MSGS = [
  'Please report to cabin when available.',
  'Order pickup rush — need assistance.',
  'Price check verification needed.',
  'Restock aisle shelf immediately.',
  'Cash counter audit and verification.',
];

const REJECT_PRESET_REASONS = [
  'Store peak hours staffing required.',
  'Overlap with existing on-leave staff.',
  'Critical fulfillment shift duties.',
  'Advance notice required for planned leave.',
  'Inventory stock audit scheduled.',
];

const TeamManagementScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    allStaff,
    leaveRequests,
    pendingLeaveCount,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useStaffRole();
  const { ringEmployeePhone, sendCabinNotification, recentAlerts } = useFloorPager();
  const { openDirectChatWithStaff } = useStaffChat();
  const { showToast } = useFeedback();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Quick Notification Sheet state
  const [selectedStaffForNotice, setSelectedStaffForNotice] = useState<any | null>(null);
  const [noticeLocation, setNoticeLocation] = useState(DESTINATION_LOCATIONS[0]);
  const [noticeMessage, setNoticeMessage] = useState('');

  // Summon History Log Modal state
  const [showLogModal, setShowLogModal] = useState(false);

  // Staff Leave Management Sheet state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
  const [rejectingLeave, setRejectingLeave] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredLeaveRequests = useMemo(() => {
    if (leaveFilter === 'ALL') return leaveRequests;
    return leaveRequests.filter((l) => l.status === leaveFilter);
  }, [leaveRequests, leaveFilter]);

  const staffList = useMemo(() => {
    return allStaff.map((emp) => {
      const roleName: TeamRole =
        emp.role === 'MANAGER'
          ? 'Manager'
          : emp.role === 'BILLER'
          ? 'Biller'
          : emp.role === 'ORDERS'
          ? 'Online Orders'
          : emp.role === 'INVENTORY'
          ? 'Inventory'
          : 'Custom';

      const permissionLabel =
        emp.role === 'MANAGER'
          ? 'All Access (Orders, Bills, Stock)'
          : emp.role === 'BILLER'
          ? 'Bills Only (Walk-in Counter POS)'
          : emp.role === 'ORDERS'
          ? 'Online Orders Only (Pick & Pack)'
          : emp.role === 'INVENTORY'
          ? 'Inventory Only (Stock & Shelf Tags)'
          : `Custom: ${emp.roleTitle}`;

      return {
        id: emp.id,
        name: emp.name,
        role: roleName,
        customLabel: emp.role === 'CUSTOM' ? emp.roleTitle : undefined,
        phone: emp.phone,
        status: (emp.status === 'On Break' ? 'Offline' : emp.status) as 'Active' | 'Offline',
        tasksToday:
          emp.role === 'BILLER' ? 24 : emp.role === 'ORDERS' ? 14 : emp.role === 'INVENTORY' ? 8 : 18,
        permissionLabel,
      };
    });
  }, [allStaff]);

  const filteredEmployees = useMemo(() => {
    return staffList.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.phone.includes(search);
      const matchesRole = activeFilter === 'ALL' || emp.role === activeFilter;
      return matchesSearch && matchesRole;
    });
  }, [staffList, activeFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: staffList.length };
    staffList.forEach((e) => {
      c[e.role] = (c[e.role] || 0) + 1;
    });
    return c;
  }, [staffList]);

  const handleOpenNoticeModal = (employee: any) => {
    setSelectedStaffForNotice(employee);
    setNoticeLocation(DESTINATION_LOCATIONS[0]);
    setNoticeMessage(`Please report to ${DESTINATION_LOCATIONS[0]} when available.`);
  };

  const handleSendNotice = () => {
    if (!selectedStaffForNotice) return;
    sendCabinNotification(
      selectedStaffForNotice.id,
      noticeLocation,
      noticeMessage || `Please come to ${noticeLocation} when available.`
    );
    showToast(`In-store notification sent to ${selectedStaffForNotice.name}!`, 'success');
    setSelectedStaffForNotice(null);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Team"
        onBack={() => navigation.goBack()}
        showBorder={false}
        rightElement={
          <View style={styles.headerRightRow}>
            {/* Staff Chat List */}
            <TouchableOpacity
              style={styles.notifLogBtn}
              scaleTo={0.88}
              onPress={() => navigation.navigate('TeamChatList')}
              accessibilityLabel="Store Floor Chat"
            >
              <Icon name="message-circle" size={18} color="#258B3E" />
            </TouchableOpacity>

            {/* In-Store Floor Notification Log */}
            <TouchableOpacity
              style={styles.notifLogBtn}
              scaleTo={0.88}
              onPress={() => setShowLogModal(true)}
              accessibilityLabel="Summon History Log"
            >
              <Icon name="bell" size={18} color="#258B3E" />
              {recentAlerts.length > 0 && <View style={styles.notifLogDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyticsHeaderBtn}
              scaleTo={0.88}
              onPress={() => navigation.navigate('TeamAnalytics')}
              accessibilityLabel="Work Analytics"
            >
              <Icon name="bar-chart-2" size={19} color="#258B3E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBtn}
              scaleTo={0.88}
              onPress={() => navigation.navigate('AddEmployee')}
              accessibilityLabel="Add Employee"
            >
              <Icon name="plus" size={22} color="#258B3E" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Staff Work Analytics Quick Banner */}
      <AnimatedEntranceView delay={40} direction="down" distance={10}>
        <TouchableOpacity
          style={styles.analyticsBanner}
          scaleTo={0.97}
          onPress={() => navigation.navigate('TeamAnalytics')}
        >
          <View style={styles.analyticsBannerIcon}>
            <Icon name="activity" size={18} color="#258B3E" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LocalizedText style={styles.analyticsBannerTitle}>
                Staff Work Analytics &amp; Tasks
              </LocalizedText>
              <Badge
                label="LIVE"
                backgroundColor="#EAF5ED"
                textColor="#258B3E"
                size="sm"
                style={{ marginLeft: 6 }}
              />
            </View>
            <LocalizedText style={styles.analyticsBannerSub}>
              Analyze floor productivity, completed tasks &amp; alert staff
            </LocalizedText>
          </View>
          <Icon name="chevron-right" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </AnimatedEntranceView>

      {/* Staff Leave Requests Banner */}
      <AnimatedEntranceView delay={50} direction="down" distance={10}>
        <TouchableOpacity
          style={styles.leaveBanner}
          scaleTo={0.97}
          onPress={() => setShowLeaveModal(true)}
          accessibilityLabel="Staff Leave Requests"
        >
          <View style={styles.leaveBannerIcon}>
            <Icon name="calendar" size={18} color="#258B3E" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LocalizedText style={styles.leaveBannerTitle}>
                Staff Leave Requests
              </LocalizedText>
              <Badge
                label={pendingLeaveCount > 0 ? `${pendingLeaveCount} PENDING` : 'ALL REVIEWED'}
                backgroundColor={pendingLeaveCount > 0 ? '#fef3c7' : '#EAF5ED'}
                textColor={pendingLeaveCount > 0 ? '#d97706' : '#258B3E'}
                size="sm"
                style={{ marginLeft: 6 }}
              />
            </View>
            <LocalizedText style={styles.leaveBannerSub}>
              Review leave applications, confirm or reject with mandatory reason
            </LocalizedText>
          </View>
          <Icon name="chevron-right" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </AnimatedEntranceView>

      {/* Search */}
      <AnimatedEntranceView delay={60} direction="down" distance={12}>
        <SearchBar
          placeholder="Search by name or phone"
          value={search}
          onChangeText={setSearch}
        />
      </AnimatedEntranceView>

      {/* Filters */}
      <AnimatedEntranceView delay={120} direction="down" distance={10}>
        <View style={{ height: 80 }}>
          <TeamFilterTabs
            active={activeFilter}
            onChange={setActiveFilter}
            counts={counts}
          />
        </View>
      </AnimatedEntranceView>

      {/* List */}
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyTeam onAdd={() => navigation.navigate('AddEmployee')} />
        }
        renderItem={({ item, index }) => (
          <AnimatedEntranceView
            delay={getStaggerDelay(index, 140, 45)}
            direction="up"
            distance={20}
          >
            <EmployeeCard
              employee={item}
              onPress={() =>
                navigation.navigate('EmployeeDetail', { employeeId: item.id })
              }
              onQuickChat={() => {
                const convId = openDirectChatWithStaff(item.id);
                navigation.navigate('TeamChatConversation', { conversationId: convId });
              }}
              onQuickNotify={() => handleOpenNoticeModal(item)}
              onQuickSummon={() => {
                ringEmployeePhone(
                  item.id,
                  'Manager Cabin #1',
                  'Please come to Manager Cabin #1 immediately.'
                );
                showToast(`🚨 Ringing ${item.name}'s phone for 20 seconds!`, 'success');
              }}
            />
          </AnimatedEntranceView>
        )}
      />

      {/* ========================================================== */}
      {/* QUICK IN-STORE CABIN NOTIFICATION MODAL                   */}
      {/* ========================================================== */}
      {selectedStaffForNotice && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedStaffForNotice(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalIconWrap}>
                  <Icon name="send" size={18} color="#258B3E" />
                </View>
                <View style={{ flex: 1 }}>
                  <LocalizedText style={styles.modalTitle}>
                    Notify {selectedStaffForNotice.name}
                  </LocalizedText>
                  <LocalizedText style={styles.modalSub}>
                    Send in-store floor page notification
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.9}
                  onPress={() => setSelectedStaffForNotice(null)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Destination selector chips */}
              <LocalizedText style={styles.fieldLabel}>Report To Destination:</LocalizedText>
              <View style={styles.chipsRow}>
                {DESTINATION_LOCATIONS.map((loc) => {
                  const isSelected = noticeLocation === loc;
                  return (
                    <Chip
                      key={loc}
                      label={loc}
                      selected={isSelected}
                      size="sm"
                      onPress={() => {
                        setNoticeLocation(loc);
                        setNoticeMessage(`Please report to ${loc} when available.`);
                      }}
                      style={styles.locationChip}
                    />
                  );
                })}
              </View>

              {/* Message Input */}
              <LocalizedText style={[styles.fieldLabel, { marginTop: 12 }]}>
                Message:
              </LocalizedText>
              <TextInput
                style={styles.modalInput}
                value={noticeMessage}
                onChangeText={setNoticeMessage}
                placeholder="Enter notification message..."
                placeholderTextColor="#9ca3af"
              />

              {/* Quick Preset Pills */}
              <View style={styles.presetRow}>
                {QUICK_PRESET_MSGS.slice(0, 3).map((msg, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.presetChip}
                    scaleTo={0.94}
                    onPress={() => setNoticeMessage(msg)}
                  >
                    <LocalizedText style={styles.presetChipText} numberOfLines={1}>
                      "{msg}"
                    </LocalizedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  scaleTo={0.94}
                  onPress={() => setSelectedStaffForNotice(null)}
                >
                  <LocalizedText style={styles.modalCancelBtnText}>Cancel</LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSendBtn}
                  scaleTo={0.94}
                  onPress={handleSendNotice}
                >
                  <Icon name="send" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <LocalizedText style={styles.modalSendBtnText}>
                    Send Notification
                  </LocalizedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================== */}
      {/* IN-STORE STAFF SUMMONS & ALERTS HISTORY LOG MODAL          */}
      {/* ========================================================== */}
      {showLogModal && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLogModal(false)}
        >
          <View style={styles.logModalBackdrop}>
            <View style={[styles.logModalCard, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.logModalHeader}>
                <View style={styles.modalIconWrap}>
                  <Icon name="bell" size={18} color="#258B3E" />
                </View>
                <View style={{ flex: 1 }}>
                  <LocalizedText style={styles.modalTitle}>
                    Floor Summons &amp; Alert Log
                  </LocalizedText>
                  <LocalizedText style={styles.modalSub}>
                    Today's sent notifications &amp; employee response status
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.9}
                  onPress={() => setShowLogModal(false)}
                >
                  <Icon name="x" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {recentAlerts.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <LocalizedText style={{ color: '#9ca3af', fontFamily: 'Poppins-Regular' }}>
                      No summons sent yet today.
                    </LocalizedText>
                  </View>
                ) : (
                  recentAlerts.map((alert) => (
                    <View key={alert.id} style={styles.logRow}>
                      <View
                        style={[
                          styles.logIcon,
                          {
                            backgroundColor: alert.isUrgentRing ? '#fee2e2' : '#EAF5ED',
                          },
                        ]}
                      >
                        <Icon
                          name={alert.isUrgentRing ? 'bell' : 'message-square'}
                          size={15}
                          color={alert.isUrgentRing ? '#dc2626' : '#258B3E'}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.logTopRow}>
                          <LocalizedText style={styles.logTargetName}>
                            {alert.targetEmployeeName}
                          </LocalizedText>
                          <Badge
                            label={
                              alert.status === 'ACKNOWLEDGED'
                                ? 'On The Way'
                                : alert.status === 'RINGING'
                                ? 'Ringing...'
                                : alert.status === 'DISMISSED'
                                ? 'Silenced'
                                : 'Notified'
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
                        <LocalizedText style={styles.logLocation}>
                          📍 {alert.location}
                        </LocalizedText>
                        <LocalizedText style={styles.logMessage}>
                          "{alert.message}"
                        </LocalizedText>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================== */}
      {/* STAFF LEAVE REQUESTS MANAGEMENT MODAL                     */}
      {/* ========================================================== */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.leaveModalBackdrop}>
          <View style={[styles.leaveModalCard, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.leaveModalIconWrap}>
                <Icon name="calendar" size={18} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <LocalizedText style={styles.modalTitle}>
                    Staff Leave Applications
                  </LocalizedText>
                  {pendingLeaveCount > 0 && (
                    <Badge
                      label={`${pendingLeaveCount} Pending`}
                      backgroundColor="#fef3c7"
                      textColor="#d97706"
                      size="sm"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
                <LocalizedText style={styles.modalSub}>
                  Store Manager &amp; Vendor review portal
                </LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                scaleTo={0.9}
                onPress={() => setShowLeaveModal(false)}
              >
                <Icon name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.leaveFilterRow}>
              {(['ALL', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => {
                const count =
                  tab === 'ALL'
                    ? leaveRequests.length
                    : leaveRequests.filter((r) => r.status === tab).length;
                const isSelected = leaveFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.leaveFilterTab,
                      isSelected && styles.leaveFilterTabActive,
                    ]}
                    scaleTo={0.95}
                    onPress={() => setLeaveFilter(tab)}
                  >
                    <LocalizedText
                      style={[
                        styles.leaveFilterTabText,
                        isSelected && styles.leaveFilterTabTextActive,
                      ]}
                    >
                      {tab} ({count})
                    </LocalizedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Requests List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingVertical: 6 }}
            >
              {filteredLeaveRequests.length === 0 ? (
                <View style={styles.emptyLeaveBox}>
                  <Icon name="inbox" size={32} color="#9ca3af" />
                  <LocalizedText style={styles.emptyLeaveText}>
                    No {leaveFilter === 'ALL' ? '' : leaveFilter.toLowerCase()} leave requests found.
                  </LocalizedText>
                </View>
              ) : (
                filteredLeaveRequests.map((item) => {
                  const isPending = item.status === 'Pending';
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  return (
                    <View key={item.id} style={styles.leaveItemCard}>
                      <View style={styles.leaveItemHeader}>
                        <View style={styles.leaveItemEmployee}>
                          <Avatar
                            role={item.employeeRole}
                            size={36}
                            style={{ marginRight: 10 }}
                          />
                          <View>
                            <LocalizedText style={styles.leaveEmpName}>
                              {item.employeeName}
                            </LocalizedText>
                            <LocalizedText style={styles.leaveEmpRole}>
                              {item.employeeRole}
                            </LocalizedText>
                          </View>
                        </View>
                        <Badge
                          label={item.status}
                          backgroundColor={
                            isApproved ? '#d1fae5' : isPending ? '#fef3c7' : '#fee2e2'
                          }
                          textColor={
                            isApproved ? '#059669' : isPending ? '#d97706' : '#dc2626'
                          }
                          size="sm"
                        />
                      </View>

                      <View style={styles.leaveMetaStrip}>
                        <View style={styles.leaveMetaCol}>
                          <LocalizedText style={styles.leaveMetaLabel}>LEAVE TYPE</LocalizedText>
                          <LocalizedText style={styles.leaveMetaVal}>{item.type}</LocalizedText>
                        </View>
                        <View style={styles.leaveMetaCol}>
                          <LocalizedText style={styles.leaveMetaLabel}>DURATION</LocalizedText>
                          <LocalizedText style={styles.leaveMetaVal}>
                            {item.days} Day{item.days > 1 ? 's' : ''}
                          </LocalizedText>
                        </View>
                        <View style={styles.leaveMetaCol}>
                          <LocalizedText style={styles.leaveMetaLabel}>DATES</LocalizedText>
                          <LocalizedText style={styles.leaveMetaVal}>
                            {item.startDate}{item.days > 1 ? ` → ${item.endDate}` : ''}
                          </LocalizedText>
                        </View>
                      </View>

                      {/* Stated Reason */}
                      <View style={styles.leaveReasonBox}>
                        <LocalizedText style={styles.leaveReasonLabel}>
                          Employee Reason:
                        </LocalizedText>
                        <LocalizedText style={styles.leaveReasonContent}>
                          {item.reason
                            ? `"${item.reason}"`
                            : item.type.toLowerCase().includes('sick') ||
                              item.type.toLowerCase().includes('emergency')
                            ? 'Sick / Emergency Leave — Reason not required'
                            : 'No reason provided'}
                        </LocalizedText>
                      </View>

                      {/* If Rejected: Show Rejection Reason */}
                      {isRejected && (
                        <View style={styles.rejectionNoticeCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                            <Icon name="alert-circle" size={13} color="#dc2626" style={{ marginRight: 5 }} />
                            <LocalizedText style={styles.rejectionNoticeTitle}>
                              Rejection Reason ({item.reviewedBy || 'Manager/Vendor'}):
                            </LocalizedText>
                          </View>
                          <LocalizedText style={styles.rejectionNoticeBody}>
                            {item.rejectionReason || 'No specific reason entered.'}
                          </LocalizedText>
                        </View>
                      )}

                      {/* If Approved: Show Approved by */}
                      {isApproved && item.reviewedBy && (
                        <View style={styles.approvalNoticeCard}>
                          <Icon name="check-circle" size={13} color="#059669" style={{ marginRight: 5 }} />
                          <LocalizedText style={styles.approvalNoticeText}>
                            Confirmed &amp; Approved by {item.reviewedBy}
                          </LocalizedText>
                        </View>
                      )}

                      {/* Pending Action Buttons */}
                      {isPending && (
                        <View style={styles.leaveActionRow}>
                          <TouchableOpacity
                            style={styles.leaveConfirmBtn}
                            scaleTo={0.94}
                            onPress={() => {
                              approveLeaveRequest(item.id, 'Vendor');
                              showToast(`Leave confirmed for ${item.employeeName}!`, 'success');
                            }}
                          >
                            <Icon name="check" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                            <LocalizedText style={styles.leaveConfirmBtnText}>
                              Confirm Leave
                            </LocalizedText>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.leaveRejectBtn}
                            scaleTo={0.94}
                            onPress={() => {
                              setRejectingLeave(item);
                              setRejectReason('');
                            }}
                          >
                            <Icon name="x" size={15} color="#dc2626" style={{ marginRight: 6 }} />
                            <LocalizedText style={styles.leaveRejectBtnText}>
                              Reject...
                            </LocalizedText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* REJECTION REASON MODAL (MANDATORY REASON INPUT)            */}
      {/* ========================================================== */}
      {rejectingLeave && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setRejectingLeave(null)}
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
                    {rejectingLeave.employeeName} • {rejectingLeave.type} ({rejectingLeave.days} day{rejectingLeave.days > 1 ? 's' : ''})
                  </LocalizedText>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  scaleTo={0.9}
                  onPress={() => setRejectingLeave(null)}
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
                  const isSelected = rejectReason === preset;
                  return (
                    <Chip
                      key={preset}
                      label={preset}
                      selected={isSelected}
                      onPress={() => setRejectReason(preset)}
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
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rejectButtonRow}>
                <TouchableOpacity
                  style={styles.rejectCancelBtn}
                  scaleTo={0.95}
                  onPress={() => setRejectingLeave(null)}
                >
                  <LocalizedText style={styles.rejectCancelBtnText}>Cancel</LocalizedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rejectSubmitBtn,
                    !rejectReason.trim() && { opacity: 0.6 },
                  ]}
                  scaleTo={0.95}
                  onPress={() => {
                    if (!rejectReason.trim()) {
                      showToast('Please provide a reason for rejecting this leave request.', 'info');
                      return;
                    }
                    rejectLeaveRequest(rejectingLeave.id, rejectReason.trim(), 'Vendor');
                    showToast(`Leave rejected for ${rejectingLeave.employeeName}. Reason sent.`, 'success');
                    setRejectingLeave(null);
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
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifLogBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifLogDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  analyticsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#c6e8cf',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  analyticsBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  analyticsBannerTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  analyticsBannerSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 11.5,
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  locationChipActive: {
    backgroundColor: '#258B3E',
  },
  locationChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  locationChipTextActive: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#EAF5ED',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    maxWidth: '100%',
  },
  presetChipText: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  modalSendBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#258B3E',
    paddingVertical: 12,
    borderRadius: 14,
  },
  modalSendBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },

  /* Summons Log Modal */
  logModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  logModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%',
  },
  logModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  logTargetName: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  logLocation: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#258B3E',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    lineHeight: 16,
  },

  // Leave Requests banner
  leaveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2ece4',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  leaveBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaveBannerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  leaveBannerSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },

  // Leave Modal styles
  leaveModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  leaveModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  leaveModalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  leaveFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
    flexWrap: 'wrap',
  },
  leaveFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  leaveFilterTabActive: {
    backgroundColor: '#258B3E',
  },
  leaveFilterTabText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  leaveFilterTabTextActive: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyLeaveBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyLeaveText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 8,
  },
  leaveItemCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8edea',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  leaveItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaveItemEmployee: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaveAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  leaveAvatarText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#258B3E',
  },
  leaveEmpName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  leaveEmpRole: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  leaveMetaStrip: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  leaveMetaCol: {
    flex: 1,
  },
  leaveMetaLabel: {
    fontSize: 9.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#9ca3af',
    letterSpacing: 0.4,
  },
  leaveMetaVal: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    marginTop: 1,
  },
  leaveReasonBox: {
    backgroundColor: '#fcfdfc',
    borderWidth: 1,
    borderColor: '#f0f3f1',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  leaveReasonLabel: {
    fontSize: 10.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#6b7280',
  },
  leaveReasonContent: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginTop: 2,
    fontStyle: 'italic',
  },
  rejectionNoticeCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  rejectionNoticeTitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  rejectionNoticeBody: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#991b1b',
    marginTop: 2,
  },
  approvalNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  approvalNoticeText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#15803d',
  },
  leaveActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  leaveConfirmBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#258B3E',
    borderRadius: 12,
    paddingVertical: 10,
  },
  leaveConfirmBtnText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  leaveRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 10,
  },
  leaveRejectBtnText: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },

  // Reject modal
  rejectModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    maxWidth: 440,
    width: '92%',
    alignSelf: 'center',
  },
  rejectIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
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

export default TeamManagementScreen;
