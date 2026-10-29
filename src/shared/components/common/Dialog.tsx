import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export type DialogType = 'info' | 'success' | 'warning' | 'destructive' | 'confirm';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: DialogType;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  icon,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  loading = false,
  children,
}) => {
  const [rendered, setRendered] = useState(visible);
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      scaleAnim.setValue(0.82);
      opacityAnim.setValue(0);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6.5,
          tension: 190,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible, rendered, scaleAnim, opacityAnim, backdropAnim]);

  if (!rendered && !visible) return null;

  const handleConfirm = () => {
    if (loading) return;
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  // Determine icon and colors based on type
  const isDestructive = type === 'destructive';
  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  const defaultIcon = isDestructive
    ? 'alert-triangle'
    : isWarning
    ? 'alert-circle'
    : isSuccess
    ? 'check-circle'
    : type === 'confirm'
    ? 'help-circle'
    : 'info';

  const activeIcon = icon || defaultIcon;

  const iconColor = isDestructive
    ? '#dc2626'
    : isWarning
    ? '#d97706'
    : isSuccess
    ? '#258B3E'
    : '#258B3E';

  const iconBg = isDestructive
    ? '#fee2e2'
    : isWarning
    ? '#fef3c7'
    : '#EAF5ED';

  const confirmBtnBg = isDestructive ? '#dc2626' : '#258B3E';

  return (
    <Modal
      transparent
      visible={rendered}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Dialog Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Icon name={activeIcon as any} size={28} color={iconColor} />
          </View>

          {/* Title */}
          <LocalizedText style={styles.title}>{title}</LocalizedText>

          {/* Message */}
          {message ? (
            <LocalizedText style={styles.message}>{message}</LocalizedText>
          ) : null}

          {/* Custom Content */}
          {children}

          {/* Actions */}
          <View style={[styles.actionsRow, !cancelText && styles.singleActionRow]}>
            {cancelText ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                scaleTo={0.94}
                activeOpacity={0.8}
                disabled={loading}
                onPress={handleClose}
              >
                <LocalizedText style={styles.cancelBtnText}>{cancelText}</LocalizedText>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: confirmBtnBg },
                !cancelText && styles.fullWidthBtn,
              ]}
              scaleTo={0.94}
              activeOpacity={0.85}
              disabled={loading}
              onPress={handleConfirm}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <LocalizedText style={styles.confirmBtnText}>{confirmText}</LocalizedText>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  singleActionRow: {
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b5563',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidthBtn: {
    flex: 1,
    maxWidth: '100%',
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

export default Dialog;
