import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../utils/i18n';

function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOffline = () => setIsOffline(true);
      const handleOnline = () => setIsOffline(false);
      setIsOffline(!navigator.onLine);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
      return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
    } else {
      // Lazy load NetInfo - never at module level
      let unsubscribe = () => {};
      try {
        const NetInfo = require('@react-native-community/netinfo').default;
        unsubscribe = NetInfo.addEventListener((state) => {
          setIsOffline(!state.isConnected);
        });
      } catch (e) {
        console.warn('[Sared] NetInfo not available:', e.message);
      }
      return () => { try { unsubscribe(); } catch { /* silent */ } };
    }
  }, []);

  return isOffline;
}

export default function OfflineBanner() {
  const isOffline = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const { t } = useI18n();

  const animateBanner = useCallback((show) => {
    Animated.spring(slideAnim, {
      toValue: show ? 0 : -60,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    if (isOffline) {
      setShowReconnected(false);
      wasOffline.current = true;
      animateBanner(true);
    } else {
      if (wasOffline.current) {
        setShowReconnected(true);
        animateBanner(true);
        wasOffline.current = false;
        const timer = setTimeout(() => {
          setShowReconnected(false);
          animateBanner(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        animateBanner(false);
      }
    }
  }, [isOffline, animateBanner]);

  if (!isOffline && !showReconnected) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.onlineBanner,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Ionicons
        name={isOffline ? 'cloud-offline-outline' : 'checkmark-circle-outline'}
        size={18}
        color="#FFFFFF"
      />
      <Text style={styles.bannerText}>
        {isOffline ? (t('noInternet') || 'No internet') : (t('backOnline') || 'Back online')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
  },
  offlineBanner: { backgroundColor: '#EF4444' },
  onlineBanner: { backgroundColor: '#22C55E' },
  bannerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
