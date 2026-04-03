import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

export default function DriverMatchingScreen({ route, navigation }) {
  const { t, isRTL } = useI18n();
  const params = route.params || {};
  const [statusIndex, setStatusIndex] = useState(0);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const truckScale = useRef(new Animated.Value(0.5)).current;
  const truckOpacity = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const statuses = [t('matchingNearest'), t('checkingAvail'), t('driverFound')];

  useEffect(() => {
    // Truck entrance
    Animated.parallel([
      Animated.spring(truckScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(truckOpacity, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    // Pulsing rings
    const createPulse = (anim, delay) => {
      return Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: Platform.OS !== 'web' }),
      ]));
    };
    createPulse(pulse1, 0).start();
    createPulse(pulse2, 500).start();
    createPulse(pulse3, 1000).start();

    // Dot animation
    Animated.loop(Animated.timing(dotAnim, { toValue: 3, duration: 1200, useNativeDriver: false })).start();

    // Status cycling
    const t1 = setTimeout(() => setStatusIndex(1), 1500);
    const t2 = setTimeout(() => {
      setStatusIndex(2);
      Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: Platform.OS !== 'web' }).start();
    }, 3000);
    const t3 = setTimeout(() => {
      navigation.replace('Booking', params);
    }, 4500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const makePulseStyle = (anim) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
  });

  return (
    <LinearGradient colors={['#022C22', '#065F46']} style={styles.container}>
      <View style={styles.content}>
        {/* Pulsing radar */}
        <View style={styles.radarContainer}>
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulse1)]} />
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulse2)]} />
          <Animated.View style={[styles.pulseRing, makePulseStyle(pulse3)]} />

          <Animated.View style={[styles.centerCircle, { transform: [{ scale: truckScale }], opacity: truckOpacity }]}>
            {statusIndex === 2 ? (
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
              </Animated.View>
            ) : (
              <Ionicons name="car-sport" size={44} color={colors.primary} />
            )}
          </Animated.View>
        </View>

        {/* Status text */}
        <Text style={styles.findingText}>{t('findingSared')}</Text>
        <Text style={[styles.statusText, statusIndex === 2 && styles.statusFound]}>
          {statuses[statusIndex]}
        </Text>

        {/* Searching dots */}
        {statusIndex < 2 && (
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[styles.searchDot, {
                  opacity: dotAnim.interpolate({
                    inputRange: [i, i + 0.5, i + 1, 3],
                    outputRange: [0.3, 1, 0.3, 0.3],
                    extrapolate: 'clamp',
                  }),
                }]}
              />
            ))}
          </View>
        )}

        {/* Prayer time note */}
        <Text style={styles.prayerNote}>{t('duringPrayer')}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  radarContainer: {
    width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40,
  },
  pulseRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: colors.primary,
  },
  centerCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(5,150,105,0.15)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(5,150,105,0.3)',
  },
  findingText: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  statusText: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  statusFound: { color: '#4ADE80', fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 8 },
  searchDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  prayerNote: {
    fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center',
    marginTop: 24, paddingHorizontal: 32,
  },
});
