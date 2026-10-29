import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';
import BottomSheet from './BottomSheet';

export type ConfirmType = 'danger' | 'warning' | 'primary' | 'success';

export interface ConfirmBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  type?: ConfirmType;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  confirmBtnStyle?: StyleProp<ViewStyle>;
  cancelBtnStyle?: StyleProp<ViewStyle>;
}

const TYPE_CONFIG: Record<
  ConfirmType,
  { icon: string; iconBg: string; iconColor: string; btnBg: string; btnText: string }
> = {
  danger: {
    icon: 'trash-2',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    btnBg: '#dc2626',
    btnText: '#ffffff',
  },
  warning: {
    icon: 'alert-triangle',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    btnBg: '#d97706',
    btnText: '#ffffff',
  },
  primary: {
    icon: 'check',
    iconBg: '#EAF5ED',
    iconColor: '#258B3E',
    btnBg: '#258B3E',
    btnText: '#ffffff',
  },
  success: {
    icon: 'check-circle',
    iconBg: '#d1fae5',
    iconColor: '#059669',
    btnBg: '#059669',
    btnText: '#ffffff',
  },
};

export const ConfirmBottomSheet: React.FC<ConfirmBottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  icon,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  children,
  confirmBtnStyle,
  cancelBtnStyle,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.danger;
  const iconName = icon || config.icon;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      iconScale.setValue(0.6);
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, iconScale]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      showHandle
      contentStyle={styles.sheet}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: config.iconBg,
            transform: [{ scale: iconScale }],
          },
        ]}
      >
        <Icon name={iconName as any} size={28} color={config.iconColor} />
      </Animated.View>

      <LocalizedText style={styles.title}>{title}</LocalizedText>
      {message ? (
        <LocalizedText style={styles.subtitle}>{message}</LocalizedText>
      ) : null}

      {children}

      <TouchableOpacity
        style={[
          styles.confirmBtn,
          { backgroundColor: config.btnBg },
          loading && styles.confirmBtnLoading,
          confirmBtnStyle,
        ]}
        scaleTo={0.94}
        activeOpacity={0.85}
        disabled={loading}
        onPress={onConfirm}
      >
        {loading ? (
          <ActivityIndicator color={config.btnText} size="small" />
        ) : (
          <LocalizedText
            style={[styles.confirmBtnText, { color: config.btnText }]}
          >
            {confirmText}
          </LocalizedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelBtn, cancelBtnStyle]}
        scaleTo={0.94}
        activeOpacity={0.8}
        disabled={loading}
        onPress={onClose}
      >
        <LocalizedText
          style={[styles.cancelBtnText, loading && { opacity: 0.4 }]}
        >
          {cancelText}
        </LocalizedText>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmBtnLoading: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cancelBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
});

export default ConfirmBottomSheet;

