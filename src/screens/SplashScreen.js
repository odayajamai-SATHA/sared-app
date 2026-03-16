import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const iconSlide = useRef(new Animated.Value(-60)).current;
  const nameSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(iconSlide, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.spring(nameSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#022C22', '#064E3B', '#059669']} style={styles.container}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.logoCircle, { transform: [{ translateX: iconSlide }] }]}>
          <Ionicons name="shield-checkmark" size={56} color="#FFF" />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: nameSlide }] }}>
          <Text style={styles.appName}>Sared</Text>
          <Text style={styles.appNameAr}>{'\u0633\u0627\u0631\u062F'}</Text>
        </Animated.View>
        <Text style={styles.tagline}>Your road story, handled</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { fontSize: 52, fontWeight: '800', color: '#FFF', letterSpacing: 3, textAlign: 'center' },
  appNameAr: { fontSize: 28, fontWeight: '600', color: 'rgba(5,150,105,0.9)', textAlign: 'center', marginTop: 4 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 16 },
});
