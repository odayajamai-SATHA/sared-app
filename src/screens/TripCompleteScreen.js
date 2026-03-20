import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

export default function TripCompleteScreen({ route, navigation }) {
  const { service, size, price, fareBreakdown, paymentMethod } = route.params || {};
  const [rating, setRating] = useState(0);
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();

  const checkScale = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: Platform.OS !== 'web' }),
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.stagger(80, starAnims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 100, friction: 6, useNativeDriver: Platform.OS !== 'web' })
      )),
    ]).start();
  }, []);

  const handleRating = (star) => {
    setRating(star);
    Animated.spring(starAnims[star - 1], { toValue: 1.3, tension: 200, friction: 5, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      Animated.spring(starAnims[star - 1], { toValue: 1, tension: 100, friction: 6, useNativeDriver: Platform.OS !== 'web' }).start();
    });
  };

  const handleSubmit = () => {
    navigation.navigate('Receipt', { service, size, price, fareBreakdown, paymentMethod });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={['#059669', '#047857']} style={styles.topSection}>
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={48} color="#FFF" />
          </View>
        </Animated.View>
        <Text style={styles.title}>{t('tripComplete')}</Text>
      </LinearGradient>

      <Animated.View style={[styles.card, { backgroundColor: colors.card }, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
        <Text style={[styles.cardTitle, isRTL && styles.textRight]}>{t('tripSummary')}</Text>
        {[
          [t('service'), service],
          [t('vehicleSize'), size],
          [t('distance'), '12.4 ' + t('km')],
          [t('duration'), '28 ' + t('minutes')],
        ].map(([label, value], i) => (
          <View key={i} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('totalPrice')}</Text>
          <Text style={styles.totalValue}>{price}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.ratingCard, { backgroundColor: colors.card }, { opacity: cardFade }]}>
        <Text style={styles.rateTitle}>{t('rateDriver')}</Text>
        <View style={[styles.driverRow, isRTL && styles.rowReverse]}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <Text style={styles.driverName}>{t('driverName')}</Text>
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)} style={styles.starBtn}>
              <Animated.View style={{ transform: [{ scale: starAnims[star - 1] }] }}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#FBBF24' : colors.border}
                />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.tapHint}>{rating > 0 ? `${rating}/5` : t('tapToRate')}</Text>

        <TouchableOpacity
          style={[styles.submitBtn, !rating && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!rating}
        >
          <LinearGradient colors={rating ? ['#059669', '#047857'] : ['#D1D5DB', '#D1D5DB']} style={styles.submitGradient}>
            <Ionicons name="receipt-outline" size={18} color="#FFF" />
            <Text style={styles.submitBtnText}>{t('viewReceipt')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  contentContainer: { paddingBottom: 40 },
  topSection: { alignItems: 'center', paddingTop: 80, paddingBottom: 50 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  card: {
    backgroundColor: colors.card, marginHorizontal: 16, marginTop: -24, borderRadius: 20,
    padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.lightGray,
  },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  ratingCard: {
    backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 20,
    padding: 24, alignItems: 'center',
  },
  rateTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowReverse: { flexDirection: 'row-reverse' },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  driverName: { fontSize: 16, fontWeight: '600', color: colors.text },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  tapHint: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  submitBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.5 },
  submitGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  textRight: { textAlign: 'right' },
});
