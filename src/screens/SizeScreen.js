import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useI18n } from '../utils/i18n';
import { getSizePriceWithVAT } from '../utils/pricing';
import { createDebouncedNav } from '../utils/navigation';

export default function SizeScreen({ route, navigation: rawNav }) {
  const navigation = createDebouncedNav(rawNav);
  const { service, serviceId } = route.params || {};
  const { t, isRTL } = useI18n();

  const sizes = [
    {
      id: 'small',
      icon: 'car-outline',
      title: t('smallSared'),
      description: t('smallDesc'),
      multiplier: '1.0x',
      price: `SAR ${getSizePriceWithVAT(serviceId, 'small')}`,
    },
    {
      id: 'medium',
      icon: 'car-sport-outline',
      title: t('mediumSared'),
      description: t('mediumDesc'),
      multiplier: '1.3x',
      price: `SAR ${getSizePriceWithVAT(serviceId, 'medium')}`,
    },
    {
      id: 'large',
      icon: 'bus-outline',
      title: t('largeSared'),
      description: t('largeDesc'),
      multiplier: '1.6x',
      price: `SAR ${getSizePriceWithVAT(serviceId, 'large')}`,
    },
    {
      id: 'enclosed',
      icon: 'shield-checkmark-outline',
      title: t('enclosed'),
      description: t('enclosedDesc'),
      multiplier: '2.0x',
      price: `SAR ${getSizePriceWithVAT(serviceId, 'enclosed')}`,
    },
  ];

  const pickup = route.params?.pickup;
  const destination = route.params?.destination;
  const destinationName = route.params?.destinationName;

  const handleSelect = (size) => {
    navigation.navigate('PriceGuarantee', {
      service, serviceId, size: size.title, price: `${size.price} (${t('inclVat')})`,
      pickup, destination, destinationName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('selectSize')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={[styles.serviceLabel, isRTL && styles.textRight]}>{service}</Text>
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('chooseSize')}</Text>
        <Text style={[styles.vatNote, isRTL && styles.textRight]}>{t('allPricesInclVat')}</Text>

        {sizes.map((size) => (
          <TouchableOpacity key={size.id} style={styles.card} onPress={() => handleSelect(size)}>
            <View style={[styles.cardTop, isRTL && styles.rowReverse]}>
              <View style={styles.iconContainer}>
                <Ionicons name={size.icon} size={28} color={colors.primary} />
              </View>
              <View style={[styles.cardContent, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.cardTitle}>{size.title}</Text>
                <Text style={[styles.cardDesc, isRTL && styles.textRight]}>{size.description}</Text>
                <Text style={styles.multiplierText}>{size.multiplier}</Text>
              </View>
            </View>
            <View style={[styles.priceRow, isRTL && styles.rowReverse]}>
              <View>
                <Text style={styles.priceText}>{size.price}</Text>
                <Text style={styles.vatLabel}>{t('inclVat15')}</Text>
              </View>
              <View style={styles.selectBtn}>
                <Text style={styles.selectBtnText}>{t('select')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  serviceLabel: {
    fontSize: 13, fontWeight: '600', color: colors.primary,
    backgroundColor: colors.primaryFaded, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    overflow: 'hidden', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  vatNote: { fontSize: 12, color: colors.gray, marginBottom: 16 },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rowReverse: { flexDirection: 'row-reverse' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primaryFaded,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  multiplierText: { fontSize: 11, fontWeight: '600', color: colors.primary, marginTop: 2 },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.lightGray, paddingTop: 12,
  },
  priceText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  vatLabel: { fontSize: 11, color: colors.gray, marginTop: 2 },
  selectBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8,
  },
  selectBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  textRight: { textAlign: 'right' },
});
