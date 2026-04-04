import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../../utils/colors';
import { useTheme } from '../../utils/theme';
import { useI18n } from '../../utils/i18n';
import { updateRideStatus } from '../../utils/supabase';

const STEPS = ['arrived', 'loading', 'in_transit', 'completed'];

export default function DriverJobScreen({ route, navigation }) {
  const { ride, driver } = route.params || {};
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0); // 0=Arrived, 1=Loading, 2=In Transit, 3=Completed

  const customerName = ride?.users?.name || t('user');
  const customerPhone = ride?.users?.phone || '';

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
      } catch {}
      navigation.navigate('DriverComplete', { ride, driver });
      return;
    }

    try {
      await updateRideStatus(ride?.id, STEPS[nextStep]);
    } catch {}
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
    try { Linking.openURL(`tel:${customerPhone}`); } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Header */}
      <View style={[styles.header, { color: colors.text }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('jobInProgress')}</Text>
        <Text style={styles.headerSub}>
          {ride?.sared_size} • {ride?.service_type}
        </Text>
      </View>

      {/* Progress Steps */}
      <View style={[styles.stepsContainer, { color: colors.text }]}>
        {stepLabels.map((label, index) => (
          <View key={index} style={[styles.stepWrapper, { color: colors.text }]}>
            <View style={[styles.stepRow, { color: colors.text }, isRTL && styles.rowReverse]}>
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
                  { color: colors.textSecondary },
                  index <= currentStep && [styles.stepLabelActive, { color: colors.text }],
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
      <View style={[styles.detailCard, { color: colors.text }]}>
        <View style={[styles.detailHeader, { color: colors.text }]}>
          <Ionicons
            name={stepIcons[currentStep]}
            size={32}
            color="#1E3A5F"
          />
          <Text style={[styles.detailTitle, { color: colors.text }]}>{stepLabels[currentStep]}</Text>
        </View>

        {currentStep === 0 && (
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{t('arrivedInstruction')}</Text>
        )}
        {currentStep === 1 && (
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{t('loadingInstruction')}</Text>
        )}
        {currentStep === 2 && (
          <View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{t('inTransitInstruction')}</Text>
            <View style={[styles.routeInfo, { color: colors.text }]}>
              <View style={[styles.routeRow, isRTL && styles.rowReverse]}>
                <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
                <Text style={[styles.routeText, { color: colors.text }]}>{t('pickupLocation')}</Text>
              </View>
              <View style={[styles.routeConnector, { color: colors.text }]} />
              <View style={[styles.routeRow, isRTL && styles.rowReverse]}>
                <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.routeText, { color: colors.text }]}>{t('dropoffLocation')}</Text>
              </View>
            </View>
          </View>
        )}
        {currentStep === 3 && (
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{t('completedInstruction')}</Text>
        )}
      </View>

      {/* Customer Info */}
      <View style={[styles.customerCard, isRTL && styles.rowReverse]}>
        <View style={[styles.customerAvatar, { color: colors.text }]}>
          <Ionicons name="person" size={22} color="#1E3A5F" />
        </View>
        <View style={[styles.customerInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.customerName, { color: colors.text }]}>{customerName}</Text>
          <Text style={[styles.customerPrice, { color: colors.primary }]}>{ride?.price} SAR</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#1E3A5F" />
        </TouchableOpacity>
      </View>

      {/* Action Button */}
      <View style={[styles.bottomActions, { color: colors.text }]}>
        <TouchableOpacity style={[styles.nextBtn, isRTL && styles.rowReverse]} onPress={handleNextStep}>
          <Text style={[styles.nextBtnText, { color: colors.text }]}>{getNextButtonLabel()}</Text>
          <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E3A5F',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.white,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  stepsContainer: {
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
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
    fontWeight: '500',
  },
  stepLabelActive: {
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginStart: 17,
    marginVertical: 4,
  },
  stepLineActive: {
    backgroundColor: '#22C55E',
  },
  detailCard: {
    backgroundColor: 'transparent',
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
  },
  detailText: {
    fontSize: 14,
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
    fontWeight: '500',
  },
  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginStart: 4,
    marginVertical: 4,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  },
  customerPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
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
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
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
    color: theme.white,
    fontSize: 18,
    fontWeight: '700',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});
