import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocalizedText from '../../i18n/LocalizedText';
import { Dialog, DialogType } from '../common/Dialog';

type FeedbackKind = 'success' | 'error' | 'info';

export interface DialogOptions {
  title: string;
  message?: string;
  actionLabel?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface FeedbackContextValue {
  showDialog: (
    titleOrOptions: string | DialogOptions,
    message?: string,
    actionLabel?: string
  ) => void;
  showConfirm: (options: DialogOptions) => void;
  showToast: (message: string, kind?: FeedbackKind) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const TOAST_DURATION_MS = 2800;

export const FeedbackProvider = ({ children }: React.PropsWithChildren) => {
  const insets = useSafeAreaInsets();
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: FeedbackKind } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-12)).current;

  const showDialog = useCallback(
    (
      titleOrOptions: string | DialogOptions,
      message?: string,
      actionLabel = 'OK'
    ) => {
      if (typeof titleOrOptions === 'object') {
        setDialog(titleOrOptions);
      } else {
        setDialog({
          title: titleOrOptions,
          message: message || '',
          actionLabel,
          type: 'info',
        });
      }
    },
    []
  );

  const showConfirm = useCallback((options: DialogOptions) => {
    setDialog({
      type: 'confirm',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      ...options,
    });
  }, []);

  const showToast = useCallback(
    (message: string, kind: FeedbackKind = 'info') => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      setToast({ message, kind });
      toastOpacity.setValue(0);
      toastTranslateY.setValue(-12);
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(toastTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
      toastTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(toastTranslateY, {
            toValue: -12,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setToast(null);
          }
        });
        toastTimer.current = null;
      }, TOAST_DURATION_MS);
    },
    [toastOpacity, toastTranslateY]
  );

  useEffect(() => () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
  }, []);

  const value = useMemo(
    () => ({ showDialog, showConfirm, showToast }),
    [showDialog, showConfirm, showToast]
  );

  const toastColor =
    toast?.kind === 'error'
      ? '#dc2626'
      : toast?.kind === 'success'
      ? '#258B3E'
      : '#258B3E';

  const toastIcon =
    toast?.kind === 'error'
      ? 'alert-circle'
      : toast?.kind === 'success'
      ? 'check-circle'
      : 'info';

  const handleCloseDialog = () => {
    dialog?.onCancel?.();
    setDialog(null);
  };

  const handleConfirmDialog = () => {
    const callback = dialog?.onConfirm;
    setDialog(null);
    callback?.();
  };

  return (
    <FeedbackContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="none"
            accessibilityRole="alert"
            style={[
              styles.toast,
              {
                top: insets.top + 12,
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
                borderLeftColor: toastColor,
              },
            ]}
          >
            <Icon name={toastIcon} size={20} color={toastColor} />
            <LocalizedText style={styles.toastText}>{toast.message}</LocalizedText>
          </Animated.View>
        )}
      </View>

      <Dialog
        visible={dialog !== null}
        onClose={handleCloseDialog}
        title={dialog?.title || ''}
        message={dialog?.message}
        type={dialog?.type || 'info'}
        icon={dialog?.icon}
        confirmText={dialog?.confirmText || dialog?.actionLabel || 'OK'}
        cancelText={dialog?.cancelText}
        onConfirm={handleConfirmDialog}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider.');
  }
  return context;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    backgroundColor: '#ffffff',
    shadowColor: '#183323',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 10,
  },
  toastText: {
    marginLeft: 10,
    color: '#1a1a1a',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
});

export default FeedbackProvider;
