import React from 'react';
import ConfirmBottomSheet from '../../../shared/components/common/ConfirmBottomSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const LogoutBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  title = 'Logout?',
  message = 'Are you sure you want to logout? You will need to sign in again to manage your store.',
  confirmText = 'Yes, Logout',
  cancelText = 'Stay Logged In',
}) => {
  return (
    <ConfirmBottomSheet
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      type="danger"
      icon="log-out"
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  );
};

export default LogoutBottomSheet;
