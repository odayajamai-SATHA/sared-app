import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

const WHATSAPP_URL = 'https://wa.me/966554404434';
const PHONE_URL = 'tel:+966554404434';
const EMAIL_URL = 'mailto:support@sared.app';
const REPORT_URL = 'https://wa.me/966554404434?text=' + encodeURIComponent('مرحباً، أحتاج مساعدة بخصوص تطبيق سارد');

export default function HelpSupportScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('helpSupport')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Us */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight, { color: colors.text }]}>
          {t('contactUs')}
        </Text>
        <View style={[styles.contactRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#25D36615' }]}
            onPress={() => { try { Linking.openURL(WHATSAPP_URL); } catch {} }}>
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
            <Text style={[styles.contactLabel, { color: colors.text }]}>{t('whatsapp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#3B82F615' }]}
            onPress={() => { try { Linking.openURL(PHONE_URL); } catch {} }}>
            <Ionicons name="call" size={28} color="#3B82F6" />
            <Text style={[styles.contactLabel, { color: colors.text }]}>{t('callUs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#EF444415' }]}
            onPress={() => { try { Linking.openURL(EMAIL_URL); } catch {} }}>
            <Ionicons name="mail" size={28} color="#EF4444" />
            <Text style={[styles.contactLabel, { color: colors.text }]}>{t('emailUs')}</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight, { color: colors.text }]}>
          {t('faqTitle')}
        </Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity key={i} style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
            activeOpacity={0.7}>
            <View style={[styles.faqHeader, isRTL && styles.rowReverse]}>
              <Text style={[styles.faqQuestion, isRTL && styles.textRight, { flex: 1, color: colors.text }]}>{faq.q}</Text>
              <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gray} />
            </View>
            {expandedFaq === i && (
              <Text style={[styles.faqAnswer, isRTL && styles.textRight, { color: colors.textSecondary, borderTopColor: colors.border }]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Report Problem */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight, { color: colors.text }]}>
          {t('reportProblem')}
        </Text>
        <TouchableOpacity style={[styles.reportBtn, isRTL && styles.rowReverse]} onPress={() => { try { Linking.openURL(REPORT_URL); } catch {} }}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.reportBtnText}>
            {t('reportViaWhatsapp')}
          </Text>
        </TouchableOpacity>

        {/* Available 24/7 */}
        <View style={[styles.availableRow, isRTL && styles.rowReverse]}>
          <Ionicons name="time-outline" size={16} color={colors.gray} />
          <Text style={[styles.availableText, { color: colors.textSecondary }]}>
            {t('available247')}
          </Text>
        </View>

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
    borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 8,
  },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: {
    flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16,
  },
  contactLabel: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  faqCard: {
    borderRadius: 14, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600' },
  faqAnswer: {
    fontSize: 14, lineHeight: 22, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1,
  },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 16, marginBottom: 24,
  },
  reportBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  availableRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  availableText: { fontSize: 13 },
  textRight: { textAlign: 'right' },
});
