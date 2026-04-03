import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

export default function MembershipScreen({ navigation }) {
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState(1);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }).start();
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
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('membership')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('membershipSubtitle')}</Text>

        {/* Plan selector tabs */}
        <View style={[styles.tabRow, { color: colors.text }]}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.tab, selected === plan.id && styles.tabActive]}
              onPress={() => setSelected(plan.id)}
            >
              {plan.popular && <View style={[styles.popularBadge, { color: colors.text }]}><Text style={styles.popularText}>{t('mostPopular')}</Text></View>}
              <Text style={[styles.tabText, selected === plan.id && styles.tabTextActive]}>{plan.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected plan card */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient colors={plans[selected].gradient} style={styles.planCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.planName}>{plans[selected].name}</Text>
            <View style={[styles.priceRow, isRTL && styles.rowReverse, { color: colors.text }]}>
              <Text style={styles.planCurrency}>SAR</Text>
              <Text style={styles.planPrice}>{plans[selected].price}</Text>
              <Text style={styles.planPeriod}>{t('perYear')}</Text>
            </View>

            <View style={[styles.featuresContainer, { color: colors.text }]}>
              {plans[selected].features.map((feat, i) => (
                <View key={i} style={[styles.featureRow, isRTL && styles.rowReverse, { color: colors.text }]}>
                  <Ionicons
                    name={feat.included ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={feat.included ? '#4ADE80' : 'rgba(255,255,255,0.55)'}
                  />
                  <Text style={[styles.featureText, !feat.included && styles.featureDisabled]}>
                    {feat.text}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.comingSoonNote}>{t('comingSoonPayments')}</Text>
            <TouchableOpacity style={styles.subscribeBtn} activeOpacity={0.8}
              onPress={() => Alert.alert(t('comingSoon'), t('notifyMeAlert'))}>
              <Text style={styles.subscribeBtnText}>{t('notifyMe')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Comparison table */}
        <View style={[styles.comparisonCard, { color: colors.text }]}>
          <Text style={[styles.comparisonTitle, { color: colors.text }]}>{t('choosePlan')}</Text>
          <View style={[styles.compRow, isRTL && styles.rowReverse, { color: colors.text }]}>
            <Text style={[styles.compLabel, { color: colors.textSecondary }]} />
            {plans.map((p) => (
              <Text key={p.id} style={[styles.compHeader, { color: colors.text }]}>{p.name}</Text>
            ))}
          </View>
          {[t('freeTows'), t('priorityResponse'), t('coveredFlatbed'), t('dedicatedSupport')].map((feat, fi) => (
            <View key={fi} style={[styles.compRow, isRTL && styles.rowReverse, fi % 2 === 0 && styles.compRowAlt]}>
              <Text style={[styles.compLabel, { color: colors.textSecondary }]}>{feat}</Text>
              {plans.map((p) => (
                <View key={p.id} style={[styles.compCell, { color: colors.text }]}>
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
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  scrollContent: { padding: 20 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: {
    flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'transparent',
    alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  tabActive: { borderColor: theme.primary, backgroundColor: 'rgba(5,150,105,0.1)' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#059669' },
  popularBadge: {
    position: 'absolute', top: -8, backgroundColor: theme.primary,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  popularText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  planCard: { borderRadius: 24, padding: 28, marginBottom: 20 },
  planName: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, marginBottom: 24 },
  planCurrency: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginEnd: 4 },
  planPrice: { fontSize: 48, fontWeight: '800', color: '#FFF' },
  planPeriod: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginStart: 4 },
  featuresContainer: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  featureDisabled: { color: 'rgba(255,255,255,0.55)' },
  subscribeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)',
  },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  comingSoonNote: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 12 },
  comparisonCard: {
    backgroundColor: 'transparent', borderRadius: 16, padding: 16, overflow: 'hidden',
  },
  comparisonTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  compRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  compRowAlt: { backgroundColor: 'transparent', marginHorizontal: -16, paddingHorizontal: 16 },
  compLabel: { flex: 2, fontSize: 12, color: '#6B7280' },
  compHeader: { flex: 1, fontSize: 12, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  compCell: { flex: 1, alignItems: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
});
