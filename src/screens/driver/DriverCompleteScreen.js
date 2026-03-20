import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';

export default function DriverCompleteScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();

  const handleDone = () => {
    navigation.navigate('DriverDashboard', { driver });
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.topSection}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark-circle" size={64} color={colors.white} />
        </View>
        <Text style={styles.title}>{t('jobCompleted')}</Text>
        <Text style={styles.subtitle}>{t('jobCompletedSub')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.textRight]}>
          {t('tripSummary')}
        </Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('customerLabel')}</Text>
          <Text style={styles.summaryValue}>
            {ride?.users?.name || 'Mohammed'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('service')}</Text>
          <Text style={styles.summaryValue}>{ride?.service_type || 'Tow'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('vehicleSize')}</Text>
          <Text style={styles.summaryValue}>{ride?.sared_size || 'Medium'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('distance')}</Text>
          <Text style={styles.summaryValue}>3.2 {t('km')}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('youEarned')}</Text>
          <Text style={styles.totalValue}>{ride?.price || 180} SAR</Text>
        </View>
      </View>

      <View style={styles.ratingCard}>
        <Ionicons name="star" size={24} color="#FBBF24" />
        <Text style={styles.ratingTitle}>{t('waitingForRating')}</Text>
        <Text style={styles.ratingText}>{t('ratingNotice')}</Text>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>{t('backToDashboard')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: undefined,
  },
  topSection: {
    backgroundColor: '#22C55E',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 44,
  },
  checkCircle: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  ratingCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
  },
  doneBtn: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  textRight: {
    textAlign: 'right',
  },
});
