const VAT_RATE = 0.15;

const SIZE_CONFIG = {
  small: { baseFare: 100, perKm: 3 },
  medium: { baseFare: 150, perKm: 4 },
  large: { baseFare: 250, perKm: 5 },
  enclosed: { baseFare: 400, perKm: 7 },
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
 * Calculate the fare breakdown.
 * @param {string} sizeLabel - Translated size name
 * @param {number} distanceKm - Distance in kilometers
 * @param {Date} [date] - Date/time of the ride (defaults to now)
 * @returns {{ baseFare, distanceCharge, subtotal, nightSurcharge, promoDiscount, vat, total, isNight, distanceKm, sizeKey }}
 */
export function calculateFare(sizeLabel, distanceKm, date = new Date()) {
  const sizeKey = getSizeKey(sizeLabel);
  const config = SIZE_CONFIG[sizeKey];
  const km = Math.max(0, distanceKm || 0);

  const baseFare = config.baseFare;
  const distanceCharge = Math.round(km * config.perKm);
  let subtotal = baseFare + distanceCharge;

  const isNight = isNightTime(date);
  const nightSurcharge = isNight ? Math.round(subtotal * 0.5) : 0;
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
 * @param {object} fare - Result from calculateFare()
 * @param {string} code - Promo code
 * @param {boolean} isFirstRide - Whether this is the user's first ride
 * @returns {{ ...fare, promoDiscount, total, promoError?, promoApplied? }}
 */
export function applyPromoCode(fare, code, isFirstRide = true) {
  const upper = (code || '').trim().toUpperCase();

  if (upper === 'SARED1') {
    if (!isFirstRide) {
      return { ...fare, promoError: 'firstRideOnly' };
    }
    const discount = Math.min(Math.round(fare.subtotal * 0.5), 75);
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
    const discount = Math.min(10, fare.subtotal);
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
 * Get price range string for size selection screen.
 */
export function getPriceRange(sizeKey) {
  const config = SIZE_CONFIG[sizeKey];
  if (!config) return '';
  const min = config.baseFare;
  const max = Math.round(config.baseFare + config.perKm * 50);
  return `SAR ${min} – ${max}`;
}
