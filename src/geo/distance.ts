/**
 * Geospatial utilities for Bangkok discovery system.
 * Uses the Haversine formula to calculate accurate great-circle distances in kilometers.
 */

const EARTH_RADIUS_KM = 6371.0088;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula.
 * Returns distance in kilometers (rounded to 2 decimal places).
 * Returns null if either point has null/invalid coordinates.
 */
export function calculateDistanceKm(
  point1: { latitude: number | null; longitude: number | null },
  point2: { latitude: number | null; longitude: number | null }
): number | null {
  if (
    point1.latitude == null ||
    point1.longitude == null ||
    point2.latitude == null ||
    point2.longitude == null
  ) {
    return null;
  }

  const lat1 = toRadians(point1.latitude);
  const lon1 = toRadians(point1.longitude);
  const lat2 = toRadians(point2.latitude);
  const lon2 = toRadians(point2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Checks whether target point is within radiusKm from center point.
 * If target has no coordinates, returns false.
 */
export function isWithinRadius(
  center: { latitude: number; longitude: number },
  target: { latitude: number | null; longitude: number | null },
  radiusKm: number
): boolean {
  const dist = calculateDistanceKm(center, target);
  if (dist === null) return false;
  return dist <= radiusKm;
}
