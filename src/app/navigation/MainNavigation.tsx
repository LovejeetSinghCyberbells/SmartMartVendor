import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import TouchableOpacity from '../../shared/components/AnimatedTouchableOpacity';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/feather';
import AnimatedTabIcon from './AnimatedTabIcon';

// Screens
import { VendorHomeScreen as HomeScreen } from '../../features/home';
import { VendorOrdersScreen } from '../../features/orders';
import { ProfileScreen } from '../../features/account';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress, accessibilityState }: any) => {
  const isSelected = accessibilityState?.selected;
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.tabIconContainer}>
        {isSelected && (
          <View style={styles.activeGlowContainer}>
            <View style={styles.activeGlow} />
          </View>
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
};

const MainNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => {
          let iconName: React.ComponentProps<typeof Icon>['name'] = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'package';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <AnimatedTabIcon
              name={iconName}
              size={24}
              color={focused ? '#258B3E' : '#1a1a1a'}
              focused={focused}
            />
          );
        },
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: { duration: 240 },
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={VendorOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  activeGlowContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? -25 : -15,
    width: 60,
    height: 25,
    overflow: 'hidden',
    alignItems: 'center',
  },
  activeGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#258B3E',
    opacity: 0.2,
    transform: [{ translateY: -25 }],
    shadowColor: '#258B3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
});

export default MainNavigation;