import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { calculateFare, getDistanceKm } from '../utils/pricing';

export default function PriceGuaranteeScreen({ route, navigation }) {
  const { service, serviceId, size, price, pickup, destination, destinationName } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(0)).current;
  const detailSlide = useRef(new Animated.Value(40)).current;
  const detailFade = useRef(new Animated.Value(0)).current;

  // Calculate the guaranteed max price
  let distKm = 15; // generous estimate
  if (pickup && destination) {
    const actual = getDistanceKm(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
    distKm = Math.max(actual * 1.2, 5); // add 20% buffer for route vs straight-line
  }
  const fare = calculateFare(serviceId || 'tow', size, distKm);
  const maxPrice = fare.total;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.spring(shieldScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: Platform.OS !== 'web' }),
      Animated.parallel([
        Animated.spring(detailSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(detailFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, []);

  const handleConfirm = () => {
    navigation.navigate('Payment', {
      service, serviceId, size, price: `SAR ${maxPrice}`,
      pickup, destination, destinationName,
      fareTotal: `SAR ${maxPrice}`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('priceGuarantee')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Shield + guaranteed price */}
        <Animated.View style={[styles.priceSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.shieldContainer, { transform: [{ scale: shieldScale }] }]}>
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.shieldCircle}>
              <Ionicons name="shield-checkmark" size={40} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.guaranteeLabel}>{t('guaranteedNotToExceed')}</Text>

          <View style={styles.priceBox}>
            <Text style={styles.currency}>SAR</Text>
            <Text style={styles.priceAmount}>{maxPrice}</Text>
          </View>

          <View style={styles.neverPayBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.neverPayText}>{t('neverPayMore')}</Text>
          </View>
        </Animated.View>

        {/* Price breakdown */}
        <Animated.View style={[styles.breakdownCard, { backgroundColor: colors.card }, { opacity: detailFade, transform: [{ translateY: detailSlide }] }]}>
          <Text style={[styles.breakdownTitle, isRTL && styles.textRight]}>{t('priceBreakdown')}</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{t('service')}</Text>
            <Text style={styles.breakdownValue}>{service}</Text>
          </View>
          {size !== '—' && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('saredType')}</Text>
              <Text style={styles.breakdownValue}>{size}</Text>
            </View>
          )}
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{t('dispatchFee')}</Text>
            <Text style={styles.breakdownValue}>SAR {fare.baseFare}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{t('distanceRate')} (~{Math.round(distKm)} {t('km')})</Text>
            <Text style={styles.breakdownValue}>SAR {fare.distanceCharge}</Text>
          </View>
          {fare.isNight && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: '#8B5CF6' }]}>{t('nightSurcharge')}</Text>
              <Text style={[styles.breakdownValue, { color: '#8B5CF6' }]}>SAR {fare.nightSurcharge}</Text>
            </View>
          )}
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{t('vat')}</Text>
            <Text style={styles.breakdownValue}>SAR {fare.vat}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.maxLabel}>{t('maxPrice')}</Text>
            <Text style={styles.maxValue}>SAR {maxPrice}</Text>
          </View>

          <Text style={styles.noteText}>{t('priceGuaranteeNote')}</Text>
        </Animated.View>
      </View>

      {/* Confirm button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
          <LinearGradient colors={['#059669', '#047857']} style={styles.confirmGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            <Text style={styles.confirmText}>{t('confirmBooking')}</Text>
            <Text style={styles.confirmPrice}>SAR {maxPrice}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  rowReverse: { flexDirection: 'row-reverse' },
  content: { flex: 1, padding: 16 },
  priceSection: { alignItems: 'center', paddingVertical: 24 },
  shieldContainer: { marginBottom: 16 },
  shieldCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  guaranteeLabel: { fontSize: 15, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  priceBox: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  currency: { fontSize: 20, fontWeight: '600', color: theme.text, marginEnd: 6 },
  priceAmount: { fontSize: 52, fontWeight: '800', color: theme.text },
  neverPayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  neverPayText: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  breakdownCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  breakdownTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 14 },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
  },
  breakdownLabel: { fontSize: 14, color: theme.textSecondary },
  breakdownValue: { fontSize: 14, fontWeight: '600', color: theme.text },
  divider: { height: 1, backgroundColor: theme.primary, opacity: 0.2, marginVertical: 8 },
  maxLabel: { fontSize: 16, fontWeight: '700', color: theme.text },
  maxValue: { fontSize: 20, fontWeight: '800', color: '#22C55E' },
  noteText: { fontSize: 12, color: theme.gray, marginTop: 12, lineHeight: 18 },
  bottomBar: { padding: 16, paddingBottom: 40, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
  confirmBtn: { borderRadius: 16, overflow: 'hidden' },
  confirmGradient: {
    paddingVertical: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
  confirmText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  confirmPrice: { fontSize: 17, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  textRight: { textAlign: 'right' },
});
