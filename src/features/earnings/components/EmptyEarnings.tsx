import React from 'react';
import EmptyState from '../../../shared/components/common/EmptyState';

const EmptyEarnings = () => {
  return (
    <EmptyState
      icon="bar-chart-2"
      title="No Settlements Yet"
      subtitle="Your settlement history will appear here once payouts start"
    />
  );
};

export default EmptyEarnings;
