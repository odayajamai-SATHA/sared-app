import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

const FLEET_SIZES = ['1-10', '11-50', '51-200', '200+'];

export default function ForBusinessScreen({ navigation }) {
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();
  const [form, setForm] = useState({ company: '', fleetSize: '', contact: '', email: '', phone: '' });
  const [showFleetMenu, setShowFleetMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const update = (key, val) => setForm({ ...form, [key]: val });
  const isValid = form.company && form.fleetSize && form.contact && form.email && form.phone;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const benefits = [
    { icon: 'pricetag-outline', text: t('bizBenefit1'), color: '#059669' },
    { icon: 'person-outline', text: t('bizBenefit2'), color: '#3B82F6' },
    { icon: 'document-text-outline', text: t('bizBenefit3'), color: '#8B5CF6' },
    { icon: 'flash-outline', text: t('bizBenefit4'), color: '#22C55E' },
  ];

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
        <Text style={styles.successTitle}>{t('requestSubmitted')}</Text>
        <Text style={styles.successSub}>{t('contactWithin24')}</Text>
        <TouchableOpacity style={styles.successBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.successBtnText}>{t('done')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={['#065F46', '#022C22']} style={styles.headerGradient}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('saredForBusiness')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroIcon}>
          <Ionicons name="briefcase" size={36} color="#FFF" />
        </View>
        <Text style={styles.headerSub}>{t('businessSubtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.benefitsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {benefits.map((b, i) => (
            <View key={i} style={[styles.benefitRow, isRTL && styles.rowReverse]}>
              <View style={[styles.benefitIcon, { backgroundColor: b.color + '15' }]}>
                <Ionicons name={b.icon} size={18} color={b.color} />
              </View>
              <Text style={[styles.benefitText, isRTL && styles.textRight]}>{b.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.label}>{t('companyName')}</Text>
          <TextInput style={styles.input} placeholder={t('companyPlaceholderBiz')} placeholderTextColor={colors.gray}
            value={form.company} onChangeText={(v) => update('company', v)} />

          <Text style={styles.label}>{t('fleetSize')}</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowFleetMenu(!showFleetMenu)}>
            <Text style={form.fleetSize ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {form.fleetSize || t('fleetSize')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </TouchableOpacity>
          {showFleetMenu && (
            <View style={styles.menuList}>
              {FLEET_SIZES.map((fs) => (
                <TouchableOpacity key={fs} style={styles.menuItem}
                  onPress={() => { update('fleetSize', fs); setShowFleetMenu(false); }}>
                  <Text style={styles.menuItemText}>{fs}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{t('contactPerson')}</Text>
          <TextInput style={styles.input} placeholder={t('contactPlaceholder')} placeholderTextColor={colors.gray}
            value={form.contact} onChangeText={(v) => update('contact', v)} />

          <Text style={styles.label}>{t('emailAddress')}</Text>
          <TextInput style={styles.input} placeholder={t('emailPlaceholder')} placeholderTextColor={colors.gray}
            keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => update('email', v)} />

          <Text style={styles.label}>{t('enterPhone')}</Text>
          <View style={styles.phoneRow}>
            <View style={styles.codeBox}><Text style={styles.codeText}>+966</Text></View>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder={t('phonePlaceholder')} placeholderTextColor={colors.gray}
              keyboardType="phone-pad" value={form.phone} onChangeText={(v) => update('phone', v)} maxLength={9} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, !isValid && { opacity: 0.5 }]}
            onPress={handleSubmit} disabled={!isValid}>
            <LinearGradient colors={['#065F46', '#022C22']} style={styles.submitGradient}>
              <Ionicons name="send" size={18} color="#FFF" />
              <Text style={styles.submitText}>{t('submitInquiry')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, alignSelf: 'stretch',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
  },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { padding: 16, paddingTop: 0 },
  benefitsCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginTop: -12, marginBottom: 12,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  benefitText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  formCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  phoneRow: { flexDirection: 'row', gap: 10 },
  codeBox: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14,
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  codeText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border,
  },
  dropdownValue: { fontSize: 15, color: colors.text },
  dropdownPlaceholder: { fontSize: 15, color: colors.gray },
  menuList: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginTop: 4, overflow: 'hidden',
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  menuItemText: { fontSize: 15, color: colors.text },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 24 },
  submitGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  textRight: { textAlign: 'right' },
  // Success state
  successContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.white, paddingHorizontal: 40,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 20, textAlign: 'center' },
  successSub: { fontSize: 15, color: colors.textSecondary, marginTop: 12, textAlign: 'center' },
  successBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 14, marginTop: 32,
  },
  successBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
