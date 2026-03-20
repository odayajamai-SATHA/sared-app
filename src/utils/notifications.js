import { Platform } from 'react-native';

// LAZY LOAD - never require native modules at module level
let Notifications = null;
let isSetup = false;

function getNotifications() {
  if (Platform.OS === 'web') return null;
  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
    } catch (e) {
      console.warn('[Sared] expo-notifications not available:', e.message);
      return null;
    }
  }
  if (!isSetup && Notifications) {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      isSetup = true;
    } catch (e) {
      console.warn('[Sared] setNotificationHandler failed:', e.message);
    }
  }
  return Notifications;
}

export async function registerForPushNotifications() {
  const N = getNotifications();
  if (!N) return null;

  try {
    // Device check: getExpoPushTokenAsync will throw on simulator/web
  const { status: existingStatus } = await N.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: N.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    const tokenData = await N.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.warn('[Sared] Push registration failed:', e.message);
    return null;
  }
}

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: expoPushToken, sound: 'default', title, body, data }),
    });
  } catch { /* silent */ }
}

export async function notifyDriversNewRide(driverTokens, rideDetails) {
  const { service, size, price } = rideDetails;
  const promises = driverTokens.map((token) =>
    sendPushNotification(token, 'New Ride Request!', `${service} • ${size} • ${price} SAR`, { type: 'new_ride', ...rideDetails })
  );
  await Promise.allSettled(promises);
}

export async function notifyCustomerDriverAccepted(customerToken, driverDetails) {
  const { name, plate, eta } = driverDetails;
  await sendPushNotification(customerToken, 'Driver Accepted!', `${name} (${plate}) is on the way • ETA: ${eta} min`, { type: 'driver_accepted', ...driverDetails });
}

export function addNotificationListeners(onNotification, onNotificationResponse) {
  const N = getNotifications();
  if (!N) return () => {};

  try {
    const notifSub = N.addNotificationReceivedListener(onNotification);
    const responseSub = N.addNotificationResponseReceivedListener(onNotificationResponse);
    return () => { notifSub.remove(); responseSub.remove(); };
  } catch {
    return () => {};
  }
}
