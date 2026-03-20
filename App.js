import { useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { I18nProvider, useI18n } from './src/utils/i18n';
import { ThemeProvider, useTheme } from './src/utils/theme';
import { registerForPushNotifications, addNotificationListeners } from './src/utils/notifications';
import { supabase } from './src/utils/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import HelpSupportScreen from './src/screens/HelpSupportScreen';

// Driver screens
import DriverLoginScreen from './src/screens/driver/DriverLoginScreen';
import DriverDashboardScreen from './src/screens/driver/DriverDashboardScreen';
import DriverNavigationScreen from './src/screens/driver/DriverNavigationScreen';
import DriverJobScreen from './src/screens/driver/DriverJobScreen';
import DriverCompleteScreen from './src/screens/driver/DriverCompleteScreen';
import DriverEarningsScreen from './src/screens/driver/DriverEarningsScreen';
import DriverProfileScreen from './src/screens/driver/DriverProfileScreen';
import DriverWithdrawalScreen from './src/screens/driver/DriverWithdrawalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          height: 64, paddingBottom: 10, paddingTop: 8,
          borderTopColor: colors.tabBarBorder, backgroundColor: colors.tabBar,
          shadowColor: colors.shadow, shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 8, elevation: 8,
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabHome') }} />
      <Tab.Screen name="Services" component={ServiceScreen} options={{ tabBarLabel: t('tabServices') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t('tabHistory') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabProfile') }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isRTL } = useI18n();
  const { colors, isDark } = useTheme();

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

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  };

  return (
    <ErrorBoundary isRTL={isRTL}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          {/* Splash & Onboarding */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* Auth */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
          <Stack.Screen name="ForBusiness" component={ForBusinessScreen} />

          {/* Main App with tab bar */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Stack screens */}
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
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

          {/* Driver Flow */}
          <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
          <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
          <Stack.Screen name="DriverNavigation" component={DriverNavigationScreen} />
          <Stack.Screen name="DriverJob" component={DriverJobScreen} />
          <Stack.Screen name="DriverComplete" component={DriverCompleteScreen} />
          <Stack.Screen name="DriverEarnings" component={DriverEarningsScreen} />
          <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
          <Stack.Screen name="DriverWithdrawal" component={DriverWithdrawalScreen} />
        </Stack.Navigator>
        <OfflineBanner />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
