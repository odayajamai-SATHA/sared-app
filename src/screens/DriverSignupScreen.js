import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Animated, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { supabase } from '../utils/supabase';

const VEHICLE_TYPES = ['smallFlatbed', 'mediumFlatbed', 'largeFlatbed', 'enclosedFlatbed'];
const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah'];
const CITIES_AR = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];

export default function DriverSignupScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [form, setForm] = useState({ name: '', phone: '', iqama: '', vehicleType: '', plate: '', city: '' });
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const update = (key, val) => setForm({ ...form, [key]: val });
  const isValid = form.name && form.phone && form.iqama && form.vehicleType && form.plate && form.city;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await supabase.from('drivers').insert({
        name: form.name,
        phone: form.phone,
        vehicle_type: form.vehicleType,
        plate_number: form.plate,
        city: form.city,
        status: 'pending',
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  };

  const benefits = [
    { icon: 'cash-outline', text: t('driverBenefit1'), color: '#22C55E' },
    { icon: 'time-outline', text: t('driverBenefit2'), color: '#3B82F6' },
    { icon: 'card-outline', text: t('driverBenefit3'), color: '#8B5CF6' },
  ];

  const cityList = lang === 'ar' ? CITIES_AR : CITIES;

  if (submitted) {
    return (
      <View style={[styles.successContainer, { color: colors.text }]}>
        <View style={[styles.successIconCircle, { color: colors.text }]}>
          <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>{t('applicationSubmittedSuccess')}</Text>
        <Text style={[styles.successSub, { color: colors.textSecondary }]}>{t('contactWithin48')}</Text>
        <TouchableOpacity style={[styles.successBtn, { color: colors.text }]} onPress={() => navigation.goBack()}>
          <Text style={styles.successBtnText}>{t('done')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <LinearGradient colors={['#022C22', '#065F46']} style={[styles.headerGradient, { color: colors.text }]}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('driverSignup')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>{t('driverSignupSub')}</Text>

        <View style={[styles.benefitsRow, { color: colors.text }]}>
          {benefits.map((b, i) => (
            <View key={i} style={[styles.benefitItem, { color: colors.text }]}>
              <View style={[styles.benefitIcon, { backgroundColor: b.color + '20' }]}>
                <Ionicons name={b.icon} size={18} color={b.color} />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('fullName')}</Text>
          <TextInput style={styles.input} placeholder={t('fullNamePlaceholder')} placeholderTextColor={colors.gray}
            value={form.name} onChangeText={(v) => update('name', v)} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('enterPhone')}</Text>
          <View style={[styles.phoneRow, { color: colors.text }]}>
            <View style={[styles.codeBox, { color: colors.text }]}><Text style={[styles.codeText, { color: colors.text }]}>+966</Text></View>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder={t('phonePlaceholder')} placeholderTextColor={colors.gray}
              keyboardType="phone-pad" value={form.phone} onChangeText={(v) => update('phone', v)} maxLength={9} />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('iqamaId')}</Text>
          <TextInput style={styles.input} placeholder={t('iqamaPlaceholder')} placeholderTextColor={colors.gray}
            keyboardType="number-pad" value={form.iqama} onChangeText={(v) => update('iqama', v)} maxLength={10} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('vehicleType')}</Text>
          <TouchableOpacity style={[styles.dropdown, { color: colors.text }]} onPress={() => setShowVehicleMenu(!showVehicleMenu)}>
            <Text style={form.vehicleType ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {form.vehicleType ? t(form.vehicleType) : t('selectVehicleType')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </TouchableOpacity>
          {showVehicleMenu && (
            <View style={[styles.menuList, { color: colors.text }]}>
              {VEHICLE_TYPES.map((vt) => (
                <TouchableOpacity key={vt} style={[styles.menuItem, { color: colors.text }]}
                  onPress={() => { update('vehicleType', vt); setShowVehicleMenu(false); }}>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{t(vt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('plateNumber')}</Text>
          <TextInput style={styles.input} placeholder={t('platePlaceholder')} placeholderTextColor={colors.gray}
            autoCapitalize="characters" value={form.plate} onChangeText={(v) => update('plate', v)} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('city')}</Text>
          <TouchableOpacity style={[styles.dropdown, { color: colors.text }]} onPress={() => setShowCityMenu(!showCityMenu)}>
            <Text style={form.city ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {form.city || t('selectCity')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </TouchableOpacity>
          {showCityMenu && (
            <View style={[styles.menuList, { color: colors.text }]}>
              {cityList.map((c) => (
                <TouchableOpacity key={c} style={[styles.menuItem, { color: colors.text }]}
                  onPress={() => { update('city', c); setShowCityMenu(false); }}>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, (!isValid || submitting) && { opacity: 0.5 }]}
            onPress={handleSubmit} disabled={!isValid || submitting}>
            <LinearGradient colors={['#059669', '#047857']} style={[styles.submitGradient, { color: colors.text }]}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.submitText}>{t('submitApplication')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  benefitsRow: { flexDirection: 'row', gap: 8 },
  benefitItem: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12,
    padding: 10, alignItems: 'center', gap: 6,
  },
  benefitIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  benefitText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { padding: 16, paddingTop: 0 },
  formCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginTop: -12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: 'transparent', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1F2937', borderWidth: 1, borderColor: 'transparent',
  },
  phoneRow: { flexDirection: 'row', gap: 10 },
  codeBox: {
    backgroundColor: 'transparent', borderRadius: 12, paddingHorizontal: 14,
    justifyContent: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  codeText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'transparent', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: 'transparent',
  },
  dropdownValue: { fontSize: 15, color: '#1F2937' },
  dropdownPlaceholder: { fontSize: 15, color: '#6B7280' },
  menuList: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: 'transparent',
    marginTop: 4, overflow: 'hidden',
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  menuItemText: { fontSize: 15, color: '#1F2937' },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 24 },
  submitGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  // Success state
  successContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent', paddingHorizontal: 40,
  },
  successIconCircle: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  successSub: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 12 },
  successBtn: {
    backgroundColor: theme.primary, paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 14, marginTop: 32,
  },
  successBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
