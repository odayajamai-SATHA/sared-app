import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as theme } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';

export default function VehiclesScreen({ navigation }) {
  const { t, isRTL } = useI18n();
  const { colors, isDark } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ make: '', model: '', year: '', color: '', plate: '' });

  const handleSave = () => {
    if (!form.make || !form.model || !form.plate) return;
    setVehicles([...vehicles, { ...form, id: Date.now().toString() }]);
    setForm({ make: '', model: '', year: '', color: '', plate: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  const colorForCar = (c) => {
    const map = { white: '#F3F4F6', black: '#1F2937', red: '#EF4444', blue: '#3B82F6', silver: '#9CA3AF', grey: '#6B7280', gray: '#6B7280' };
    return map[(c || '').toLowerCase()] || colors.primaryFaded;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, isRTL && styles.rowReverse, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myVehicles')}</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Ionicons name={showForm ? 'close' : 'add'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add vehicle form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, isRTL && styles.textRight]}>{t('addVehicle')}</Text>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t('vehicleMake')}</Text>
                <TextInput style={styles.input} placeholder={t('makePlaceholder')} placeholderTextColor={colors.gray}
                  value={form.make} onChangeText={(v) => setForm({ ...form, make: v })} />
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t('vehicleModel')}</Text>
                <TextInput style={styles.input} placeholder={t('modelPlaceholder')} placeholderTextColor={colors.gray}
                  value={form.model} onChangeText={(v) => setForm({ ...form, model: v })} />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t('vehicleYear')}</Text>
                <TextInput style={styles.input} placeholder={t('yearPlaceholder')} placeholderTextColor={colors.gray}
                  keyboardType="number-pad" value={form.year} onChangeText={(v) => setForm({ ...form, year: v })} />
              </View>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>{t('vehicleColor')}</Text>
                <TextInput style={styles.input} placeholder={t('colorPlaceholder')} placeholderTextColor={colors.gray}
                  value={form.color} onChangeText={(v) => setForm({ ...form, color: v })} />
              </View>
            </View>
            <Text style={styles.fieldLabel}>{t('plateNumber')}</Text>
            <TextInput style={styles.input} placeholder={t('platePlaceholder')} placeholderTextColor={colors.gray}
              autoCapitalize="characters" value={form.plate} onChangeText={(v) => setForm({ ...form, plate: v })} />

            <TouchableOpacity
              style={[styles.saveBtn, (!form.make || !form.model || !form.plate) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!form.make || !form.model || !form.plate}
            >
              <Text style={styles.saveBtnText}>{t('saveVehicle')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Vehicle list */}
        {vehicles.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="car-outline" size={64} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>{t('noVehiclesSaved')}</Text>
            <Text style={styles.emptyHint}>{t('addVehicleForFaster')}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.emptyBtnText}>{t('addVehicle')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {vehicles.map((v) => (
          <View key={v.id} style={styles.vehicleCard}>
            <View style={[styles.vehicleRow, isRTL && styles.rowReverse]}>
              <View style={[styles.vehicleColor, { backgroundColor: colorForCar(v.color) }]}>
                <Ionicons name="car-sport" size={24} color={v.color?.toLowerCase() === 'white' ? colors.text : '#FFF'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.vehicleName, isRTL && styles.textRight]}>{v.make} {v.model}</Text>
                <Text style={[styles.vehicleDetails, isRTL && styles.textRight]}>
                  {v.year} {v.color ? `• ${v.color}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(v.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View style={styles.plateContainer}>
              <Text style={styles.plateText}>{v.plate}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.lightGray },
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
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryFaded,
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { padding: 16 },
  formCard: {
    backgroundColor: theme.white, borderRadius: 16, padding: 20, marginBottom: 16,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  formField: { flex: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.lightGray, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border,
  },
  saveBtn: {
    backgroundColor: theme.primary, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', marginTop: 12,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.darkGray },
  emptyHint: { fontSize: 14, color: theme.textSecondary, marginTop: 6, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8,
  },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  vehicleCard: {
    backgroundColor: theme.white, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleColor: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginEnd: 14,
  },
  vehicleName: { fontSize: 16, fontWeight: '700', color: theme.text },
  vehicleDetails: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 8 },
  plateContainer: {
    backgroundColor: '#FEFCE8', borderRadius: 8, marginTop: 12,
    paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#FDE68A',
  },
  plateText: { fontSize: 14, fontWeight: '700', color: '#92400E', letterSpacing: 2 },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
});
