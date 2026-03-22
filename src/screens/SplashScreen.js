import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../utils/i18n';

export default function SplashScreen({ navigation }) {
  const { t } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shield icon: fade + scale bounce
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      // Text fade in after icon
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  useEffect(() => {
    // Always redirect after 2.5 seconds — don't depend on Supabase
    const timer = setTimeout(() => {
      try {
        // Try to check auth
        const { supabase } = require('../utils/supabase');
        supabase.auth.getSession().then(({ data }) => {
          if (data?.session) {
            navigation.replace('Main');
          } else {
            navigation.replace('Onboarding');
          }
        }).catch(() => {
          navigation.replace('Onboarding');
        });
      } catch {
        navigation.replace('Onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#022C22', '#064E3B', '#059669']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconCircle, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="shield-checkmark" size={80} color="#FFF" />
          </Animated.View>
          <Animated.View style={{ opacity: textFade }}>
            <Text style={styles.appName}>SARED</Text>
            <Text style={styles.appNameAr}>{'\u0633\u0627\u0631\u062F'}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  iconCircle: { marginBottom: 24 },
  appName: { fontSize: 48, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: 3 },
  appNameAr: { fontSize: 36, fontWeight: '600', color: '#FFF', textAlign: 'center', marginTop: 8 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 20 },
});
