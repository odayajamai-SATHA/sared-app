import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';
import { createDebouncedNav } from '../utils/navigation';
import { supabase } from '../utils/supabase';

export default function LoginScreen({ navigation: rawNav }) {
  const navigation = createDebouncedNav(rawNav);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);
  const cooldownRef = useRef(null);
  const { t, toggleLang, isRTL } = useI18n();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.spring(iconScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
      Animated.parallel([
        Animated.timing(formFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(formSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const startCooldown = () => {
    const delays = [30, 60, 120];
    const seconds = delays[Math.min(sendCount, delays.length - 1)];
    setCooldown(seconds);
    setSendCount((c) => c + 1);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const isValidPhone = phone.length === 9 && phone.startsWith('5');

  const handleGetOTP = async () => {
    if (!isValidPhone || cooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: '+966' + phone });
      setLoading(false);
      if (error) {
        Alert.alert(
          t('error') || 'Error',
          'SMS service is being configured. Please continue as guest for now.',
          [
            { text: t('continueAsGuest') || 'Continue as Guest', onPress: () => navigation.replace('Main') },
            { text: 'Test OTP Screen', onPress: () => navigation.navigate('OTP', { phone }) },
          ]
        );
        return;
      }
      startCooldown();
      navigation.navigate('OTP', { phone });
    } catch (e) {
      setLoading(false);
      Alert.alert(
        t('error') || 'Error',
        'SMS verification not available yet.',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          { text: t('continueAsGuest') || 'Continue as Guest', onPress: () => navigation.replace('Main') },
          { text: 'Test OTP', onPress: () => navigation.navigate('OTP', { phone }) },
        ]
      );
    }
  };

  return (
    <LinearGradient colors={['#022C22', '#064E3B', '#065F46', '#059669']} style={styles.gradient}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar style="light" />

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('DriverLogin')}>
            <Ionicons name="car-sport" size={13} color="#FFF" />
            <Text style={styles.topBtnText}>{t('switchToDriver')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('ForBusiness')}>
            <Ionicons name="briefcase" size={13} color="#FFF" />
            <Text style={styles.topBtnText}>{t('forBusiness')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={toggleLang}>
            <Text style={styles.topBtnText}>{t('langToggle')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoSection}>
          <Animated.View style={[styles.logoCircle, { opacity: fadeAnim, transform: [{ scale: iconScale }] }]}>
            <Ionicons name="shield-checkmark" size={36} color="#FFF" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.appName}>Sared</Text>
            <Text style={styles.appNameAr}>{'\u0633\u0627\u0631\u062F'}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
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
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
              maxLength={9}
            />
          </View>

          <TouchableOpacity
            style={[styles.otpButton, (!isValidPhone || loading || cooldown > 0) && styles.otpButtonDisabled]}
            onPress={handleGetOTP}
            disabled={!isValidPhone || loading || cooldown > 0}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#059669', '#047857']} style={[styles.otpGradient, isRTL && styles.rowReverse]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : cooldown > 0 ? (
                <Text style={styles.otpButtonText}>{t('resendIn') || 'Resend in'} {cooldown}s</Text>
              ) : (
                <>
                  <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color="#FFF" />
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
  container: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 16, gap: 8, flexWrap: 'wrap' },
  topBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, gap: 5,
  },
  topBtnText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  logoSection: { alignItems: 'center', paddingVertical: 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { fontSize: 40, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: 3 },
  appNameAr: { fontSize: 22, fontWeight: '600', color: 'rgba(5,150,105,0.9)', textAlign: 'center', marginTop: 2 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 6 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  label: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  rowReverse: { flexDirection: 'row-reverse' },
  countryCode: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderStartWidth: 3, borderStartColor: '#22C55E',
  },
  codeText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  phoneInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 18, color: '#FFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', letterSpacing: 1,
  },
  otpButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  otpButtonDisabled: { opacity: 0.3 },
  otpGradient: {
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  otpButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  guestBtn: { alignItems: 'center', paddingVertical: 8, marginBottom: 4 },
  guestBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textDecorationLine: 'underline' },
  terms: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 16 },
  textRight: { textAlign: 'right' },
});
