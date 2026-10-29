import { PermissionsAndroid, Platform, Vibration } from 'react-native';
import {
  checkVibratePermission,
  safeVibrate,
  safeVibrationCancel,
} from './vibration';

describe('vibration utility - crash prevention for Android VIBRATE permission', () => {
  let vibrateSpy: jest.SpyInstance;
  let cancelSpy: jest.SpyInstance;

  beforeEach(() => {
    vibrateSpy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    cancelSpy = jest.spyOn(Vibration, 'cancel').mockImplementation(() => {});
  });

  afterEach(() => {
    vibrateSpy.mockRestore();
    cancelSpy.mockRestore();
  });

  it('safely checks vibration permission without throwing', async () => {
    const result = await checkVibratePermission();
    expect(typeof result).toBe('boolean');
  });

  it('safely invokes safeVibrate', () => {
    expect(() => safeVibrate(100)).not.toThrow();
  });

  it('safely invokes safeVibrationCancel', () => {
    expect(() => safeVibrationCancel()).not.toThrow();
  });
});

