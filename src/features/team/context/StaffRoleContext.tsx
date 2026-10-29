import React, { createContext, useContext, useState, useMemo } from 'react';

export type EmployeeRole = 'MANAGER' | 'BILLER' | 'ORDERS' | 'INVENTORY' | 'CUSTOM';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  type: string; // 'Casual Leave' | 'Sick Leave' | 'Emergency' | 'Shift Swap'
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  rejectionReason?: string;
  reviewedBy?: 'Manager' | 'Vendor';
  reviewedAt?: string;
}

export const isLeaveReasonRequired = (leaveType: string): boolean => {
  if (!leaveType) return true;
  const normalized = leaveType.toLowerCase().trim();
  if (normalized.includes('sick') || normalized.includes('emergency')) {
    return false;
  }
  return true;
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-2',
    employeeName: 'Priya Patel',
    employeeRole: 'Offline Cashier & Biller',
    type: 'Casual Leave',
    startDate: 'Thu, 29 Oct 2026',
    endDate: 'Fri, 30 Oct 2026',
    days: 2,
    reason: 'Family wedding out of town',
    status: 'Pending',
    appliedOn: 'Today',
  },
  {
    id: 'leave-2',
    employeeId: 'emp-3',
    employeeName: 'Amit Kumar',
    employeeRole: 'Online Orders Specialist',
    type: 'Sick Leave',
    startDate: 'Mon, 12 Oct 2026',
    endDate: 'Mon, 12 Oct 2026',
    days: 1,
    reason: '',
    status: 'Approved',
    appliedOn: '12 Oct 2026',
    reviewedBy: 'Manager',
    reviewedAt: '12 Oct 2026',
  },
  {
    id: 'leave-3',
    employeeId: 'emp-4',
    employeeName: 'Vikram Singh',
    employeeRole: 'Inventory & Stock Manager',
    type: 'Emergency',
    startDate: 'Wed, 21 Oct 2026',
    endDate: 'Wed, 21 Oct 2026',
    days: 1,
    reason: '',
    status: 'Approved',
    appliedOn: '21 Oct 2026',
    reviewedBy: 'Vendor',
    reviewedAt: '21 Oct 2026',
  },
  {
    id: 'leave-4',
    employeeId: 'emp-5',
    employeeName: 'Sneha Roy',
    employeeRole: 'Floor Supervisor',
    type: 'Casual Leave',
    startDate: 'Sat, 17 Oct 2026',
    endDate: 'Sat, 17 Oct 2026',
    days: 1,
    reason: 'Personal leisure trip',
    status: 'Rejected',
    rejectionReason: 'Saturday evening peak hours — mandatory floor supervision required.',
    appliedOn: '15 Oct 2026',
    reviewedBy: 'Manager',
    reviewedAt: '16 Oct 2026',
  },
];

export interface CrudProductsPermissions {
  view: boolean;   // View product catalog, prices & aisle locations
  create: boolean; // Add new product SKU to store catalog
  update: boolean; // Adjust shelf stock & edit price tags
  delete: boolean; // Delete or archive product SKU
}

export interface CrudBillingPermissions {
  view: boolean;   // View POS counter billing register & receipts
  create: boolean; // Create new walk-in bills & collect payment
  update: boolean; // Edit cart quantities & apply discounts
  delete: boolean; // Void or cancel bill transaction
}

export interface CrudOrdersPermissions {
  view: boolean;   // View online customer orders queue
  create: boolean; // Process / pick & pack order items
  update: boolean; // Dispatch / hand over to delivery boys
  delete: boolean; // Reject or cancel order items
}

export interface CrudStaffPermissions {
  view: boolean;   // View store staff list & shift schedule
  manage: boolean; // Add, configure permissions, or remove staff members
}

export interface EmployeePermissions {
  products: CrudProductsPermissions;
  billing: CrudBillingPermissions;
  orders: CrudOrdersPermissions;
  staff: CrudStaffPermissions;

  // Backwards-compatible convenience helpers
  canManageOrders: boolean;
  canCreateBills: boolean;
  canManageInventory: boolean;
  canManageStaff: boolean;
}

export function createPermissions(crud: {
  products?: Partial<CrudProductsPermissions>;
  billing?: Partial<CrudBillingPermissions>;
  orders?: Partial<CrudOrdersPermissions>;
  staff?: Partial<CrudStaffPermissions>;
}): EmployeePermissions {
  const products: CrudProductsPermissions = {
    view: !!crud.products?.view,
    create: !!crud.products?.create,
    update: !!crud.products?.update,
    delete: !!crud.products?.delete,
  };
  const billing: CrudBillingPermissions = {
    view: !!crud.billing?.view,
    create: !!crud.billing?.create,
    update: !!crud.billing?.update,
    delete: !!crud.billing?.delete,
  };
  const orders: CrudOrdersPermissions = {
    view: !!crud.orders?.view,
    create: !!crud.orders?.create,
    update: !!crud.orders?.update,
    delete: !!crud.orders?.delete,
  };
  const staff: CrudStaffPermissions = {
    view: !!crud.staff?.view,
    manage: !!crud.staff?.manage,
  };

  return {
    products,
    billing,
    orders,
    staff,
    canManageOrders: orders.view || orders.create || orders.update,
    canCreateBills: billing.view || billing.create,
    canManageInventory: products.view || products.create || products.update,
    canManageStaff: staff.manage,
  };
}

export interface StoreEmployee {
  id: string;
  name: string;
  phone: string;
  role: EmployeeRole;
  roleTitle: string;
  avatarText: string;
  avatarUrl?: string;
  status: 'Active' | 'On Break' | 'Offline';
  shift: string;
  permissions: EmployeePermissions;
  isCustomRole?: boolean;
}

export const ROLE_PERMISSIONS: Record<EmployeeRole, EmployeePermissions> = {
  MANAGER: createPermissions({
    products: { view: true, create: true, update: true, delete: true },
    billing: { view: true, create: true, update: true, delete: true },
    orders: { view: true, create: true, update: true, delete: true },
    staff: { view: true, manage: true },
  }),
  BILLER: createPermissions({
    products: { view: false, create: false, update: false, delete: false },
    billing: { view: true, create: true, update: true, delete: false },
    orders: { view: false, create: false, update: false, delete: false },
    staff: { view: false, manage: false },
  }),
  ORDERS: createPermissions({
    products: { view: false, create: false, update: false, delete: false },
    billing: { view: false, create: false, update: false, delete: false },
    orders: { view: true, create: true, update: true, delete: false },
    staff: { view: false, manage: false },
  }),
  INVENTORY: createPermissions({
    products: { view: true, create: true, update: true, delete: true },
    billing: { view: false, create: false, update: false, delete: false },
    orders: { view: false, create: false, update: false, delete: false },
    staff: { view: false, manage: false },
  }),
  CUSTOM: createPermissions({
    products: { view: false, create: false, update: false, delete: false },
    billing: { view: false, create: false, update: false, delete: false },
    orders: { view: false, create: false, update: false, delete: false },
    staff: { view: false, manage: false },
  }),
};

export const INITIAL_STAFF_MEMBERS: StoreEmployee[] = [
  {
    id: 'emp-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    role: 'MANAGER',
    roleTitle: 'Store Manager',
    avatarText: 'RS',
    status: 'Active',
    shift: 'Full Day (09:00 AM – 08:00 PM)',
    permissions: ROLE_PERMISSIONS.MANAGER,
  },
  {
    id: 'emp-2',
    name: 'Priya Patel',
    phone: '+91 87654 32109',
    role: 'BILLER',
    roleTitle: 'Offline Cashier & Biller',
    avatarText: 'PP',
    status: 'Active',
    shift: 'Morning Shift (10:00 AM – 06:00 PM)',
    permissions: ROLE_PERMISSIONS.BILLER,
  },
  {
    id: 'emp-3',
    name: 'Amit Kumar',
    phone: '+91 76543 21098',
    role: 'ORDERS',
    roleTitle: 'Online Orders Specialist',
    avatarText: 'AK',
    status: 'Active',
    shift: 'Fulfillment Shift (08:00 AM – 04:00 PM)',
    permissions: ROLE_PERMISSIONS.ORDERS,
  },
  {
    id: 'emp-4',
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    role: 'INVENTORY',
    roleTitle: 'Inventory & Stock Manager',
    avatarText: 'VS',
    status: 'Active',
    shift: 'Floor Shift (11:00 AM – 07:00 PM)',
    permissions: ROLE_PERMISSIONS.INVENTORY,
  },
  {
    id: 'emp-5',
    name: 'Sneha Roy',
    phone: '+91 65432 10987',
    role: 'CUSTOM',
    roleTitle: 'Floor Supervisor',
    avatarText: 'SR',
    status: 'Active',
    shift: 'Evening Shift (02:00 PM – 10:00 PM)',
    permissions: createPermissions({
      products: { view: true, create: true, update: true, delete: false },
      billing: { view: true, create: false, update: false, delete: false },
      orders: { view: true, create: true, update: false, delete: false },
      staff: { view: true, manage: false },
    }),
    isCustomRole: true,
  },
];

interface StaffRoleContextType {
  currentEmployee: StoreEmployee;
  allStaff: StoreEmployee[];
  switchEmployee: (employeeId: string) => void;
  updateEmployeePermissions: (
    employeeId: string,
    permissions: Partial<EmployeePermissions>,
    role?: EmployeeRole,
    customRoleTitle?: string
  ) => void;
  addStaffMember: (
    newStaff: Omit<StoreEmployee, 'id' | 'permissions' | 'avatarText'> & {
      permissions?: EmployeePermissions;
    }
  ) => void;
  leaveRequests: LeaveRequest[];
  pendingLeaveCount: number;
  applyLeaveRequest: (
    request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>
  ) => void;
  approveLeaveRequest: (requestId: string, reviewer?: 'Manager' | 'Vendor') => void;
  rejectLeaveRequest: (
    requestId: string,
    rejectionReason: string,
    reviewer?: 'Manager' | 'Vendor'
  ) => void;
}

const StaffRoleContext = createContext<StaffRoleContextType>({
  currentEmployee: INITIAL_STAFF_MEMBERS[0],
  allStaff: INITIAL_STAFF_MEMBERS,
  switchEmployee: () => {},
  updateEmployeePermissions: () => {},
  addStaffMember: () => {},
  leaveRequests: INITIAL_LEAVE_REQUESTS,
  pendingLeaveCount: 1,
  applyLeaveRequest: () => {},
  approveLeaveRequest: () => {},
  rejectLeaveRequest: () => {},
});

export const StaffRoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allStaff, setAllStaff] =
    useState<StoreEmployee[]>(INITIAL_STAFF_MEMBERS);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp-1');
  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);

  const pendingLeaveCount = useMemo(
    () => leaveRequests.filter((r) => r.status === 'Pending').length,
    [leaveRequests]
  );

  const applyLeaveRequest = (
    request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>
  ) => {
    const newRecord: LeaveRequest = {
      ...request,
      id: `leave-${Date.now()}`,
      status: 'Pending',
      appliedOn: 'Today',
    };
    setLeaveRequests((prev) => [newRecord, ...prev]);
  };

  const approveLeaveRequest = (
    requestId: string,
    reviewer: 'Manager' | 'Vendor' = 'Manager'
  ) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved',
              reviewedBy: reviewer,
              reviewedAt: 'Today',
            }
          : r
      )
    );
  };

  const rejectLeaveRequest = (
    requestId: string,
    rejectionReason: string,
    reviewer: 'Manager' | 'Vendor' = 'Manager'
  ) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
              reviewedBy: reviewer,
              reviewedAt: 'Today',
            }
          : r
      )
    );
  };

  const currentEmployee =
    allStaff.find((e) => e.id === currentEmployeeId) || allStaff[0];

  const switchEmployee = (employeeId: string) => {
    const exists = allStaff.find((e) => e.id === employeeId);
    if (exists) {
      setCurrentEmployeeId(employeeId);
    }
  };

  const updateEmployeePermissions = (
    employeeId: string,
    permissions: Partial<EmployeePermissions>,
    role?: EmployeeRole,
    customRoleTitle?: string
  ) => {
    setAllStaff((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const updatedRole = role || emp.role;
          const mergedProducts = {
            ...emp.permissions.products,
            ...(permissions.products || {}),
          };
          const mergedBilling = {
            ...emp.permissions.billing,
            ...(permissions.billing || {}),
          };
          const mergedOrders = {
            ...emp.permissions.orders,
            ...(permissions.orders || {}),
          };
          const mergedStaff = {
            ...emp.permissions.staff,
            ...(permissions.staff || {}),
          };

          const fullPermissions = createPermissions({
            products: mergedProducts,
            billing: mergedBilling,
            orders: mergedOrders,
            staff: mergedStaff,
          });

          let roleTitle = emp.roleTitle;
          if (updatedRole === 'CUSTOM') {
            roleTitle = customRoleTitle || emp.roleTitle || 'Custom Role';
          } else if (role) {
            roleTitle =
              updatedRole === 'MANAGER'
                ? 'Store Manager'
                : updatedRole === 'BILLER'
                ? 'Offline Cashier & Biller'
                : updatedRole === 'ORDERS'
                ? 'Online Orders Specialist'
                : 'Inventory & Stock Manager';
          }

          return {
            ...emp,
            role: updatedRole,
            roleTitle,
            isCustomRole: updatedRole === 'CUSTOM',
            permissions: fullPermissions,
          };
        }
        return emp;
      })
    );
  };

  const addStaffMember = (
    newStaff: Omit<StoreEmployee, 'id' | 'permissions' | 'avatarText'> & {
      permissions?: EmployeePermissions;
    }
  ) => {
    const id = `emp-${Date.now()}`;
    const role = newStaff.role;
    const permissions =
      newStaff.permissions || ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CUSTOM;
    const initials = newStaff.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const created: StoreEmployee = {
      ...newStaff,
      id,
      avatarText: initials || 'ST',
      permissions,
      isCustomRole: role === 'CUSTOM',
    };

    setAllStaff((prev) => [...prev, created]);
  };

  return (
    <StaffRoleContext.Provider
      value={{
        currentEmployee,
        allStaff,
        switchEmployee,
        updateEmployeePermissions,
        addStaffMember,
        leaveRequests,
        pendingLeaveCount,
        applyLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
      }}
    >
      {children}
    </StaffRoleContext.Provider>
  );
};

export const useStaffRole = () => useContext(StaffRoleContext);
