import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, Polyline } from '../../components/MapView';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { updateRideStatus } from '../../utils/supabase';

export default function DriverNavigationScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();
  const mapRef = useRef(null);

  const customerName = ride?.users?.name || 'Mohammed';
  const customerPhone = ride?.users?.phone || '+966512345678';

  // Driver's real GPS location
  const [driverLocation, setDriverLocation] = useState(null);
  // Customer pickup (simulated ~1.5km away from driver)
  const [customerLocation, setCustomerLocation] = useState(null);
  const [eta, setEta] = useState(8);
  const [distanceKm, setDistanceKm] = useState(3.2);

  const defaultCoord = { latitude: 24.7136, longitude: 46.6753 };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const driverCoord = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setDriverLocation(driverCoord);
          // Customer is ~0.015 degrees (~1.5km) away
          setCustomerLocation({
            latitude: driverCoord.latitude + 0.013,
            longitude: driverCoord.longitude + 0.009,
          });
        } else {
          setDriverLocation(defaultCoord);
          setCustomerLocation({
            latitude: defaultCoord.latitude + 0.013,
            longitude: defaultCoord.longitude + 0.009,
          });
        }
      } catch {
        setDriverLocation(defaultCoord);
        setCustomerLocation({
          latitude: defaultCoord.latitude + 0.013,
          longitude: defaultCoord.longitude + 0.009,
        });
      }
    })();
  }, []);

  // Watch driver location updates
  useEffect(() => {
    let subscription;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (loc) => {
              setDriverLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          );
        }
      } catch { /* silent */ }
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // Fit map to both markers
  useEffect(() => {
    if (mapRef.current && driverLocation && customerLocation) {
      mapRef.current.fitToCoordinates([driverLocation, customerLocation], {
        edgePadding: { top: 120, right: 60, bottom: 300, left: 60 },
        animated: true,
      });
    }
  }, [driverLocation, customerLocation]);

  // Simulate ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
      setDistanceKm((prev) => Math.max(0.1, prev - 0.4));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleArrived = async () => {
    try {
      await updateRideStatus(ride?.id, 'arrived');
    } catch { /* silent */ }
    navigation.navigate('DriverJob', { ride, driver });
  };

  const handleCall = () => {
    try { Linking.openURL(`tel:${customerPhone}`); } catch { /* silent */ }
  };

  // Build simple route waypoints (straight line with midpoint offset for curve effect)
  const routeCoords =
    driverLocation && customerLocation
      ? [
          driverLocation,
          {
            latitude: (driverLocation.latitude + customerLocation.latitude) / 2 + 0.003,
            longitude: (driverLocation.longitude + customerLocation.longitude) / 2 - 0.002,
          },
          customerLocation,
        ]
      : [];

  const region = driverLocation
    ? {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : { ...defaultCoord, latitudeDelta: 0.04, longitudeDelta: 0.04 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('navigateToCustomer')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsCompass={false}
      >
        {/* Driver marker */}
        {driverLocation && (
          <Marker coordinate={driverLocation} title={driver?.name || t('driverName')}>
            <View style={styles.driverMarker}>
              <Ionicons name="car-sport" size={20} color={colors.white} />
            </View>
          </Marker>
        )}

        {/* Customer marker */}
        {customerLocation && (
          <Marker coordinate={customerLocation} title={customerName}>
            <View style={styles.customerMarker}>
              <Ionicons name="location" size={18} color={colors.white} />
            </View>
          </Marker>
        )}

        {/* Route line */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#1E3A5F"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Floating badges */}
      <View style={styles.etaBadge}>
        <Text style={styles.etaNumber}>{eta}</Text>
        <Text style={styles.etaUnit}>{t('min')}</Text>
      </View>

      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{distanceKm.toFixed(1)} {t('km')}</Text>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.handle} />

        {/* Customer Info */}
        <View style={[styles.customerCard, isRTL && styles.rowReverse]}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={24} color="#1E3A5F" />
          </View>
          <View style={[styles.customerInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.customerDetails}>
              {ride?.sared_size} | {ride?.service_type} | {ride?.price} SAR
            </Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#1E3A5F" />
          </TouchableOpacity>
        </View>

        {/* Pickup Address */}
        <View style={[styles.addressRow, isRTL && styles.rowReverse]}>
          <View style={styles.addressDot} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.addressLabel, isRTL && styles.textRight]}>
              {t('pickupLocation')}
            </Text>
            <Text style={[styles.addressText, isRTL && styles.textRight]}>
              {t('customerPickupAddress')}
            </Text>
          </View>
        </View>

        {/* Arrived Button */}
        <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived}>
          <Ionicons name="flag" size={20} color={colors.white} />
          <Text style={styles.arrivedBtnText}>{t('iHaveArrived')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4DE',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  customerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaBadge: {
    position: 'absolute',
    top: 110,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 5,
  },
  etaNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  etaUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  distanceBadge: {
    position: 'absolute',
    top: 170,
    right: 16,
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  customerDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
  arrivedBtn: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  arrivedBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
});
