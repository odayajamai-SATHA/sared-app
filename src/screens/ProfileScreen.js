import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Share, ScrollView, Alert, Linking, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { supabase } from '../utils/supabase';

export default function ProfileScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState({ trips: 0, rating: '--', vehicles: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
          // Try to fetch ride count
          const { count } = await supabase
            .from('rides')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('status', 'completed');
          setStats(prev => ({ ...prev, trips: count || 0 }));
        }
      } catch {}
    })();
  }, []);

  const showComingSoon = (feature) => {
    Alert.alert(
      t('comingSoon'),
      t('featureComingSoonDesc'),
      [{ text: t('confirm') }]
    );
  };

  const menuGroup1 = [
    { icon: 'car-sport-outline', label: t('myVehicles'), color: '#3B82F6', screen: 'Vehicles' },
    { icon: 'diamond-outline', label: t('membership'), color: '#8B5CF6', screen: 'Membership' },
    { icon: 'shield-checkmark-outline', label: t('insuranceBenefits'), color: '#22C55E', screen: 'Insurance' },
  ];

  const menuGroup2 = [
    { icon: 'person-outline', label: t('editProfile'), color: colors.darkGray, action: 'comingSoon' },
    { icon: 'card-outline', label: t('paymentMethods'), color: colors.darkGray, action: 'comingSoon' },
    { icon: 'notifications-outline', label: t('notifications'), color: colors.darkGray, action: 'comingSoon' },
    { icon: 'help-circle-outline', label: t('helpSupport'), color: colors.darkGray, screen: 'HelpSupport' },
    { icon: 'document-text-outline', label: t('termsConditions'), color: colors.darkGray, action: 'terms' },
    { icon: 'settings-outline', label: t('settings'), color: colors.darkGray, screen: 'Settings' },
  ];

  const allMenuGroups = [menuGroup1, menuGroup2];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#022C22', '#065F46']} style={styles.headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ height: 56 }} />
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('profile')}</Text>

        <View style={[styles.profileCard, isRTL && styles.rowReverse]}>
          <View style={[styles.avatar, { color: colors.text }]}>
            <Ionicons name="person" size={28} color="#FFF" />
          </View>
          <View style={[styles.profileInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.name}>{user?.user_metadata?.name || t('user')}</Text>
            <Text style={[styles.phone, { direction: 'ltr', writingDirection: 'ltr' }]}>{user?.phone || t('notSignedIn')}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
            onPress={showComingSoon}
          >
            <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <View style={[styles.statsRow, { color: colors.text }]}>
          <View style={[styles.statItem, { color: colors.text }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.trips}</Text>
            <Text style={styles.statLabel}>{t('rides')}</Text>
          </View>
          <View style={[styles.statDivider, { color: colors.text }]} />
          <View style={[styles.statItem, { color: colors.text }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.rating}</Text>
            <Text style={styles.statLabel}>{t('rating')}</Text>
          </View>
          <View style={[styles.statDivider, { color: colors.text }]} />
          <View style={[styles.statItem, { color: colors.text }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.vehicles}</Text>
            <Text style={styles.statLabel}>{t('saved')}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.content, { color: colors.text }]}>
        {allMenuGroups.map((group, gi) => (
          <View key={gi} style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {group.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.menuItem,
                  isRTL && styles.rowReverse,
                  i === group.length - 1 && { borderBottomWidth: 0 },
                  pressed && { backgroundColor: colors.surfaceSecondary },
                ]}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  } else if (item.action === 'terms') {
                    try { Linking.openURL('https://sared.app/terms'); } catch {}
                  } else if (item.action === 'help') {
                    try { Linking.openURL('https://wa.me/966554404434'); } catch {}
                  } else {
                    showComingSoon();
                  }
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }, isRTL && styles.textRight, { flex: 1 }]}>{item.label}</Text>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.shareRow, isRTL && styles.rowReverse, pressed && { backgroundColor: colors.surfaceSecondary }]}
          onPress={async () => {
            try {
              await Share.share({ message: t('shareMessage') + 'https://sared.app', title: t('appName') });
            } catch {}
          }}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#22C55E15' }]}>
            <Ionicons name="share-social-outline" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.shareText, isRTL && styles.textRight]}>{t('shareApp')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.6 }]}
          onPress={() => {
            Alert.alert(
              t('logOutTitle'),
              t('logOutMessage'),
              [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: t('confirm'),
                  style: 'destructive',
                  onPress: async () => {
                    try { await supabase.auth.signOut(); } catch {}
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </Pressable>
        <View style={{ height: 120 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowReverse: { flexDirection: 'row-reverse' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(5,150,105,0.3)', justifyContent: 'center', alignItems: 'center',
    marginEnd: 14, borderWidth: 2, borderColor: 'rgba(5,150,105,0.5)',
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#059669' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { padding: 16 },
  menuSection: {
    backgroundColor: 'transparent', borderRadius: 16, marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'transparent',
    cursor: 'pointer',
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginEnd: 12,
  },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  shareRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12,
    cursor: 'pointer',
  },
  shareText: { flex: 1, fontSize: 15, color: '#22C55E', fontWeight: '600', marginStart: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, cursor: 'pointer',
  },
  logoutText: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginStart: 8 },
  textRight: { textAlign: 'right' },
});
