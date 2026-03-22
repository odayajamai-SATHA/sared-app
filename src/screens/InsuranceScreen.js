import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Animated, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

const PARTNER_INSURERS = [
  { name: 'Tawuniya', nameAr: 'التعاونية', icon: 'business' },
  { name: 'Bupa Arabia', nameAr: 'بوبا العربية', icon: 'medkit' },
  { name: 'Malath', nameAr: 'ملاذ', icon: 'shield-checkmark' },
  { name: 'Al Rajhi Takaful', nameAr: 'الراجحي تكافل', icon: 'wallet' },
  { name: 'Walaa', nameAr: 'ولاء', icon: 'star' },
  { name: 'AXA Cooperative', nameAr: 'أكسا التعاونية', icon: 'globe' },
];

export default function InsuranceScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [company, setCompany] = useState('');
  const [policyNum, setPolicyNum] = useState('');
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const handleSave = () => {
    if (!company.trim() || !policyNum.trim()) return;
    setSaved(true);
    Alert.alert(t('insuranceSaved'));
  };

  const handleSelectInsurer = (insurer) => {
    setCompany(lang === 'ar' ? insurer.nameAr : insurer.name);
  };

  const coveredItems = [
    { icon: 'car-sport', text: t('insuranceTow'), color: '#059669' },
    { icon: 'disc', text: t('insuranceTire'), color: '#3B82F6' },
    { icon: 'flash', text: t('insuranceBattery'), color: '#8B5CF6' },
    { icon: 'water', text: t('insuranceFuel'), color: '#22C55E' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('insuranceBenefits')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <LinearGradient colors={['#065F46', '#022C22']} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={36} color="#4ADE80" />
            </View>
            <Text style={styles.heroTitle}>{t('insuranceTitle')}</Text>
            <Text style={styles.heroSub}>{t('insuranceSubtitle')}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={[styles.formLabel, isRTL && styles.textRight]}>{t('insuranceCompany')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder={t('companyPlaceholder')}
            placeholderTextColor={colors.gray}
            value={company}
            onChangeText={(v) => { setCompany(v); setSaved(false); }}
          />

          <Text style={[styles.formLabel, isRTL && styles.textRight]}>{t('policyNumber')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.textRight]}
            placeholder={t('policyPlaceholder')}
            placeholderTextColor={colors.gray}
            value={policyNum}
            onChangeText={(v) => { setPolicyNum(v); setSaved(false); }}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.saveBtn, (!company.trim() || !policyNum.trim()) && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={!company.trim() || !policyNum.trim()}
          >
            <LinearGradient
              colors={saved ? ['#22C55E', '#16A34A'] : ['#059669', '#047857']}
              style={styles.saveBtnGradient}
            >
              <Ionicons name={saved ? 'checkmark-circle' : 'search'} size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>
                {saved ? t('insuranceSaved') : t('checkCoverage')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.noteText}>{t('insuranceNote')}</Text>
        </View>

        {/* Covered services */}
        <View style={styles.coveredCard}>
          <Text style={[styles.coveredTitle, isRTL && styles.textRight]}>{t('coveredServices')}</Text>
          {coveredItems.map((item, i) => (
            <View key={i} style={[styles.coveredRow, isRTL && styles.rowReverse]}>
              <View style={[styles.coveredIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.coveredText, isRTL && styles.textRight]}>{item.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            </View>
          ))}
        </View>

        {/* Partner insurers */}
        <View style={styles.partnersCard}>
          <Text style={[styles.partnersTitle, isRTL && styles.textRight]}>{t('partnerInsurers')}</Text>
          <View style={styles.partnersGrid}>
            {PARTNER_INSURERS.map((insurer, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.partnerChip, company === (lang === 'ar' ? insurer.nameAr : insurer.name) && styles.partnerChipActive]}
                onPress={() => handleSelectInsurer(insurer)}
              >
                <Ionicons name={insurer.icon} size={18} color={colors.primary} />
                <Text style={styles.partnerName}>{lang === 'ar' ? insurer.nameAr : insurer.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { padding: 16 },
  heroCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(74,222,128,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: 'rgba(74,222,128,0.3)',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },
  formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: theme.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 4,
  },
  saveBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  saveBtnGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  noteText: { fontSize: 12, color: theme.gray, marginTop: 14, lineHeight: 18 },
  coveredCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16 },
  coveredTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 14 },
  coveredRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  coveredIcon: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  coveredText: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.text },
  partnersCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  partnersTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 14 },
  partnersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  partnerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.lightGray, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: 'transparent',
  },
  partnerChipActive: { borderColor: theme.primary, backgroundColor: theme.primaryFaded },
  partnerName: { fontSize: 13, fontWeight: '600', color: theme.text },
  textRight: { textAlign: 'right' },
});
