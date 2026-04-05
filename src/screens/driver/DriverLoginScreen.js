import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { getDriverByPhone } from '../../utils/supabase';

export default function DriverLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, toggleLang, setLang, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    if (!phone || !driverId) return;

    setLoading(true);
    try {
      const { data, error } = await getDriverByPhone(`+966${phone}`);
      if (error || !data) {
        setLoading(false);
        Alert.alert(
          t('error'),
          t('noDriverAccount'),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('demoMode'),
              onPress: () => {
                navigation.replace('DriverDashboard', {
                  driver: {
                    id: 'demo-driver',
                    name: t('driverName'),
                    phone: `+966${phone}`,
                    vehicle_type: 'flatbed',
                    plate_number: 'ABC 1234',
                    rating: 4.8,
                    is_online: false,
                    isDemo: true,
                  },
                });
              },
            },
          ]
        );
        return;
      }
      // Verify driver ID matches
      if (data.driver_id && data.driver_id !== driverId) {
        setLoading(false);
        Alert.alert(
          t('error'),
          t('driverIdMismatch')
        );
        return;
      }
      navigation.replace('DriverDashboard', { driver: data });
    } catch {
      setLoading(false);
      Alert.alert(
        t('error'),
        t('connectionError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <View style={styles.langRow}>
        <TouchableOpacity style={[styles.langBtn, lang === 'en' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={() => setLang('en')}>
          <Text style={[styles.langBtnText, { color: lang === 'en' ? colors.primary : colors.textSecondary }]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.langBtn, lang === 'ar' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={() => setLang('ar')}>
          <Text style={[styles.langBtnText, { color: lang === 'ar' ? colors.primary : colors.textSecondary }]}>العربية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.langBtn, lang === 'ur' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={() => setLang('ur')}>
          <Text style={[styles.langBtnText, { color: lang === 'ur' ? colors.primary : colors.textSecondary }]}>اردو</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.switchBtn, { color: colors.text }, isRTL && styles.rowReverse]}
        onPress={() => navigation.replace('Login')}
      >
        <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
        <Text style={[styles.switchBtnText, { color: colors.primary }]}>{t('switchToUser')}</Text>
      </TouchableOpacity>

      <View style={[styles.logoContainer, { color: colors.text }]}>
        <View style={[styles.logoCircle, { color: colors.text }]}>
          <Ionicons name="car-sport" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.logoText, { color: colors.primary }]}>{t('appName')}</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('driverMode')}</Text>
      </View>

      <View style={[styles.formContainer, { color: colors.text }]}>
        <Text style={[styles.label, { color: colors.text }, isRTL && styles.textRight]}>
          {t('enterPhone')}
        </Text>
        <View style={styles.phoneRow}>
          <View style={[styles.countryCode, { color: colors.text }]}>
            <Text style={[styles.countryCodeText, { color: colors.text }]}>+966</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder={t('phonePlaceholder')}
            placeholderTextColor={colors.gray}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={9}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }, isRTL && styles.textRight]}>
          {t('driverIdLabel')}
        </Text>
        <TextInput
          style={[styles.idInput, isRTL && styles.textRight]}
          placeholder={t('driverIdPlaceholder')}
          placeholderTextColor={colors.gray}
          value={driverId}
          onChangeText={setDriverId}
          maxLength={20}
        />

        <TouchableOpacity
          style={[styles.loginButton, (!phone || !driverId) && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={!phone || !driverId || loading}
        >
          {loading ? (
            <Text style={[styles.loginButtonText, { color: colors.text }]}>...</Text>
          ) : (
            <Text style={[styles.loginButtonText, { color: colors.text }]}>{t('driverLogin')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.terms, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('terms')}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  langRow: {
    position: 'absolute',
    top: 52,
    end: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchBtn: {
    position: 'absolute',
    top: 52,
    start: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,150,105,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(5,150,105,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#059669',
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    direction: 'ltr',
    gap: 10,
    marginBottom: 20,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  countryCode: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    direction: 'ltr',
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  idInput: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: theme.white,
    fontSize: 18,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  textRight: {
    textAlign: 'right',
  },
});
