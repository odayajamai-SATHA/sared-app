import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from './supabase';

export async function setupPushNotifications(userId = null, driverId = null) {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: '70f882d3-12b5-418a-9167-1d06dc836669' });
    const token = tokenData.data;
    const platform = Platform.OS;
    await registerPushToken(token, platform, userId, driverId);
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('rides', {
        name: 'Ride Requests',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
    return token;
  } catch (err) {
    console.error('Push notification setup failed:', err);
    return null;
  }
}

export async function registerForPushNotifications() {
  return setupPushNotifications();
}

export function addNotificationListeners(onNotification, onResponse) {
  const notifSub = Notifications.addNotificationReceivedListener((notification) => {
    if (onNotification) onNotification(notification);
  });
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    if (onResponse) onResponse(response);
  });
  return () => {
    notifSub.remove();
    responseSub.remove();
  };
}
