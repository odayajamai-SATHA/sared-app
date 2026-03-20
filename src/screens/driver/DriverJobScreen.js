import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { updateRideStatus } from '../../utils/supabase';

const STEPS = ['arrived', 'loading', 'in_transit', 'completed'];

export default function DriverJobScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors: C, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0); // 0=Arrived, 1=Loading, 2=In Transit, 3=Completed

  const customerName = ride?.users?.name || 'Mohammed';
  const customerPhone = ride?.users?.phone || '+966512345678';

  const stepLabels = [
    t('stepArrived'),
    t('stepLoading'),
    t('stepInTransit'),
    t('stepCompleted'),
  ];

  const stepIcons = ['flag', 'cube', 'car-sport', 'checkmark-circle'];

  const handleNextStep = async () => {
    const nextStep = currentStep + 1;

    if (nextStep >= STEPS.length) {
      // Job complete
      try {
        await updateRideStatus(ride?.id, 'completed');
      } catch { /* silent */ }
      navigation.navigate('DriverComplete', { ride, driver });
      return;
    }

    try {
      await updateRideStatus(ride?.id, STEPS[nextStep]);
    } catch { /* silent */ }
    setCurrentStep(nextStep);
  };

  const getNextButtonLabel = () => {
    switch (currentStep) {
      case 0:
        return t('startLoading');
      case 1:
        return t('startTrip');
      case 2:
        return t('completeJob');
      default:
        return t('done');
    }
  };

  const handleCall = () => {
    try { Linking.openURL(`tel:${customerPhone}`); } catch { /* silent */ }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('jobInProgress')}</Text>
        <Text style={styles.headerSub}>
          {ride?.sared_size} • {ride?.service_type}
        </Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {stepLabels.map((label, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepCircle,
                  index <= currentStep && styles.stepCircleActive,
                  index < currentStep && styles.stepCircleDone,
                ]}
              >
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                ) : (
                  <Ionicons
                    name={stepIcons[index]}
                    size={18}
                    color={index <= currentStep ? colors.white : colors.gray}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  index <= currentStep && styles.stepLabelActive,
                ]}
              >
                {label}
              </Text>
            </View>
            {index < stepLabels.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Current Step Detail */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Ionicons
            name={stepIcons[currentStep]}
            size={32}
            color="#1E3A5F"
          />
          <Text style={styles.detailTitle}>{stepLabels[currentStep]}</Text>
        </View>

        {currentStep === 0 && (
          <Text style={styles.detailText}>{t('arrivedInstruction')}</Text>
        )}
        {currentStep === 1 && (
          <Text style={styles.detailText}>{t('loadingInstruction')}</Text>
        )}
        {currentStep === 2 && (
          <View>
            <Text style={styles.detailText}>{t('inTransitInstruction')}</Text>
            <View style={styles.routeInfo}>
              <View style={[styles.routeRow, isRTL && styles.rowReverse]}>
                <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.routeText}>{t('pickupLocation')}</Text>
              </View>
              <View style={styles.routeConnector} />
              <View style={[styles.routeRow, isRTL && styles.rowReverse]}>
                <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.routeText}>{t('dropoffLocation')}</Text>
              </View>
            </View>
          </View>
        )}
        {currentStep === 3 && (
          <Text style={styles.detailText}>{t('completedInstruction')}</Text>
        )}
      </View>

      {/* Customer Info */}
      <View style={[styles.customerCard, isRTL && styles.rowReverse]}>
        <View style={styles.customerAvatar}>
          <Ionicons name="person" size={22} color="#1E3A5F" />
        </View>
        <View style={[styles.customerInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerPrice}>{ride?.price} SAR</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#1E3A5F" />
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
          <Text style={styles.nextBtnText}>{getNextButtonLabel()}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
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
  header: {
    backgroundColor: '#1E3A5F',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  stepsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stepWrapper: {
    marginBottom: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepCircleActive: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  stepCircleDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  stepLabel: {
    fontSize: 15,
    color: colors.gray,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginStart: 17,
    marginVertical: 4,
  },
  stepLineActive: {
    backgroundColor: '#22C55E',
  },
  detailCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  routeInfo: {
    marginTop: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginStart: 4,
    marginVertical: 4,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  customerPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextBtn: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});
