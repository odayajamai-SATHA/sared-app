import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';

export default function DriverProfileScreen({ route, navigation }) {
  const driver = route.params?.driver;
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();

  const menuItems = [
    { icon: 'car-outline', label: t('vehicleInfo') },
    { icon: 'document-text-outline', label: t('documents') },
    { icon: 'card-outline', label: t('bankDetails') },
    { icon: 'notifications-outline', label: t('notifications') },
    { icon: 'help-circle-outline', label: t('helpSupport') },
    { icon: 'document-text-outline', label: t('termsConditions') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, { color: colors.text }]}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('driverProfile')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={[styles.profileCard, isRTL && styles.rowReverse]}>
        <View style={[styles.avatar, { color: colors.text }]}>
          <Ionicons name="person" size={32} color="#1E3A5F" />
        </View>
        <View style={[styles.profileInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.name, { color: colors.text }]}>{driver?.name || t('driverName')}</Text>
          <Text style={[styles.phone, { color: colors.textSecondary, direction: 'ltr', writingDirection: 'ltr' }]}>{driver?.phone || '+966 5X XXX XXXX'}</Text>
          <Text style={[styles.plate, { color: colors.text }]}>{driver?.plate_number || 'ABC 1234'}</Text>
        </View>
      </View>

      <View style={[styles.statsRow, { color: colors.text }]}>
        <View style={[styles.statItem, { color: colors.text }]}>
          <Ionicons name="star" size={18} color="#FBBF24" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{driver?.rating || '4.8'}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('rating')}</Text>
        </View>
        <View style={[styles.statDivider, { color: colors.text }]} />
        <View style={[styles.statItem, { color: colors.text }]}>
          <Ionicons name="car-sport" size={18} color="#1E3A5F" />
          <Text style={[styles.statNumber, { color: colors.text }]}>156</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalTrips')}</Text>
        </View>
        <View style={[styles.statDivider, { color: colors.text }]} />
        <View style={[styles.statItem, { color: colors.text }]}>
          <Ionicons name="time" size={18} color="#1E3A5F" />
          <Text style={[styles.statNumber, { color: colors.text }]}>3m</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('memberSince')}</Text>
        </View>
      </View>

      <View style={[styles.menu, { color: colors.text }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.menuItem, isRTL && styles.rowReverse]}
            onPress={() => Alert.alert(item.label, t('featureComingSoon'))}>
            <Ionicons name={item.icon} size={22} color={colors.darkGray} />
            <Text style={[styles.menuLabel, isRTL && styles.textRight]}>{item.label}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { color: colors.text }]}
        onPress={() => navigation.replace('DriverLogin')}
      >
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>{t('logOut')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.white,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 14,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  plate: {
    fontSize: 13,
    color: '#1E3A5F',
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  menu: {
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginStart: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginStart: 8,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
});
