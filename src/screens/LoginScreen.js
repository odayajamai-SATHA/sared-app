import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, toggleLang, isRTL } = useI18n();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      ]),
      Animated.spring(iconScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(formSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Replace with real Supabase auth when phone provider is configured
  const handleGetOTP = () => {
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTP', { phone });
    }, 500);
  };

  return (
    <LinearGradient colors={['#022C22', '#064E3B', '#065F46', '#059669']} style={styles.gradient}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="light" />

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('DriverSignup')}>
            <Ionicons name="car-sport" size={14} color="#FFF" />
            <Text style={styles.topBtnText}>{t('switchToDriver')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('ForBusiness')}>
            <Ionicons name="briefcase" size={14} color="#FFF" />
            <Text style={styles.topBtnText}>{t('forBusiness')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={toggleLang}>
            <Text style={styles.topBtnText}>{t('langToggle')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoCircle, { opacity: fadeAnim, transform: [{ scale: iconScale }] }]}>
            <Ionicons name="shield-checkmark" size={56} color="#FFF" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.appName}>Sared</Text>
            <Text style={styles.appNameAr}>{'\u0633\u0627\u0631\u062F'}</Text>
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>{t('tagline')}</Text>
              <Text style={styles.taglineAr}>{t('taglineAr')}</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.formCard, { opacity: formFade, transform: [{ translateY: formSlide }] }]}>
          <Text style={[styles.label, isRTL && styles.textRight]}>{t('enterPhone')}</Text>
          <View style={[styles.phoneRow, isRTL && styles.rowReverse]}>
            <View style={styles.countryCode}>
              <Text style={styles.codeText}>+966</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, isRTL && styles.textRight]}
              placeholder={t('phonePlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[styles.otpButton, (!phone || loading) && styles.otpButtonDisabled]}
            onPress={handleGetOTP}
            disabled={!phone || loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#059669', '#047857']} style={styles.otpGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <Ionicons name="reload" size={20} color="#FFF" />
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  <Text style={styles.otpButtonText}>{t('getOTP')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={() => navigation.replace('Main')}>
            <Text style={styles.guestBtnText}>{t('continueAsGuest')}</Text>
          </TouchableOpacity>

          <Text style={[styles.terms, isRTL && styles.textRight]}>{t('terms')}</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 20 },
  topBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6,
  },
  topBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  logoSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { fontSize: 52, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: 3 },
  appNameAr: { fontSize: 28, fontWeight: '600', color: 'rgba(5,150,105,0.9)', textAlign: 'center', marginTop: 2 },
  taglineContainer: { alignItems: 'center', marginTop: 12, gap: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  taglineAr: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  label: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  rowReverse: { flexDirection: 'row-reverse' },
  countryCode: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  codeText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  phoneInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: '#FFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', letterSpacing: 1,
  },
  otpButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  otpButtonDisabled: { opacity: 0.5 },
  otpGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  otpButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  guestBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  guestBtnText: { fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textDecorationLine: 'underline' },
  terms: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 16 },
  textRight: { textAlign: 'right' },
});
