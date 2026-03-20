import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Linking, Modal, Platform, Alert } from 'react-native';
import MapView, { Marker, Polyline } from '../components/MapView';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { supabase, updateRideStatus, subscribeToRideUpdates } from '../utils/supabase';

export default function TrackingScreen({ route, navigation }) {
  const { service, size, price, fareBreakdown, paymentMethod, rideId } = route.params || {};
  const { t, isRTL, lang } = useI18n();
  const { colors: C, isDark } = useTheme();
  const mapRef = useRef(null);
  const sheetAnim = useRef(new Animated.Value(100)).current;
  const sheetFade = useRef(new Animated.Value(0)).current;
  const [showSOS, setShowSOS] = useState(false);
  const sosPulse = useRef(new Animated.Value(1)).current;

  const [userLocation, setUserLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(15);
  const [activeStep, setActiveStep] = useState(1);
  const [rideStatus, setRideStatus] = useState('accepted');

  const defaultCoord = { latitude: 24.7136, longitude: 46.6753 };

  // Subscribe to realtime ride updates from Supabase
  useEffect(() => {
    if (!rideId) return;
    const channel = subscribeToRideUpdates(rideId, (updatedRide) => {
      if (updatedRide.status) setRideStatus(updatedRide.status);
      // Update driver location if provided
      if (updatedRide.driver_lat && updatedRide.driver_lng) {
        setDriverLocation({ latitude: updatedRide.driver_lat, longitude: updatedRide.driver_lng });
      }
      // Auto-navigate to TripComplete when ride is completed
      if (updatedRide.status === 'completed') {
        navigation.navigate('TripComplete', { service, size, price, fareBreakdown, paymentMethod });
      }
    });
    return () => { channel?.unsubscribe(); };
  }, [rideId]);

  // Sheet slide-up animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(sheetFade, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  // Get user location
  useEffect(() => {
    let locationSubscription;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Get initial position
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          const userCoord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(userCoord);
          setDriverLocation({ latitude: userCoord.latitude + 0.012, longitude: userCoord.longitude - 0.008 });

          // Watch position updates
          locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
            (newLoc) => {
              setUserLocation({ latitude: newLoc.coords.latitude, longitude: newLoc.coords.longitude });
            }
          );
        } else {
          setUserLocation(defaultCoord);
          setDriverLocation({ latitude: defaultCoord.latitude + 0.012, longitude: defaultCoord.longitude - 0.008 });
        }
      } catch {
        setUserLocation(defaultCoord);
        setDriverLocation({ latitude: defaultCoord.latitude + 0.012, longitude: defaultCoord.longitude - 0.008 });
      }
    })();
    return () => { if (locationSubscription) locationSubscription.remove(); };
  }, []);

  // Simulate driver approach (when not getting real-time Supabase updates)
  useEffect(() => {
    if (!userLocation || !driverLocation) return;
    const interval = setInterval(() => {
      setDriverLocation((prev) => {
        if (!prev || !userLocation) return prev;
        const dlat = userLocation.latitude - prev.latitude;
        const dlng = userLocation.longitude - prev.longitude;
        const dist = Math.sqrt(dlat * dlat + dlng * dlng);
        if (dist < 0.0005) { clearInterval(interval); return prev; }
        return { latitude: prev.latitude + dlat * 0.06, longitude: prev.longitude + dlng * 0.06 };
      });
      setEta((prev) => Math.max(1, prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // Step progression based on ETA and ride status
  useEffect(() => {
    if (rideStatus === 'arrived' || eta <= 3) setActiveStep(3);
    else if (rideStatus === 'in_transit' || eta <= 8) setActiveStep(2);
    else setActiveStep(1);
  }, [eta, rideStatus]);

  // Fit map to markers
  useEffect(() => {
    if (mapRef.current && userLocation && driverLocation) {
      try {
        mapRef.current.fitToCoordinates([userLocation, driverLocation], {
          edgePadding: { top: 120, right: 60, bottom: 340, left: 60 }, animated: true,
        });
      } catch {}
    }
  }, [userLocation, driverLocation]);

  // Calculate distance between user and driver
  const getDistance = () => {
    if (!userLocation || !driverLocation) return '...';
    const R = 6371;
    const dLat = ((driverLocation.latitude - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((driverLocation.longitude - userLocation.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(userLocation.latitude*Math.PI/180) * Math.cos(driverLocation.latitude*Math.PI/180) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Build route polyline (curved path)
  const routeCoords = userLocation && driverLocation ? [
    driverLocation,
    {
      latitude: (driverLocation.latitude + userLocation.latitude) / 2 + 0.002,
      longitude: (driverLocation.longitude + userLocation.longitude) / 2 - 0.001,
    },
    userLocation,
  ] : [];

  const region = userLocation ? {
    latitude: (userLocation.latitude + (driverLocation?.latitude || userLocation.latitude)) / 2,
    longitude: (userLocation.longitude + (driverLocation?.longitude || userLocation.longitude)) / 2,
    latitudeDelta: 0.04, longitudeDelta: 0.04,
  } : { ...defaultCoord, latitudeDelta: 0.04, longitudeDelta: 0.04 };

  const steps = [
    { label: t('driverAssigned'), icon: 'checkmark-circle' },
    { label: t('onTheWay'), icon: 'car-sport' },
    { label: t('arriving'), icon: 'flag' },
  ];

  const handleComplete = async () => {
    Alert.alert(
      lang === 'ar' ? 'تأكيد الوصول' : 'Confirm Arrival',
      lang === 'ar' ? 'هل وصل السائق وتم تحميل سيارتك؟' : 'Has the driver arrived and loaded your vehicle?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: async () => {
            try { if (rideId) await updateRideStatus(rideId, 'completed'); } catch {}
            navigation.navigate('TripComplete', { service, size, price, fareBreakdown, paymentMethod });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#E8E4DE' }]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: C.card }]}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>{t('trackingDriver')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsCompass={false}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title={t('pickupLocation')}>
            <View style={styles.userMarkerOuter}><View style={styles.userDot} /></View>
          </Marker>
        )}
        {driverLocation && (
          <Marker coordinate={driverLocation} title={t('driverName')}>
            <View style={styles.driverMarker}><Ionicons name="car-sport" size={20} color="#FFF" /></View>
          </Marker>
        )}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor={colors.primary} strokeWidth={4} lineDashPattern={[8, 4]} />
        )}
      </MapView>

      {/* SOS */}
      <TouchableOpacity style={styles.sosBtn} onPress={() => setShowSOS(true)} activeOpacity={0.7}>
        <Text style={styles.sosBtnText}>SOS</Text>
      </TouchableOpacity>

      {/* SOS Modal */}
      <Modal visible={showSOS} transparent animationType="fade">
        <View style={styles.sosOverlay}>
          <View style={styles.sosModal}>
            <View style={styles.sosIconCircle}><Ionicons name="warning" size={40} color="#FFF" /></View>
            <Text style={styles.sosTitle}>{t('emergencySOS')}</Text>
            <Text style={styles.sosDesc}>{t('sosDesc')}</Text>
            {userLocation && (
              <View style={styles.sosCoords}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.sosCoordsText}>{userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.sosCallBtn} onPress={() => { setShowSOS(false); Linking.openURL('tel:911'); }}>
              <Ionicons name="call" size={20} color="#DC2626" />
              <Text style={styles.sosCallText}>{t('callEmergency') || 'Call 911'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosCancelBtn} onPress={() => setShowSOS(false)}>
              <Text style={styles.sosCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ETA + Distance badges */}
      <View style={[styles.etaBubble, { backgroundColor: C.card }]}>
        <Text style={[styles.etaNumber, { color: C.primary }]}>{eta}</Text>
        <Text style={[styles.etaUnit, { color: C.textSecondary }]}>{t('min')}</Text>
      </View>
      <View style={styles.distBubble}>
        <Text style={styles.distText}>{getDistance()} {t('km')}</Text>
      </View>

      {/* Bottom sheet */}
      <Animated.View style={[styles.bottomPanel, { backgroundColor: C.card, opacity: sheetFade, transform: [{ translateY: sheetAnim }] }]}>
        <View style={[styles.handle, { backgroundColor: C.border }]} />

        {/* Progress steps */}
        <View style={styles.stepsRow}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[styles.stepCircle, activeStep > i && styles.stepCircleActive, activeStep === i + 1 && styles.stepCircleCurrent]}>
                <Ionicons name={step.icon} size={14} color={activeStep > i ? '#FFF' : C.gray} />
              </View>
              <Text style={[styles.stepLabel, activeStep >= i + 1 && styles.stepLabelActive, { color: activeStep >= i+1 ? C.primary : C.gray }]}>{step.label}</Text>
              {i < 2 && <View style={[styles.stepLine, activeStep > i + 1 && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {/* Driver info */}
        <View style={[styles.driverCard, { backgroundColor: C.surfaceSecondary }, isRTL && styles.rowReverse]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primaryFaded }]}>
            <Ionicons name="person" size={24} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.driverName, { color: C.text }]}>{t('driverName')}</Text>
            <View style={styles.driverMeta}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={[styles.ratingText, { color: C.text }]}>4.8</Text>
              <Text style={{ color: C.gray }}>|</Text>
              <Text style={{ fontSize: 12, color: C.textSecondary }}>{t('plateNum')}: أ ب ج 1234</Text>
            </View>
          </View>
          <View style={[styles.etaChip, { backgroundColor: colors.primaryFaded }]}>
            <Text style={[styles.etaChipNum, { color: C.primary }]}>{eta}</Text>
            <Text style={{ fontSize: 10, color: C.textSecondary }}>{t('min')}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.msgBtn, { backgroundColor: colors.primaryFaded }]} onPress={() => Alert.alert(t('messageDriver'), t('featureComingSoon'))}>
            <Ionicons name="chatbubble-outline" size={20} color={C.primary} />
            <Text style={{ color: C.primary, fontSize: 14, fontWeight: '600' }}>{t('messageDriver')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.callBtn, { backgroundColor: C.primary }]} onPress={() => Linking.openURL('tel:+966500000000')}>
            <Ionicons name="call" size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{t('callDriver')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: colors.primaryFaded, borderColor: C.border }]} onPress={handleComplete}>
            <Ionicons name="checkmark" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// Dark mode map style (Google Maps)
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  map: { flex: 1 },
  userMarkerOuter: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  userDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#3B82F6', borderWidth: 3, borderColor: '#FFF' },
  driverMarker: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  etaBubble: {
    position: 'absolute', top: 110, right: 16, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 5,
  },
  etaNumber: { fontSize: 22, fontWeight: 'bold' },
  etaUnit: { fontSize: 11 },
  distBubble: {
    position: 'absolute', top: 168, right: 16, backgroundColor: colors.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, zIndex: 5,
  },
  distText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  bottomPanel: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingHorizontal: 4 },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCircleCurrent: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.primaryFaded },
  stepLabel: { fontSize: 10, textAlign: 'center' },
  stepLabelActive: { fontWeight: '600' },
  stepLine: {
    position: 'absolute', top: 13, left: '60%', right: '-40%', height: 2,
    backgroundColor: '#E5E7EB', zIndex: -1,
  },
  stepLineActive: { backgroundColor: colors.primary },
  driverCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverName: { fontSize: 16, fontWeight: '700' },
  driverMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '600' },
  etaChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  etaChipNum: { fontSize: 18, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  msgBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 6,
  },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 6,
  },
  completeBtn: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  sosBtn: {
    position: 'absolute', bottom: 300, right: 16, zIndex: 10,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  sosBtnText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  sosOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  sosModal: { backgroundColor: '#DC2626', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' },
  sosIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sosTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  sosDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 16 },
  sosCoords: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20 },
  sosCoordsText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' },
  sosCallBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, width: '100%', marginBottom: 12 },
  sosCallText: { fontSize: 18, fontWeight: '800', color: '#DC2626' },
  sosCancelBtn: { paddingVertical: 12 },
  sosCancelText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});
