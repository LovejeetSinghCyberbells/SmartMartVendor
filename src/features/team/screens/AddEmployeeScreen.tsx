import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { ScreenHeader } from '../../../shared/components/common';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';
import {
  useStaffRole,
  EmployeeRole,
  ROLE_PERMISSIONS,
  EmployeePermissions,
  createPermissions,
  CrudProductsPermissions,
  CrudBillingPermissions,
  CrudOrdersPermissions,
  CrudStaffPermissions,
} from '../context/StaffRoleContext';
import { colors } from '../../../shared/theme/colors';

interface RoleOption {
  key: EmployeeRole;
  title: string;
  badge: string;
  description: string;
  icon: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'MANAGER',
    title: 'Store Manager',
    badge: 'ALL ACCESS',
    description: 'Full CRUD on products, bills, online orders & staff management',
    icon: 'shield',
  },
  {
    key: 'BILLER',
    title: 'Biller / Cashier',
    badge: 'BILLS ONLY',
    description: 'Walk-in counter billing, cart edits & customer bill receipts',
    icon: 'file-text',
  },
  {
    key: 'ORDERS',
    title: 'Online Orders Specialist',
    badge: 'ORDERS ONLY',
    description: 'Order queue, item picking, packing & delivery boy handover',
    icon: 'package',
  },
  {
    key: 'INVENTORY',
    title: 'Inventory Manager',
    badge: 'STOCK ONLY',
    description: 'Store products, shelf stock counts, price tags & aisles',
    icon: 'grid',
  },
  {
    key: 'CUSTOM',
    title: 'Custom Role',
    badge: 'CUSTOM CRUD',
    description: 'Define your own role name and grant specific CRUD permissions',
    icon: 'settings',
  },
];

const AddEmployeeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addStaffMember } = useStaffRole();
  const { showDialog, showToast } = useFeedback();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<EmployeeRole>('BILLER');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [permissions, setPermissions] = useState<EmployeePermissions>(
    ROLE_PERMISSIONS.BILLER
  );

  const handleSelectRole = (newRole: EmployeeRole) => {
    setRole(newRole);
    setPermissions(ROLE_PERMISSIONS[newRole]);
  };

  const handleToggleCrud = (
    moduleKey: 'products' | 'billing' | 'orders' | 'staff',
    crudKey: string
  ) => {
    setPermissions((prev) => {
      const moduleObj = { ...(prev[moduleKey] as any) };
      moduleObj[crudKey] = !moduleObj[crudKey];

      return createPermissions({
        products: moduleKey === 'products' ? moduleObj : prev.products,
        billing: moduleKey === 'billing' ? moduleObj : prev.billing,
        orders: moduleKey === 'orders' ? moduleObj : prev.orders,
        staff: moduleKey === 'staff' ? moduleObj : prev.staff,
      });
    });

    // If user modifies permissions while on preset, automatically mark as CUSTOM
    if (role !== 'CUSTOM') {
      setRole('CUSTOM');
      if (!customRoleTitle) {
        const option = ROLE_OPTIONS.find((r) => r.key === role);
        setCustomRoleTitle(`${option?.title || 'Custom'} (Customized)`);
      }
    }
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      showDialog({
        title: 'Missing Fields',
        message: 'Please enter employee name and phone number',
        type: 'warning',
      });
      return;
    }

    if (role === 'CUSTOM' && !customRoleTitle.trim()) {
      showDialog({
        title: 'Custom Role Title Required',
        message: 'Please provide a name for this custom role (e.g. Night Supervisor, Stock Auditor)',
        type: 'warning',
      });
      return;
    }

    const defaultTitle = ROLE_OPTIONS.find((r) => r.key === role)?.title || 'Store Associate';
    const roleTitle = role === 'CUSTOM' ? customRoleTitle.trim() : defaultTitle;

    addStaffMember({
      name: name.trim(),
      phone: phone.trim(),
      role,
      roleTitle,
      status: 'Active',
      shift: 'Standard Shift (10:00 AM – 07:00 PM)',
      permissions,
      isCustomRole: role === 'CUSTOM',
    });

    showToast(`Staff member "${name.trim()}" added with ${roleTitle} permissions`, 'success');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Add Store Staff"
        onBack={() => navigation.goBack()}
        showBorder={false}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info */}
        <View style={styles.card}>
          <LocalizedText style={styles.sectionHeading}>Staff Member Details</LocalizedText>

          <LocalizedText style={styles.fieldLabel}>Full Name *</LocalizedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Chandra"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <LocalizedText style={styles.fieldLabel}>Phone Number *</LocalizedText>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Role Selection */}
        <View style={styles.card}>
          <LocalizedText style={styles.sectionHeading}>Store Role &amp; Access Tier</LocalizedText>
          <LocalizedText style={styles.sectionSubtitle}>
            Select a preset role or create a custom role with tailored CRUD permissions:
          </LocalizedText>

          <View style={styles.rolesList}>
            {ROLE_OPTIONS.map((item) => {
              const isSelected = role === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.roleCard, isSelected && styles.roleCardActive]}
                  scaleTo={0.96}
                  onPress={() => handleSelectRole(item.key)}
                >
                  <View style={styles.roleCardTop}>
                    <View style={styles.roleTitleRow}>
                      <View
                        style={[
                          styles.roleIconWrap,
                          isSelected && { backgroundColor: colors.primary },
                        ]}
                      >
                        <Icon
                          name={item.icon as any}
                          size={16}
                          color={isSelected ? '#ffffff' : colors.primary}
                        />
                      </View>
                      <LocalizedText style={styles.roleNameText}>
                        {item.title}
                      </LocalizedText>
                    </View>

                    <View
                      style={[
                        styles.roleBadge,
                        isSelected && { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <LocalizedText
                        style={[
                          styles.roleBadgeText,
                          isSelected && { color: colors.primaryDark },
                        ]}
                      >
                        {item.badge}
                      </LocalizedText>
                    </View>
                  </View>

                  <LocalizedText style={styles.roleDescText}>
                    {item.description}
                  </LocalizedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Role Name Input if CUSTOM is active */}
          {role === 'CUSTOM' && (
            <View style={styles.customRoleInputBox}>
              <LocalizedText style={styles.fieldLabel}>Custom Role Name *</LocalizedText>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. Senior Floor Supervisor, Stock Auditor"
                placeholderTextColor="#9ca3af"
                value={customRoleTitle}
                onChangeText={setCustomRoleTitle}
              />
              <LocalizedText style={styles.customHint}>
                This role name will be shown on the employee’s profile, badge &amp; shift logs.
              </LocalizedText>
            </View>
          )}
        </View>

        {/* ===================== CRUD PERMISSIONS CHECKLIST ===================== */}

        {/* 1. Products & Inventory CRUD */}
        <View style={styles.card}>
          <View style={styles.crudSectionHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#fffbeb' }]}>
              <Icon name="grid" size={16} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Products &amp; Inventory Permissions
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Access to in-store products, shelf stock counts &amp; price tags
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Products (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can view store product catalog, stock levels &amp; aisle placement
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Add Product (Create)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can add new product SKUs and barcodes to the store catalog
                </LocalizedText>
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
                <LocalizedText style={styles.crudSub}>
                  Can adjust shelf quantities (+/-) and edit price tags on the floor
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Delete Product (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can remove or archive product SKUs from the store
                </LocalizedText>
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
          <View style={styles.crudSectionHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#EAF5ED' }]}>
              <Icon name="file-text" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Walk-in POS Billing Permissions
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Customer counter checkout, payment collection &amp; bill receipts
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Billing Counter (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can open POS billing counter and view product prices
                </LocalizedText>
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
                <LocalizedText style={styles.crudSub}>
                  Can scan items, accept Cash/UPI, and generate customer receipts
                </LocalizedText>
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
                <LocalizedText style={styles.crudSub}>
                  Can adjust billing cart quantities and apply custom item discounts
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Void / Cancel Bills (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can void pending cart sessions or delete erroneous billing slips
                </LocalizedText>
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
          <View style={styles.crudSectionHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Icon name="package" size={16} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Online Orders Fulfillment Permissions
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Picking, packing &amp; delivery boy handover (Swiggy, Zomato, Blinkit)
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Orders Queue (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can view incoming customer online orders and item lists
                </LocalizedText>
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
                <LocalizedText style={styles.crudSub}>
                  Can start order picking from aisles and mark bags packed
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Delivery Rider Handover (Update)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can verify rider OTP and hand over staged order bags
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Reject / Cancel Orders (Delete)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can reject out-of-stock items or cancel unfulfillable orders
                </LocalizedText>
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
          <View style={styles.crudSectionHeader}>
            <View style={[styles.crudIconWrap, { backgroundColor: '#ede9fe' }]}>
              <Icon name="users" size={16} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <LocalizedText style={styles.crudSectionTitle}>
                Store Staff &amp; Shift Permissions
              </LocalizedText>
              <LocalizedText style={styles.crudSectionSub}>
                Team oversight, roster access &amp; permission settings
              </LocalizedText>
            </View>
          </View>

          <View style={styles.crudList}>
            <View style={styles.crudRow}>
              <View style={styles.crudInfo}>
                <LocalizedText style={styles.crudTitle}>View Team Roster (Read)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can view fellow staff members and daily shift timings
                </LocalizedText>
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
                <LocalizedText style={styles.crudTitle}>Manage Staff &amp; Roles (Admin)</LocalizedText>
                <LocalizedText style={styles.crudSub}>
                  Can add staff, change permissions, or reassign shifts
                </LocalizedText>
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
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.saveBtn}
          scaleTo={0.96}
          onPress={handleSave}
        >
          <Icon name="check" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <LocalizedText style={styles.saveBtnText}>Save Staff &amp; Permissions</LocalizedText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8edea',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textPrimary,
    backgroundColor: '#f9fafb',
  },
  rolesList: {
    gap: 8,
  },
  roleCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 12,
    backgroundColor: '#ffffff',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#EAF5ED',
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  roleNameText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  roleBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  roleDescText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  customRoleInputBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#edf2ee',
  },
  customInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: colors.textPrimary,
    backgroundColor: '#ffffff',
  },
  customHint: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.primaryDark,
    marginTop: 5,
  },

  // CRUD Section Styling
  crudSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: colors.textPrimary,
  },
  crudSectionSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
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
    marginRight: 12,
  },
  crudTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textPrimary,
  },
  crudSub: {
    fontSize: 10.5,
    fontFamily: 'Poppins-Regular',
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 14,
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
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default AddEmployeeScreen;
