import React from 'react';
import FilterTabs, { FilterTabItem } from '../../../shared/components/common/FilterTabs';

export const TEAM_FILTERS: FilterTabItem[] = [
  { key: 'ALL', label: 'All Staff' },
  { key: 'Manager', label: 'Manager' },
  { key: 'Biller', label: 'Biller (POS)' },
  { key: 'Online Orders', label: 'Online Orders' },
  { key: 'Inventory', label: 'Inventory' },
  { key: 'Custom', label: 'Custom Roles' },
];

interface Props {
  active: string;
  onChange: (key: string) => void;
  counts?: Record<string, number>;
}

const TeamFilterTabs: React.FC<Props> = ({ active, onChange, counts = {} }) => {
  return (
    <FilterTabs
      filters={TEAM_FILTERS}
      active={active}
      onChange={onChange}
      counts={counts}
      showZeroCount={true}
    />
  );
};

export default TeamFilterTabs;