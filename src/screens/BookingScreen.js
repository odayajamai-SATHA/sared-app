import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { notifyDriversNewRide } from '../utils/notifications';
import { calculateFare, applyPromoCode, getDistanceKm } from '../utils/pricing';

export default function BookingScreen({ route, navigation }) {
  const { service, serviceId, size, pickup, destination, destinationName, paymentMethod } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();
  const [promoCode, setPromoCode] = useState('');
  const [fare, setFare] = useState(null);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(40)).current;
  const priceFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let distKm = 12;
    if (pickup && destination) {
      distKm = getDistanceKm(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude);
    }
    const calculated = calculateFare(serviceId || 'tow', size, distKm);
    setFare(calculated);

    const nearbyDriverTokens = route.params?.driverTokens || [];
    if (nearbyDriverTokens.length > 0) {
      notifyDriversNewRide(nearbyDriverTokens, { service, size, price: `SAR ${calculated.total}` });
    }

    // Staggered animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.parallel([
        Animated.spring(priceAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(priceFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, []);

  const handleApplyPromo = () => {
    if (!fare || !promoCode.trim()) return;
    const baseFare = calculateFare(serviceId || 'tow', size, fare.distanceKm);
    const updated = applyPromoCode(baseFare, promoCode, true);
    setFare(updated);
  };

  if (!fare) return null;
  const priceDisplay = `SAR ${fare.total}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.topSection}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color="#FFF" />
        </View>
        <Text style={styles.confirmedTitle}>{t('bookingConfirmed')}</Text>
        <Text style={styles.confirmedSub}>{t('driverOnWay')}</Text>
      </View>

      <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardAnim }] }]}>
        <View style={[styles.driverRow, isRTL && styles.rowReverse]}>
          <View style={styles.driverAvatar}><Ionicons name="person" size={28} color={colors.primary} /></View>
          <View style={[styles.driverInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.driverName}>{t('driverName')}</Text>
            <View style={[styles.ratingRow, isRTL && styles.rowReverse]}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          <View style={styles.callBtn}><Ionicons name="call" size={20} color={colors.primary} /></View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailsGrid}>
          {[[t('saredType'), size], [t('service'), service], [t('eta'), `15 ${t('minutes')}`], [t('distance'), `${fare.distanceKm} ${t('km')}`]].map(([label, val], i) => (
            <View key={i} style={styles.detailItem}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{val}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.priceCard, { opacity: priceFade, transform: [{ translateY: priceAnim }] }]}>
        <Text style={[styles.priceCardTitle, isRTL && styles.textRight]}>{t('priceBreakdown')}</Text>
        {[[t('baseFare'), fare.baseFare], [`${t('distanceCharge')} (${fare.distanceKm} ${t('km')})`, fare.distanceCharge]].map(([l, v], i) => (
          <View key={i} style={styles.priceRow}><Text style={styles.priceLabel}>{l}</Text><Text style={styles.priceValue}>SAR {v}</Text></View>
        ))}
        {fare.isNight && <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: '#8B5CF6' }]}>{t('nightSurcharge')}</Text><Text style={[styles.priceValue, { color: '#8B5CF6' }]}>SAR {fare.nightSurcharge}</Text></View>}
        {fare.promoDiscount > 0 && <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: '#22C55E' }]}>{t('discount')}</Text><Text style={[styles.priceValue, { color: '#22C55E' }]}>-SAR {fare.promoDiscount}</Text></View>}
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}><Text style={styles.priceLabel}>{t('vat')}</Text><Text style={styles.priceValue}>SAR {fare.vat}</Text></View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}><Text style={styles.totalLabel}>{t('totalPrice')}</Text><Text style={styles.totalValue}>SAR {fare.total}</Text></View>
      </Animated.View>

      <View style={styles.promoCard}>
        <Text style={[styles.promoTitle, isRTL && styles.textRight]}>{t('promoCode')}</Text>
        <View style={[styles.promoRow, isRTL && styles.rowReverse]}>
          <TextInput style={[styles.promoInput, isRTL && styles.textRight]} placeholder={t('promoPlaceholder')} placeholderTextColor={colors.gray} value={promoCode} onChangeText={setPromoCode} autoCapitalize="characters" />
          <TouchableOpacity style={[styles.promoBtn, !promoCode.trim() && { opacity: 0.5 }]} onPress={handleApplyPromo} disabled={!promoCode.trim()}>
            <Text style={styles.promoBtnText}>{t('applyPromo')}</Text>
          </TouchableOpacity>
        </View>
        {fare.promoApplied && <View style={styles.promoSuccess}><Ionicons name="checkmark-circle" size={16} color="#22C55E" /><Text style={styles.promoSuccessText}>{fare.promoApplied === 'SARED1' ? (t('promoFirstFree') || 'Promo applied: First rescue free!') : t('promoApplied')}</Text></View>}
        {fare.promoError && <Text style={styles.promoError}>{t(fare.promoError)}</Text>}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.cancelBtnText}>{t('cancelRide')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('Tracking', { service, size, price: priceDisplay, fareBreakdown: fare, paymentMethod })}>
          <Ionicons name="navigate" size={18} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.trackBtnText}>{t('trackDriver')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  topSection: { backgroundColor: colors.primary, alignItems: 'center', paddingTop: 70, paddingBottom: 36 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  confirmedTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  confirmedSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  card: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: -20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  driverAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: '700', color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: colors.darkGray },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: 14 },
  detailLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  priceCard: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 20 },
  priceCardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14, color: colors.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  priceDivider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  promoCard: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 20 },
  promoTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: { flex: 1, backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  promoBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  promoBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  promoSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  promoSuccessText: { fontSize: 13, color: '#22C55E', fontWeight: '600' },
  promoError: { fontSize: 13, color: '#EF4444', marginTop: 8 },
  buttonRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#FFF', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.darkGray },
  trackBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trackBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  textRight: { textAlign: 'right' },
});
