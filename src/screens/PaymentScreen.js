import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Animated, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const STC_PAY_NUMBER = '0554404434';

export default function PaymentScreen({ route, navigation }) {
  const { service, serviceId, size, price, pickup, destination, destinationName, fareTotal } = route.params;
  const { t, isRTL } = useI18n();
  const [copied, setCopied] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const displayTotal = fareTotal || price || 'SAR 0';

  const handleCopyNumber = async () => {
    await Clipboard.setStringAsync(STC_PAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStcPaid = () => {
    navigation.navigate('DriverMatching', {
      service, serviceId, size, price,
      pickup, destination, destinationName,
      paymentMethod: 'stc_pay',
    });
  };

  const handleCash = () => {
    navigation.navigate('DriverMatching', {
      service, serviceId, size, price,
      pickup, destination, destinationName,
      paymentMethod: 'cash',
    });
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
            <Text style={styles.totalLabel}>{t('totalPrice')}</Text>
            <Text style={styles.totalAmount}>{displayTotal}</Text>
            <Text style={styles.vatNote}>{t('inclVat')}</Text>
          </View>

          {/* STC Pay Option */}
          <View style={styles.stcCard}>
            <View style={styles.stcHeader}>
              <View style={styles.stcBadge}>
                <Ionicons name="phone-portrait" size={22} color="#FFF" />
              </View>
              <Text style={styles.stcTitle}>STC Pay</Text>
            </View>

            <Text style={[styles.stcInstructions, isRTL && styles.textRight]}>
              {t('stcPayInstructions').replace('{amount}', displayTotal).replace('{number}', STC_PAY_NUMBER)}
            </Text>

            {/* Number display + copy */}
            <View style={styles.numberRow}>
              <Text style={styles.numberText}>{STC_PAY_NUMBER}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyNumber}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#22C55E' : colors.primary} />
                <Text style={[styles.copyText, copied && { color: '#22C55E' }]}>
                  {copied ? (t('copied') || 'Copied!') : (t('copyNumber') || 'Copy')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* I Paid button */}
            <TouchableOpacity style={styles.iPaidBtn} onPress={handleStcPaid} activeOpacity={0.8}>
              <LinearGradient colors={['#059669', '#047857']} style={styles.iPaidGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.iPaidText}>{t('iPaid')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Cash Option */}
          <View style={styles.cashCard}>
            <View style={[styles.cashHeader, isRTL && styles.rowReverse]}>
              <View style={styles.cashIcon}>
                <Ionicons name="cash" size={22} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cashTitle, isRTL && styles.textRight]}>{t('payWithCash')}</Text>
                <Text style={[styles.cashDesc, isRTL && styles.textRight]}>{t('cashPaymentDesc')}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.cashBtn} onPress={handleCash} activeOpacity={0.8}>
              <Text style={styles.cashBtnText}>{t('payWithCash')}</Text>
            </TouchableOpacity>
          </View>

          {/* Coming soon note */}
          <View style={styles.comingSoonRow}>
            <Ionicons name="time-outline" size={16} color={colors.gray} />
            <Text style={styles.comingSoonText}>{t('madaApplePaySoon')}</Text>
          </View>
        </Animated.View>
        <View style={{ height: 40 }} />
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
  totalAmount: { fontSize: 36, fontWeight: '800', color: colors.text },
  vatNote: { fontSize: 12, color: colors.gray, marginTop: 4 },
  stcCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 2, borderColor: colors.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  stcHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  stcBadge: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#5F259F',
    justifyContent: 'center', alignItems: 'center',
  },
  stcTitle: { fontSize: 20, fontWeight: '800', color: '#5F259F' },
  stcInstructions: {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 16,
  },
  numberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  numberText: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  copyText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  iPaidBtn: { borderRadius: 14, overflow: 'hidden' },
  iPaidGradient: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  iPaidText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  cashCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cashHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cashIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7',
    justifyContent: 'center', alignItems: 'center',
  },
  cashTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cashDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cashBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 2, borderColor: colors.primary, backgroundColor: '#F0FDF4',
  },
  cashBtnText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  comingSoonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 16,
  },
  comingSoonText: { fontSize: 13, color: colors.gray },
  textRight: { textAlign: 'right' },
});
