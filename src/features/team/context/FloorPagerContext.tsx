import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useStaffRole } from './StaffRoleContext';
import { safeVibrate, safeVibrationCancel } from '../../../shared/utils/vibration';

export interface SummonAlert {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  location: string;
  message: string;
  isUrgentRing: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  timestamp: number;
  status: 'RINGING' | 'NOTIFIED' | 'ACKNOWLEDGED' | 'DISMISSED';
}

interface FloorPagerContextType {
  activeIncomingAlert: SummonAlert | null;
  activeIncomingNotification: SummonAlert | null;
  activeOutgoingCall: SummonAlert | null;
  recentAlerts: SummonAlert[];
  sendCabinNotification: (
    targetEmployeeId: string,
    location: string,
    customMessage?: string
  ) => void;
  ringEmployeePhone: (
    targetEmployeeId: string,
    location: string,
    customMessage?: string
  ) => void;
  testIncomingSummon: (isUrgent: boolean) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  cancelOutgoingCall: () => void;
}

const FloorPagerContext = createContext<FloorPagerContextType>({
  activeIncomingAlert: null,
  activeIncomingNotification: null,
  activeOutgoingCall: null,
  recentAlerts: [],
  sendCabinNotification: () => {},
  ringEmployeePhone: () => {},
  testIncomingSummon: () => {},
  acknowledgeAlert: () => {},
  dismissAlert: () => {},
  cancelOutgoingCall: () => {},
});

const INITIAL_RECENT_ALERTS: SummonAlert[] = [
  {
    id: 'alert-init-1',
    senderId: '1',
    senderName: 'Sunita Rao',
    senderRole: 'Store Manager',
    targetEmployeeId: '2',
    targetEmployeeName: 'Priya Sharma',
    location: 'Manager Cabin #1',
    message: 'Shift handoff and POS cash counter verification.',
    isUrgentRing: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    timestamp: Date.now() - 35 * 60 * 1000,
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'alert-init-2',
    senderId: '1',
    senderName: 'Sunita Rao',
    senderRole: 'Store Manager',
    targetEmployeeId: '3',
    targetEmployeeName: 'Rahul Verma',
    location: 'Dispatch Bay #4',
    message: 'Blinkit order #TK-1024 rush pickup ready for sealing.',
    isUrgentRing: true,
    totalSeconds: 20,
    remainingSeconds: 0,
    timestamp: Date.now() - 75 * 60 * 1000,
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'alert-init-3',
    senderId: '1',
    senderName: 'Sunita Rao',
    senderRole: 'Store Manager',
    targetEmployeeId: '4',
    targetEmployeeName: 'Vikram Patel',
    location: 'Aisle 1 • Produce',
    message: 'Fresh vegetables shipment arrived at back dock.',
    isUrgentRing: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    timestamp: Date.now() - 110 * 60 * 1000,
    status: 'DISMISSED',
  },
];

export const FloorPagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentEmployee, allStaff } = useStaffRole();
  const [activeAlert, setActiveAlert] = useState<SummonAlert | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SummonAlert[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVibratingRef = useRef<boolean>(false);

  // Vibration Helpers
  const startVibration = () => {
    try {
      if (Platform.OS === 'android') {
        // Repeated buzzer pattern: 500ms vibrate, 300ms pause
        safeVibrate([0, 500, 300, 500, 300, 500], true);
      } else {
        safeVibrate();
      }
      isVibratingRef.current = true;
    } catch {
      // safe fallback
    }
  };

  const stopVibration = () => {
    if (!isVibratingRef.current) return;
    try {
      safeVibrationCancel();
    } catch {
      // safe fallback
    } finally {
      isVibratingRef.current = false;
    }
  };

  // 20-Second Active Countdown Loop
  useEffect(() => {
    if (activeAlert && activeAlert.status === 'RINGING' && activeAlert.isUrgentRing) {
      startVibration();

      timerRef.current = setInterval(() => {
        setActiveAlert((prev) => {
          if (!prev || prev.status !== 'RINGING') {
            if (timerRef.current) clearInterval(timerRef.current);
            stopVibration();
            return prev;
          }

          if (prev.remainingSeconds <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            stopVibration();
            return {
              ...prev,
              remainingSeconds: 0,
              status: 'DISMISSED',
            };
          }

          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopVibration();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopVibration();
    };
  }, [activeAlert?.id, activeAlert?.status]);

  // Send Standard Cabin Notification
  const sendCabinNotification = (
    targetEmployeeId: string,
    location: string,
    customMessage?: string
  ) => {
    const target = allStaff.find((e) => e.id === targetEmployeeId);
    const targetName = target?.name || 'Staff Member';
    const message = customMessage || `Please come to ${location} when available.`;

    const alertItem: SummonAlert = {
      id: `alert-${Date.now()}`,
      senderId: currentEmployee.id,
      senderName: currentEmployee.name,
      senderRole: currentEmployee.roleTitle,
      targetEmployeeId,
      targetEmployeeName: targetName,
      location,
      message,
      isUrgentRing: false,
      totalSeconds: 0,
      remainingSeconds: 0,
      timestamp: Date.now(),
      status: 'NOTIFIED',
    };

    setActiveAlert(alertItem);
    setRecentAlerts((prev) => [alertItem, ...prev.slice(0, 24)]);
  };

  // Ring Employee Phone for 20 Seconds
  const ringEmployeePhone = (
    targetEmployeeId: string,
    location: string,
    customMessage?: string
  ) => {
    const target = allStaff.find((e) => e.id === targetEmployeeId);
    const targetName = target?.name || 'Staff Member';
    const message = customMessage || `Please come to ${location} immediately.`;

    const alertItem: SummonAlert = {
      id: `ring-${Date.now()}`,
      senderId: currentEmployee.id,
      senderName: currentEmployee.name,
      senderRole: currentEmployee.roleTitle,
      targetEmployeeId,
      targetEmployeeName: targetName,
      location,
      message,
      isUrgentRing: true,
      totalSeconds: 20,
      remainingSeconds: 20,
      timestamp: Date.now(),
      status: 'RINGING',
    };

    setActiveAlert(alertItem);
    setRecentAlerts((prev) => [alertItem, ...prev.slice(0, 24)]);
  };

  // Quick Demo Simulator to test incoming alert on this device
  const testIncomingSummon = (isUrgent: boolean) => {
    const manager = allStaff.find((e) => e.role === 'MANAGER') || allStaff[0];
    const alertItem: SummonAlert = {
      id: `test-${Date.now()}`,
      senderId: manager.id,
      senderName: manager.name,
      senderRole: manager.roleTitle,
      targetEmployeeId: currentEmployee.id,
      targetEmployeeName: currentEmployee.name,
      location: 'Manager Cabin #1',
      message: isUrgent
        ? 'Urgent floor summon from Store Manager. Please report immediately.'
        : 'Please come to Manager Cabin #1 for shift handoff.',
      isUrgentRing: isUrgent,
      totalSeconds: isUrgent ? 20 : 0,
      remainingSeconds: isUrgent ? 20 : 0,
      timestamp: Date.now(),
      status: isUrgent ? 'RINGING' : 'NOTIFIED',
    };

    setActiveAlert(alertItem);
    setRecentAlerts((prev) => [alertItem, ...prev.slice(0, 24)]);
  };

  // Employee Acknowledges: "I'm on my way"
  const acknowledgeAlert = (alertId: string) => {
    stopVibration();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setActiveAlert((prev) => {
      if (prev && prev.id === alertId) {
        const updated: SummonAlert = {
          ...prev,
          status: 'ACKNOWLEDGED',
        };
        setRecentAlerts((all) =>
          all.map((item) => (item.id === alertId ? updated : item))
        );
      }
      return null;
    });
  };

  // Dismiss / Silence Alert
  const dismissAlert = (alertId: string) => {
    stopVibration();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setActiveAlert((prev) => {
      if (prev && prev.id === alertId) {
        const updated: SummonAlert = {
          ...prev,
          status: 'DISMISSED',
        };
        setRecentAlerts((all) =>
          all.map((item) => (item.id === alertId ? updated : item))
        );
      }
      return null;
    });
  };

  // Manager Hangs Up / Cancels Call
  const cancelOutgoingCall = () => {
    stopVibration();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveAlert(null);
  };

  // Incoming Urgent Ring (for employee receiving the summon)
  const activeIncomingAlert =
    activeAlert && activeAlert.status === 'RINGING' ? activeAlert : null;

  // Incoming Standard Notification (for employee receiving notice)
  const activeIncomingNotification =
    activeAlert &&
    activeAlert.status === 'NOTIFIED' &&
    activeAlert.targetEmployeeId === currentEmployee.id
      ? activeAlert
      : null;

  // Active Outgoing Call (for the manager who triggered the 20s ring)
  const activeOutgoingCall =
    activeAlert &&
    activeAlert.status === 'RINGING' &&
    activeAlert.targetEmployeeId !== currentEmployee.id
      ? activeAlert
      : null;

  return (
    <FloorPagerContext.Provider
      value={{
        activeIncomingAlert,
        activeIncomingNotification,
        activeOutgoingCall,
        recentAlerts,
        sendCabinNotification,
        ringEmployeePhone,
        testIncomingSummon,
        acknowledgeAlert,
        dismissAlert,
        cancelOutgoingCall,
      }}
    >
      {children}
    </FloorPagerContext.Provider>
  );
};

export const useFloorPager = () => useContext(FloorPagerContext);
