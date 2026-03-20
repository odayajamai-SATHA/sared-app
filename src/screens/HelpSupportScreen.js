import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const WHATSAPP_URL = 'https://wa.me/966554404434';
const PHONE_URL = 'tel:+966554404434';
const EMAIL_URL = 'mailto:support@sared.app';
const REPORT_URL = 'https://wa.me/966554404434?text=' + encodeURIComponent('مرحباً، أحتاج مساعدة بخصوص تطبيق سارد');

export default function HelpSupportScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: lang === 'ar' ? 'كيف أطلب سطحة؟' : 'How do I request a tow?',
      a: lang === 'ar'
        ? 'افتح التطبيق، اختر الخدمة، اختر حجم المركبة، أكد السعر، واختر طريقة الدفع. سيتم ربطك بسائق خلال دقائق.'
        : 'Open the app, select your service, choose vehicle size, confirm the price, and pick your payment method. A driver will be matched to you within minutes.',
    },
    {
      q: lang === 'ar' ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods do you accept?',
      a: lang === 'ar'
        ? 'نقبل STC Pay، نقد، ودفع بالبطاقة (مدى/فيزا) قريباً.'
        : 'We accept STC Pay, Cash, and card payments (Mada/Visa) coming soon.',
    },
    {
      q: lang === 'ar' ? 'كيف يتم حساب السعر؟' : 'How is the price calculated?',
      a: lang === 'ar'
        ? 'الأسعار تعتمد على المسافة، حجم المركبة، والوقت. جميع الأسعار شاملة ضريبة القيمة المضافة 15%. ترى السعر المضمون قبل التأكيد.'
        : 'Prices are based on distance, vehicle size, and time of day. All prices include 15% VAT. You see the guaranteed maximum price before confirming.',
    },
    {
      q: lang === 'ar' ? 'هل أقدر ألغي الطلب؟' : 'Can I cancel a request?',
      a: lang === 'ar'
        ? 'نعم، تقدر تلغي مجاناً قبل إرسال السائق. بعد الإرسال، قد تطبق رسوم إلغاء 15 ريال.'
        : 'Yes, you can cancel for free before a driver is dispatched. After dispatch, a SAR 15 cancellation fee may apply.',
    },
    {
      q: lang === 'ar' ? 'هل سيارتي مؤمنة أثناء النقل؟' : 'Is my car insured during transport?',
      a: lang === 'ar'
        ? 'جميع سائقي سارد لديهم تأمين مسؤولية. تحقق من تغطية تأمينك من خلال شاشة التأمين.'
        : 'All Sared drivers carry liability insurance. Check your own insurance coverage through our Insurance screen.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpSupport')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Us */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
        </Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#25D36615' }]}
            onPress={() => Linking.openURL(WHATSAPP_URL)}>
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
            <Text style={styles.contactLabel}>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#3B82F615' }]}
            onPress={() => Linking.openURL(PHONE_URL)}>
            <Ionicons name="call" size={28} color="#3B82F6" />
            <Text style={styles.contactLabel}>{lang === 'ar' ? 'اتصال' : 'Call'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#EF444415' }]}
            onPress={() => Linking.openURL(EMAIL_URL)}>
            <Ionicons name="mail" size={28} color="#EF4444" />
            <Text style={styles.contactLabel}>{lang === 'ar' ? 'بريد' : 'Email'}</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
        </Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity key={i} style={styles.faqCard}
            onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
            activeOpacity={0.7}>
            <View style={[styles.faqHeader, isRTL && styles.rowReverse]}>
              <Text style={[styles.faqQuestion, isRTL && styles.textRight, { flex: 1 }]}>{faq.q}</Text>
              <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gray} />
            </View>
            {expandedFaq === i && (
              <Text style={[styles.faqAnswer, isRTL && styles.textRight]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Report Problem */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {lang === 'ar' ? 'الإبلاغ عن مشكلة' : 'Report a Problem'}
        </Text>
        <TouchableOpacity style={styles.reportBtn} onPress={() => Linking.openURL(REPORT_URL)}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.reportBtnText}>
            {lang === 'ar' ? 'أبلغ عبر واتساب' : 'Report via WhatsApp'}
          </Text>
        </TouchableOpacity>

        {/* Available 24/7 */}
        <View style={styles.availableRow}>
          <Ionicons name="time-outline" size={16} color={colors.gray} />
          <Text style={styles.availableText}>
            {lang === 'ar' ? 'متاح على مدار الساعة' : 'Available 24/7'}
          </Text>
        </View>

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
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12, marginTop: 8,
  },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: {
    flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16,
    backgroundColor: '#FFF',
  },
  contactLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 8 },
  faqCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: colors.text },
  faqAnswer: {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.lightGray,
  },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 16, marginBottom: 24,
  },
  reportBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  availableRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  availableText: { fontSize: 13, color: colors.gray },
  textRight: { textAlign: 'right' },
});
