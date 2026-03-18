import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

export default function ReceiptScreen({ route, navigation }) {
  const { service, size, price } = route.params;
  const { t, isRTL } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit' });

  // Parse price (e.g. "SAR 230" -> 230)
  const totalNum = parseInt((price || '').replace(/\D/g, '')) || 200;
  const baseFare = Math.round(totalNum * 0.6);
  const distFee = Math.round(totalNum * 0.2);
  const serviceFee = 15;
  const subtotal = baseFare + distFee + serviceFee;
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;

  const handleShareWhatsapp = async () => {
    const msg = `${t('tripReceipt')}\n${t('service')}: ${service}\n${t('totalPrice')}: SAR ${total}\n${t('tripDate')}: ${dateStr}\n\nSared App`;
    try {
      await Share.share({ message: msg });
    } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{t('receipt')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.receiptCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          <Text style={styles.logoName}>Sared</Text>
          <Text style={styles.logoNameAr}>سارد</Text>
        </View>

        <View style={styles.divider} />

        {/* Trip info */}
        <Text style={styles.sectionTitle}>{t('tripReceipt')}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>{t('tripDate')}</Text>
          <Text style={styles.infoValue}>{dateStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>{t('tripTime')}</Text>
          <Text style={styles.infoValue}>{timeStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="locate-outline" size={16} color="#22C55E" />
          <Text style={styles.infoLabel}>{t('pickup')}</Text>
          <Text style={styles.infoValue}>King Fahd Rd, Riyadh</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#EF4444" />
          <Text style={styles.infoLabel}>{t('dropoff')}</Text>
          <Text style={styles.infoValue}>Olaya St, Riyadh</Text>
        </View>

        <View style={styles.divider} />

        {/* Price breakdown */}
        <Text style={styles.sectionTitle}>{t('priceBreakdown')}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('baseFare')}</Text>
          <Text style={styles.priceValue}>SAR {baseFare}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('distance')}</Text>
          <Text style={styles.priceValue}>SAR {distFee}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('serviceFee')}</Text>
          <Text style={styles.priceValue}>SAR {serviceFee}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('vat')}</Text>
          <Text style={styles.priceValue}>SAR {vat}</Text>
        </View>

        <View style={styles.totalDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>{t('totalPrice')}</Text>
          <Text style={styles.totalValue}>SAR {total}</Text>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.paymentRow}>
          <Ionicons name="cash-outline" size={20} color="#22C55E" />
          <Text style={styles.paymentLabel}>{t('paymentMethod')}</Text>
          <Text style={styles.paymentValue}>{t('cashPayment')}</Text>
        </View>

        {/* Dashed border (receipt tear) */}
        <View style={styles.tearLine} />

        {/* Transaction ID */}
        <Text style={styles.txId}>TXN-{Date.now().toString().slice(-8)}</Text>
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <Text style={styles.actionBtnText}>{t('downloadPdf')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnFilled]} onPress={handleShareWhatsapp}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.actionBtnTextFilled}>{t('shareWhatsapp')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.doneBtnText}>{t('done')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FFF',
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  receiptCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 20,
    padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  logoSection: { alignItems: 'center', marginBottom: 8 },
  logoName: { fontSize: 24, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  logoNameAr: { fontSize: 16, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  infoLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14, color: colors.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  totalDivider: { height: 1, backgroundColor: colors.primary, marginVertical: 10, opacity: 0.3 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  paymentValue: { fontSize: 14, fontWeight: '600', color: '#22C55E' },
  tearLine: {
    borderTopWidth: 2, borderTopColor: colors.border, borderStyle: 'dashed',
    marginVertical: 16, marginHorizontal: -24,
  },
  txId: { fontSize: 11, color: colors.gray, textAlign: 'center', letterSpacing: 1 },
  actionsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, gap: 8,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  actionBtnFilled: { backgroundColor: '#25D366', borderColor: '#25D366' },
  actionBtnTextFilled: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  doneBtn: {
    marginHorizontal: 16, marginTop: 12, paddingVertical: 16, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
