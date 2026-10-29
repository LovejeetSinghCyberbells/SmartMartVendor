import React from 'react';
import FilterTabs, { FilterTabItem } from '../../../shared/components/common/FilterTabs';

export const ORDER_FILTERS: FilterTabItem[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'PACKING', label: 'Packing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out' },
  { key: 'DELIVERED', label: 'Delivered' },
];

interface Props {
  active: string;
  onChange: (key: string) => void;
  counts?: Record<string, number>;
}

const OrderFilterTabs: React.FC<Props> = ({ active, onChange, counts = {} }) => {
  return (
    <FilterTabs
      filters={ORDER_FILTERS}
      active={active}
      onChange={onChange}
      counts={counts}
      showZeroCount={false}
    />
  );
};

export default OrderFilterTabs;
