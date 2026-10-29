/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useRef } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  createNavigationContainerRef,
  NavigationContainer,
  ParamListBase,
  StackActions,
} from '@react-navigation/native';
import RootNavigation from './src/app/navigation/RootNavigation';
import { LocalizationProvider } from './src/shared/i18n/LocalizationProvider';
import { BiometricLockProvider } from './src/features/auth/biometrics/BiometricLockProvider';
import { FeedbackProvider } from './src/shared/components/feedback/FeedbackProvider';
import { StaffRoleProvider } from './src/features/team/context/StaffRoleContext';
import {
  FloorPagerProvider,
  ManagerSummonOverlay,
  StaffChatProvider,
} from './src/features/team';
import { isAuthenticatedNavigation } from './src/features/auth/biometrics/authenticatedNavigation';
import { useBiometricLock } from './src/features/auth/biometrics/BiometricLockProvider';
import {
  SharedTransitionProvider,
  SharedTransitionOverlay,
  useSharedTransition,
} from './src/shared/components/sharedTransition';

const navigationRef = createNavigationContainerRef<ParamListBase>();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LocalizationProvider>
        <FeedbackProvider>
          <BiometricLockProvider>
            <StaffRoleProvider>
              <FloorPagerProvider>
                <StaffChatProvider>
                  <SharedTransitionProvider>
                    <AppNavigation />
                  </SharedTransitionProvider>
                </StaffChatProvider>
              </FloorPagerProvider>
            </StaffRoleProvider>
          </BiometricLockProvider>
        </FeedbackProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { activeItem, hideProduct, showProduct } = useSharedTransition();
  const { setAuthenticated } = useBiometricLock();
  const overlayReturnRouteKey = useRef<string | null>(null);
  const overlayReturnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncAuthenticationState = () => {
    const rootState = navigationRef.getRootState();
    setAuthenticated(
      isAuthenticatedNavigation(rootState?.routes.map((route) => route.name) ?? []),
    );
  };

  const handleNavigationStateChange = () => {
    syncAuthenticationState();
    const currentRouteKey = navigationRef.getCurrentRoute()?.key;
    if (overlayReturnRouteKey.current === currentRouteKey && !overlayReturnTimer.current) {
      const returnRouteKey = currentRouteKey;
      overlayReturnTimer.current = setTimeout(() => {
        overlayReturnTimer.current = null;
        if (
          navigationRef.getCurrentRoute()?.key === returnRouteKey &&
          overlayReturnRouteKey.current === returnRouteKey
        ) {
          overlayReturnRouteKey.current = null;
          if (activeItem) {
            showProduct();
          }
        }
      }, Platform.OS === 'android' ? 360 : 0);
    } else if (
      overlayReturnTimer.current &&
      currentRouteKey !== overlayReturnRouteKey.current
    ) {
      clearTimeout(overlayReturnTimer.current);
      overlayReturnTimer.current = null;
      overlayReturnRouteKey.current = null;
    }
  };

  const pushWithOverlayHidden = (routeName: string, params?: ParamListBase[string]) => {
    if (overlayReturnTimer.current) {
      clearTimeout(overlayReturnTimer.current);
      overlayReturnTimer.current = null;
    }
    overlayReturnRouteKey.current = activeItem
      ? navigationRef.getCurrentRoute()?.key ?? null
      : null;
    hideProduct();
    navigationRef.dispatch(StackActions.push(routeName, params));
  };

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={syncAuthenticationState}
        onStateChange={handleNavigationStateChange}
      >
        <RootNavigation />
      </NavigationContainer>
      <SharedTransitionOverlay
        onNavigateToCart={() => pushWithOverlayHidden('CartScreen')}
        onNavigateToShop={() => pushWithOverlayHidden('ShopDetailsScreen')}
        onNavigateToReviews={(item) =>
          pushWithOverlayHidden('ReviewsScreen', { item })
        }
      />
      <ManagerSummonOverlay />
    </>
  );
}

export default App;