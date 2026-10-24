/**
 * OSRM Client for route calculation
 * Public API: https://router.project-osrm.org/route/v1/{profile}/{lng1},{lat1};{lng2},{lat2}
 * IMPORTANT: OSRM uses lng,lat order (not lat,lng)
 */

export async function getRoute(
  start: [number, number],  // [lat, lng]
  end: [number, number],    // [lat, lng]
  profile: 'driving' | 'cycling' | 'foot'
): Promise<{ distance: number; duration: number; geometry: string } | null> {
  try {
    // CRITICAL: OSRM uses lng,lat order
    const [startLat, startLng] = start;
    const [endLat, endLng] = end;
    
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    
    // 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return null;
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Convert meters to km, seconds to minutes
    const distanceKm = Math.round((leg.distance / 1000) * 100) / 100;
    const durationMinutes = Math.round((leg.duration / 60) * 10) / 10;
    
    return {
      distance: distanceKm,
      duration: durationMinutes,
      geometry: JSON.stringify(route.geometry)
    };
    
  } catch (error) {
    // Return null on any error (timeout, network error, etc.)
    return null;
  }
}
