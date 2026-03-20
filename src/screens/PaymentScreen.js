import { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Animated, Alert, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const STC_PAY_NUMBER = '0554404434';

const PAYMENT_OPTIONS = [
  { id: 'mada', icon: 'card', badgeColor: '#1D6F37', titleKey: 'payWithMada', descKey: 'madaDesc' },
  { id: 'card', icon: 'card-outline', badgeColor: '#1A1F71', titleKey: 'payWithCard', descKey: 'cardDesc' },
  { id: 'stc_pay', icon: 'phone-portrait', badgeColor: '#5F259F', titleKey: 'stcPay', descKey: 'stcPayDesc' },
  { id: 'cash', icon: 'cash', badgeColor: '#F59E0B', titleKey: 'payWithCash', descKey: 'cashPaymentDesc' },
  { id: 'apple_pay', icon: 'phone-portrait-outline', badgeColor: '#000000', titleKey: 'applePay', descKey: 'applePaySoon', disabled: true },
];

export default function PaymentScreen({ route, navigation }) {
  const { service, serviceId, size, price, pickup, destination, destinationName, fareTotal } = route.params || {};
  const { t, isRTL } = useI18n();
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    return () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current); };
  }, []);

  const displayTotal = fareTotal || price || 'SAR 0';

  const navParams = {
    service, serviceId, size, price,
    pickup, destination, destinationName, fareTotal,
  };

  const handleCopyNumber = useCallback(async () => {
    await Clipboard.setStringAsync(STC_PAY_NUMBER);
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleComingSoon = () => {
    Alert.alert(
      t('paymentMethods'),
      t('comingSoonAlert'),
      [{ text: t('confirm'), style: 'default' }]
    );
  };

  const handleNavigate = (method) => {
    navigation.navigate('DriverMatching', { ...navParams, paymentMethod: method });
  };

  const handleOptionPress = (option) => {
    if (option.disabled) return;
    if (option.id === 'mada' || option.id === 'card') {
      setSelected(option.id);
      handleComingSoon();
      return;
    }
    setSelected(selected === option.id ? null : option.id);
  };

  const renderExpanded = (optionId) => {
    if (optionId === 'stc_pay') {
      return (
        <View style={styles.expandedContent}>
          <Text style={[styles.stcInstructions, isRTL && styles.textRight]}>
            {t('stcPayInstructions').replace('{amount}', displayTotal).replace('{number}', STC_PAY_NUMBER)}
          </Text>
          <View style={styles.numberRow}>
            <Text style={styles.numberText}>{STC_PAY_NUMBER}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyNumber}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#22C55E' : colors.primary} />
              <Text style={[styles.copyText, copied && { color: '#22C55E' }]}>
                {copied ? (t('copied') || 'Copied!') : (t('copyNumber') || 'Copy')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleNavigate('stc_pay')} activeOpacity={0.8}>
            <LinearGradient colors={['#5F259F', '#7C3AED']} style={styles.actionGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>{t('iPaid')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    if (optionId === 'cash') {
      return (
        <View style={styles.expandedContent}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleNavigate('cash')} activeOpacity={0.8}>
            <LinearGradient colors={['#059669', '#047857']} style={styles.actionGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="cash" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>{t('payWithCash')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentMethod')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Total amount */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('totalAmount') || t('totalPrice')}</Text>
            <Text style={styles.totalAmount}>{displayTotal}</Text>
            <Text style={styles.vatNote}>{t('inclVat')}</Text>
          </View>

          {/* Select Payment heading */}
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('selectPayment')}</Text>

          {/* Payment options */}
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            const isDisabled = option.disabled;
            return (
              <View key={option.id}>
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    isDisabled && styles.optionCardDisabled,
                  ]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <View style={[styles.optionRow, isRTL && styles.rowReverse]}>
                    <View style={[styles.optionBadge, { backgroundColor: option.badgeColor }]}>
                      <Ionicons name={option.icon} size={22} color="#FFF" />
                    </View>
                    <View style={[styles.optionTextWrap, isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={[styles.optionTitle, isRTL && styles.textRight]}>
                        {option.id === 'stc_pay' ? 'STC Pay' : option.id === 'apple_pay' ? 'Apple Pay' : t(option.titleKey)}
                      </Text>
                      <Text style={[styles.optionDesc, isRTL && styles.textRight]}>
                        {t(option.descKey)}
                      </Text>
                    </View>
                    {!isDisabled && (
                      <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={20}
                        color={colors.gray}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                {isSelected && renderExpanded(option.id)}
              </View>
            );
          })}

          {/* Secure payment footer */}
          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={16} color={colors.gray} />
            <Text style={styles.secureText}>{t('securePayment')}</Text>
          </View>
        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  rowReverse: { flexDirection: 'row-reverse' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  totalCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  totalLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#059669' },
  vatNote: { fontSize: 12, color: colors.gray, marginTop: 4 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: colors.text,
    marginBottom: 12, marginTop: 4,
  },
  optionCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  optionCardSelected: {
    borderColor: colors.primary, borderWidth: 2,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  optionBadge: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  optionTextWrap: {
    flex: 1, marginHorizontal: 12,
  },
  optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  optionDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  expandedContent: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 10, marginTop: -4,
    borderWidth: 1, borderColor: colors.border,
  },
  stcInstructions: {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 14,
  },
  numberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  numberText: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  copyText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  actionBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  secureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 20,
  },
  secureText: { fontSize: 13, color: colors.gray },
  textRight: { textAlign: 'right' },
});
