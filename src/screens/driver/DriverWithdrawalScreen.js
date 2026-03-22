import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Alert, Animated, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../utils/i18n';
import { useTheme } from '../../utils/theme';
import { supabase } from '../../utils/supabase';

const WITHDRAWAL_METHODS = [
  { id: 'bank', icon: 'business-outline', color: '#1E3A5F' },
  { id: 'stc_pay', icon: 'phone-portrait', color: '#5F259F' },
];

export default function DriverWithdrawalScreen({ route, navigation }) {
  const driver = route.params?.driver;
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [stcNumber, setStcNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }).start();
    fetchBalance();
    fetchWithdrawals();
  }, []);

  const fetchBalance = async () => {
    try {
      if (driver?.id && driver.id !== 'demo-driver') {
        const { data } = await supabase
          .from('rides')
          .select('price')
          .eq('driver_id', driver.id)
          .eq('status', 'completed');
        const total = (data || []).reduce((sum, r) => sum + (r.price || 0), 0);
        // Subtract already withdrawn
        const { data: wd } = await supabase
          .from('withdrawals')
          .select('amount')
          .eq('driver_id', driver.id)
          .in('status', ['pending', 'completed']);
        const withdrawn = (wd || []).reduce((sum, w) => sum + (w.amount || 0), 0);
        setBalance(Math.max(0, total - withdrawn));
      } else {
        // Demo balance
        setBalance(1250);
      }
    } catch {
      setBalance(1250);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      if (driver?.id && driver.id !== 'demo-driver') {
        const { data } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setWithdrawals(data);
      } else {
        setWithdrawals([
          { id: '1', amount: 500, status: 'completed', method: 'bank', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: '2', amount: 300, status: 'pending', method: 'stc_pay', created_at: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } catch {}
  };

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Alert.alert(t('error'), lang === 'ar' ? 'أدخل مبلغ صحيح' : 'Enter a valid amount');
      return;
    }
    if (num > balance) {
      Alert.alert(t('error'), lang === 'ar' ? 'المبلغ أكبر من الرصيد المتاح' : 'Amount exceeds available balance');
      return;
    }
    if (num < 50) {
      Alert.alert(t('error'), lang === 'ar' ? 'الحد الأدنى للسحب 50 ريال' : 'Minimum withdrawal is SAR 50');
      return;
    }
    if (!method) {
      Alert.alert(t('error'), lang === 'ar' ? 'اختر طريقة السحب' : 'Select a withdrawal method');
      return;
    }
    if (method === 'bank' && (!bankName.trim() || !iban.trim())) {
      Alert.alert(t('error'), lang === 'ar' ? 'أدخل بيانات البنك' : 'Enter bank details');
      return;
    }
    if (method === 'stc_pay' && !stcNumber.trim()) {
      Alert.alert(t('error'), lang === 'ar' ? 'أدخل رقم STC Pay' : 'Enter STC Pay number');
      return;
    }

    setLoading(true);
    try {
      const withdrawalData = {
        driver_id: driver?.id,
        amount: num,
        method,
        status: 'pending',
        bank_name: method === 'bank' ? bankName : null,
        iban: method === 'bank' ? iban : null,
        stc_number: method === 'stc_pay' ? stcNumber : null,
      };

      if (driver?.id && driver.id !== 'demo-driver') {
        const { error } = await supabase.from('withdrawals').insert(withdrawalData);
        if (error) throw error;
      }

      setBalance(prev => prev - num);
      setAmount('');
      setBankName('');
      setIban('');
      setStcNumber('');
      setMethod(null);
      fetchWithdrawals();

      Alert.alert(
        lang === 'ar' ? 'تم الطلب' : 'Request Submitted',
        lang === 'ar'
          ? `تم تقديم طلب سحب ${num} ريال. سيتم التحويل خلال 24-48 ساعة.`
          : `Withdrawal request for SAR ${num} submitted. Transfer within 24-48 hours.`
      );
    } catch (e) {
      Alert.alert(t('error'), e.message || t('connectionError'));
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { bg: colors.successFaded, color: colors.success, label: lang === 'ar' ? 'مكتمل' : 'Completed' };
      case 'pending': return { bg: colors.warningFaded, color: colors.warning, label: lang === 'ar' ? 'قيد المعالجة' : 'Pending' };
      case 'rejected': return { bg: colors.dangerFaded, color: colors.danger, label: lang === 'ar' ? 'مرفوض' : 'Rejected' };
      default: return { bg: colors.surfaceSecondary, color: colors.gray, label: status };
    }
  };

  const quickAmounts = [100, 250, 500];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, { backgroundColor: '#1E3A5F' }]}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lang === 'ar' ? 'سحب الأرباح' : 'Withdraw Earnings'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.balanceCard, { color: colors.text }]}>
          <Text style={styles.balanceLabel}>{lang === 'ar' ? 'الرصيد المتاح' : 'Available Balance'}</Text>
          <Text style={styles.balanceAmount}>{balance} SAR</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Amount input */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
              {lang === 'ar' ? 'مبلغ السحب' : 'Withdrawal Amount'}
            </Text>
            <View style={[styles.amountRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.sarLabel, { color: colors.textSecondary }]}>SAR</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.gray}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={[styles.quickRow, { color: colors.text }]}>
              {quickAmounts.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickChip, { backgroundColor: colors.primaryFaded, borderColor: amount === String(a) ? colors.primary : 'transparent', borderWidth: 1.5 }]}
                  onPress={() => setAmount(String(a))}
                >
                  <Text style={[styles.quickText, { color: colors.primary }]}>{a} SAR</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickChip, { backgroundColor: colors.primaryFaded, borderColor: colors.border }]}
                onPress={() => setAmount(String(balance))}
              >
                <Text style={[styles.quickText, { color: colors.primary }]}>{lang === 'ar' ? 'الكل' : 'All'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Withdrawal method */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
              {lang === 'ar' ? 'طريقة السحب' : 'Withdrawal Method'}
            </Text>
            {WITHDRAWAL_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.methodCard,
                  { backgroundColor: colors.surfaceSecondary, borderColor: method === m.id ? colors.primary : colors.cardBorder },
                  method === m.id && { borderWidth: 2 },
                ]}
                onPress={() => setMethod(m.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: m.color }]}>
                  <Ionicons name={m.icon} size={22} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodTitle, { color: colors.text }]}>
                    {m.id === 'bank' ? (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer') : 'STC Pay'}
                  </Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>
                    {m.id === 'bank'
                      ? (lang === 'ar' ? '24-48 ساعة عمل' : '24-48 business hours')
                      : (lang === 'ar' ? 'خلال ساعات' : 'Within hours')}
                  </Text>
                </View>
                {method === m.id && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}

            {/* Bank details */}
            {method === 'bank' && (
              <View style={[styles.detailsSection, { color: colors.text }]}>
                <TextInput
                  style={[styles.detailInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={lang === 'ar' ? 'اسم البنك' : 'Bank Name'}
                  placeholderTextColor={colors.gray}
                  value={bankName}
                  onChangeText={setBankName}
                />
                <TextInput
                  style={[styles.detailInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={lang === 'ar' ? 'رقم الآيبان (IBAN)' : 'IBAN Number'}
                  placeholderTextColor={colors.gray}
                  value={iban}
                  onChangeText={setIban}
                  autoCapitalize="characters"
                  maxLength={24}
                />
              </View>
            )}

            {/* STC Pay details */}
            {method === 'stc_pay' && (
              <View style={[styles.detailsSection, { color: colors.text }]}>
                <TextInput
                  style={[styles.detailInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder={lang === 'ar' ? 'رقم STC Pay' : 'STC Pay Number'}
                  placeholderTextColor={colors.gray}
                  value={stcNumber}
                  onChangeText={setStcNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            )}
          </View>

          {/* Withdraw button */}
          <TouchableOpacity
            style={[styles.withdrawBtn, (!amount || !method || loading) && { opacity: 0.5 }]}
            onPress={handleWithdraw}
            disabled={!amount || !method || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="wallet-outline" size={20} color="#FFF" />
                <Text style={styles.withdrawBtnText}>
                  {lang === 'ar' ? 'سحب الأرباح' : 'Withdraw Funds'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Recent withdrawals */}
          {withdrawals.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
                {lang === 'ar' ? 'عمليات السحب السابقة' : 'Recent Withdrawals'}
              </Text>
              {withdrawals.map((w) => {
                const badge = getStatusBadge(w.status);
                return (
                  <View key={w.id} style={[styles.withdrawalRow, { borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.withdrawalAmount, { color: colors.text }]}>SAR {w.amount}</Text>
                      <Text style={[styles.withdrawalDate, { color: colors.textSecondary }]}>
                        {new Date(w.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-SA', { month: 'short', day: 'numeric' })}
                        {' • '}{w.method === 'bank' ? (lang === 'ar' ? 'بنك' : 'Bank') : 'STC Pay'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Info note */}
          <View style={[styles.infoCard, { backgroundColor: colors.warningFaded, borderColor: colors.border }]}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {lang === 'ar'
                ? 'الحد الأدنى للسحب 50 ريال. التحويلات البنكية تتم خلال 24-48 ساعة عمل. STC Pay خلال ساعات.'
                : 'Minimum withdrawal SAR 50. Bank transfers within 24-48 business hours. STC Pay within hours.'}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  rowReverse: { flexDirection: 'row-reverse' },
  balanceCard: { alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: '#FFF', marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  card: { borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1 },
  sarLabel: { fontSize: 16, fontWeight: '600', marginEnd: 8 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '800', paddingVertical: 14 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  quickChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  quickText: { fontSize: 13, fontWeight: '600' },
  methodCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, gap: 12 },
  methodIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  methodTitle: { fontSize: 16, fontWeight: '700' },
  methodDesc: { fontSize: 12, marginTop: 2 },
  detailsSection: { marginTop: 12, gap: 10 },
  detailInput: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1 },
  withdrawBtn: {
    backgroundColor: '#1E3A5F', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  withdrawBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  withdrawalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  withdrawalAmount: { fontSize: 16, fontWeight: '700' },
  withdrawalDate: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  infoCard: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 14, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  textRight: { textAlign: 'right' },
});
