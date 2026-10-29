jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import OnboardingCard from './OnboardingCard';
import { LocalizationProvider } from '../../../shared/i18n/LocalizationProvider';

describe('OnboardingCard sliding animation', () => {
  const defaultProps = {
    title: 'Manage Your Store\nfrom One Place',
    description: 'Track inventory, update prices and add\nnew products in just a few taps.',
    image: { uri: 'test-image' },
    currentIndex: 0,
    onNext: jest.fn(),
    onSkip: jest.fn(),
  };

  const renderComponent = () =>
    ReactTestRenderer.create(
      <LocalizationProvider>
        <OnboardingCard {...defaultProps} />
      </LocalizationProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders onboarding card component without crashing', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = renderComponent();
    });
    expect(renderer).toBeDefined();
  });

  it('handles Next button press with slide-out animation and invokes onNext', () => {
    jest.useFakeTimers();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = renderComponent();
    });

    const root = renderer!.root;
    const nextTouchables = root.findAll((node) => node.props.accessibilityLabel === 'Next onboarding screen');
    expect(nextTouchables.length).toBeGreaterThan(0);

    act(() => {
      nextTouchables[0].props.onPress();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('handles Skip button press and invokes onSkip', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    act(() => {
      renderer = renderComponent();
    });

    const root = renderer!.root;
    const skipTouchables = root.findAll((node) => node.props.accessibilityLabel === 'Skip onboarding');
    expect(skipTouchables.length).toBeGreaterThan(0);

    act(() => {
      skipTouchables[0].props.onPress();
    });

    expect(defaultProps.onSkip).toHaveBeenCalledTimes(1);
  });
});
