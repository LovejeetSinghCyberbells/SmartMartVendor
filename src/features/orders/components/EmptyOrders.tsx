import React from 'react';
import EmptyState from '../../../shared/components/common/EmptyState';

const EmptyOrders = () => {
  return (
    <EmptyState
      icon="package"
      title="No Orders Found"
      subtitle="Orders matching this filter will appear here"
      containerStyle={{ paddingTop: 80 }}
    />
  );
};

export default EmptyOrders;
