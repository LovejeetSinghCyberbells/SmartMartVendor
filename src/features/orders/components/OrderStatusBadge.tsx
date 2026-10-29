import React from 'react';
import StatusBadge, { StatusBadgeVariant } from '../../../shared/components/common/StatusBadge';

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PACKING'
  | 'READY'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant?: StatusBadgeVariant; bg?: string; text?: string }
> = {
  NEW: { label: 'NEW', variant: 'warning' },
  ACCEPTED: { label: 'ACCEPTED', variant: 'info' },
  PACKING: { label: 'PACKING', bg: '#e0e7ff', text: '#4f46e5' },
  READY: { label: 'READY', variant: 'success' },
  ASSIGNED: { label: 'ASSIGNED', bg: '#fce7f3', text: '#db2777' },
  PICKED_UP: { label: 'PICKED UP', variant: 'purple' },
  OUT_FOR_DELIVERY: { label: 'OUT FOR DELIVERY', variant: 'teal' },
  DELIVERED: { label: 'DELIVERED', bg: '#d1fae5', text: '#047857' },
  REJECTED: { label: 'REJECTED', variant: 'danger' },
  CANCELLED: { label: 'CANCELLED', variant: 'neutral' },
};

const OrderStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;

  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      backgroundColor={config.bg}
      textColor={config.text}
      size={size}
    />
  );
};

export default OrderStatusBadge;
