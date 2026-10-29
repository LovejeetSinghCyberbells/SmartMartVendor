jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

import { INVENTORY_FILTERS } from '../../../features/inventory/components/InventoryFilterTabs';
import { TEAM_FILTERS } from '../../../features/team/components/TeamFilterTabs';
import { ORDER_FILTERS } from '../../../features/orders/components/OrderFilterTabs';
import { colors } from '../../theme/colors';
import {
  getStaggerDelay,
  AnimatedEntranceView,
  Dialog,
  BottomSheet,
  Avatar,
  getRoleIcon,
  getRoleColors,
  Chip,
  StatusBadge,
  ConfirmBottomSheet,
  Divider,
  ListItem,
  InfoBanner,
  StatCard,
  SummaryRow,
  RadioOption,
  CalendarPicker,
  DatePickerField,
  formatReadableDate,
  isSameDay,
  isDateInRange,
  LivePulseBeacon,
  AnimatedSuccessCheckmark,
  CartBounceBadge,
  ShimmerLoadingCard,
} from './index';

describe('Common Components Configuration & Registry', () => {
  it('has consistent and valid inventory filter tabs', () => {
    expect(INVENTORY_FILTERS).toBeDefined();
    expect(INVENTORY_FILTERS.length).toBe(4);
    expect(INVENTORY_FILTERS.map((f) => f.key)).toEqual([
      'ALL',
      'IN_STOCK',
      'LOW',
      'OUT',
    ]);
  });

  it('has consistent and valid team filter tabs', () => {
    expect(TEAM_FILTERS).toBeDefined();
    expect(TEAM_FILTERS.length).toBe(6);
    expect(TEAM_FILTERS.map((f) => f.key)).toEqual([
      'ALL',
      'Manager',
      'Biller',
      'Online Orders',
      'Inventory',
      'Custom',
    ]);
  });

  it('has consistent and valid order filter tabs', () => {
    expect(ORDER_FILTERS).toBeDefined();
    expect(ORDER_FILTERS.length).toBe(6);
    expect(ORDER_FILTERS.map((f) => f.key)).toEqual([
      'ALL',
      'NEW',
      'PACKING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ]);
  });

  it('provides a centralized color palette in theme', () => {
    expect(colors.primary).toBe('#258B3E');
    expect(colors.textPrimary).toBe('#1a1a1a');
    expect(colors.background).toBe('#ffffff');
    expect(colors.success).toBe('#059669');
    expect(colors.danger).toBe('#dc2626');
    expect(colors.warning).toBe('#d97706');
    expect(colors.info).toBe('#2563eb');
  });

  it('computes staggered delay correctly for sequential animations', () => {
    expect(getStaggerDelay(0, 100, 50)).toBe(100);
    expect(getStaggerDelay(1, 100, 50)).toBe(150);
    expect(getStaggerDelay(2, 100, 50)).toBe(200);
    expect(getStaggerDelay(10, 100, 100, 500)).toBe(500); // capped at maxDelay
  });

  it('exports AnimatedEntranceView component cleanly', () => {
    expect(AnimatedEntranceView).toBeDefined();
  });

  it('exports animated Dialog and BottomSheet components cleanly', () => {
    expect(Dialog).toBeDefined();
    expect(BottomSheet).toBeDefined();
  });

  it('exports new common components cleanly (Avatar, Chip, StatusBadge, ConfirmBottomSheet)', () => {
    expect(Avatar).toBeDefined();
    expect(Chip).toBeDefined();
    expect(StatusBadge).toBeDefined();
    expect(ConfirmBottomSheet).toBeDefined();
  });

  it('exports modular reusable micro-components cleanly (Divider, ListItem, InfoBanner, StatCard, SummaryRow, RadioOption)', () => {
    expect(Divider).toBeDefined();
    expect(ListItem).toBeDefined();
    expect(InfoBanner).toBeDefined();
    expect(StatCard).toBeDefined();
    expect(SummaryRow).toBeDefined();
    expect(RadioOption).toBeDefined();
  });

  it('exports new interactive animated components cleanly (LivePulseBeacon, AnimatedSuccessCheckmark, CartBounceBadge, ShimmerLoadingCard)', () => {
    expect(LivePulseBeacon).toBeDefined();
    expect(AnimatedSuccessCheckmark).toBeDefined();
    expect(CartBounceBadge).toBeDefined();
    expect(ShimmerLoadingCard).toBeDefined();
  });

  it('provides calendar date picker and date utility helpers cleanly', () => {
    expect(CalendarPicker).toBeDefined();
    expect(DatePickerField).toBeDefined();

    const d1 = new Date(2026, 9, 29); // Oct 29, 2026
    const d2 = new Date(2026, 9, 29);
    const d3 = new Date(2026, 9, 31); // Oct 31, 2026

    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);

    expect(isDateInRange(new Date(2026, 9, 30), d1, d3)).toBe(true);
    expect(isDateInRange(new Date(2026, 10, 1), d1, d3)).toBe(false);

    const formatted = formatReadableDate(d1);
    expect(formatted).toContain('29');
    expect(formatted).toContain('Oct');
    expect(formatted).toContain('2026');
  });

  it('resolves correct profile icons and colors according to position or permission access', () => {
    // Store Manager with all access permissions
    expect(getRoleIcon('MANAGER')).toBe('shield');
    expect(getRoleIcon(undefined, { staff: { manage: true } })).toBe('shield');

    // Biller / Cashier with billing permissions
    expect(getRoleIcon('BILLER')).toBe('file-text');
    expect(getRoleIcon('Offline Cashier & Biller')).toBe('file-text');
    expect(getRoleIcon(undefined, { billing: { create: true } })).toBe('file-text');

    // Online Orders Specialist with order queue permissions
    expect(getRoleIcon('ORDERS')).toBe('package');
    expect(getRoleIcon('Online Orders Specialist')).toBe('package');
    expect(getRoleIcon(undefined, { orders: { view: true } })).toBe('package');

    // Inventory Manager with products update permissions
    expect(getRoleIcon('INVENTORY')).toBe('grid');
    expect(getRoleIcon('Inventory & Stock Manager')).toBe('grid');
    expect(getRoleIcon(undefined, { products: { update: true } })).toBe('grid');

    // Store Owner / Vendor
    expect(getRoleIcon('OWNER')).toBe('shopping-bag');
    expect(getRoleIcon('VENDOR')).toBe('shopping-bag');

    // Floor Supervisor / Custom
    expect(getRoleIcon('CUSTOM')).toBe('user-check');
    expect(getRoleIcon('Floor Supervisor')).toBe('user-check');

    // General fallback profile icon
    expect(getRoleIcon(undefined, undefined)).toBe('user');
    expect(getRoleIcon('')).toBe('user');

    // Role colors: white icons on rich role badges
    expect(getRoleColors('MANAGER').fg).toBe('#ffffff');
    expect(getRoleColors('MANAGER').bg).toBe('#2563eb');
    expect(getRoleColors('BILLER').fg).toBe('#ffffff');
    expect(getRoleColors('BILLER').bg).toBe('#16a34a');
    expect(getRoleColors('ORDERS').fg).toBe('#ffffff');
    expect(getRoleColors('ORDERS').bg).toBe('#d97706');
    expect(getRoleColors('INVENTORY').fg).toBe('#ffffff');
    expect(getRoleColors('INVENTORY').bg).toBe('#7c3aed');
    expect(getRoleColors('VENDOR').fg).toBe('#ffffff');
    expect(getRoleColors('VENDOR').bg).toBe('#258B3E');
  });
});

