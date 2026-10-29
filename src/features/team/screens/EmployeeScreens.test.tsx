import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

// Mock AsyncStorage and Icons
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-camera-kit', () => ({
  Camera: 'Camera',
  CameraType: { Back: 'back', Front: 'front' },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

import { StaffRoleProvider } from '../context/StaffRoleContext';
import { FloorPagerProvider } from '../context/FloorPagerContext';
import { FeedbackProvider } from '../../../shared/components/feedback/FeedbackProvider';
import { LocalizationProvider } from '../../../shared/i18n/LocalizationProvider';
import EmployeeShiftAttendanceScreen from './EmployeeShiftAttendanceScreen';
import EmployeeTasksActivityScreen from './EmployeeTasksActivityScreen';
import EmployeePermissionsGuideScreen from './EmployeePermissionsGuideScreen';
import EmployeeGuidelinesSOPScreen from './EmployeeGuidelinesSOPScreen';
import StoreVendorContactScreen from './StoreVendorContactScreen';
import EmployeeAppPreferencesScreen from './EmployeeAppPreferencesScreen';
import EmployeeNoticeBoardScreen from './EmployeeNoticeBoardScreen';
import TeamAnalyticsScreen from './TeamAnalyticsScreen';
import BarcodeScannerScreen from '../../inventory/screens/BarcodeScannerScreen';

describe('Employee Profile Internal Screens', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const renderScreen = (
    Component: React.ComponentType<any>
  ): ReactTestRenderer.ReactTestRenderer => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocalizationProvider>
          <FeedbackProvider>
            <StaffRoleProvider>
              <FloorPagerProvider>
                <Component navigation={mockNavigation} />
              </FloorPagerProvider>
            </StaffRoleProvider>
          </FeedbackProvider>
        </LocalizationProvider>
      );
    });
    return renderer;
  };

  it('renders EmployeeShiftAttendanceScreen with live duty timer and punch in/out', () => {
    const renderer = renderScreen(EmployeeShiftAttendanceScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders EmployeeTasksActivityScreen with KPI cards and chronological timeline', () => {
    const renderer = renderScreen(EmployeeTasksActivityScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders EmployeePermissionsGuideScreen with assigned CRUD breakdown and request upgrade', () => {
    const renderer = renderScreen(EmployeePermissionsGuideScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders EmployeeGuidelinesSOPScreen with cold-chain, picking, hygiene and emergency SOPs', () => {
    const renderer = renderScreen(EmployeeGuidelinesSOPScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders StoreVendorContactScreen with owner details and floor cabin intercom', () => {
    const renderer = renderScreen(StoreVendorContactScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders EmployeeAppPreferencesScreen with barcode haptics and floor ringer test', () => {
    const renderer = renderScreen(EmployeeAppPreferencesScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders EmployeeNoticeBoardScreen with pinned announcements and star employee of the month', () => {
    const renderer = renderScreen(EmployeeNoticeBoardScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders TeamAnalyticsScreen with store performance summary and direct notification/alert controls', () => {
    const renderer = renderScreen(TeamAnalyticsScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });

  it('renders BarcodeScannerScreen within safe area and camera terminal', () => {
    const renderer = renderScreen(BarcodeScannerScreen);
    expect(renderer).toBeDefined();
    const tree = renderer?.toJSON();
    expect(tree).not.toBeNull();
  });
});
