import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, Polyline } from '../../components/MapView';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { updateRideStatus, broadcastDriverLocation } from '../../utils/supabase';

export default function DriverNavigationScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);

  const customerName = ride?.users?.name || t('user');
  const customerPhone = ride?.users?.phone || '';

  // Driver's real GPS location
  const [driverLocation, setDriverLocation] = useState(null);
  // Customer pickup (simulated ~1.5km away from driver)
  const [customerLocation, setCustomerLocation] = useState(null);
  const [eta, setEta] = useState(8);
  const [distanceKm, setDistanceKm] = useState(3.2);

  const defaultCoord = { latitude: 26.4207, longitude: 50.0888 };

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
      } catch {}
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
    } catch {}
    navigation.navigate('DriverJob', { ride, driver });
  };

  const handleCall = () => {
    try { Linking.openURL(`tel:${customerPhone}`); } catch {}
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
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('navigateToCustomer')}</Text>
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
            <View style={[styles.driverMarker, { color: colors.text }]}>
              <Ionicons name="car-sport" size={20} color={colors.white} />
            </View>
          </Marker>
        )}

        {/* Customer marker */}
        {customerLocation && (
          <Marker coordinate={customerLocation} title={customerName}>
            <View style={[styles.customerMarker, { color: colors.text }]}>
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
      <View style={[styles.etaBadge, { color: colors.text }]}>
        <Text style={[styles.etaNumber, { color: colors.text }]}>{eta}</Text>
        <Text style={[styles.etaUnit, { color: colors.textSecondary }]}>{t('min')}</Text>
      </View>

      <View style={[styles.distanceBadge, { color: colors.text }]}>
        <Text style={[styles.distanceText, { color: colors.text }]}>{distanceKm.toFixed(1)} {t('km')}</Text>
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { color: colors.text }]}>
        <View style={[styles.handle, { color: colors.text }]} />

        {/* Customer Info */}
        <View style={[styles.customerCard, isRTL && styles.rowReverse]}>
          <View style={[styles.customerAvatar, { color: colors.text }]}>
            <Ionicons name="person" size={24} color="#1E3A5F" />
          </View>
          <View style={[styles.customerInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.customerName, { color: colors.text }]}>{customerName}</Text>
            <Text style={[styles.customerDetails, { color: colors.textSecondary }]}>
              {ride?.sared_size} | {ride?.service_type} | {ride?.price} SAR
            </Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#1E3A5F" />
          </TouchableOpacity>
        </View>

        {/* Pickup Address */}
        <View style={[styles.addressRow, isRTL && styles.rowReverse]}>
          <View style={[styles.addressDot, { color: colors.text }]} />
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
          <Text style={[styles.arrivedBtnText, { color: colors.text }]}>{t('iHaveArrived')}</Text>
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
    backgroundColor: 'transparent',
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
    color: '#1F2937',
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
    end: 16,
    backgroundColor: 'transparent',
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
    color: '#6B7280',
  },
  distanceBadge: {
    position: 'absolute',
    top: 170,
    end: 16,
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.white,
  },
  bottomPanel: {
    backgroundColor: 'transparent',
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
    backgroundColor: '#E5E7EB',
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
    color: '#1F2937',
  },
  customerDetails: {
    fontSize: 13,
    color: '#6B7280',
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
    color: '#6B7280',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
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
    color: theme.white,
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
