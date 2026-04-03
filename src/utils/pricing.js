const VAT_RATE = 0.15;
const NIGHT_SURCHARGE_RATE = 0.25;
const BASE_DISPATCH_FEE = 50;
const MIN_FARE = 100;
const EMERGENCY_FEE = 50;

// Per-km rates by vehicle size
const RATE_PER_KM = {
  small: 5,    // Sedan: Camry, Accent, Elantra
  medium: 7,   // SUV: Fortuner, Patrol, Tahoe
  large: 10,   // Truck/bus/heavy
  enclosed: 12, // Luxury/classic car
};

// Base fares per service (for screens without distance)
const SERVICE_BASE_FARES = {
  tow: 150,
  heavyTow: 250,
  emergency: 200,
  transport: 300,
  flatTire: 80,
  battery: 100,
  fuel: 70,
  lockout: 120,
};

// Size multipliers (for fixed-price screens)
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
 * Distance-based fare calculation.
 *
 * Tiered distance pricing:
 *   0-50km  = full rate per km
 *   50-100km = 60% of rate per km
 *   100+km  = 30% of rate per km
 *
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} vehicleSize - small | medium | large | enclosed
 * @param {boolean} isNight - Whether it's nighttime (10pm-6am)
 * @param {boolean} isEmergency - Whether this is an emergency call
 * @returns {{ subtotal, vat, total, distanceKm, distanceCost, baseFee, nightSurcharge, emergencyFee }}
 */
export function calculateDistanceFare(distanceKm, vehicleSize, isNight, isEmergency) {
  const rate = RATE_PER_KM[vehicleSize] || RATE_PER_KM.small;

  let distanceCost = 0;
  if (distanceKm <= 50) {
    distanceCost = distanceKm * rate;
  } else if (distanceKm <= 100) {
    distanceCost = (50 * rate) + ((distanceKm - 50) * rate * 0.6);
  } else {
    distanceCost = (50 * rate) + (50 * rate * 0.6) + ((distanceKm - 100) * rate * 0.3);
  }

  let subtotal = Math.max(BASE_DISPATCH_FEE + distanceCost, MIN_FARE);
  const emergencyAmount = isEmergency ? EMERGENCY_FEE : 0;
  subtotal += emergencyAmount;
  const nightAmount = isNight ? Math.round(subtotal * NIGHT_SURCHARGE_RATE) : 0;
  subtotal += nightAmount;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = Math.round(subtotal) + vat;

  return {
    baseFee: BASE_DISPATCH_FEE,
    distanceCost: Math.round(distanceCost),
    emergencyFee: emergencyAmount,
    nightSurcharge: nightAmount,
    subtotal: Math.round(subtotal),
    vat,
    total,
    distanceKm,
    isNight,
    isEmergency: !!isEmergency,
  };
}

/**
 * Calculate the fare breakdown (used by BookingScreen and PriceGuaranteeScreen).
 * Uses tiered distance-based pricing.
 *
 * @param {string} serviceId - Service type key (tow, flatTire, etc.)
 * @param {string} sizeLabel - Translated size name or size key
 * @param {number} distanceKm - Distance in kilometers
 * @param {Date} [date] - Date/time of the ride (defaults to now)
 */
export function calculateFare(serviceId, sizeLabel, distanceKm, date = new Date()) {
  const sizeKey = getSizeKey(sizeLabel);
  const km = Math.max(0, distanceKm || 0);
  const isNight = isNightTime(date);
  const isEmergency = serviceId === 'emergency';

  const rate = RATE_PER_KM[sizeKey] || RATE_PER_KM.small;

  // Tiered distance cost
  let distanceCharge = 0;
  if (km <= 50) {
    distanceCharge = km * rate;
  } else if (km <= 100) {
    distanceCharge = (50 * rate) + ((km - 50) * rate * 0.6);
  } else {
    distanceCharge = (50 * rate) + (50 * rate * 0.6) + ((km - 100) * rate * 0.3);
  }
  distanceCharge = Math.round(distanceCharge);

  const baseFare = BASE_DISPATCH_FEE;
  let subtotal = Math.max(baseFare + distanceCharge, MIN_FARE);

  if (isEmergency) subtotal += EMERGENCY_FEE;

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
    const discount = fare.subtotal;
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
    const discount = Math.round(fare.subtotal * 0.10);
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

export { SERVICE_BASE_FARES, SIZE_MULTIPLIERS, VAT_RATE, NIGHT_SURCHARGE_RATE, RATE_PER_KM };
