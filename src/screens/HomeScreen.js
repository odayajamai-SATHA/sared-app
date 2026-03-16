import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, ActivityIndicator,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import MapView, { Marker } from '../components/MapView';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { t, isRTL } = useI18n();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const promoAnim = useRef(new Animated.Value(0)).current;

  const defaultRegion = {
    latitude: 24.7136, longitude: 46.6753,
    latitudeDelta: 0.01, longitudeDelta: 0.01,
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        }
      } catch {}
      setLoading(false);
    })();
    Animated.spring(promoAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true, delay: 500 }).start();
  }, []);

  const region = location || defaultRegion;

  const quickActions = [
    { id: 'tow', icon: 'car-sport', label: t('towService'), color: '#059669' },
    { id: 'tire', icon: 'disc', label: t('flatTire'), color: '#3B82F6' },
    { id: 'battery', icon: 'flash', label: t('deadBattery'), color: '#8B5CF6' },
    { id: 'fuel', icon: 'water', label: t('fuelDelivery'), color: '#22C55E' },
  ];

  const recentLocations = [
    { id: '1', name: isRTL ? 'طريق الملك فهد' : 'King Fahd Road', sub: 'Riyadh' },
    { id: '2', name: isRTL ? 'شارع العليا' : 'Olaya Street', sub: 'Riyadh' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation showsMyLocationButton={false} showsCompass={false}>
            {location && (
              <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={t('pickupLocation')}>
                <View style={styles.userMarkerOuter}><View style={styles.userMarkerInner} /></View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Search bar overlay */}
        <View style={styles.searchOverlay}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}
            onPress={() => navigation.navigate('Service', { pickup: location || { latitude: defaultRegion.latitude, longitude: defaultRegion.longitude } })}
          >
            <Ionicons name="search" size={20} color={colors.gray} />
            <Text style={styles.searchPlaceholder}>{t('whereNeedSared')}</Text>
            <View style={styles.notifDot}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recenter */}
        {!loading && (
          <TouchableOpacity style={styles.recenterBtn}
            onPress={() => { if (mapRef.current && region) mapRef.current.animateToRegion(region, 500); }}>
            <Ionicons name="locate" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom sheet */}
      <ScrollView style={styles.bottomSheet} showsVerticalScrollIndicator={false}>
        <View style={styles.handle} />

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickAction}
              onPress={() => navigation.navigate('Service', {
                pickup: location || { latitude: defaultRegion.latitude, longitude: defaultRegion.longitude },
                quickService: action.id,
              })}>
              <View style={[styles.quickIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickLabel} numberOfLines={1}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo banner */}
        <Animated.View style={{ opacity: promoAnim, transform: [{ scale: promoAnim }] }}>
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient colors={['#059669', '#047857']} style={styles.promoBanner}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={styles.promoContent}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>50%</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{t('promoOffer')}</Text>
                  <Text style={styles.promoSub}>{t('useCode')}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent locations */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('recentLocations')}</Text>
        {recentLocations.map((loc) => (
          <TouchableOpacity key={loc.id} style={[styles.recentRow, isRTL && styles.rowReverse]}
            onPress={() => navigation.navigate('Service', {
              pickup: location || { latitude: defaultRegion.latitude, longitude: defaultRegion.longitude },
            })}>
            <View style={styles.recentIcon}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recentName, isRTL && styles.textRight]}>{loc.name}</Text>
              <Text style={[styles.recentSub, isRTL && styles.textRight]}>{loc.sub}</Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  mapContainer: { height: '45%' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8E4DE' },
  userMarkerOuter: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(249,115,22,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  userMarkerInner: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.white,
  },
  searchOverlay: {
    position: 'absolute', top: 52, left: 16, right: 16, zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, gap: 10,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: colors.gray },
  notifDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center',
  },
  recenterBtn: {
    position: 'absolute', bottom: 16, right: 16,
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  bottomSheet: {
    flex: 1, backgroundColor: colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20,
    paddingHorizontal: 20, paddingTop: 8,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20,
  },
  quickRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  quickAction: { alignItems: 'center', width: (width - 80) / 4 },
  quickIcon: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  promoBanner: { borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  promoContent: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  promoBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  promoBadgeText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  promoTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.lightGray,
  },
  recentIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  recentName: { fontSize: 15, fontWeight: '600', color: colors.text },
  recentSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
});
