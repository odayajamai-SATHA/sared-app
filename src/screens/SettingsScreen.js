import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

export default function SettingsScreen({ navigation }) {
  const { t, isRTL, lang, toggleLang } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      lang === 'ar' ? 'حذف الحساب' : 'Delete Account',
      lang === 'ar' ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This action cannot be undone.',
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), style: 'destructive', onPress: () => Alert.alert(lang === 'ar' ? 'تم حذف الحساب' : 'Account deleted') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Language */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
              {lang === 'ar' ? 'اللغة' : 'Language'}
            </Text>
            <View style={styles.langRow}>
              <TouchableOpacity
                style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
                onPress={() => { if (lang !== 'en') toggleLang(); }}
              >
                <Ionicons name="globe-outline" size={22} color={lang === 'en' ? colors.primary : colors.gray} />
                <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
                {lang === 'en' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langOption, lang === 'ar' && styles.langOptionActive]}
                onPress={() => { if (lang !== 'ar') toggleLang(); }}
              >
                <Ionicons name="globe-outline" size={22} color={lang === 'ar' ? colors.primary : colors.gray} />
                <Text style={[styles.langText, lang === 'ar' && styles.langTextActive]}>العربية</Text>
                {lang === 'ar' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Dark Mode - Coming Soon */}
          <View style={styles.card}>
            <View style={styles.darkModeRow}>
              <Ionicons name="moon-outline" size={20} color={colors.gray} />
              <Text style={styles.darkModeText}>{t('darkModeComingSoon')}</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
              {lang === 'ar' ? 'حول التطبيق' : 'About'}
            </Text>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{lang === 'ar' ? 'الإصدار' : 'Version'}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{lang === 'ar' ? 'صنع في' : 'Made in'}</Text>
              <Text style={styles.aboutValue}>{lang === 'ar' ? 'الدمام، السعودية' : 'Dammam, Saudi Arabia'}</Text>
            </View>
            <View style={[styles.madeWith, { marginTop: 12 }]}>
              <Ionicons name="flag" size={20} color="#16A34A" />
              <Text style={styles.madeWithLabel}>
                {lang === 'ar' ? 'صنع بفخر في المملكة العربية السعودية' : 'Proudly made in Saudi Arabia'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.card}>
            <TouchableOpacity style={[styles.actionRow, isRTL && styles.rowReverse]} onPress={() => Linking.openURL('https://sared.app')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FBBF2415' }]}>
                <Ionicons name="star" size={20} color="#FBBF24" />
              </View>
              <Text style={[styles.actionText, isRTL && styles.textRight]}>
                {lang === 'ar' ? 'قيّم التطبيق' : 'Rate the App'}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Danger zone */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteText}>
              {lang === 'ar' ? 'حذف الحساب' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
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
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 },
  langRow: { gap: 10 },
  langOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    backgroundColor: colors.lightGray, borderWidth: 2, borderColor: 'transparent',
  },
  langOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  darkModeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.5 },
  darkModeText: { fontSize: 15, fontWeight: '600', color: colors.gray },
  langText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  langTextActive: { color: colors.primary },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.lightGray,
  },
  aboutLabel: { fontSize: 14, color: colors.textSecondary },
  aboutValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  madeWith: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  madeWithLabel: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
  },
  deleteText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  textRight: { textAlign: 'right' },
});
