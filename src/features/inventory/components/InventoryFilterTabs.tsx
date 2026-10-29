import React from 'react';
import FilterTabs, { FilterTabItem } from '../../../shared/components/common/FilterTabs';

export const INVENTORY_FILTERS: FilterTabItem[] = [
  { key: 'ALL', label: 'All' },
  { key: 'IN_STOCK', label: 'In Stock' },
  { key: 'LOW', label: 'Low Stock' },
  { key: 'OUT', label: 'Out of Stock' },
];

interface Props {
  active: string;
  onChange: (key: string) => void;
  counts?: Record<string, number>;
}

const InventoryFilterTabs: React.FC<Props> = ({ active, onChange, counts = {} }) => {
  return (
    <FilterTabs
      filters={INVENTORY_FILTERS}
      active={active}
      onChange={onChange}
      counts={counts}
      showZeroCount={false}
    />
  );
};

export default InventoryFilterTabs;
