import React from 'react';
import { Vibration } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { StaffRoleProvider } from './StaffRoleContext';
import { FloorPagerProvider, useFloorPager } from './FloorPagerContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('FloorPagerContext - In-Store Floor Pager & Cabin Summon', () => {
  let pagerRef: ReturnType<typeof useFloorPager>;
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  let vibrateSpy: jest.SpyInstance;
  let cancelSpy: jest.SpyInstance;

  const TestConsumer = () => {
    pagerRef = useFloorPager();
    return null;
  };

  const renderWithProviders = () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <StaffRoleProvider>
          <FloorPagerProvider>
            <TestConsumer />
          </FloorPagerProvider>
        </StaffRoleProvider>
      );
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    vibrateSpy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
    cancelSpy = jest.spyOn(Vibration, 'cancel').mockImplementation(() => {});
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    vibrateSpy.mockRestore();
    cancelSpy.mockRestore();
  });

  it('initializes with default empty summon alert state', () => {
    renderWithProviders();
    expect(pagerRef.activeIncomingAlert).toBeNull();
    expect(pagerRef.activeOutgoingCall).toBeNull();
    expect(pagerRef.recentAlerts).toEqual([]);
  });

  it('sends an in-store cabin notification to employee', () => {
    renderWithProviders();

    act(() => {
      pagerRef.sendCabinNotification(
        'emp-2',
        'Manager Cabin #1',
        'Please come to Cabin #1 when available.'
      );
    });

    expect(pagerRef.recentAlerts.length).toBe(1);
    const alert = pagerRef.recentAlerts[0];
    expect(alert.targetEmployeeId).toBe('emp-2');
    expect(alert.location).toBe('Manager Cabin #1');
    expect(alert.message).toBe('Please come to Cabin #1 when available.');
    expect(alert.status).toBe('NOTIFIED');
    expect(alert.isUrgentRing).toBe(false);
  });

  it('triggers urgent 20-second ringer with vibration buzzer', () => {
    renderWithProviders();

    act(() => {
      pagerRef.ringEmployeePhone(
        'emp-2',
        'Manager Cabin #1',
        'Please come to the office immediately!'
      );
    });

    expect(vibrateSpy).toHaveBeenCalled();
    expect(pagerRef.activeIncomingAlert).not.toBeNull();
    expect(pagerRef.activeIncomingAlert?.status).toBe('RINGING');
    expect(pagerRef.activeIncomingAlert?.totalSeconds).toBe(20);
    expect(pagerRef.activeIncomingAlert?.remainingSeconds).toBe(20);
    expect(pagerRef.activeIncomingAlert?.isUrgentRing).toBe(true);

    // Verify countdown reduces every second
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(pagerRef.activeIncomingAlert?.remainingSeconds).toBe(17);
  });

  it('stops vibration and marks status as ACKNOWLEDGED when employee answers "I\'m on my way"', () => {
    renderWithProviders();

    act(() => {
      pagerRef.ringEmployeePhone('emp-2', 'Manager Cabin #1');
    });

    const alertId = pagerRef.activeIncomingAlert!.id;

    act(() => {
      pagerRef.acknowledgeAlert(alertId);
    });

    expect(cancelSpy).toHaveBeenCalled();
    expect(pagerRef.activeIncomingAlert).toBeNull();
  });

  it('silences buzzer and dismisses alert when dismiss is clicked', () => {
    renderWithProviders();

    act(() => {
      pagerRef.ringEmployeePhone('emp-2', 'Main Office');
    });

    const alertId = pagerRef.activeIncomingAlert!.id;

    act(() => {
      pagerRef.dismissAlert(alertId);
    });

    expect(cancelSpy).toHaveBeenCalled();
    expect(pagerRef.activeIncomingAlert).toBeNull();
  });

  it('auto-dismisses alert and stops buzzer after 20 seconds timeout', () => {
    renderWithProviders();

    act(() => {
      pagerRef.ringEmployeePhone('emp-2', 'Billing Counter');
    });

    expect(pagerRef.activeIncomingAlert?.status).toBe('RINGING');

    // Advance 21 seconds
    act(() => {
      jest.advanceTimersByTime(21000);
    });

    expect(cancelSpy).toHaveBeenCalled();
    expect(pagerRef.activeIncomingAlert).toBeNull();
  });

  it('cancels outgoing call when manager hangs up', () => {
    renderWithProviders();

    act(() => {
      pagerRef.ringEmployeePhone('emp-2', 'Manager Cabin #1');
    });

    expect(pagerRef.activeOutgoingCall).not.toBeNull();

    act(() => {
      pagerRef.cancelOutgoingCall();
    });

    expect(cancelSpy).toHaveBeenCalled();
    expect(pagerRef.activeOutgoingCall).toBeNull();
  });
});

