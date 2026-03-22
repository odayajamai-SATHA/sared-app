import { useEffect, Component } from 'react';
import { AppState, StatusBar, View, Text, Linking } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { I18nProvider, useI18n } from './src/utils/i18n';
import { ThemeProvider, useTheme } from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Lazy imports for native modules - these are only called inside components, never at module level
let supabase = null;
try {
  supabase = require('./src/utils/supabase').supabase;
} catch (e) {
  console.warn('[Sared] Supabase init failed:', e.message);
}

// Screen imports
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
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
          height: 80, paddingBottom: 24, paddingTop: 8,
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

  // Lazy init notifications - inside useEffect, never at module level
  useEffect(() => {
    (async () => {
      try {
        const { registerForPushNotifications, addNotificationListeners } = require('./src/utils/notifications');
        await registerForPushNotifications();
        const cleanup = addNotificationListeners(() => {}, () => {});
        return cleanup;
      } catch (e) {
        console.warn('[Sared] Notifications setup failed:', e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const subscription = AppState.addEventListener('change', (state) => {
      try {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      } catch { /* silent */ }
    });
    return () => subscription.remove();
  }, []);


  const linking = {
    prefixes: ['sared://', 'https://sared.app'],
    config: {
      screens: {
        Splash: 'splash',
        Login: 'login',
        Main: { screens: { Home: 'home', Services: 'services', History: 'history', Profile: 'profile' } },
        Booking: 'booking/:id',
        Tracking: 'tracking/:id',
        Receipt: 'receipt/:id',
        DriverDashboard: 'driver',
        DriverLogin: 'driver/login',
      },
    },
  };

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <NavigationContainer theme={navTheme} linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
          <Stack.Screen name="ForBusiness" component={ForBusinessScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
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
          <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
          <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
          <Stack.Screen name="DriverNavigation" component={DriverNavigationScreen} />
          <Stack.Screen name="DriverJob" component={DriverJobScreen} />
          <Stack.Screen name="DriverComplete" component={DriverCompleteScreen} />
          <Stack.Screen name="DriverEarnings" component={DriverEarningsScreen} />
          <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
          <Stack.Screen name="DriverWithdrawal" component={DriverWithdrawalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// Top-level error boundary as a class component

class CrashGuard extends Component {
  state = { crashed: false, error: null };

  static getDerivedStateFromError(error) {
    return { crashed: true, error: error.message };
  }

  componentDidCatch(error, info) {
    console.error('[Sared] App crashed:', error, info);
  }

  render() {
    if (this.state.crashed) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#022C22', padding: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 12 }} accessibilityRole="header">Sared</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 20, textAlign: 'center' }}>
            {this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <CrashGuard>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <AppContent />
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </CrashGuard>
  );
}
