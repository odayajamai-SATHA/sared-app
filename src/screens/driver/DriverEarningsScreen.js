import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useI18n } from '../../utils/i18n';

export default function DriverEarningsScreen({ route, navigation }) {
  const driver = route.params?.driver;
  const { t, isRTL, lang } = useI18n();

  const recentJobs = [
    { id: 1, customer: 'Mohammed', service: 'Tow', amount: 180, time: '2:30 PM' },
    { id: 2, customer: 'Abdullah', service: 'Transport', amount: 120, time: '11:15 AM' },
    { id: 3, customer: 'Fahad', service: 'Emergency', amount: 250, time: '9:00 AM' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('driverEarnings')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.earningsTotal}>
          <Text style={styles.earningsLabel}>{t('todayEarnings')}</Text>
          <Text style={styles.earningsAmount}>450 SAR</Text>
        </View>

        <View style={styles.earningsStats}>
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>12</Text>
            <Text style={styles.earningStatLabel}>{t('tripsCompleted')}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>6.2h</Text>
            <Text style={styles.earningStatLabel}>{t('onlineHours')}</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>37.5</Text>
            <Text style={styles.earningStatLabel}>SAR/{t('tripAvg')}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Withdraw button */}
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => navigation.navigate('DriverWithdrawal', { driver })}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={20} color="#FFF" />
          <Text style={styles.withdrawBtnText}>{lang === 'ar' ? 'سحب الأرباح' : 'Withdraw Earnings'}</Text>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {t('recentTrips')}
        </Text>

        {recentJobs.map((job) => (
          <View key={job.id} style={[styles.jobCard, isRTL && styles.rowReverse]}>
            <View style={styles.jobIcon}>
              <Ionicons name="car-sport" size={20} color="#1E3A5F" />
            </View>
            <View style={[styles.jobInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={styles.jobCustomer}>{job.customer}</Text>
              <Text style={styles.jobService}>
                {job.service} • {job.time}
              </Text>
            </View>
            <Text style={styles.jobAmount}>+{job.amount} SAR</Text>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    color: colors.white,
  },
  earningsTotal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 4,
  },
  earningsStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14,
  },
  earningStat: {
    flex: 1,
    alignItems: 'center',
  },
  earningStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  earningStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  earningDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobCustomer: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  jobService: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  jobAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  withdrawBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  withdrawBtnText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
