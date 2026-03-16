import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function MembershipScreen({ navigation }) {
  const { t, isRTL } = useI18n();
  const [selected, setSelected] = useState(1);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, [selected]);

  const plans = [
    {
      id: 0,
      name: t('basicPlan'),
      price: 199,
      gradient: ['#6B7280', '#4B5563'],
      features: [
        { text: `2 ${t('freeTows')}`, included: true },
        { text: t('priorityResponse'), included: false },
        { text: t('coveredFlatbed'), included: false },
        { text: t('dedicatedSupport'), included: false },
      ],
    },
    {
      id: 1,
      name: t('premiumPlan'),
      price: 399,
      gradient: ['#059669', '#047857'],
      popular: true,
      features: [
        { text: t('unlimitedTows'), included: true },
        { text: t('priorityResponse'), included: true },
        { text: t('coveredFlatbed'), included: false },
        { text: t('dedicatedSupport'), included: false },
      ],
    },
    {
      id: 2,
      name: t('vipPlan'),
      price: 799,
      gradient: ['#022C22', '#065F46'],
      features: [
        { text: t('allPremiumFeatures'), included: true },
        { text: t('coveredFlatbed'), included: true },
        { text: t('dedicatedSupport'), included: true },
        { text: t('unlimitedTows'), included: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('membership')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>{t('membershipSubtitle')}</Text>

        {/* Plan selector tabs */}
        <View style={styles.tabRow}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.tab, selected === plan.id && styles.tabActive]}
              onPress={() => setSelected(plan.id)}
            >
              {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>{t('mostPopular')}</Text></View>}
              <Text style={[styles.tabText, selected === plan.id && styles.tabTextActive]}>{plan.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected plan card */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient colors={plans[selected].gradient} style={styles.planCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.planName}>{plans[selected].name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.planCurrency}>SAR</Text>
              <Text style={styles.planPrice}>{plans[selected].price}</Text>
              <Text style={styles.planPeriod}>{t('perYear')}</Text>
            </View>

            <View style={styles.featuresContainer}>
              {plans[selected].features.map((feat, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons
                    name={feat.included ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={feat.included ? '#4ADE80' : 'rgba(255,255,255,0.3)'}
                  />
                  <Text style={[styles.featureText, !feat.included && styles.featureDisabled]}>
                    {feat.text}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.subscribeBtn} activeOpacity={0.8}>
              <Text style={styles.subscribeBtnText}>{t('subscribe')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Comparison table */}
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>{t('choosePlan')}</Text>
          <View style={styles.compRow}>
            <Text style={styles.compLabel} />
            {plans.map((p) => (
              <Text key={p.id} style={styles.compHeader}>{p.name}</Text>
            ))}
          </View>
          {[t('freeTows'), t('priorityResponse'), t('coveredFlatbed'), t('dedicatedSupport')].map((feat, fi) => (
            <View key={fi} style={[styles.compRow, fi % 2 === 0 && styles.compRowAlt]}>
              <Text style={styles.compLabel}>{feat}</Text>
              {plans.map((p) => (
                <View key={p.id} style={styles.compCell}>
                  <Ionicons
                    name={p.features[fi]?.included ? 'checkmark' : 'close'}
                    size={16}
                    color={p.features[fi]?.included ? '#22C55E' : '#D1D5DB'}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  scrollContent: { padding: 20 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: {
    flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.white,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  popularBadge: {
    position: 'absolute', top: -8, backgroundColor: colors.primary,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  popularText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  planCard: { borderRadius: 24, padding: 28, marginBottom: 20 },
  planName: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, marginBottom: 24 },
  planCurrency: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginRight: 4 },
  planPrice: { fontSize: 48, fontWeight: '800', color: '#FFF' },
  planPeriod: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginLeft: 4 },
  featuresContainer: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  featureDisabled: { color: 'rgba(255,255,255,0.35)' },
  subscribeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  comparisonCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, overflow: 'hidden',
  },
  comparisonTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  compRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  compRowAlt: { backgroundColor: colors.lightGray, marginHorizontal: -16, paddingHorizontal: 16 },
  compLabel: { flex: 2, fontSize: 12, color: colors.textSecondary },
  compHeader: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
  compCell: { flex: 1, alignItems: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
});
