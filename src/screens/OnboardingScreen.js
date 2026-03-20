import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, FlatList, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

function AnimatedIllustration({ icons, color, centerIcon }) {
  const bounce = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: -12, duration: 1200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bounce, { toValue: 0, duration: 1200, useNativeDriver: Platform.OS !== 'web' }),
    ])).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 8000, useNativeDriver: Platform.OS !== 'web' })).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={illStyles.container}>
      <Animated.View style={[illStyles.outerRing, { transform: [{ rotate }], borderColor: color + '20' }]}>
        {icons.map((icon, i) => {
          const angle = (i * 360) / icons.length;
          const rad = (angle * Math.PI) / 180;
          const r = 80;
          return (
            <View key={i} style={[illStyles.orbitIcon, {
              left: 80 + Math.cos(rad) * r - 18,
              top: 80 + Math.sin(rad) * r - 18,
              backgroundColor: '#FFFFFF',
            }]}>
              <Ionicons name={icon} size={16} color={color} />
            </View>
          );
        })}
      </Animated.View>
      <Animated.View style={[illStyles.centerCircle, { backgroundColor: color + '15', transform: [{ translateY: bounce }] }]}>
        <Ionicons name={centerIcon} size={40} color={color} />
      </Animated.View>
    </View>
  );
}

const illStyles = StyleSheet.create({
  container: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  outerRing: { position: 'absolute', width: 196, height: 196, borderRadius: 98, borderWidth: 2 },
  orbitIcon: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  centerCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
  },
});

export default function OnboardingScreen({ navigation }) {
  const { t } = useI18n();
  const { width, height: screenHeight } = useWindowDimensions();
  const slideHeight = screenHeight - 180;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      centerIcon: 'car-sport', color: '#059669',
      icons: ['warning', 'location', 'time', 'call'],
      title: t('onboard1Title'), sub: t('onboard1Sub'),
    },
    {
      centerIcon: 'shield-checkmark', color: '#3B82F6',
      icons: ['car-sport', 'disc', 'flash', 'water', 'key', 'link'],
      title: t('onboard2Title'), sub: t('onboard2Sub'),
    },
    {
      centerIcon: 'location', color: '#22C55E',
      icons: ['navigate', 'car-sport', 'checkmark-circle', 'pin'],
      title: t('onboard3Title'), sub: t('onboard3Sub'),
    },
  ];

  const goToSlide = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < 2) goToSlide(currentIndex + 1);
    else navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width, height: slideHeight }]}>
      <View style={styles.illustrationArea}>
        <AnimatedIllustration icons={item.icons} color={item.color} centerIcon={item.centerIcon} />
      </View>
      <View style={styles.textArea}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.sub}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#022C22', '#064E3B', '#065F46']} style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Login')}>
        <Text style={styles.skipText}>{t('skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        style={styles.flatList}
        extraData={width}
      />

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient colors={['#059669', '#047857']} style={styles.nextGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextText}>
              {currentIndex === 2 ? t('getStarted') : t('next')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  flatList: { flex: 1 },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  illustrationArea: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  textArea: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomArea: { paddingBottom: 50, paddingHorizontal: 24, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 28, backgroundColor: colors.primary },
  nextBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  nextGradient: {
    paddingVertical: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  nextText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
});
