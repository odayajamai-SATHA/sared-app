const VAT_RATE = 0.15;
const NIGHT_SURCHARGE_RATE = 0.25;

// Base fares per service (before VAT)
const SERVICE_BASE_FARES = {
  tow: 150,        // Standard Tow
  heavyTow: 250,   // Heavy Tow
  emergency: 200,  // Emergency
  transport: 300,  // Transport
  flatTire: 80,    // Flat Tire
  battery: 100,    // Battery
  fuel: 70,        // Fuel
  lockout: 120,    // Lockout
};

// Size multipliers
const SIZE_MULTIPLIERS = {
  small: 1.0,
  medium: 1.3,
  large: 1.6,
  enclosed: 2.0,
};

// Map translated size names to config keys
function getSizeKey(sizeLabel) {
  const lower = (sizeLabel || '').toLowerCase();
  if (lower.includes('enclosed') || lower.includes('مغلقة')) return 'enclosed';
  if (lower.includes('large') || lower.includes('كبيرة')) return 'large';
  if (lower.includes('medium') || lower.includes('متوسطة')) return 'medium';
  return 'small';
}

function isNightTime(date = new Date()) {
  const hour = date.getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Get base fare for a service.
 */
export function getServiceBaseFare(serviceId) {
  return SERVICE_BASE_FARES[serviceId] || 150;
}

/**
 * Get price including VAT for a service (no size multiplier).
 */
export function getServicePriceWithVAT(serviceId) {
  const base = getServiceBaseFare(serviceId);
  return Math.round(base * (1 + VAT_RATE));
}

/**
 * Get price for a service + size combo including VAT.
 */
export function getSizePriceWithVAT(serviceId, sizeKey) {
  const base = getServiceBaseFare(serviceId);
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1.0;
  const price = base * multiplier;
  return Math.round(price * (1 + VAT_RATE));
}

/**
 * Calculate the fare breakdown.
 * @param {string} serviceId - Service type key (tow, flatTire, etc.)
 * @param {string} sizeLabel - Translated size name
 * @param {number} distanceKm - Distance in kilometers
 * @param {Date} [date] - Date/time of the ride (defaults to now)
 */
export function calculateFare(serviceId, sizeLabel, distanceKm, date = new Date()) {
  const sizeKey = getSizeKey(sizeLabel);
  const baseFareRaw = getServiceBaseFare(serviceId);
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1.0;
  const baseFare = Math.round(baseFareRaw * multiplier);
  const km = Math.max(0, distanceKm || 0);
  const distanceCharge = Math.round(km * 3);

  let subtotal = baseFare + distanceCharge;

  const isNight = isNightTime(date);
  const nightSurcharge = isNight ? Math.round(subtotal * NIGHT_SURCHARGE_RATE) : 0;
  subtotal += nightSurcharge;

  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  return {
    baseFare,
    distanceCharge,
    subtotal,
    nightSurcharge,
    promoDiscount: 0,
    vat,
    total,
    isNight,
    distanceKm: km,
    sizeKey,
  };
}

/**
 * Apply a promo code to a fare breakdown.
 */
export function applyPromoCode(fare, code, isFirstRide = true) {
  const upper = (code || '').trim().toUpperCase();

  if (upper === 'SARED1') {
    if (!isFirstRide) {
      return { ...fare, promoError: 'firstRideOnly' };
    }
    const discount = fare.subtotal; // 100% discount - first ride free
    const newSubtotal = fare.subtotal - discount;
    const vat = Math.round(newSubtotal * VAT_RATE);
    return {
      ...fare,
      promoDiscount: discount,
      vat,
      total: newSubtotal + vat,
      promoApplied: 'SARED1',
      promoError: null,
    };
  }

  if (upper === 'SARED10') {
    const discount = Math.round(fare.subtotal * 0.10); // 10% discount
    const newSubtotal = fare.subtotal - discount;
    const vat = Math.round(newSubtotal * VAT_RATE);
    return {
      ...fare,
      promoDiscount: discount,
      vat,
      total: newSubtotal + vat,
      promoApplied: 'SARED10',
      promoError: null,
    };
  }

  return { ...fare, promoError: 'invalidCode' };
}

/**
 * Calculate distance in km between two coordinates using Haversine formula.
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Get price range string for size selection screen (including VAT).
 */
export function getPriceRange(serviceId, sizeKey) {
  const base = getServiceBaseFare(serviceId);
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1.0;
  const price = Math.round(base * multiplier);
  const priceWithVat = Math.round(price * (1 + VAT_RATE));
  const maxWithVat = Math.round((price + 150) * (1 + VAT_RATE));
  return `SAR ${priceWithVat} – ${maxWithVat}`;
}

export { SERVICE_BASE_FARES, SIZE_MULTIPLIERS, VAT_RATE, NIGHT_SURCHARGE_RATE };
