import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../utils/i18n';

export default function SplashScreen({ navigation }) {
  const { t } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
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
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={80} color="#FFF" />
          </View>
          <Text style={styles.appName}>SARED</Text>
          <Text style={styles.appNameAr}>{'\u0633\u0627\u0631\u062F'}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 4,
  },
  appNameAr: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 20,
  },
});
