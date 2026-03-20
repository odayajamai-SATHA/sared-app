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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { getDriverByPhone } from '../../utils/supabase';

export default function DriverLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, toggleLang, isRTL, lang } = useI18n();
  const { colors: C, isDark } = useTheme();

  const handleLogin = async () => {
    if (!phone || !driverId) return;

    setLoading(true);
    try {
      const { data, error } = await getDriverByPhone(`+966${phone}`);
      if (error || !data) {
        setLoading(false);
        Alert.alert(
          t('error') || 'Error',
          t('noDriverAccount'),
          [
            { text: t('cancel') || 'Cancel', style: 'cancel' },
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
          t('error') || 'Error',
          t('driverIdMismatch')
        );
        return;
      }
      navigation.replace('DriverDashboard', { driver: data });
    } catch {
      setLoading(false);
      Alert.alert(
        t('error') || 'Error',
        t('connectionError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
        <Text style={styles.langToggleText}>{t('langToggle')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchBtn}
        onPress={() => navigation.replace('Login')}
      >
        <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
        <Text style={styles.switchBtnText}>{t('switchToUser')}</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="car-sport" size={48} color={colors.primary} />
        </View>
        <Text style={styles.logoText}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('driverMode')}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.label, isRTL && styles.textRight]}>
          {t('enterPhone')}
        </Text>
        <View style={[styles.phoneRow, isRTL && styles.rowReverse]}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+966</Text>
          </View>
          <TextInput
            style={[styles.phoneInput, isRTL && styles.textRight]}
            placeholder={t('phonePlaceholder')}
            placeholderTextColor={colors.gray}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={9}
          />
        </View>

        <Text style={[styles.label, isRTL && styles.textRight]}>
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
            <Text style={styles.loginButtonText}>...</Text>
          ) : (
            <Text style={styles.loginButtonText}>{t('driverLogin')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.terms, isRTL && styles.textRight]}>{t('terms')}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  langToggle: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  langToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  switchBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
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
    color: colors.text,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  countryCode: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCodeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  textRight: {
    textAlign: 'right',
  },
});
