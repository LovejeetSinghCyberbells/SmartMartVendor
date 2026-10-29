import React from 'react';
import StatusBadge from '../../../shared/components/common/StatusBadge';

export type TeamRole =
  | 'Manager'
  | 'Biller'
  | 'Online Orders'
  | 'Inventory'
  | 'Custom'
  | 'Picker'
  | 'Packer'
  | 'Delivery';

interface Props {
  role: TeamRole;
  customLabel?: string;
  size?: 'sm' | 'md';
}

const ROLE_CONFIG: Record<TeamRole, { bg: string; text: string }> = {
  Manager: { bg: '#ede9fe', text: '#7c3aed' },
  Biller: { bg: '#d1fae5', text: '#059669' },
  'Online Orders': { bg: '#dbeafe', text: '#2563eb' },
  Inventory: { bg: '#fef3c7', text: '#d97706' },
  Custom: { bg: '#f3e8ff', text: '#9333ea' },
  Picker: { bg: '#e0f2fe', text: '#0284c7' },
  Packer: { bg: '#ffedd5', text: '#ea580c' },
  Delivery: { bg: '#dcfce7', text: '#16a34a' },
};

const RoleBadge: React.FC<Props> = ({ role, customLabel, size = 'md' }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Custom;

  return (
    <StatusBadge
      label={customLabel || role}
      backgroundColor={config.bg}
      textColor={config.text}
      size={size}
    />
  );
};

export default RoleBadge;
