// Dynamic pricing engine for RideMate

export const BASE_FARES = {
  bike: { base: 20, perKm: 8, perMin: 0.5, minFare: 50 },
  auto: { base: 35, perKm: 12, perMin: 0.8, minFare: 100 },
  car: { base: 60, perKm: 18, perMin: 1.2, minFare: 180 },
};

export const SURGE_THRESHOLDS = {
  low: { multiplier: 1.0, label: 'Normal' },
  medium: { multiplier: 1.3, label: 'Moderate surge' },
  high: { multiplier: 1.6, label: 'High demand' },
  peak: { multiplier: 2.0, label: 'Peak surge' },
};

export function calculateFare({ vehicleType, distanceKm, durationMin, isShared, passengers = 1, surgeMultiplier = 1.0 }) {
  const rates = BASE_FARES[vehicleType] || BASE_FARES.auto;
  let fare = rates.base + (rates.perKm * distanceKm) + (rates.perMin * durationMin);
  fare = Math.max(fare, rates.minFare);
  fare *= surgeMultiplier;
  if (isShared && passengers > 1) {
    fare = fare / passengers * 1.15; // 15% platform fee on shared
  }
  return Math.round(fare);
}

export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDuration(distanceKm, vehicleType) {
  const speeds = { bike: 25, auto: 20, car: 30 };
  const speed = speeds[vehicleType] || 25;
  return Math.round((distanceKm / speed) * 60);
}

export function formatFare(amount) {
  return `₹${amount}`;
}

export function getSurgeMultiplier(hour = new Date().getHours()) {
  if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)) return 1.6;
  if ((hour >= 7 && hour <= 11) || (hour >= 17 && hour <= 21)) return 1.3;
  if (hour >= 22 || hour <= 5) return 1.2;
  return 1.0;
}
