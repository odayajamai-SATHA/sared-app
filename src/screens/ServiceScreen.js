import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { getServicePriceWithVAT } from '../utils/pricing';
import { createDebouncedNav } from '../utils/navigation';

export default function ServiceScreen({ route, navigation: rawNav }) {
  const navigation = createDebouncedNav(rawNav);
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const pickup = route.params?.pickup;
  const destination = route.params?.destination;
  const destinationName = route.params?.destinationName;

  const services = [
    { id: 'tow', icon: 'car-sport', title: t('towVehicle'), desc: t('towDesc'), price: getServicePriceWithVAT('tow'), color: '#059669' },
    { id: 'flatTire', icon: 'disc-outline', title: t('flatTireChange'), desc: t('flatTireDesc'), price: getServicePriceWithVAT('flatTire'), color: '#3B82F6' },
    { id: 'battery', icon: 'flash-outline', title: t('batteryJump'), desc: t('batteryJumpDesc'), price: getServicePriceWithVAT('battery'), color: '#F59E0B' },
    { id: 'fuel', icon: 'water-outline', title: t('fuelDeliveryService'), desc: t('fuelDeliveryDesc'), price: getServicePriceWithVAT('fuel'), color: '#EF4444' },
    { id: 'lockout', icon: 'key-outline', title: t('carLockout'), desc: t('carLockoutDesc'), color: '#8B5CF6', comingSoon: true },
    { id: 'emergency', icon: 'warning-outline', title: t('winchRecovery'), desc: t('winchRecoveryDesc'), color: '#F97316', comingSoon: true },
    { id: 'transport', icon: 'cube', title: t('transportItems'), desc: t('transportDesc'), color: '#06B6D4', comingSoon: true },
    { id: 'heavyTow', icon: 'airplane-outline', title: t('intercityTransport'), desc: t('intercityDesc'), color: '#6366F1', comingSoon: true },
  ];

  const animations = useRef(services.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const stagger = services.map((_, i) =>
      Animated.spring(animations[i], { toValue: 1, tension: 60, friction: 8, useNativeDriver: Platform.OS !== 'web', delay: i * 60 })
    );
    Animated.stagger(60, stagger).start();
  }, []);

  const handleSelect = (service) => {
    if (service.comingSoon) {
      Alert.alert(
        t('comingSoon'),
        t('featureComingSoon')
      );
      return;
    }
    const directServices = ['flatTire', 'battery', 'fuel'];
    if (directServices.includes(service.id)) {
      navigation.navigate('PriceGuarantee', {
        service: service.title,
        serviceId: service.id,
        size: '—',
        price: `SAR ${service.price} (${t('inclVat')})`,
        pickup,
        destination,
        destinationName,
      });
    } else {
      navigation.navigate('Size', {
        service: service.title,
        serviceId: service.id,
        pickup,
        destination,
        destinationName,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chooseService')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('whatNeed')}</Text>

        {services.map((service, index) => (
          <Animated.View key={service.id} style={{
            opacity: animations[index],
            transform: [{ translateY: animations[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          }}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, isRTL && styles.rowReverse, service.comingSoon && styles.cardComingSoon]}
              onPress={() => handleSelect(service)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: service.color + '15' }]}>
                <Ionicons name={service.icon} size={26} color={service.color} />
              </View>
              <View style={[styles.cardContent, isRTL && { alignItems: 'flex-end' }]}>
                <View style={[styles.titleRow, isRTL && styles.rowReverse]}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{service.title}</Text>
                  {service.comingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>{lang === 'ar' ? 'قريباً' : 'Soon'}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardDesc, isRTL && styles.textRight]}>{service.desc}</Text>
                {!service.comingSoon && (
                  <Text style={[styles.cardPrice, { color: service.color }]}>
                    {t('fromSar')} {service.price} ({t('inclVat') || 'incl. VAT'})
                  </Text>
                )}
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.gray} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: undefined },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: theme.white, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.textSecondary, marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: theme.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardComingSoon: {
    opacity: 0.6,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 7,
  },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  cardDesc: { fontSize: 13, color: theme.textSecondary, marginTop: 3 },
  cardPrice: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  comingSoonBadge: {
    backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  comingSoonText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  textRight: { textAlign: 'right' },
});
