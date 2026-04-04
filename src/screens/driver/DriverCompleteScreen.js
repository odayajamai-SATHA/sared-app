import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as theme } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';

export default function DriverCompleteScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();

  const handleDone = () => {
    navigation.navigate('DriverDashboard', { driver });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.topSection, { color: colors.text }]}>
        <View style={[styles.checkCircle, { color: colors.text }]}>
          <Ionicons name="checkmark-circle" size={64} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t('jobCompleted')}</Text>
        <Text style={styles.subtitle}>{t('jobCompletedSub')}</Text>
      </View>

      <View style={[styles.card, { color: colors.text }]}>
        <Text style={[styles.cardTitle, { color: colors.text }, isRTL && styles.textRight]}>
          {t('tripSummary')}
        </Text>

        <View style={[styles.summaryRow, { color: colors.text }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('customerLabel')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {ride?.users?.name || 'Mohammed'}
          </Text>
        </View>
        <View style={[styles.summaryRow, { color: colors.text }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('service')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{ride?.service_type || 'Tow'}</Text>
        </View>
        <View style={[styles.summaryRow, { color: colors.text }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('vehicleSize')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{ride?.sared_size || 'Medium'}</Text>
        </View>
        <View style={[styles.summaryRow, { color: colors.text }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('distance')}</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>3.2 {t('km')}</Text>
        </View>

        <View style={[styles.totalRow, { color: colors.text }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>{t('youEarned')}</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>{ride?.price || 180} SAR</Text>
        </View>
      </View>

      <View style={[styles.ratingCard, { color: colors.text }]}>
        <Ionicons name="star" size={24} color="#FBBF24" />
        <Text style={[styles.ratingTitle, { color: colors.text }]}>{t('waitingForRating')}</Text>
        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{t('ratingNotice')}</Text>
      </View>

      <View style={[styles.bottomActions, { color: colors.text }]}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={[styles.doneBtnText, { color: colors.text }]}>{t('backToDashboard')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: theme.white,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'transparent',
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
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  ratingCard: {
    backgroundColor: 'transparent',
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
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  doneBtn: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.white,
    fontSize: 18,
    fontWeight: '700',
  },
  textRight: {
    textAlign: 'right',
  },
});
