import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import {
  SplashScreen,
  OnboardingScreen as OnBoardingScreen,
  LoginScreen,
  SignupScreen,
} from '../../features/auth';

// Account
import {
  AddressScreen,
  AddEditAddressScreen,
  EditProfileScreen,
  PaymentMethodsScreen,
  AddPaymentMethodScreen,
  NotificationsScreen,
  SettingsScreen,
} from '../../features/account';

// Support & Legal
import { HelpScreen, LiveChatScreen } from '../../features/support';
import { PrivacyPolicyScreen, TermsOfServiceScreen } from '../../features/legal';

// Orders
import { VendorOrdersScreen, OrderDetailScreen } from '../../features/orders';

// Inventory
import {
  InventoryScreen,
  StoreProductsScreen,
  BarcodeScannerScreen,
  ProductFormScreen,
  LowStockScreen,
} from '../../features/inventory';

// Billing
import { StoreBillingScreen } from '../../features/billing';

// Team & Staff
import {
  TeamManagementScreen,
  TeamAnalyticsScreen,
  AddEmployeeScreen,
  EmployeeDetailScreen,
  EmployeeShiftAttendanceScreen,
  EmployeeTasksActivityScreen,
  EmployeePermissionsGuideScreen,
  EmployeeGuidelinesSOPScreen,
  StoreVendorContactScreen,
  EmployeeAppPreferencesScreen,
  EmployeeNoticeBoardScreen,
  TeamChatListScreen,
  TeamChatConversationScreen,
} from '../../features/team';

// Earnings
import {
  EarningsScreen,
  SettlementDetailScreen,
} from '../../features/earnings';

// Settings
import {
  VendorSettingsScreen,
  StoreProfileScreen,
  StoreAddressScreen,
  WorkingHoursScreen,
  CommissionRateScreen,
  NotificationPreferencesScreen,
} from '../../features/settings';

// Navigation
import MainNavigation from './MainNavigation';
import DeliveryNavigation from './DeliveryNavigation';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 260,
        freezeOnBlur: true,
      }}
    >
      {/* Auth Flow */}
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />

      {/* Main Vendor App */}
      <Stack.Screen name="MainNavigation" component={MainNavigation} />

      {/* Delivery / Rider App */}
      <Stack.Screen name="DeliveryNavigation" component={DeliveryNavigation} />

      {/* Orders */}
      <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

      {/* Account */}
      <Stack.Screen name="AddressScreen" component={AddressScreen} />
      <Stack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddPaymentMethodScreen" component={AddPaymentMethodScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />

      {/* Support & Legal */}
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="LiveChatScreen" component={LiveChatScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfServiceScreen" component={TermsOfServiceScreen} />

      {/* inventary */}
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="StoreProducts" component={StoreProductsScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="LowStock" component={LowStockScreen} />

      {/* Billing */}
      <Stack.Screen name="Billing" component={StoreBillingScreen} />

      {/* Barcode Scanner & Price Checker */}
      <Stack.Screen name="ScanBarcode" component={BarcodeScannerScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />

      {/* Team */}
      <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
      <Stack.Screen name="TeamAnalytics" component={TeamAnalyticsScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
      <Stack.Screen name="EmployeeShiftAttendance" component={EmployeeShiftAttendanceScreen} />
      <Stack.Screen name="EmployeeTasksActivity" component={EmployeeTasksActivityScreen} />
      <Stack.Screen name="EmployeePermissionsGuide" component={EmployeePermissionsGuideScreen} />
      <Stack.Screen name="EmployeeGuidelinesSOP" component={EmployeeGuidelinesSOPScreen} />
      <Stack.Screen name="StoreVendorContact" component={StoreVendorContactScreen} />
      <Stack.Screen name="EmployeeAppPreferences" component={EmployeeAppPreferencesScreen} />
      <Stack.Screen name="EmployeeNoticeBoard" component={EmployeeNoticeBoardScreen} />
      <Stack.Screen name="TeamChatList" component={TeamChatListScreen} />
      <Stack.Screen name="TeamChatConversation" component={TeamChatConversationScreen} />

      {/* Earnings */}
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="SettlementDetail" component={SettlementDetailScreen} />

      {/* Settings */}
      <Stack.Screen name="VendorSettings" component={VendorSettingsScreen} />
      <Stack.Screen name="StoreProfile" component={StoreProfileScreen} />
      <Stack.Screen name="StoreAddress" component={StoreAddressScreen} />
      <Stack.Screen name="WorkingHours" component={WorkingHoursScreen} />
      <Stack.Screen name="CommissionRate" component={CommissionRateScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigation;