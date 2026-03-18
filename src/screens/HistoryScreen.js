import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

export default function HistoryScreen({ navigation }) {
  const { t, isRTL } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('rideHistory')}</Text>
      </View>
      <View style={styles.empty}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="time-outline" size={64} color={colors.border} />
        </View>
        <Text style={styles.emptyTitle}>{t('noTripsYet')}</Text>
        <Text style={styles.emptyText}>{t('tripsWillAppear')}</Text>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Services')}
          activeOpacity={0.8}
        >
          <Ionicons name="car-sport" size={18} color="#FFF" />
          <Text style={styles.bookBtnText}>{t('bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80, paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.darkGray, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, marginTop: 24,
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  textRight: { textAlign: 'right' },
});
