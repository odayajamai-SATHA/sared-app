import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useI18n } from '../../utils/i18n';
import {
  updateDriverStatus,
  subscribeToNewRides,
  acceptRide,
} from '../../utils/supabase';
import { notifyCustomerDriverAccepted } from '../../utils/notifications';

export default function DriverDashboardScreen({ route, navigation }) {
  const driver = route.params?.driver;
  const { t, isRTL } = useI18n();

  const [isOnline, setIsOnline] = useState(driver?.is_online || false);
  const [earnings, setEarnings] = useState(450);
  const [totalRides, setTotalRides] = useState(12);
  const [incomingRide, setIncomingRide] = useState(null);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for online status
  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  // Subscribe to new rides when online
  useEffect(() => {
    if (!isOnline) return;

    const channel = subscribeToNewRides((ride) => {
      setIncomingRide(ride);
      setTimer(30);
    });

    return () => {
      channel?.unsubscribe();
    };
  }, [isOnline]);

  // Timer countdown for incoming ride
  useEffect(() => {
    if (incomingRide && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (timer === 0 && incomingRide) {
      handleDecline();
    }
  }, [incomingRide, timer]);

  // Simulate incoming ride for demo
  useEffect(() => {
    if (isOnline && !incomingRide) {
      const demoTimeout = setTimeout(() => {
        setIncomingRide({
          id: 'demo-ride-1',
          service_type: 'tow',
          sared_size: 'Medium',
          pickup_lat: 24.7136,
          pickup_lng: 46.6753,
          dropoff_lat: 24.7236,
          dropoff_lng: 46.6853,
          price: 180,
          users: { name: 'Mohammed', phone: '+966512345678' },
        });
        setTimer(30);
      }, 3000);
      return () => clearTimeout(demoTimeout);
    }
  }, [isOnline]);

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await updateDriverStatus(driver?.id, newStatus);
    } catch {}
  };

  const handleAccept = async () => {
    if (!incomingRide) return;
    clearTimeout(timerRef.current);
    try {
      await acceptRide(incomingRide.id, driver?.id);
    } catch {}

    // Notify the customer that their driver is on the way
    const customerToken = incomingRide.users?.push_token;
    if (customerToken) {
      notifyCustomerDriverAccepted(customerToken, {
        name: driver?.name || 'Ahmed',
        plate: driver?.plate_number || 'ABC 1234',
        rating: driver?.rating || '4.8',
        eta: 15,
      });
    }

    navigation.navigate('DriverNavigation', {
      ride: incomingRide,
      driver,
    });
    setIncomingRide(null);
  };

  const handleDecline = () => {
    clearTimeout(timerRef.current);
    setIncomingRide(null);
    setTimer(30);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerRow, isRTL && styles.rowReverse]}>
          <View>
            <Text style={[styles.greeting, isRTL && styles.textRight]}>
              {t('helloDriver')} {driver?.name || t('driverName')}
            </Text>
            <Text style={[styles.plateText, isRTL && styles.textRight]}>
              {driver?.plate_number || 'ABC 1234'}
            </Text>
          </View>
          <View style={[styles.ratingBadge, isRTL && styles.rowReverse]}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{driver?.rating || '4.8'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Online/Offline Toggle */}
        <View style={styles.toggleSection}>
          <Animated.View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#22C55E' : colors.gray },
              { transform: [{ scale: isOnline ? pulseAnim : 1 }] },
            ]}
          />
          <Text style={styles.statusLabel}>
            {isOnline ? t('youAreOnline') : t('youAreOffline')}
          </Text>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              isOnline ? styles.toggleBtnOnline : styles.toggleBtnOffline,
            ]}
            onPress={toggleOnline}
          >
            <Ionicons
              name={isOnline ? 'power' : 'power-outline'}
              size={24}
              color={isOnline ? '#22C55E' : colors.gray}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: isOnline ? '#22C55E' : colors.gray },
              ]}
            >
              {isOnline ? t('goOffline') : t('goOnline')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={28} color={colors.primary} />
            <Text style={styles.statValue}>{earnings} SAR</Text>
            <Text style={styles.statLabel}>{t('todayEarnings')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="car-sport-outline" size={28} color={colors.primary} />
            <Text style={styles.statValue}>{totalRides}</Text>
            <Text style={styles.statLabel}>{t('totalRidesToday')}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatItem, isRTL && styles.rowReverse]}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.quickStatText}>{t('avgResponseTime')}: 2.3 {t('min')}</Text>
          </View>
          <View style={[styles.quickStatItem, isRTL && styles.rowReverse]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#22C55E" />
            <Text style={styles.quickStatText}>{t('acceptanceRate')}: 94%</Text>
          </View>
        </View>
      </ScrollView>

      {/* Incoming Ride Request Overlay */}
      {incomingRide && (
        <View style={styles.requestOverlay}>
          <View style={styles.requestCard}>
            {/* Timer Circle */}
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{timer}</Text>
              <Text style={styles.timerLabel}>{t('seconds')}</Text>
            </View>

            <Text style={styles.requestTitle}>{t('newRideRequest')}</Text>

            {/* Ride Details */}
            <View style={styles.requestDetails}>
              <View style={[styles.requestRow, isRTL && styles.rowReverse]}>
                <Ionicons name="person" size={18} color={colors.primary} />
                <Text style={styles.requestText}>
                  {incomingRide.users?.name || 'Mohammed'}
                </Text>
              </View>
              <View style={[styles.requestRow, isRTL && styles.rowReverse]}>
                <Ionicons name="car-sport" size={18} color={colors.primary} />
                <Text style={styles.requestText}>
                  {incomingRide.sared_size} • {incomingRide.service_type}
                </Text>
              </View>
              <View style={[styles.requestRow, isRTL && styles.rowReverse]}>
                <Ionicons name="cash" size={18} color={colors.primary} />
                <Text style={styles.requestText}>
                  {incomingRide.price} SAR
                </Text>
              </View>
              <View style={[styles.requestRow, isRTL && styles.rowReverse]}>
                <Ionicons name="navigate" size={18} color={colors.primary} />
                <Text style={styles.requestText}>3.2 {t('km')} {t('away')}</Text>
              </View>
            </View>

            {/* Accept / Decline */}
            <View style={styles.requestButtons}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                <Ionicons name="close" size={24} color="#EF4444" />
                <Text style={styles.declineBtnText}>{t('decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Ionicons name="checkmark" size={24} color={colors.white} />
                <Text style={styles.acceptBtnText}>{t('accept')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color={colors.primary} />
          <Text style={[styles.navLabel, { color: colors.primary }]}>{t('home')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('DriverEarnings', { driver })}
        >
          <Ionicons name="wallet-outline" size={22} color={colors.gray} />
          <Text style={styles.navLabel}>{t('driverEarnings')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('DriverProfile', { driver })}
        >
          <Ionicons name="person-outline" size={22} color={colors.gray} />
          <Text style={styles.navLabel}>{t('profile')}</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  plateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  toggleSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  toggleBtnOnline: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#22C55E',
  },
  toggleBtnOffline: {
    backgroundColor: colors.lightGray,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  toggleBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  quickStats: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  quickStatText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Incoming ride overlay
  requestOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  timerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  requestDetails: {
    width: '100%',
    marginBottom: 20,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  requestText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: 6,
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    gap: 6,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  // Bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 4,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
});
