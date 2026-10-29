import React from 'react';
import StatusBadge from '../../../shared/components/common/StatusBadge';

interface Props {
  stock: number;
  lowThreshold?: number;
  size?: 'sm' | 'md';
}

const StockBadge: React.FC<Props> = ({ stock, lowThreshold = 10, size = 'md' }) => {
  let variant: 'success' | 'warning' | 'danger' = 'success';
  let label = 'In Stock';

  if (stock === 0) {
    variant = 'danger';
    label = 'Out of Stock';
  } else if (stock <= lowThreshold) {
    variant = 'warning';
    label = 'Low Stock';
  }

  return (
    <StatusBadge
      label={`${label} (${stock})`}
      variant={variant}
      showDot={stock === 0}
      size={size}
    />
  );
};

export default StockBadge;
