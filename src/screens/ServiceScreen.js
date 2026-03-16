import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';

const { width } = Dimensions.get('window');

export default function ServiceScreen({ route, navigation }) {
  const { t, isRTL } = useI18n();
  const pickup = route.params?.pickup;
  const destination = route.params?.destination;
  const destinationName = route.params?.destinationName;

  const services = [
    { id: 'tow', icon: 'car-sport', title: t('towVehicle'), desc: t('towDesc'), price: 100, color: '#059669' },
    { id: 'flatTire', icon: 'disc', title: t('flatTireChange'), desc: t('flatTireDesc'), price: 60, color: '#3B82F6' },
    { id: 'battery', icon: 'flash', title: t('batteryJump'), desc: t('batteryJumpDesc'), price: 50, color: '#8B5CF6' },
    { id: 'fuel', icon: 'water', title: t('fuelDeliveryService'), desc: t('fuelDeliveryDesc'), price: 40, color: '#22C55E' },
    { id: 'lockout', icon: 'key', title: t('carLockout'), desc: t('carLockoutDesc'), price: 80, color: '#EC4899' },
    { id: 'winch', icon: 'link', title: t('winchRecovery'), desc: t('winchRecoveryDesc'), price: 200, color: '#EF4444' },
    { id: 'transport', icon: 'cube', title: t('transportItems'), desc: t('transportDesc'), price: 150, color: '#F59E0B' },
    { id: 'intercity', icon: 'airplane', title: t('intercityTransport'), desc: t('intercityDesc'), price: 500, color: '#0EA5E9' },
  ];

  const animations = useRef(services.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const stagger = services.map((_, i) =>
      Animated.spring(animations[i], { toValue: 1, tension: 60, friction: 8, useNativeDriver: true, delay: i * 60 })
    );
    Animated.stagger(60, stagger).start();
  }, []);

  const handleSelect = (service) => {
    // Services that don't need size selection
    // Services that don't need size selection go straight to price guarantee
    const directServices = ['flatTire', 'battery', 'fuel', 'lockout'];
    if (directServices.includes(service.id)) {
      navigation.navigate('PriceGuarantee', {
        service: service.title,
        size: '—',
        price: `SAR ${service.price}`,
        pickup,
        destination,
        destinationName,
      });
    } else {
      navigation.navigate('Size', {
        service: service.title,
        pickup,
        destination,
        destinationName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
              style={[styles.card, isRTL && styles.rowReverse]}
              onPress={() => handleSelect(service)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: service.color + '15' }]}>
                <Ionicons name={service.icon} size={26} color={service.color} />
              </View>
              <View style={[styles.cardContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={[styles.cardDesc, isRTL && styles.textRight]}>{service.desc}</Text>
                <Text style={[styles.cardPrice, { color: service.color }]}>
                  {t('fromSar')} {service.price}
                </Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.gray} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  cardPrice: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  textRight: { textAlign: 'right' },
});
