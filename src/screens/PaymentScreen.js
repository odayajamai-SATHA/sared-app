import { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Animated, Alert, Platform, Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

const STC_PAY_NUMBER = '0554404434';

const MOYASAR_KEY = process.env.EXPO_PUBLIC_MOYASAR_KEY;

const PAYMENT_FEES = {
  mada: 0.01,
  card: 0.0275,
};

const PAYMENT_OPTIONS = [
  { id: 'mada', icon: 'card', badgeColor: '#008539', titleKey: 'payWithMada', descKey: 'madaDesc', feeLabel: '1%' },
  { id: 'apple_pay', icon: 'phone-portrait-outline', badgeColor: '#000000', titleKey: 'applePay', descKey: 'applePaySoon', disabled: true },
  { id: 'card', icon: 'card-outline', badgeColor: '#1A1F71', titleKey: 'payWithCard', descKey: 'cardDesc', feeLabel: '2.75%' },
  { id: 'stc_pay', icon: 'phone-portrait', badgeColor: '#5F259F', titleKey: 'stcPay', descKey: 'stcPayDesc' },
  { id: 'cash', icon: 'cash', badgeColor: '#F59E0B', titleKey: 'payWithCash', descKey: 'cashPaymentDesc' },
];

function parseSAR(priceStr) {
  const num = parseFloat((priceStr || '').replace(/[^\d.]/g, ''));
  return isNaN(num) ? 0 : num;
}

export default function PaymentScreen({ route, navigation }) {
  const { service, serviceId, serviceType, size, price, pickup, destination, destinationName, fareTotal, fareBreakdown } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
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
  const totalAmount = parseSAR(displayTotal);

  const navParams = {
    service, serviceId, serviceType, size, price,
    pickup, destination, destinationName, fareTotal, fareBreakdown,
  };

  const handleCopyNumber = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(STC_PAY_NUMBER);
      setCopied(true);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const handleNavigate = (method) => {
    navigation.navigate('DriverMatching', { ...navParams, paymentMethod: method });
  };

  const handleMoyasarPayment = (method) => {
    if (!MOYASAR_KEY || MOYASAR_KEY === 'pk_test_placeholder') {
      Alert.alert(
        t('paymentMethods'),
        t('comingSoonAlert'),
        [{ text: t('confirm'), style: 'default' }]
      );
      return;
    }

    const fee = PAYMENT_FEES[method] || 0;
    const feeAmount = Math.round(totalAmount * fee * 100) / 100;
    const chargeTotal = totalAmount + feeAmount;

    setProcessing(true);

    Alert.alert(
      method === 'mada' ? t('payWithMada') : t('payWithCard'),
      `${t('totalAmount')}: SAR ${chargeTotal.toFixed(2)}`,
      [
        { text: t('cancel'), style: 'cancel', onPress: () => setProcessing(false) },
        {
          text: t('confirm'),
          onPress: () => {
            setProcessing(false);
            handleNavigate(method);
          },
        },
      ]
    );
  };

  const handleOptionPress = (option) => {
    if (option.disabled || processing) return;
    if (option.id === 'mada' || option.id === 'card') {
      setSelected(option.id);
      handleMoyasarPayment(option.id);
      return;
    }
    setSelected(selected === option.id ? null : option.id);
  };

  const renderExpanded = (optionId) => {
    if (optionId === 'stc_pay') {
      return (
        <View style={[styles.expandedContent, { color: colors.text }]}>
          <Text style={[styles.stcInstructions, { color: colors.textSecondary }, isRTL && styles.textRight]}>
            {t('stcPayInstructions').replace('{amount}', displayTotal).replace('{number}', STC_PAY_NUMBER)}
          </Text>
          <View style={[styles.numberRow, isRTL && styles.rowReverse, { color: colors.text }]}>
            <Text style={[styles.numberText, { color: colors.text }]}>{STC_PAY_NUMBER}</Text>
            <TouchableOpacity style={[styles.copyBtn, isRTL && styles.rowReverse]} onPress={handleCopyNumber}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#22C55E' : colors.primary} />
              <Text style={[styles.copyText, copied && { color: '#22C55E' }]}>
                {copied ? t('copied') : t('copyNumber')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.actionBtn, { color: colors.text }]} onPress={() => handleNavigate('stc_pay')} activeOpacity={0.8}>
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
        <View style={[styles.expandedContent, { color: colors.text }]}>
          <TouchableOpacity style={[styles.actionBtn, { color: colors.text }]} onPress={() => handleNavigate('cash')} activeOpacity={0.8}>
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
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('paymentMethod')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.totalCard, { color: colors.text }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('totalAmount') || t('totalPrice')}</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>{displayTotal}</Text>
            <Text style={[styles.vatNote, { color: colors.textSecondary }]}>{t('inclVat')}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>{t('selectPayment')}</Text>

          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = selected === option.id;
            const isDisabled = option.disabled;
            return (
              <View key={option.id}>
                <TouchableOpacity
                  style={[
                    styles.optionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder },
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
                      <View style={[styles.optionTitleRow, isRTL && styles.rowReverse]}>
                        <Text style={[styles.optionTitle, { color: colors.text }, isRTL && styles.textRight]}>
                          {option.id === 'stc_pay' ? 'STC Pay' : option.id === 'apple_pay' ? 'Apple Pay' : t(option.titleKey)}
                        </Text>
                        {option.feeLabel && (
                          <View style={styles.feeBadge}>
                            <Text style={styles.feeText}>{option.feeLabel}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.optionDesc, { color: colors.textSecondary }, isRTL && styles.textRight]}>
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

          <View style={[styles.currencyNote, isRTL && styles.rowReverse]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.gray} />
            <Text style={[styles.currencyText, { color: colors.textSecondary }]}>
              {t('currencyNote')}
            </Text>
          </View>

          <View style={[styles.secureRow, isRTL && styles.rowReverse, { color: colors.text }]}>
            <Ionicons name="lock-closed" size={16} color={colors.gray} />
            <Text style={[styles.secureText, { color: colors.textSecondary }]}>{t('securePayment')}</Text>
          </View>
        </Animated.View>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  rowReverse: { flexDirection: 'row-reverse' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  totalCard: {
    backgroundColor: 'transparent', borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  totalLabel: { fontSize: 14, marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#059669' },
  vatNote: { fontSize: 12, marginTop: 4 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700',
    marginBottom: 12, marginTop: 4,
  },
  optionCard: {
    backgroundColor: 'transparent', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  optionCardSelected: {
    borderColor: theme.primary, borderWidth: 2,
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
  optionTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 13, marginTop: 2 },
  feeBadge: {
    backgroundColor: '#E0F2FE', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  feeText: { fontSize: 11, fontWeight: '600', color: '#0284C7' },
  expandedContent: {
    backgroundColor: 'transparent', borderRadius: 14, padding: 16, marginBottom: 10, marginTop: -4,
    borderWidth: 1, borderColor: 'transparent',
  },
  stcInstructions: {
    fontSize: 14, lineHeight: 22, marginBottom: 14,
  },
  numberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'transparent', borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'transparent',
  },
  numberText: { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'transparent', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'transparent',
  },
  copyText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  actionBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  currencyNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  currencyText: { fontSize: 12,  },
  secureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  secureText: { fontSize: 13,  },
  textRight: { textAlign: 'right' },
});
