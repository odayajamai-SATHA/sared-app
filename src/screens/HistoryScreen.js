import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { useTheme } from '../utils/theme';
import { useI18n } from '../utils/i18n';
import { supabase } from '../utils/supabase';

export default function HistoryScreen({ navigation }) {
  const { t, isRTL, lang } = useI18n();
  const { colors: C, isDark } = useTheme();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) setRides(data);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-SA', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22C55E';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const renderRide = ({ item }) => (
    <View style={[styles.rideCard, isRTL && styles.rowReverse]}>
      <View style={[styles.rideIcon, { backgroundColor: getStatusColor(item.status) + '15' }]}>
        <Ionicons name="car-sport" size={20} color={getStatusColor(item.status)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rideService, isRTL && styles.textRight]}>
          {item.service_type || t('towService')}
        </Text>
        <Text style={[styles.rideDate, isRTL && styles.textRight]}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.ridePrice, { color: getStatusColor(item.status) }]}>
          {item.price ? `SAR ${item.price}` : '--'}
        </Text>
        <Text style={[styles.rideStatus, { color: getStatusColor(item.status) }]}>
          {item.status || 'pending'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('rideHistory')}</Text>
        </View>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t('rideHistory')}</Text>
      </View>
      {rides.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="time-outline" size={64} color={colors.border} />
          </View>
          <Text style={styles.emptyTitle}>{t('noTripsYet')}</Text>
          <Text style={styles.emptyText}>{t('tripsWillAppear')}</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('Services')}
            activeOpacity={0.8}
          >
            <Ionicons name="car-sport" size={18} color="#FFF" />
            <Text style={styles.bookBtnText}>{t('bookNow')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={renderRide}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: undefined },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80, paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.darkGray, marginTop: 8 },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, marginTop: 24,
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  rideCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  rideIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rideService: { fontSize: 15, fontWeight: '600', color: colors.text },
  rideDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  ridePrice: { fontSize: 15, fontWeight: '700' },
  rideStatus: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  textRight: { textAlign: 'right' },
});
