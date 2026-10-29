import { isAuthenticatedNavigation } from './authenticatedNavigation';

describe('biometric authentication session gating', () => {
  it('does not consider auth and onboarding routes logged in', () => {
    expect(isAuthenticatedNavigation(['LoginScreen'])).toBe(false);
    expect(isAuthenticatedNavigation(['SplashScreen', 'SignupScreen'])).toBe(false);
  });

  it('allows biometric locking only inside customer or delivery navigation', () => {
    expect(isAuthenticatedNavigation(['MainNavigation', 'SettingsScreen'])).toBe(true);
    expect(isAuthenticatedNavigation(['DeliveryNavigation', 'DeliveryOrderDetailsScreen'])).toBe(true);
  });
});
