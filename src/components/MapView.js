import RNMapView, { Marker as RNMarker, Polyline as RNPolyline, PROVIDER_GOOGLE as RN_PROVIDER_GOOGLE } from 'react-native-maps';
import { forwardRef } from 'react';
import { Platform } from 'react-native';

const MapView = forwardRef(function MapView({ style, children, initialRegion, ...props }, ref) {
  const defaultRegion = initialRegion || {
    latitude: 26.4207,
    longitude: 50.0888,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <RNMapView
      ref={ref}
      style={[{ flex: 1 }, style]}
      provider={Platform.OS === 'android' ? RN_PROVIDER_GOOGLE : undefined}
      initialRegion={defaultRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
      {...props}
    >
      {children}
    </RNMapView>
  );
});

MapView.displayName = 'MapView';
export default MapView;

export const Marker = RNMarker;
export const Polyline = RNPolyline;
export const PROVIDER_GOOGLE = RN_PROVIDER_GOOGLE;
