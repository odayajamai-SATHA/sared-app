import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';
import { supabase } from '../utils/supabase';

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;
  const { t, isRTL } = useI18n();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const cooldownRef = useRef(null);
  const inputs = useRef([]);

  useEffect(() => {
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const handleChange = (text, index) => {
    const newCode = [...code];
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6).split('');
      digits.forEach((d, i) => { if (i < 6) newCode[i] = d; });
      setCode(newCode);
      inputs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const otpCode = code.join('');

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: '+966' + phone,
        token: otpCode,
        type: 'sms',
      });
      setLoading(false);
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      if (data?.session) {
        navigation.replace('Main');
      } else {
        setError(t('verificationFailed') || 'Verification failed. Please try again.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert(
        t('error') || 'Error',
        'SMS verification not available yet. Continue as guest?',
        [
          { text: t('cancel') || 'Cancel', style: 'cancel' },
          { text: t('continueAsGuest') || 'Continue as Guest', onPress: () => navigation.replace('Main') },
        ]
      );
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({ phone: '+966' + phone });
      if (resendError) {
        Alert.alert(t('error') || 'Error', resendError.message);
        return;
      }
      Alert.alert(t('otpResent') || 'OTP Resent');
      setResendCooldown(30);
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      Alert.alert(t('error') || 'Error', 'Could not resend OTP.');
    }
  };

  return (
    <LinearGradient colors={['#022C22', '#064E3B', '#065F46']} style={styles.gradient}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('verifyOTP')}</Text>
          <Text style={styles.subtitle}>{t('otpSentTo')} +966{phone}</Text>

          <View style={[styles.otpRow, isRTL && styles.rowReverse]}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  error ? styles.otpInputError : null,
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.verifyBtn, otpCode.length !== 6 && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={otpCode.length !== 6 || loading}
          >
            <LinearGradient colors={['#059669', '#047857']} style={styles.verifyGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? (
                <Ionicons name="reload" size={20} color="#FFF" />
              ) : (
                <Text style={styles.verifyBtnText}>{t('verifyCode')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[styles.resendText, resendCooldown > 0 && { opacity: 0.5 }]}>
              {resendCooldown > 0
                ? `${t('resendIn') || 'Resend in'} ${resendCooldown}s`
                : t('resendOTP')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 52, left: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(5,150,105,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    borderWidth: 2, borderColor: 'rgba(5,150,105,0.3)',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 32 },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  rowReverse: { flexDirection: 'row-reverse' },
  otpInput: {
    width: 48, height: 58, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    textAlign: 'center', fontSize: 24, fontWeight: '700', color: '#FFF',
  },
  otpInputFilled: { borderColor: colors.primary, backgroundColor: 'rgba(5,150,105,0.15)' },
  otpInputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 14, color: '#EF4444', marginBottom: 16 },
  verifyBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  verifyBtnDisabled: { opacity: 0.5 },
  verifyGradient: { paddingVertical: 16, alignItems: 'center' },
  verifyBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  resendBtn: { padding: 12 },
  resendText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
});
