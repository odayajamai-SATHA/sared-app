import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

export default function SizeScreen({ route, navigation }) {
  const { service, serviceId } = route.params || {};
  const { t, isRTL, lang } = useI18n();
  const { colors, isDark } = useTheme();
  const [selectedId, setSelectedId] = useState(null);

  const pickup = route.params?.pickup;
  const destination = route.params?.destination;
  const destinationName = route.params?.destinationName;

  const sizes = [
    {
      id: 'standard',
      nameAr: 'سطحة عادية', nameEn: 'Standard Flatbed',
      descAr: 'سيدان وجيب عادي', descEn: 'Sedans & regular SUVs',
      specAr: 'حتى 3 طن', specEn: 'Up to 3 tons',
      icon: 'car-outline', pricePerKm: 5,
    },
    {
      id: 'hydraulic',
      nameAr: 'سطحة هيدروليك', nameEn: 'Hydraulic Flatbed',
      descAr: 'سيارات رياضية ومنخفضة', descEn: 'Sports & low cars',
      specAr: 'حتى 5 طن • نزول كامل', specEn: 'Up to 5 tons • Full down',
      icon: 'arrow-down-outline', pricePerKm: 7,
    },
    {
      id: 'enclosed',
      nameAr: 'سطحة مغلقة', nameEn: 'Enclosed Flatbed',
      descAr: 'سيارات فارهة وكلاسيكية', descEn: 'Luxury & classic cars',
      specAr: 'حتى 5 طن • حماية كاملة', specEn: 'Up to 5 tons • Full protection',
      icon: 'lock-closed-outline', pricePerKm: 12,
    },
    {
      id: 'winch',
      nameAr: 'ونش إنقاذ', nameEn: 'Winch Recovery',
      descAr: 'سيارات حوادث أو عالقة', descEn: 'Accident or stuck vehicles',
      specAr: 'حتى 8 طن • سحب ثقيل', specEn: 'Up to 8 tons • Heavy pull',
      icon: 'warning-outline', pricePerKm: 10,
    },
  ];

  const isAr = lang === 'ar';

  const handleSelect = (size) => {
    setSelectedId(size.id);
  };

  const handleConfirm = () => {
    const size = sizes.find(s => s.id === selectedId);
    if (!size) return;
    const sizeName = isAr ? size.nameAr : size.nameEn;
    navigation.navigate('PriceGuarantee', {
      service, serviceId,
      size: sizeName,
      price: `SAR ${size.pricePerKm * 15} (${t('inclVat')})`,
      pickup, destination, destinationName,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('selectSize')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={[styles.serviceLabel, isRTL && styles.textRight]}>{service}</Text>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }, isRTL && styles.textRight]}>{t('chooseSize')}</Text>

        {sizes.map((size) => {
          const isSelected = selectedId === size.id;
          return (
            <TouchableOpacity
              key={size.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(size)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardRow, isRTL && styles.rowReverse]}>
                <View style={[styles.iconContainer, isSelected && { backgroundColor: colors.primaryFaded }]}>
                  <Ionicons name={size.icon} size={28} color={isSelected ? colors.primary : colors.gray} />
                </View>
                <View style={[styles.cardContent, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }, isSelected && { color: colors.primary }]}>
                    {isAr ? size.nameAr : size.nameEn}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }, isRTL && styles.textRight]}>
                    {isAr ? size.descAr : size.descEn}
                  </Text>
                  <Text style={[styles.cardSpec, { color: colors.textSecondary }, isRTL && styles.textRight]}>
                    {isAr ? size.specAr : size.specEn}
                  </Text>
                </View>
                <View style={[styles.priceCol, { color: colors.text }]}>
                  <Text style={[styles.priceNum, { color: colors.text }, isSelected && { color: colors.primary }]}>
                    {size.pricePerKm}
                  </Text>
                  <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>{isAr ? 'ر.س/كم' : 'SAR/km'}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={[styles.selectedCheck, { color: colors.text }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {selectedId && (
        <View style={[styles.bottomBar, { color: colors.text }]}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.confirmBtnText}>{t('confirmBooking') || (isAr ? 'تأكيد' : 'Confirm')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  serviceLabel: {
    fontSize: 13, fontWeight: '600', color: '#059669',
    backgroundColor: 'rgba(5,150,105,0.1)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    overflow: 'hidden', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  card: {
    backgroundColor: 'transparent', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  cardSelected: {
    borderColor: theme.primary, borderWidth: 3, backgroundColor: '#F0FDF4',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  iconContainer: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center', marginEnd: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: 2 },
  cardSpec: { fontSize: 12, marginTop: 2 },
  priceCol: { alignItems: 'center', marginStart: 8 },
  priceNum: { fontSize: 24, fontWeight: '800' },
  priceUnit: { fontSize: 11, marginTop: 2 },
  selectedCheck: { position: 'absolute', top: 12, end: 12 },
  textRight: { textAlign: 'right' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 44, backgroundColor: 'transparent',
    borderTopWidth: 1, borderTopColor: 'transparent',
  },
  confirmBtn: {
    backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
