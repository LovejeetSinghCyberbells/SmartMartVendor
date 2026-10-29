import {
  ROLE_PERMISSIONS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_LEAVE_REQUESTS,
  createPermissions,
  isLeaveReasonRequired,
} from './StaffRoleContext';

describe('Staff Role & Permissions System', () => {
  it('defines MANAGER with all CRUD permissions', () => {
    const manager = ROLE_PERMISSIONS.MANAGER;
    expect(manager.canManageOrders).toBe(true);
    expect(manager.canCreateBills).toBe(true);
    expect(manager.canManageInventory).toBe(true);
    expect(manager.canManageStaff).toBe(true);

    expect(manager.products).toEqual({ view: true, create: true, update: true, delete: true });
    expect(manager.billing).toEqual({ view: true, create: true, update: true, delete: true });
    expect(manager.orders).toEqual({ view: true, create: true, update: true, delete: true });
    expect(manager.staff).toEqual({ view: true, manage: true });
  });

  it('defines BILLER with bills only permissions', () => {
    const biller = ROLE_PERMISSIONS.BILLER;
    expect(biller.canCreateBills).toBe(true);
    expect(biller.canManageOrders).toBe(false);
    expect(biller.canManageInventory).toBe(false);
    expect(biller.canManageStaff).toBe(false);

    expect(biller.billing.view).toBe(true);
    expect(biller.billing.create).toBe(true);
    expect(biller.products.view).toBe(false);
    expect(biller.orders.view).toBe(false);
  });

  it('defines ORDERS with online orders only permissions', () => {
    const orders = ROLE_PERMISSIONS.ORDERS;
    expect(orders.canManageOrders).toBe(true);
    expect(orders.canCreateBills).toBe(false);
    expect(orders.canManageInventory).toBe(false);
    expect(orders.canManageStaff).toBe(false);

    expect(orders.orders.view).toBe(true);
    expect(orders.orders.create).toBe(true);
    expect(orders.products.view).toBe(false);
    expect(orders.billing.view).toBe(false);
  });

  it('defines INVENTORY with shelf stock only permissions', () => {
    const inventory = ROLE_PERMISSIONS.INVENTORY;
    expect(inventory.canManageInventory).toBe(true);
    expect(inventory.canManageOrders).toBe(false);
    expect(inventory.canCreateBills).toBe(false);
    expect(inventory.canManageStaff).toBe(false);

    expect(inventory.products.view).toBe(true);
    expect(inventory.products.create).toBe(true);
    expect(inventory.products.update).toBe(true);
    expect(inventory.products.delete).toBe(true);
    expect(inventory.billing.view).toBe(false);
    expect(inventory.orders.view).toBe(false);
  });

  it('creates custom role with granular CRUD permissions without conflict', () => {
    const custom = createPermissions({
      products: { view: true, create: true, update: false, delete: false },
      billing: { view: false, create: false, update: false, delete: false },
      orders: { view: true, create: true, update: true, delete: false },
      staff: { view: true, manage: false },
    });

    expect(custom.products.create).toBe(true);
    expect(custom.products.delete).toBe(false);
    expect(custom.billing.view).toBe(false);
    expect(custom.orders.update).toBe(true);
    expect(custom.staff.manage).toBe(false);
    expect(custom.canManageInventory).toBe(true);
    expect(custom.canCreateBills).toBe(false);
  });

  it('initializes staff personas covering presets and custom roles', () => {
    expect(INITIAL_STAFF_MEMBERS.length).toBeGreaterThanOrEqual(5);
    const roles = INITIAL_STAFF_MEMBERS.map((s) => s.role);
    expect(roles).toContain('MANAGER');
    expect(roles).toContain('BILLER');
    expect(roles).toContain('ORDERS');
    expect(roles).toContain('INVENTORY');
    expect(roles).toContain('CUSTOM');
  });

  describe('Leave Application & Review Rules', () => {
    it('does not require reason for sick or emergency leaves', () => {
      expect(isLeaveReasonRequired('Sick Leave')).toBe(false);
      expect(isLeaveReasonRequired('sick')).toBe(false);
      expect(isLeaveReasonRequired('Emergency')).toBe(false);
      expect(isLeaveReasonRequired('Medical Emergency')).toBe(false);
    });

    it('strictly requires reason for casual leaves and other types', () => {
      expect(isLeaveReasonRequired('Casual Leave')).toBe(true);
      expect(isLeaveReasonRequired('casual')).toBe(true);
      expect(isLeaveReasonRequired('Shift Swap')).toBe(true);
      expect(isLeaveReasonRequired('Planned Vacation')).toBe(true);
    });

    it('contains initial leave applications covering pending, approved, and rejected states', () => {
      expect(INITIAL_LEAVE_REQUESTS.length).toBeGreaterThanOrEqual(3);

      const pending = INITIAL_LEAVE_REQUESTS.find((r) => r.status === 'Pending');
      expect(pending).toBeDefined();

      const approved = INITIAL_LEAVE_REQUESTS.find((r) => r.status === 'Approved');
      expect(approved).toBeDefined();
      expect(approved?.reviewedBy).toBeDefined();

      const rejected = INITIAL_LEAVE_REQUESTS.find((r) => r.status === 'Rejected');
      expect(rejected).toBeDefined();
      expect(rejected?.rejectionReason).toBeTruthy();
      expect(rejected?.rejectionReason?.length).toBeGreaterThan(5);
    });
  });
});
