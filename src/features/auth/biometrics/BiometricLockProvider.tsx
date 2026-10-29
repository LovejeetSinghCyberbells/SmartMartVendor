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
  AppState,
  Modal,
  NativeModules,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Icon from '@react-native-vector-icons/feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import { useFeedback } from '../../../shared/components/feedback/FeedbackProvider';

const BIOMETRIC_LOCK_STORAGE_KEY = '@smart-mart/biometric-lock-enabled';
const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isBiometricsNativeModuleAvailable = (): boolean =>
  typeof NativeModules.ReactNativeBiometrics?.isSensorAvailable === 'function' &&
  typeof NativeModules.ReactNativeBiometrics?.simplePrompt === 'function';

interface BiometricLockContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  setAuthenticated: (authenticated: boolean) => void;
}

const BiometricLockContext = createContext<BiometricLockContextValue | null>(null);

export const BiometricLockProvider = ({ children }: React.PropsWithChildren) => {
  const insets = useSafeAreaInsets();
  const { showDialog } = useFeedback();
  const [enabled, setEnabledState] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lockError, setLockError] = useState('');
  const enabledRef = useRef(false);
  const authenticatedRef = useRef(false);
  const authenticationInProgress = useRef(false);
  const currentAppState = useRef<string | null | undefined>(AppState.currentState);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (authenticationInProgress.current) {
      return false;
    }

    authenticationInProgress.current = true;
    setIsAuthenticating(true);
    setLockError('');
    try {
      if (!isBiometricsNativeModuleAvailable()) {
        throw new Error('Native biometric module is not installed in this app build. Rebuild and reinstall the native app.');
      }
      const result = await biometrics.simplePrompt({
        promptMessage: 'Unlock SmartMart',
        fallbackPromptMessage: 'Use your device passcode',
        cancelButtonText: 'Cancel',
      });
      if (!result.success) {
        setLockError('Authentication was cancelled. Verify to continue.');
        return false;
      }
      setIsLocked(false);
      return true;
    } catch {
      setLockError('Authentication could not be completed. Check your device security settings and try again.');
      return false;
    } finally {
      authenticationInProgress.current = false;
      setIsAuthenticating(false);
    }
  }, []);

  const restoreSetting = useCallback(async () => {
    try {
      const storedValue = await AsyncStorage.getItem(BIOMETRIC_LOCK_STORAGE_KEY);
      const shouldLock = storedValue === 'true';
      enabledRef.current = shouldLock;
      setEnabledState(shouldLock);
      setIsLocked(shouldLock && authenticatedRef.current);
      setLockError('');
      setIsReady(true);
      if (shouldLock && AppState.currentState === 'active') {
        await authenticate();
      }
    } catch {
      enabledRef.current = true;
      setEnabledState(true);
      setIsLocked(authenticatedRef.current);
      setLockError('Could not load your lock setting. Retry before continuing.');
      setIsReady(true);
    }
  }, [authenticate]);

  useEffect(() => {
    restoreSetting();
  }, [restoreSetting]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = currentAppState.current;
      currentAppState.current = nextState;
      if (!enabledRef.current || !authenticatedRef.current) {
        return;
      }
      if (nextState !== 'active') {
        setIsLocked(true);
        setLockError('');
      } else if (previousState !== 'active') {
        authenticate();
      }
    });
    return () => subscription.remove();
  }, [authenticate]);

  const setAuthenticated = useCallback((authenticated: boolean) => {
    if (authenticatedRef.current === authenticated) {
      return;
    }
    authenticatedRef.current = authenticated;
    if (!authenticated) {
      setIsLocked(false);
      setLockError('');
      return;
    }
    if (enabledRef.current) {
      setIsLocked(true);
      authenticate();
    }
  }, [authenticate]);

  const setEnabled = useCallback(async (nextEnabled: boolean): Promise<boolean> => {
    if (!authenticatedRef.current) {
      showDialog('Login required', 'Sign in to your SmartMart account before changing the biometric lock setting.');
      return false;
    }

    if (!nextEnabled) {
      try {
        await AsyncStorage.removeItem(BIOMETRIC_LOCK_STORAGE_KEY);
        enabledRef.current = false;
        setEnabledState(false);
        setIsLocked(false);
        setLockError('');
        return true;
      } catch {
        showDialog('Unable to turn off biometric lock', 'Your lock setting could not be updated. Please try again.');
        return false;
      }
    }

    let sensor: Awaited<ReturnType<typeof biometrics.isSensorAvailable>>;
    if (!isBiometricsNativeModuleAvailable()) {
      showDialog(
        'Biometric module unavailable',
        'This installed app does not include the native biometric module. Rebuild and reinstall the app, then try again.',
      );
      return false;
    }
    try {
      sensor = await biometrics.isSensorAvailable();
    } catch (error) {
      console.error('Unable to check biometric sensor availability.', error);
      showDialog(
        'Unable to check biometrics',
        `Could not check device authentication support. ${getErrorMessage(error)}`,
      );
      return false;
    }

    if (!sensor.available) {
      showDialog(
        'Biometrics unavailable',
        sensor.error
          ? `Set up Face ID, fingerprint, or a device passcode in your device settings. (${sensor.error})`
          : 'Set up Face ID, fingerprint, or a device passcode in your device settings before turning on this lock.',
      );
      return false;
    }

    const authenticated = await authenticate();
    if (!authenticated) {
      showDialog(
        'Authentication required',
        'The biometric lock was not enabled because device authentication did not succeed.',
      );
      return false;
    }

    try {
      await AsyncStorage.setItem(BIOMETRIC_LOCK_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Unable to persist the biometric lock setting.', error);
      showDialog(
        'Unable to save biometric lock',
        `Authentication succeeded, but the lock setting could not be saved. ${getErrorMessage(error)}`,
      );
      return false;
    }
    enabledRef.current = true;
    setEnabledState(true);
    setIsLocked(false);
    return true;
  }, [authenticate, showDialog]);

  const value = useMemo(
    () => ({ enabled, setEnabled, setAuthenticated }),
    [enabled, setEnabled, setAuthenticated],
  );

  return (
    <BiometricLockContext.Provider value={value}>
      <View style={styles.appRoot}>{children}</View>
      <Modal
        visible={!isReady || isLocked}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => undefined}
      >
        <View style={[styles.lockScreen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.brandMark}>
            <Icon name="shopping-bag" size={34} color="#258e43" />
          </View>
          <LocalizedText style={styles.title}>
            {isReady ? 'SmartMart is locked' : 'Checking app lock'}
          </LocalizedText>
          <LocalizedText style={styles.subtitle}>
            {isReady
              ? 'Verify with biometrics or your device passcode to continue.'
              : 'Please wait while SmartMart checks your security settings.'}
          </LocalizedText>
          {lockError ? (
            <LocalizedText accessibilityRole="alert" style={styles.errorText}>
              {lockError}
            </LocalizedText>
          ) : null}
          {isReady ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Unlock SmartMart"
                style={[styles.unlockButton, isAuthenticating && styles.unlockButtonDisabled]}
                disabled={isAuthenticating}
                activeOpacity={0.85}
                onPress={() => {
                  if (enabledRef.current) {
                    authenticate();
                  } else {
                    restoreSetting();
                  }
                }}
              >
                <Icon name="lock" size={19} color="#ffffff" />
                <LocalizedText style={styles.unlockButtonText}>
                  {isAuthenticating ? 'Verifying...' : 'Unlock with biometrics'}
                </LocalizedText>
              </TouchableOpacity>
              <LocalizedText style={styles.footerText}>
                Your app stays locked until verification succeeds.
              </LocalizedText>
            </>
          ) : null}
        </View>
      </Modal>
    </BiometricLockContext.Provider>
  );
};

export const useBiometricLock = (): BiometricLockContextValue => {
  const context = useContext(BiometricLockContext);
  if (!context) {
    throw new Error('useBiometricLock must be used within BiometricLockProvider.');
  }
  return context;
};

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  lockScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f5faf6',
  },
  brandMark: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    borderRadius: 30,
    backgroundColor: '#e4f4e8',
  },
  title: {
    color: '#18261c',
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
    marginTop: 10,
    color: '#68756b',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    color: '#b73636',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  unlockButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 30,
    borderRadius: 17,
    backgroundColor: '#258e43',
  },
  unlockButtonDisabled: {
    opacity: 0.65,
  },
  unlockButtonText: {
    marginLeft: 10,
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  footerText: {
    position: 'absolute',
    bottom: 28,
    color: '#849087',
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
});
