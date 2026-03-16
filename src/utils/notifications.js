import { Platform } from 'react-native';

let Notifications = null;

// Only import expo-notifications on native platforms
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Register for push notifications and return the Expo push token.
 * Returns null on web or if permissions are denied.
 */
export async function registerForPushNotifications() {
  if (Platform.OS === 'web' || !Notifications) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Set notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

/**
 * Send a push notification via Expo's push service.
 * In production, this should go through your backend server.
 */
async function sendPushNotification(expoPushToken, title, body, data = {}) {
  if (!expoPushToken) return;

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

/**
 * Notify nearby online drivers about a new ride request.
 * @param {string[]} driverTokens - Array of Expo push tokens for nearby drivers
 * @param {object} rideDetails - { service, size, price, pickupAddress }
 */
export async function notifyDriversNewRide(driverTokens, rideDetails) {
  const { service, size, price } = rideDetails;

  const promises = driverTokens.map((token) =>
    sendPushNotification(
      token,
      'New Ride Request! ',
      `${service} • ${size} • ${price} SAR`,
      { type: 'new_ride', ...rideDetails }
    )
  );

  await Promise.allSettled(promises);
}

/**
 * Notify the customer that a driver has accepted their ride.
 * @param {string} customerToken - Customer's Expo push token
 * @param {object} driverDetails - { name, plate, rating, eta }
 */
export async function notifyCustomerDriverAccepted(customerToken, driverDetails) {
  const { name, plate, eta } = driverDetails;

  await sendPushNotification(
    customerToken,
    'Driver Accepted! ✅',
    `${name} (${plate}) is on the way • ETA: ${eta} min`,
    { type: 'driver_accepted', ...driverDetails }
  );
}

/**
 * Listen for incoming notifications. Returns a subscription to clean up.
 * @param {function} onNotification - Called when a notification is received while app is open
 * @param {function} onNotificationResponse - Called when user taps a notification
 */
export function addNotificationListeners(onNotification, onNotificationResponse) {
  if (Platform.OS === 'web' || !Notifications) {
    return () => {};
  }

  const notifSub = Notifications.addNotificationReceivedListener(onNotification);
  const responseSub = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    notifSub.remove();
    responseSub.remove();
  };
}
