// Universal MapView - works on all platforms without native maps dependency
// Uses expo-location for GPS, renders a styled placeholder with coordinates
import { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapView = forwardRef(function MapView({ style, children, initialRegion, ...props }, ref) {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    fitToCoordinates: () => {},
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="location" size={48} color="#059669" />
        <Text style={styles.text}>Live Map</Text>
        <Text style={styles.subtext}>
          {initialRegion ? `${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}` : 'Loading location...'}
        </Text>
      </View>
      {children}
    </View>
  );
});

MapView.displayName = 'MapView';
export default MapView;

export function Marker({ children, coordinate, title }) {
  if (!children) return null;
  return (
    <View style={styles.markerContainer} title={title}>
      {children}
    </View>
  );
}

export function Polyline() {
  return null;
}

export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  subtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});
