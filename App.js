import { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { I18nProvider, useI18n } from './src/utils/i18n';
import { registerForPushNotifications, addNotificationListeners } from './src/utils/notifications';
import { supabase } from './src/utils/supabase';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';

// Splash & Onboarding
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// User screens
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServiceScreen from './src/screens/ServiceScreen';
import SizeScreen from './src/screens/SizeScreen';
import DriverMatchingScreen from './src/screens/DriverMatchingScreen';
import BookingScreen from './src/screens/BookingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import TripCompleteScreen from './src/screens/TripCompleteScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DestinationScreen from './src/screens/DestinationScreen';
import MembershipScreen from './src/screens/MembershipScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import PriceGuaranteeScreen from './src/screens/PriceGuaranteeScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import InsuranceScreen from './src/screens/InsuranceScreen';
import DriverSignupScreen from './src/screens/DriverSignupScreen';
import ForBusinessScreen from './src/screens/ForBusinessScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Driver screens
import DriverLoginScreen from './src/screens/driver/DriverLoginScreen';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';
import DriverNavigationScreen from './src/screens/driver/DriverNavigationScreen';
import DriverJobScreen from './src/screens/driver/DriverJobScreen';
import DriverCompleteScreen from './src/screens/driver/DriverCompleteScreen';
import DriverEarningsScreen from './src/screens/driver/DriverEarningsScreen';
import DriverProfileScreen from './src/screens/driver/DriverProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 64, paddingBottom: 10, paddingTop: 8,
          borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF',
          shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Services') iconName = 'grid';
          else if (route.name === 'History') iconName = 'time';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServiceScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isRTL } = useI18n();

  useEffect(() => {
    registerForPushNotifications();
    const cleanup = addNotificationListeners(() => {}, () => {});
    return cleanup;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <ErrorBoundary isRTL={isRTL}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          {/* Splash & Onboarding - NO tab bar */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* Auth - NO tab bar */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
          <Stack.Screen name="ForBusiness" component={ForBusinessScreen} />

          {/* Main App with tab bar */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Stack screens (no tab bar) */}
          <Stack.Screen name="Service" component={ServiceScreen} />
          <Stack.Screen name="Size" component={SizeScreen} />
          <Stack.Screen name="PriceGuarantee" component={PriceGuaranteeScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="DriverMatching" component={DriverMatchingScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="TripComplete" component={TripCompleteScreen} />
          <Stack.Screen name="Receipt" component={ReceiptScreen} />
          <Stack.Screen name="Destination" component={DestinationScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />
          <Stack.Screen name="Vehicles" component={VehiclesScreen} />
          <Stack.Screen name="Insurance" component={InsuranceScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/* Driver Flow */}
          <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
          <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
          <Stack.Screen name="DriverNavigation" component={DriverNavigationScreen} />
          <Stack.Screen name="DriverJob" component={DriverJobScreen} />
          <Stack.Screen name="DriverComplete" component={DriverCompleteScreen} />
          <Stack.Screen name="DriverEarnings" component={DriverEarningsScreen} />
          <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        </Stack.Navigator>
        <OfflineBanner />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
