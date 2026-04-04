import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Animated, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../utils/i18n';
import { useTheme } from '../utils/theme';
import { supabase } from '../utils/supabase';

export default function SettingsScreen({ navigation }) {
  const { t, isRTL, lang, toggleLang } = useI18n();
  const { colors, isDark, mode, setTheme, toggleDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try { await supabase.auth.signOut(); } catch {}
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Language */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
              {t('language')}
            </Text>
            <View style={[styles.langRow, { color: colors.text }]}>
              <TouchableOpacity
                style={[styles.langOption, isRTL && styles.rowReverse, { backgroundColor: colors.surfaceSecondary, borderColor: lang === 'en' ? colors.primary : 'transparent' }]}
                onPress={() => { if (lang !== 'en') toggleLang(); }}
              >
                <Ionicons name="globe-outline" size={22} color={lang === 'en' ? colors.primary : colors.gray} />
                <Text style={[styles.langText, { color: lang === 'en' ? colors.primary : colors.text }]}>English</Text>
                {lang === 'en' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langOption, isRTL && styles.rowReverse, { backgroundColor: colors.surfaceSecondary, borderColor: lang === 'ar' ? colors.primary : 'transparent' }]}
                onPress={() => { if (lang !== 'ar') toggleLang(); }}
              >
                <Ionicons name="globe-outline" size={22} color={lang === 'ar' ? colors.primary : colors.gray} />
                <Text style={[styles.langText, { color: lang === 'ar' ? colors.primary : colors.text }]}>العربية</Text>
                {lang === 'ar' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Dark Mode - FUNCTIONAL */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
              {t('appearance')}
            </Text>
            {[
              { id: 'light', icon: 'sunny', label: t('lightTheme') },
              { id: 'dark', icon: 'moon', label: t('darkTheme') },
              { id: 'system', icon: 'phone-portrait-outline', label: t('systemTheme') },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.themeOption,
                  isRTL && styles.rowReverse,
                  { backgroundColor: colors.surfaceSecondary, borderColor: mode === opt.id ? colors.primary : 'transparent' },
                ]}
                onPress={() => setTheme(opt.id)}
              >
                <Ionicons name={opt.icon} size={20} color={mode === opt.id ? colors.primary : colors.gray} />
                <Text style={[styles.themeText, { color: mode === opt.id ? colors.primary : colors.text }]}>{opt.label}</Text>
                {mode === opt.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* About */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }, isRTL && styles.textRight]}>
              {t('aboutApp')}
            </Text>
            <View style={[styles.aboutRow, isRTL && styles.rowReverse, { borderBottomColor: colors.border }]}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('version')}</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, isRTL && styles.rowReverse, { borderBottomColor: colors.border }]}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>{t('madeInSaudi')}</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>{t('madeInCity')}</Text>
            </View>
            <View style={[styles.madeWith, isRTL && styles.rowReverse, { backgroundColor: colors.successFaded, borderColor: colors.border }]}>
              <Ionicons name="flag" size={20} color={colors.success} />
              <Text style={[styles.madeWithLabel, { color: colors.success }]}>
                {t('proudlyMade')}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity style={[styles.actionRow, isRTL && styles.rowReverse]} onPress={() => { try { Linking.openURL('https://sared.app'); } catch {} }}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warningFaded, borderColor: colors.border }]}>
                <Ionicons name="star" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }, isRTL && styles.textRight]}>
                {t('rateApp')}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

            <TouchableOpacity style={[styles.actionRow, isRTL && styles.rowReverse]} onPress={() => { try { Linking.openURL('https://sared.app/privacy'); } catch {} }}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryFaded, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }, isRTL && styles.textRight]}>
                {t('privacyPolicy')}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

            <TouchableOpacity style={[styles.actionRow, isRTL && styles.rowReverse]} onPress={() => { try { Linking.openURL('https://sared.app/terms'); } catch {} }}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }, isRTL && styles.textRight]}>
                {t('termsOfService')}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Danger zone */}
          <TouchableOpacity style={[styles.deleteBtn, isRTL && styles.rowReverse, { backgroundColor: colors.dangerFaded, borderColor: colors.dangerBorder }]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.deleteText, { color: colors.danger }]}>
              {t('deleteAccount')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  rowReverse: { flexDirection: 'row-reverse' },
  scrollContent: { padding: 16 },
  card: { borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  langRow: { gap: 10 },
  langOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2,
  },
  langText: { flex: 1, fontSize: 16, fontWeight: '600' },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14,
    borderWidth: 2, marginBottom: 8,
  },
  themeText: { flex: 1, fontSize: 15, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: '600' },
  madeWith: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12,
  },
  madeWithLabel: { fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1, fontSize: 15, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14, borderWidth: 1,
  },
  deleteText: { fontSize: 15, fontWeight: '600' },
  textRight: { textAlign: 'right' },
});
