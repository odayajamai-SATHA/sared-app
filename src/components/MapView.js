// Native: use react-native-maps with Google provider on Android
import RNMapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { forwardRef } from 'react';
import { Platform } from 'react-native';

const MapView = forwardRef((props, ref) => {
  return (
    <RNMapView
      ref={ref}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      showsMyLocationButton={false}
      showsCompass={true}
      loadingEnabled={true}
      loadingIndicatorColor="#059669"
      mapType="standard"
      {...props}
    />
  );
});

MapView.displayName = 'MapView';
export default MapView;
export { Marker, Polyline, PROVIDER_GOOGLE };
