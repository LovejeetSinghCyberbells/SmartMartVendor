import { PermissionsAndroid, Platform, Vibration } from 'react-native';

/**
 * Defensive Vibration Utility
 *
 * Prevents Android fatal SecurityException crashes:
 * "cancelVibrate: Neither user nor current process has android.permission.VIBRATE"
 *
 * This occurs if:
 * 1. The native APK running on the device was compiled before `android.permission.VIBRATE` was added to AndroidManifest.xml.
 * 2. `Vibration.cancel()` or `Vibration.vibrate()` is invoked on Android when permission is missing.
 *
 * By checking `PermissionsAndroid.check('android.permission.VIBRATE')`, we ensure
 * the native bridge never calls native `vibrator.cancel()` or `vibrator.vibrate()` unless
 * permission is actually registered in the running APK.
 */

let isVibrateGranted: boolean = Platform.OS !== 'android';
let isChecked: boolean = Platform.OS !== 'android';

/**
 * Asynchronously checks if VIBRATE permission is available in current process.
 */
export const checkVibratePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    isVibrateGranted = true;
    isChecked = true;
    return true;
  }

  try {
    const granted = await PermissionsAndroid.check(
      'android.permission.VIBRATE' as any
    );
    isVibrateGranted = Boolean(granted);
    isChecked = true;
    return isVibrateGranted;
  } catch {
    isVibrateGranted = false;
    isChecked = true;
    return false;
  }
};

// Check on module load on Android
if (Platform.OS === 'android') {
  checkVibratePermission().catch(() => {
    isVibrateGranted = false;
    isChecked = true;
  });
}

/**
 * Safely trigger vibration without risking an unhandled native SecurityException
 */
export const safeVibrate = (pattern?: number | number[], repeat?: boolean) => {
  if (Platform.OS === 'android') {
    // If not yet verified or explicitly denied, verify before invoking
    if (!isChecked) {
      checkVibratePermission()
        .then((granted) => {
          if (granted) {
            try {
              if (pattern !== undefined) {
                Vibration.vibrate(pattern as any, repeat);
              } else {
                Vibration.vibrate();
              }
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});
      return;
    }

    if (!isVibrateGranted) {
      // Permission not present in installed APK; skip native call to prevent crash
      return;
    }
  }

  try {
    if (pattern !== undefined) {
      Vibration.vibrate(pattern as any, repeat);
    } else {
      Vibration.vibrate();
    }
  } catch {
    // ignore
  }
};

/**
 * Safely cancel active vibration without risking an unhandled native SecurityException
 */
export const safeVibrationCancel = () => {
  if (Platform.OS === 'android') {
    if (!isChecked) {
      checkVibratePermission()
        .then((granted) => {
          if (granted) {
            try {
              Vibration.cancel();
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});
      return;
    }

    if (!isVibrateGranted) {
      // Avoid calling cancelVibrate when missing permission
      return;
    }
  }

  try {
    Vibration.cancel();
  } catch {
    // ignore
  }
};
