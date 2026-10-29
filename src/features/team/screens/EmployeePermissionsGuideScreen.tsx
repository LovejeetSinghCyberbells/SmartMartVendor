import React, { useState } from 'react';
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
import { ScreenHeader, AnimatedEntranceView, Badge } from '../../../shared/components/common';
import { useStaffRole } from '../context/StaffRoleContext';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import { colors } from '../../../shared/theme/colors';

const EmployeePermissionsGuideScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { showToast } = useFeedback();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedModule, setRequestedModule] = useState('Void / Refund Bills');
  const [requestReason, setRequestReason] = useState('');

  const perms = currentEmployee.permissions;

  const handleSendPermissionRequest = () => {
    if (!requestReason.trim()) {
      showToast('Please enter the reason for elevation request', 'info');
      return;
    }
    setShowRequestModal(false);
    setRequestReason('');
    showToast(`Access request for "${requestedModule}" sent to Manager Cabin #1`, 'success');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="My Role & Permissions"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ================= HERO ROLE CARD ================= */}
        <AnimatedEntranceView delay={40} direction="up" distance={14}>
          <View style={styles.roleHeroCard}>
            <View style={styles.roleTopRow}>
              <View style={styles.roleIconWrap}>
                <Icon name="shield" size={24} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.roleHeroTitle}>
                  {currentEmployee.roleTitle}
                </LocalizedText>
                <LocalizedText style={styles.roleHeroSub}>
                  Assigned by Store Vendor • Green Basket Kirana
                </LocalizedText>
              </View>
              <Badge
                label={currentEmployee.role}
                backgroundColor="#EAF5ED"
                textColor="#258B3E"
                size="sm"
              />
            </View>

            <LocalizedText style={styles.roleSummaryText}>
              {currentEmployee.role === 'MANAGER'
                ? 'You have complete administrative master access across store billing, order picking, shelf stock inventory, and staff management.'
                : currentEmployee.role === 'BILLER'
                ? 'Your access is optimized for customer-facing checkout. You can create customer walk-in bills and accept cash/UPI payments.'
                : currentEmployee.role === 'ORDERS'
                ? 'Your role is dedicated to online order fulfillment. You can view order queues, pick items from aisles, pack bags, and hand over to riders.'
                : currentEmployee.role === 'INVENTORY'
                ? 'Your role is focused on shelf stock. You can update inventory levels, manage SKUs, and maintain aisle pricing tags.'
                : `Custom assigned permissions configured specifically for: ${currentEmployee.roleTitle}.`}
            </LocalizedText>
          </View>
        </AnimatedEntranceView>

        {/* ================= 1. POS BILLING PERMISSIONS ================= */}
        <AnimatedEntranceView delay={80} direction="up" distance={14}>
          <View style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={[styles.moduleIcon, { backgroundColor: '#EAF5ED' }]}>
                <Icon name="file-text" size={16} color="#258B3E" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.moduleTitle}>Walk-in POS Billing</LocalizedText>
                <LocalizedText style={styles.moduleSub}>Customer checkout counter privileges</LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>View POS Counter Register</LocalizedText>
                <LocalizedText style={styles.permDesc}>Open cash drawer and view item rates</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.billing.view ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.billing.view ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.billing.view ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Create Bills &amp; Collect Cash/UPI</LocalizedText>
                <LocalizedText style={styles.permDesc}>Generate invoice, barcode scan &amp; payment</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.billing.create ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.billing.create ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.billing.create ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Edit Cart Quantities &amp; Discounts</LocalizedText>
                <LocalizedText style={styles.permDesc}>Modify items or apply store promotions</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.billing.update ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.billing.update ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.billing.update ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={[styles.permRow, { borderBottomWidth: 0 }]}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Void or Cancel Invoices</LocalizedText>
                <LocalizedText style={styles.permDesc}>Delete completed receipts or reverse cash</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.billing.delete ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.billing.delete ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.billing.delete ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= 2. ONLINE ORDERS PERMISSIONS ================= */}
        <AnimatedEntranceView delay={120} direction="up" distance={14}>
          <View style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={[styles.moduleIcon, { backgroundColor: '#eff6ff' }]}>
                <Icon name="package" size={16} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.moduleTitle}>Online Orders Fulfillment</LocalizedText>
                <LocalizedText style={styles.moduleSub}>App picking, packing and dispatch</LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>View Incoming Orders Queue</LocalizedText>
                <LocalizedText style={styles.permDesc}>Read order items and priority timers</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.orders.view ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.orders.view ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.orders.view ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Pick Items &amp; Pack Bags</LocalizedText>
                <LocalizedText style={styles.permDesc}>Check items in aisle and seal tamper bags</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.orders.create ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.orders.create ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.orders.create ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Rider OTP Handover</LocalizedText>
                <LocalizedText style={styles.permDesc}>Verify Blinkit/Zomato rider and hand over bags</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.orders.update ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.orders.update ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.orders.update ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={[styles.permRow, { borderBottomWidth: 0 }]}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Cancel Unfulfillable Orders</LocalizedText>
                <LocalizedText style={styles.permDesc}>Reject orders with out-of-stock items</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.orders.delete ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.orders.delete ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.orders.delete ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= 3. PRODUCTS & INVENTORY PERMISSIONS ================= */}
        <AnimatedEntranceView delay={160} direction="up" distance={14}>
          <View style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View style={[styles.moduleIcon, { backgroundColor: '#fffbeb' }]}>
                <Icon name="grid" size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <LocalizedText style={styles.moduleTitle}>Products &amp; Shelf Inventory</LocalizedText>
                <LocalizedText style={styles.moduleSub}>Store catalog, price tags &amp; aisles</LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>View Products &amp; Prices</LocalizedText>
                <LocalizedText style={styles.permDesc}>Check shelf inventory and barcode database</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.products.view ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.products.view ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.products.view ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Add New Products (Create)</LocalizedText>
                <LocalizedText style={styles.permDesc}>Scan and register new barcodes in store</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.products.create ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.products.create ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.products.create ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Update Stock Count &amp; Price</LocalizedText>
                <LocalizedText style={styles.permDesc}>Adjust aisle shelf stock and price tags</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.products.update ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.products.update ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.products.update ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>

            <View style={[styles.permRow, { borderBottomWidth: 0 }]}>
              <View style={styles.permInfo}>
                <LocalizedText style={styles.permName}>Delete / Archive Products</LocalizedText>
                <LocalizedText style={styles.permDesc}>Remove discontinued SKUs from store</LocalizedText>
              </View>
              <View style={[styles.statusTag, perms.products.delete ? styles.tagGreen : styles.tagGray]}>
                <LocalizedText style={[styles.tagText, perms.products.delete ? styles.tagTextGreen : styles.tagTextGray]}>
                  {perms.products.delete ? 'ALLOWED' : 'LOCKED'}
                </LocalizedText>
              </View>
            </View>
          </View>
        </AnimatedEntranceView>

        {/* ================= REQUEST ACCESS UPGRADE ================= */}
        <AnimatedEntranceView delay={200} direction="up" distance={14}>
          <TouchableOpacity
            style={styles.upgradeBtn}
            scaleTo={0.96}
            onPress={() => setShowRequestModal(true)}
          >
            <Icon name="key" size={17} color="#258B3E" style={{ marginRight: 8 }} />
            <LocalizedText style={styles.upgradeBtnText}>
              Request Temporary Permission Elevation
            </LocalizedText>
          </TouchableOpacity>
        </AnimatedEntranceView>
      </ScrollView>

      {/* Elevation Request Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <LocalizedText style={styles.modalTitle}>Request Access Elevation</LocalizedText>
                <LocalizedText style={styles.modalSubtitle}>
                  Sent directly to Store Manager Cabin for approval:
                </LocalizedText>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                scaleTo={0.88}
                onPress={() => setShowRequestModal(false)}
              >
                <Icon name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <LocalizedText style={styles.modalFieldLabel}>Requested Permission:</LocalizedText>
            <View style={styles.modalChipsRow}>
              {['Void / Refund Bills', 'Cancel Order', 'Add New Product', 'Update Price Tag'].map(
                (mod) => {
                  const isSelected = requestedModule === mod;
                  return (
                    <TouchableOpacity
                      key={mod}
                      style={[styles.modalChip, isSelected && styles.modalChipActive]}
                      scaleTo={0.94}
                      onPress={() => setRequestedModule(mod)}
                    >
                      <LocalizedText
                        style={[styles.modalChipText, isSelected && styles.modalChipTextActive]}
                      >
                        {mod}
                      </LocalizedText>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <LocalizedText style={[styles.modalFieldLabel, { marginTop: 12 }]}>
              Reason for Special Access:
            </LocalizedText>
            <TextInput
              style={styles.modalInput}
              value={requestReason}
              onChangeText={setRequestReason}
              placeholder="e.g. Customer returned spoiled milk, need to void receipt #INV-8821"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              scaleTo={0.96}
              onPress={handleSendPermissionRequest}
            >
              <LocalizedText style={styles.modalSubmitBtnText}>
                Send Elevation Request to Cabin
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  roleHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  roleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleHeroTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  roleHeroSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  roleSummaryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    lineHeight: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8edea',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  moduleSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  permInfo: {
    flex: 1,
    marginRight: 12,
  },
  permName: {
    fontSize: 12.5,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  permDesc: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagGreen: {
    backgroundColor: '#EAF5ED',
  },
  tagGray: {
    backgroundColor: '#f3f4f6',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  tagTextGreen: {
    color: '#258B3E',
  },
  tagTextGray: {
    color: '#9ca3af',
  },

  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#258B3E',
    borderRadius: 16,
    paddingVertical: 14,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#258B3E',
  },

  // Modal
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
  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modalChip: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modalChipActive: {
    backgroundColor: '#258B3E',
    borderColor: '#258B3E',
  },
  modalChipText: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  modalChipTextActive: {
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
  modalSubmitBtn: {
    backgroundColor: '#258B3E',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default EmployeePermissionsGuideScreen;
