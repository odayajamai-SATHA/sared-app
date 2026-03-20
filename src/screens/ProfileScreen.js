import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share, Platform, ScrollView, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';
import { createDebouncedNav } from '../utils/navigation';
import { supabase } from '../utils/supabase';

export default function ProfileScreen({ navigation: rawNav }) {
  const navigation = createDebouncedNav(rawNav);
  const { t, isRTL, lang } = useI18n();
  const [stats, setStats] = useState({ trips: 0, rating: '--', vehicles: 0 });

  useEffect(() => {
    setStats({ trips: 0, rating: '--', vehicles: 0 });
  }, []);

  const comingSoonAlert = () => {
    Alert.alert(
      lang === 'ar' ? 'قريباً' : 'Coming Soon',
      t('featureComingSoon'),
      [{ text: t('confirm'), style: 'default' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      lang === 'ar' ? 'تسجيل الخروج' : 'Log Out',
      lang === 'ar' ? 'هل أنت متأكد أنك تريد تسجيل الخروج؟' : 'Are you sure you want to log out?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try { await supabase.auth.signOut(); } catch {}
            rawNav.replace('Login');
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    const message = 'Download Sared - Saudi tow truck app: https://sared.app';
    try {
      await Share.share(Platform.OS === 'ios' ? { message, url: 'https://sared.app' } : { message, title: 'Sared' });
    } catch {}
  };

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }
    if (item.action === 'terms') {
      Linking.openURL('https://sared.app/terms');
      return;
    }
    if (item.action === 'help') {
      Linking.openURL('mailto:support@sared.app');
      return;
    }
    comingSoonAlert();
  };

  const menuGroups = [
    {
      items: [
        { icon: 'car-sport-outline', label: t('myVehicles'), color: '#3B82F6', screen: 'Vehicles' },
        { icon: 'diamond-outline', label: t('membership'), color: '#8B5CF6', screen: 'Membership' },
        { icon: 'shield-checkmark-outline', label: t('insuranceBenefits'), color: '#22C55E', screen: 'Insurance' },
      ],
    },
    {
      items: [
        { icon: 'person-outline', label: t('editProfile'), color: colors.darkGray },
        { icon: 'card-outline', label: t('paymentMethods'), color: colors.darkGray },
        { icon: 'notifications-outline', label: t('notifications'), color: colors.darkGray },
        { icon: 'help-circle-outline', label: t('helpSupport'), color: colors.darkGray, action: 'help' },
        { icon: 'document-text-outline', label: t('termsConditions'), color: colors.darkGray, action: 'terms' },
        { icon: 'settings-outline', label: t('settings'), color: colors.darkGray, screen: 'Settings' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#022C22', '#065F46']} style={styles.headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ height: 56 }} />
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('profile')}</Text>

        <View style={[styles.profileCard, isRTL && styles.rowReverse]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#FFF" />
          </View>
          <View style={[styles.profileInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.name}>User</Text>
            <Text style={styles.phone}>+966 5X XXX XXXX</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={comingSoonAlert}>
            <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.trips}</Text>
            <Text style={styles.statLabel}>{t('rides')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.rating}</Text>
            <Text style={styles.statLabel}>{t('rating')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.vehicles}</Text>
            <Text style={styles.statLabel}>{t('saved')}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {menuGroups.map((group, gi) => (
          <View key={gi} style={styles.menuGroup}>
            {group.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, isRTL && styles.rowReverse, index === group.items.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, isRTL && styles.textRight]}>{item.label}</Text>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[styles.shareRow, isRTL && styles.rowReverse]} onPress={handleShare}>
          <View style={[styles.menuIcon, { backgroundColor: '#22C55E15' }]}>
            <Ionicons name="share-social-outline" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.shareText, isRTL && styles.textRight]}>{t('shareApp')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowReverse: { flexDirection: 'row-reverse' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(5,150,105,0.3)', justifyContent: 'center', alignItems: 'center',
    marginRight: 14, borderWidth: 2, borderColor: 'rgba(5,150,105,0.5)',
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
  statNumber: { fontSize: 20, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { padding: 16, marginTop: -12 },
  menuGroup: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.lightGray,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  shareRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12,
  },
  shareText: { flex: 1, fontSize: 15, color: '#22C55E', fontWeight: '600', marginLeft: 12 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutText: { fontSize: 16, color: '#EF4444', fontWeight: '600', marginLeft: 8 },
  textRight: { textAlign: 'right' },
});
