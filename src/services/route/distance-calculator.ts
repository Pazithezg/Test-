/**
 * Distance Calculator - Fallback when OSRM is unavailable
 * Uses Haversine formula for straight-line distance
 */

import { TravelMode } from '../types';

/**
 * Calculate straight-line distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateStraightLineDistance(
  start: [number, number], // [lat, lng]
  end: [number, number]
): number {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Speed assumptions (km/h)
 * These are CITY averages, not highway speeds
 */
const SPEEDS: Record<TravelMode, number> = {
  walk: 4.5,
  bicycle: 15,
  motorcycle: 35,
  car: 25 // City traffic average
};

/**
 * Estimate travel time based on straight-line distance and mode
 * Applies a road factor to account for actual road distance vs straight-line
 * @returns Time in minutes
 */
export function estimateTravelTime(
  distanceKm: number,
  mode: TravelMode
): number {
  // Road factor: actual road distance is typically 1.3x straight-line distance
  const roadFactor = 1.3;
  const actualDistanceKm = distanceKm * roadFactor;
  
  const speedKmPerHour = SPEEDS[mode];
  const hours = actualDistanceKm / speedKmPerHour;
  const minutes = hours * 60;
  
  return Math.ceil(minutes); // Round up to nearest minute
}

/**
 * Calculate multiple waypoints distance
 * @returns Total distance in km
 */
export function calculateTotalDistance(
  waypoints: Array<[number, number]>
): number {
  if (waypoints.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += calculateStraightLineDistance(waypoints[i], waypoints[i + 1]);
  }
  
  return Math.round(total * 100) / 100;
}

/**
 * Get speed for travel mode
 */
export function getSpeed(mode: TravelMode): number {
  return SPEEDS[mode];
}

/**
 * Convert km/h to different units
 */
export function convertSpeed(kmPerHour: number) {
  return {
    kmPerHour,
    metersPerSecond: kmPerHour / 3.6,
    milesPerHour: kmPerHour * 0.621371
  };
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coords: [number, number]): boolean {
  const [lat, lng] = coords;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
