import React from 'react';
import ConfirmBottomSheet from '../../../shared/components/common/ConfirmBottomSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  addressLabel?: string;
}

const DeleteConfirmSheet: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  addressLabel,
}) => {
  return (
    <ConfirmBottomSheet
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      icon="trash-2"
      title="Delete Address?"
      message={
        addressLabel
          ? `Are you sure you want to delete “${addressLabel}”? This action cannot be undone.`
          : 'Are you sure you want to delete this address? This action cannot be undone.'
      }
      confirmText="Yes, Delete"
      cancelText="Cancel"
    />
  );
};

export default DeleteConfirmSheet;
