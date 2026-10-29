import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalizationProvider } from '../../../shared/i18n/LocalizationProvider';
import {
  WorkingHoursScreen,
  timeToMinutes,
  formatTimeString,
  parseTimeString,
  calculateOperatingDuration,
} from './WorkingHoursScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('WorkingHoursScreen & Time Helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Time Calculation Utilities', () => {
    it('timeToMinutes converts AM/PM times accurately', () => {
      expect(timeToMinutes('12:00 AM')).toBe(0);
      expect(timeToMinutes('08:00 AM')).toBe(480);
      expect(timeToMinutes('12:00 PM')).toBe(720);
      expect(timeToMinutes('02:30 PM')).toBe(870);
      expect(timeToMinutes('10:00 PM')).toBe(1320);
      expect(timeToMinutes('11:30 PM')).toBe(1410);
      expect(timeToMinutes('')).toBe(0);
    });

    it('formatTimeString formats 12-hour values with leading zeros', () => {
      expect(formatTimeString(8, 0, 'AM')).toBe('08:00 AM');
      expect(formatTimeString(10, 30, 'PM')).toBe('10:30 PM');
      expect(formatTimeString(12, 15, 'PM')).toBe('12:15 PM');
      expect(formatTimeString(6, 5, 'AM')).toBe('06:05 AM');
    });

    it('parseTimeString parses valid 12-hour strings', () => {
      expect(parseTimeString('08:00 AM')).toEqual({ hour: 8, minute: 0, period: 'AM' });
      expect(parseTimeString('10:45 PM')).toEqual({ hour: 10, minute: 45, period: 'PM' });
      expect(parseTimeString('')).toEqual({ hour: 8, minute: 0, period: 'AM' });
    });

    it('calculateOperatingDuration computes accurate day span with or without afternoon break', () => {
      // 8 AM to 10 PM = 14h
      expect(calculateOperatingDuration('08:00 AM', '10:00 PM', false)).toBe('14h');
      // 9 AM to 9:30 PM = 12h 30m
      expect(calculateOperatingDuration('09:00 AM', '09:30 PM', false)).toBe('12h 30m');
      // 8 AM to 10 PM with 1.5h break = 12h 30m
      expect(calculateOperatingDuration('08:00 AM', '10:00 PM', true, '02:00 PM', '03:30 PM')).toBe('12h 30m');
    });
  });

  describe('WorkingHoursScreen Component Lifecycle', () => {
    it('renders correctly and loads stored settings on mount', async () => {
      const mockNavigation = { goBack: jest.fn() };
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await act(async () => {
        renderer = ReactTestRenderer.create(
          <LocalizationProvider>
            <WorkingHoursScreen navigation={mockNavigation} />
          </LocalizationProvider>
        );
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@smartmart_working_hours_schedule');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@smartmart_working_hours_buffer');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@smartmart_working_hours_vacation');
      expect(renderer!.root).toBeTruthy();
    });
  });
});
