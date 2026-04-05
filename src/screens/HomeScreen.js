import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Animated, Platform, Alert, Linking, useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { getServicePriceWithVAT } from '../utils/pricing';
import { createDebouncedNav } from '../utils/navigation';

export default function HomeScreen({ navigation: rawNav }) {
  const navigation = createDebouncedNav(rawNav);
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const promoAnim = useRef(new Animated.Value(0)).current;

  const defaultLocation = { latitude: 24.7136, longitude: 46.6753 };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch {}
      setLoading(false);
    })();
    Animated.spring(promoAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: Platform.OS !== 'web', delay: 500 }).start();
  }, []);

  const pickup = location || defaultLocation;

  const quickActions = [
    { id: 'tow', icon: 'car-outline', label: t('towVehicle') || t('towService'), color: '#059669', price: getServicePriceWithVAT('tow'), serviceType: 'towing' },
    { id: 'flatTire', icon: 'ellipse-outline', label: t('tireChange') || t('flatTire'), color: '#3B82F6', price: getServicePriceWithVAT('flatTire'), serviceType: 'flat' },
    { id: 'battery', icon: 'flash-outline', label: t('batteryJumpStart') || t('deadBattery'), color: '#F59E0B', price: getServicePriceWithVAT('battery'), serviceType: 'flat' },
    { id: 'fuel', icon: 'water-outline', label: t('fuelDeliveryLabel') || t('fuelDelivery'), color: '#EF4444', price: getServicePriceWithVAT('fuel'), serviceType: 'flat' },
  ];

  const recentLocations = [
    { id: '1', name: isRTL ? 'طريق الملك فهد' : 'King Fahd Road', sub: 'Riyadh' },
    { id: '2', name: isRTL ? 'شارع العليا' : 'Olaya Street', sub: 'Riyadh' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('goodMorning');
    if (hour >= 12 && hour < 17) return t('goodAfternoon');
    if (hour >= 17 && hour < 22) return t('goodEvening');
    return t('goodNight');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <StatusBar style="dark" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={[styles.greetingSection, { color: colors.text }]}>
          <Text style={[styles.greeting, { color: colors.text }, isRTL && styles.textRight]}>{getGreeting()}</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }, isRTL && styles.textRight]}>
            {t('howCanWeHelp')}
          </Text>
          <TouchableOpacity style={[styles.helpLink, { color: colors.text }, isRTL && styles.rowReverse]}
            onPress={() => { try { Linking.openURL('https://wa.me/966554404434'); } catch {} }}>
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={[styles.helpLinkText, { color: colors.text }]}>
              {t('needHelp')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar + notification */}
        <View style={[styles.searchRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Destination', { pickup })}
          >
            <Ionicons name="search" size={20} color={colors.gray} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('whereNeedSared')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => Alert.alert(t('notifications'), t('featureComingSoon'))}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Promo banner */}
        <Animated.View style={{ opacity: promoAnim, transform: [{ scale: promoAnim }] }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Service', { pickup })}>
            <LinearGradient colors={['#059669', '#047857']} style={styles.promoBanner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={[styles.promoContent, { color: colors.text }, isRTL && styles.rowReverse]}>
                <View style={[styles.promoBadge, { color: colors.text }]}>
                  <Text style={styles.promoBadgeText}>50%</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{t('promoOffer')}</Text>
                  <Text style={styles.promoCode}>SARED1</Text>
                  <Text style={styles.promoSub}>{t('useCode')}</Text>
                </View>
                <Ionicons name={isRTL ? 'arrow-back-circle' : 'arrow-forward-circle'} size={32} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions 2x2 grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
          {t('quickServices')}
        </Text>
        <View style={[styles.quickGrid, { color: colors.text }]}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickCard, { width: (width - 52) / 2 }]}
              onPress={() => {
                if (action.serviceType === 'towing') {
                  navigation.navigate('Size', {
                    service: action.label, serviceId: action.id, serviceType: 'towing', pickup
                  });
                } else {
                  navigation.navigate('PriceGuarantee', {
                    service: action.label, serviceId: action.id, serviceType: 'flat',
                    size: '—', price: `SAR ${action.price} (${t('inclVat')})`, pickup,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]} numberOfLines={1}>{action.label}</Text>
              <Text style={[styles.quickPrice, { color: action.color }]}>
                {t('fromSar')} {action.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent locations */}
        <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>{t('recentLocations')}</Text>
        {recentLocations.map((loc) => (
          <TouchableOpacity key={loc.id} style={[styles.recentRow, isRTL && styles.rowReverse]}
            onPress={() => navigation.navigate('Service', { pickup })}>
            <View style={[styles.recentIcon, { color: colors.text }]}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recentName, { color: colors.text }, isRTL && styles.textRight]}>{loc.name}</Text>
              <Text style={[styles.recentSub, { color: colors.textSecondary }, isRTL && styles.textRight]}>{loc.sub}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  greetingSection: { paddingTop: 60, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '800' },
  greetingSub: { fontSize: 15, marginTop: 4 },
  helpLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  helpLinkText: { fontSize: 13, color: '#25D366', fontWeight: '600' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'transparent', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  searchPlaceholder: { flex: 1, fontSize: 15,  },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center',
    marginStart: 8,
  },
  promoBanner: { borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  promoContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  promoBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  promoBadgeText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  promoTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  promoCode: { fontSize: 20, fontWeight: '900', color: '#FFF', marginTop: 2 },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24,
  },
  quickCard: {
    backgroundColor: 'transparent',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'transparent', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  quickIcon: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  quickLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  quickPrice: { fontSize: 16, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  quickVat: { fontSize: 11, marginTop: 2 },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  recentIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center', marginEnd: 12,
  },
  recentName: { fontSize: 15, fontWeight: '600' },
  recentSub: { fontSize: 13, marginTop: 2 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
});
