import React from 'react';
import EmptyState from '../../../shared/components/common/EmptyState';

interface Props {
  onAdd?: () => void;
}

const EmptyInventory: React.FC<Props> = ({ onAdd }) => {
  return (
    <EmptyState
      icon="box"
      title="No Products Found"
      subtitle="Add products to your inventory to start selling"
      actionLabel="Add Product"
      onAction={onAdd}
      actionIcon="plus"
    />
  );
};

export default EmptyInventory;
