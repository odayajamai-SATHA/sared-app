import { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

let RNMapView = null;
let RNMarker = null;
let RNPolyline = null;
let RN_PROVIDER_GOOGLE = null;

try {
  const Maps = require('react-native-maps');
  RNMapView = Maps.default;
  RNMarker = Maps.Marker;
  RNPolyline = Maps.Polyline;
  RN_PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch (e) {
  console.warn('react-native-maps not available:', e.message);
}

const MapView = forwardRef(function MapView({ style, children, initialRegion, ...props }, ref) {
  const [hasError, setHasError] = useState(false);

  const defaultRegion = initialRegion || {
    latitude: 26.4207,
    longitude: 50.0888,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (!RNMapView || hasError) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackIcon}>📍</Text>
        <Text style={styles.fallbackText}>Map View</Text>
        <Text style={styles.fallbackCoords}>
          {defaultRegion.latitude.toFixed(4)}, {defaultRegion.longitude.toFixed(4)}
        </Text>
      </View>
    );
  }

  return (
    <RNMapView
      ref={ref}
      style={[{ flex: 1 }, style]}
      provider={Platform.OS === 'android' ? RN_PROVIDER_GOOGLE : undefined}
      initialRegion={defaultRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
      onMapReady={() => console.log('Map ready')}
      {...props}
    >
      {children}
    </RNMapView>
  );
});

MapView.displayName = 'MapView';
export default MapView;

export const Marker = RNMarker || View;
export const Polyline = RNPolyline || View;
export const PROVIDER_GOOGLE = RN_PROVIDER_GOOGLE;

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIcon: { fontSize: 48 },
  fallbackText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 8 },
  fallbackCoords: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});
