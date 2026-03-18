// Web fallback for react-native-maps (not supported on web)
import { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapView = forwardRef(function MapView({ style, children, ...props }, ref) {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    fitToCoordinates: () => {},
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="location" size={48} color="#059669" />
        <Text style={styles.text}>Map View</Text>
        <Text style={styles.subtext}>Maps are available on mobile devices</Text>
      </View>
      {children}
    </View>
  );
});

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
