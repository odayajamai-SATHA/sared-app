import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Share, Platform, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../utils/i18n';
import { useTheme } from '../utils/theme';

export default function ReceiptScreen({ route, navigation }) {
  const { service, serviceId, serviceType, size, price, fareBreakdown, paymentMethod } = route.params || {};
  const { t, isRTL, lang } = useI18n();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-SA', { hour: '2-digit', minute: '2-digit' });

  const isFlat = fareBreakdown?.isFlat || serviceType === 'flat' || ['flatTire', 'battery', 'fuel'].includes(serviceId);
  const totalNum = fareBreakdown?.total || parseInt((price || '').replace(/\D/g, '')) || 0;
  const serviceFee = fareBreakdown?.serviceFee || fareBreakdown?.baseFare || 50;
  const baseFare = fareBreakdown?.baseFare || 50;
  const distFee = fareBreakdown?.distanceCharge || (isFlat ? 0 : Math.max(0, Math.round((totalNum / 1.15) - 50)));
  const nightSurcharge = fareBreakdown?.nightSurcharge || 0;
  const vat = fareBreakdown?.vat || Math.round((totalNum / 1.15) * 0.15);
  const total = fareBreakdown?.total || totalNum;
  const txnId = `TXN-${Date.now().toString().slice(-8)}`;

  const paymentDisplay = paymentMethod === 'stc_pay' ? 'STC Pay' : t('cashLabel');

  const buildReceiptMessage = () => {
    const lines = [
      `━━━━━━━━━━━━━━━━`,
      `🛡️ ${t('saredReceipt')}`,
      `━━━━━━━━━━━━━━━━`,
      ``,
      `📅 ${dateStr} | ${timeStr}`,
      `🔧 ${service || t('towService')}`,
      size && size !== '—' ? `🚗 ${size}` : null,
      ``,
      `💰 ${t('receiptTotal')}: SAR ${total}`,
      `💳 ${t('receiptPayment')}: ${paymentDisplay}`,
      `📝 ${txnId}`,
      ``,
      `${t('thankYouSared')}`,
      `https://sared.app`,
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleManualShare = async () => {
    const msg = buildReceiptMessage();
    try {
      await Share.share({ message: msg, title: t('saredReceipt') });
    } catch {}
  };

  const handleShareWhatsApp = async () => {
    const msg = buildReceiptMessage();
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(whatsappUrl);
    } catch {
      Alert.alert(t('error'), t('whatsappNotInstalled'));
    }
  };

  const handleShareEmail = async () => {
    const subject = encodeURIComponent(`${t('saredReceipt')} - ${txnId}`);
    const body = encodeURIComponent(buildReceiptMessage());
    try {
      await Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    } catch {
      Alert.alert(t('error'), t('noEmailApp'));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.topBar, { backgroundColor: colors.headerBg, borderColor: colors.border }, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]}>{t('receipt')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.receiptCard, { backgroundColor: colors.card, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <View style={[styles.logoSection, { color: colors.text }]}>
          <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          <Text style={[styles.logoName, { color: colors.primary }]}>Sared</Text>
          <Text style={[styles.logoNameAr, { color: colors.textSecondary }]}>سارد</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, borderColor: colors.border }]} />

        {/* Trip info */}
        <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>{t('tripReceipt')}</Text>
        {[
          ['calendar-outline', t('tripDate'), dateStr],
          ['time-outline', t('tripTime'), timeStr],
          ['locate-outline', t('pickup'), lang === 'ar' ? 'طريق الملك فهد، الرياض' : 'King Fahd Rd, Riyadh'],
          ['location-outline', t('dropoff'), lang === 'ar' ? 'شارع العليا، الرياض' : 'Olaya St, Riyadh'],
        ].map(([icon, label, value], i) => (
          <View key={i} style={[styles.infoRow, { color: colors.text }, isRTL && styles.rowReverse]}>
            <Ionicons name={icon} size={16} color={i < 2 ? colors.textSecondary : i === 2 ? colors.success : colors.danger} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }, isRTL && styles.textRight]}>{value}</Text>
          </View>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border, borderColor: colors.border }]} />

        {/* Price breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>{t('priceBreakdown')}</Text>
        {isFlat ? (
          <>
            <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('serviceFee')}</Text>
              <Text style={[styles.priceValue, { color: colors.text }, isRTL && styles.textRight]}>SAR {serviceFee}</Text>
            </View>
            {nightSurcharge > 0 && (
              <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
                <Text style={[styles.priceLabel, { color: '#8B5CF6' }, isRTL && styles.textRight]}>{t('nightSurcharge')}</Text>
                <Text style={[styles.priceValue, { color: '#8B5CF6' }, isRTL && styles.textRight]}>SAR {nightSurcharge}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('baseFare')}</Text>
              <Text style={[styles.priceValue, { color: colors.text }, isRTL && styles.textRight]}>SAR {baseFare}</Text>
            </View>
            <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('distanceRate') || t('distance')}</Text>
              <Text style={[styles.priceValue, { color: colors.text }, isRTL && styles.textRight]}>SAR {distFee}</Text>
            </View>
            {nightSurcharge > 0 && (
              <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
                <Text style={[styles.priceLabel, { color: '#8B5CF6' }, isRTL && styles.textRight]}>{t('nightSurcharge')}</Text>
                <Text style={[styles.priceValue, { color: '#8B5CF6' }, isRTL && styles.textRight]}>SAR {nightSurcharge}</Text>
              </View>
            )}
          </>
        )}
        <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('vat')}</Text>
          <Text style={[styles.priceValue, { color: colors.text }, isRTL && styles.textRight]}>SAR {vat}</Text>
        </View>

        <View style={[styles.totalDivider, { backgroundColor: colors.primary, borderColor: colors.border }]} />
        <View style={[styles.priceRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          <Text style={[styles.totalLabel, { color: colors.text }, isRTL && styles.textRight]}>{t('totalPrice')}</Text>
          <Text style={[styles.totalValue, { color: colors.primary }, isRTL && styles.textRight]}>SAR {total}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, borderColor: colors.border }]} />

        {/* Payment */}
        <View style={[styles.paymentRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          <Ionicons name="cash-outline" size={20} color={colors.success} />
          <Text style={[styles.paymentLabel, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('paymentMethod')}</Text>
          <Text style={[styles.paymentValue, { color: colors.success }, isRTL && styles.textRight]}>{paymentDisplay}</Text>
        </View>

        {/* Receipt tear line */}
        <View style={[styles.tearLine, { borderTopColor: colors.border }]} />

        {/* Transaction ID */}
        <Text style={[styles.txId, { color: colors.gray }]}>{txnId}</Text>
      </Animated.View>

      {/* Share action buttons */}
      <View style={[styles.shareSection, { color: colors.text }]}>
        <Text style={[styles.shareTitle, { color: colors.text }]}>
          {t('shareReceipt')}
        </Text>
        <View style={[styles.shareRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#25D366' }, isRTL && styles.rowReverse]} onPress={handleShareWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
            <Text style={styles.shareBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: '#EA4335' }, isRTL && styles.rowReverse]} onPress={handleShareEmail}>
            <Ionicons name="mail" size={22} color="#FFF" />
            <Text style={styles.shareBtnText}>{t('emailLabel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.primary, borderColor: colors.border }, isRTL && styles.rowReverse]} onPress={handleManualShare}>
            <Ionicons name="share-social" size={22} color="#FFF" />
            <Text style={styles.shareBtnText}>{t('otherShare')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tip section */}
      <View style={[styles.shareSection, { color: colors.text }]}>
        <Text style={[styles.shareTitle, { color: colors.text }]}>
          {t('tipYourDriver') || t('tipDriver')}
        </Text>
        <View style={[styles.shareRow, { color: colors.text }, isRTL && styles.rowReverse]}>
          {[5, 10, 20].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.shareBtn, { backgroundColor: colors.primary, borderColor: colors.border }]}
              onPress={() => Alert.alert(t('tipDriver'), `SAR ${amount} - ${t('thankYouSared')}`)}
            >
              <Text style={styles.shareBtnText}>SAR {amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => {}} style={{ paddingVertical: 8, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('noTip') || 'No tip'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: colors.primary, borderColor: colors.border }]}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
      >
        <Text style={styles.doneBtnText}>{t('done')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '700' },
  receiptCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  logoSection: { alignItems: 'center', marginBottom: 8 },
  logoName: { fontSize: 24, fontWeight: '800', letterSpacing: 2 },
  logoNameAr: { fontSize: 16 },
  divider: { height: 1, marginVertical: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  infoLabel: { flex: 1, fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '500' },
  totalDivider: { height: 1, marginVertical: 10, opacity: 0.3 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentLabel: { flex: 1, fontSize: 14 },
  paymentValue: { fontSize: 14, fontWeight: '600' },
  tearLine: { borderTopWidth: 2, borderStyle: 'dashed', marginVertical: 16, marginHorizontal: -24 },
  txId: { fontSize: 11, textAlign: 'center', letterSpacing: 1 },
  shareSection: { marginHorizontal: 16, marginTop: 20 },
  shareTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  shareRow: { flexDirection: 'row', gap: 10 },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 6 },
  shareBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  doneBtn: { marginHorizontal: 16, marginTop: 16, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
});
