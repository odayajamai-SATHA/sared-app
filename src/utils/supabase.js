import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env variables. Create .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function signInWithPhone(phone) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  return { data, error };
}

export async function verifyOTP(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  return { data, error };
}

export async function upsertUser(phone, name, lang) {
  const { data, error } = await supabase.from('users').upsert({ phone, name, lang }, { onConflict: 'phone' }).select().single();
  return { data, error };
}

export async function getDriverByPhone(phone) {
  const { data, error } = await supabase.from('drivers').select('*').eq('phone', phone).single();
  return { data, error };
}

export async function updateDriverStatus(driverId, isOnline) {
  const { data, error } = await supabase.from('drivers').update({ is_online: isOnline }).eq('id', driverId).select().single();
  return { data, error };
}

export async function updateDriverLocation(driverId, lat, lng) {
  const { data, error } = await supabase.from('drivers').update({ lat, lng }).eq('id', driverId).select().single();
  return { data, error };
}

export async function createRide(rideData) {
  const { data, error } = await supabase.from('rides').insert(rideData).select().single();
  return { data, error };
}

export async function updateRideStatus(rideId, status) {
  const updates = { status };
  if (status === 'completed') { updates.completed_at = new Date().toISOString(); }
  const { data, error } = await supabase.from('rides').update(updates).eq('id', rideId).select().single();
  return { data, error };
}

export async function acceptRide(rideId, driverId) {
  const { data, error } = await supabase.from('rides').update({ driver_id: driverId, status: 'accepted' }).eq('id', rideId).select().single();
  return { data, error };
}

export async function getDriverRides(driverId) {
  const { data, error } = await supabase.from('rides').select('*').eq('driver_id', driverId).eq('status', 'completed').order('completed_at', { ascending: false });
  return { data, error };
}

export async function getPendingRides() {
  const { data, error } = await supabase.from('rides').select('*, users(name, phone)').eq('status', 'pending').order('created_at', { ascending: true });
  return { data, error };
}

export async function submitRating(ratingData) {
  const { data, error } = await supabase.from('ratings').insert(ratingData).select().single();
  return { data, error };
}

export function subscribeToNewRides(callback) {
  return supabase.channel('new-rides').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => callback(payload.new)).subscribe();
}

export function subscribeToRideUpdates(rideId, callback) {
  return supabase.channel('ride-' + rideId).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: 'id=eq.' + rideId }, (payload) => callback(payload.new)).subscribe();
}

export function subscribeToDriverLocation(rideId, callback) {
  const channel = supabase.channel('ride-gps-' + rideId);
  channel.on('broadcast', { event: 'driver-location' }, (payload) => {
    callback(payload.payload);
  }).subscribe();
  return channel;
}

export function broadcastDriverLocation(rideId, lat, lng) {
  const channel = supabase.channel('ride-gps-' + rideId);
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'driver-location',
        payload: { lat, lng, timestamp: new Date().toISOString() },
      });
    }
  });
  return channel;
}

export async function updateRideLifecycle(rideId, newStatus, driverId = null) {
  const { data, error } = await supabase.rpc('update_ride_status', {
    p_ride_id: rideId,
    p_new_status: newStatus,
    p_driver_id: driverId,
  });
  return { data, error };
}
