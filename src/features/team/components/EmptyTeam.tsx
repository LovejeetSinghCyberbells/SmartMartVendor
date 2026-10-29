import React from 'react';
import EmptyState from '../../../shared/components/common/EmptyState';

interface Props {
  onAdd?: () => void;
}

const EmptyTeam: React.FC<Props> = ({ onAdd }) => {
  return (
    <EmptyState
      icon="users"
      title="No Team Members"
      subtitle="Add employees to manage orders efficiently"
      actionLabel="Add Employee"
      onAction={onAdd}
      actionIcon="plus"
    />
  );
};

export default EmptyTeam;
