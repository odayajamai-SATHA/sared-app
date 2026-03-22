import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker } from '../components/MapView';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

// Sample suggestions for Saudi Arabia (in production, use a geocoding API)
const SUGGESTIONS = [
  { id: '1', name: 'King Fahd Road', nameAr: 'طريق الملك فهد', lat: 24.7255, lng: 46.6620 },
  { id: '2', name: 'Olaya Street', nameAr: 'شارع العليا', lat: 24.6900, lng: 46.6850 },
  { id: '3', name: 'King Abdullah Road', nameAr: 'طريق الملك عبدالله', lat: 24.7450, lng: 46.6400 },
  { id: '4', name: 'Exit 5, Ring Road', nameAr: 'مخرج 5، الطريق الدائري', lat: 24.7700, lng: 46.7200 },
  { id: '5', name: 'Al Malaz District', nameAr: 'حي الملز', lat: 24.6650, lng: 46.7250 },
  { id: '6', name: 'Riyadh Gallery Mall', nameAr: 'الرياض جاليري مول', lat: 24.7100, lng: 46.6730 },
  { id: '7', name: 'King Khalid Airport', nameAr: 'مطار الملك خالد', lat: 24.9577, lng: 46.6989 },
  { id: '8', name: 'Al Diriyah', nameAr: 'الدرعية', lat: 24.7343, lng: 46.5727 },
];

export default function DestinationScreen({ route, navigation }) {
  const { pickup } = route.params || {};
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const filtered = query.length > 0
    ? SUGGESTIONS.filter((s) => {
        const q = query.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.nameAr.includes(q);
      })
    : SUGGESTIONS;

  const handleSelectSuggestion = (item) => {
    const dest = { latitude: item.lat, longitude: item.lng };
    navigation.navigate('Service', {
      pickup,
      destination: dest,
      destinationName: lang === 'ar' ? item.nameAr : item.name,
    });
  };

  const handleMapPress = (e) => {
    // On web, the MapView placeholder doesn't emit onPress with coordinates
    if (Platform.OS === 'web') return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmPin = () => {
    if (!selectedLocation) return;
    navigation.navigate('Service', {
      pickup,
      destination: selectedLocation,
      destinationName: `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
    });
  };

  const pickupRegion = pickup
    ? { latitude: pickup.latitude, longitude: pickup.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 24.7136, longitude: 46.6753, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  if (showMap) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowMap(false)} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('dropPin')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={pickupRegion}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker coordinate={selectedLocation} title={t('dropoffLocation')}>
              <View style={[styles.pinMarker, { color: colors.text }]}>
                <Ionicons name="location" size={24} color={colors.white} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Center crosshair hint */}
        <View style={[styles.crosshairContainer, { color: colors.text }]} pointerEvents="none">
          <Ionicons name="add" size={32} color={colors.primary} />
        </View>

        {selectedLocation && (
          <TouchableOpacity style={styles.confirmPinBtn} onPress={handleConfirmPin}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={[styles.confirmPinText, { color: colors.text }]}>{t('confirmLocation')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('setDropoff')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchContainer, { color: colors.text }]}>
        <Ionicons name="search" size={20} color={colors.gray} />
        <TextInput
          style={[styles.searchInput, isRTL && styles.textRight]}
          placeholder={t('searchDestination')}
          placeholderTextColor={colors.gray}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.mapOption, isRTL && styles.rowReverse]} onPress={() => setShowMap(true)}>
        <View style={[styles.mapOptionIcon, { color: colors.text }]}>
          <Ionicons name="map-outline" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.mapOptionText, isRTL && styles.textRight]}>{t('dropPin')}</Text>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.suggestionRow, isRTL && styles.rowReverse]}
            onPress={() => handleSelectSuggestion(item)}
          >
            <View style={[styles.suggestionIcon, { color: colors.text }]}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.suggestionName, isRTL && styles.textRight]}>
                {lang === 'ar' ? item.nameAr : item.name}
              </Text>
              <Text style={[styles.suggestionSub, isRTL && styles.textRight]}>
                {lang === 'ar' ? item.name : item.nameAr}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  mapOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: 'rgba(5,150,105,0.1)',
    borderRadius: 12,
  },
  mapOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  mapOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  list: {
    flex: 1,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  suggestionSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  map: {
    flex: 1,
  },
  pinMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginStart: -16,
    marginTop: -16,
    opacity: 0.4,
  },
  confirmPinBtn: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  confirmPinText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
