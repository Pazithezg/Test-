/**
 * Trip Optimizer using TSP nearest-neighbor algorithm
 */

import { TripRequest, TripPlan, StopTime, RouteSegment } from '../types';
import { calculateStraightLineDistance, estimateTravelTime } from '../route/distance-calculator';
import { calculateTravelCost } from '../route/travel-cost';

export function optimizeTripRoute(request: TripRequest): TripPlan {
  const {
    startLocation,
    places,
    timeBudgetHours,
    costBudgetTHB,
    travelMode,
    timePerPlaceMinutes = 45
  } = request;
  
  // Build coordinate map (use mock coordinates for missing data)
  const placeCoords = new Map<string, [number, number]>();
  places.forEach((placeId, index) => {
    // For demo: use startLocation with small offset if coordinates not provided
    // In production, this would fetch from database
    placeCoords.set(placeId, [
      startLocation[0] + (index * 0.01),
      startLocation[1] + (index * 0.01)
    ]);
  });
  
  // TSP nearest-neighbor algorithm
  const unvisited = new Set(places);
  const route: string[] = [];
  const segments: RouteSegment[] = [];
  
  let currentLocation = startLocation;
  let totalDistanceKm = 0;
  let totalTimeMinutes = 0;
  
  while (unvisited.size > 0) {
    let nearestPlace: string | null = null;
    let nearestDistance = Infinity;
    let nearestCoords: [number, number] = [0, 0];
    
    // Find nearest unvisited place
    for (const placeId of unvisited) {
      const coords = placeCoords.get(placeId)!;
      const distance = calculateStraightLineDistance(currentLocation, coords);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPlace = placeId;
        nearestCoords = coords;
      }
    }
    
    if (nearestPlace) {
      route.push(nearestPlace);
      unvisited.delete(nearestPlace);
      
      const travelTime = estimateTravelTime(nearestDistance, travelMode);
      
      segments.push({
        from: currentLocation,
        to: nearestCoords,
        distanceKm: nearestDistance,
        durationMinutes: travelTime,
        mode: travelMode
      });
      
      totalDistanceKm += nearestDistance;
      totalTimeMinutes += travelTime;
      currentLocation = nearestCoords;
    }
  }
  
  // Add time per place
  totalTimeMinutes += timePerPlaceMinutes * places.length;
  
  // Apply 10% buffer
  totalTimeMinutes = Math.ceil(totalTimeMinutes * 1.1);
  
  // Calculate costs for each segment
  let totalCostMin = 0;
  let totalCostMax = 0;
  
  for (const segment of segments) {
    const cost = calculateTravelCost(segment.distanceKm, travelMode);
    totalCostMin += cost.costMin;
    totalCostMax += cost.costMax;
  }
  
  // Check feasibility
  const timeBudgetMinutes = timeBudgetHours * 60;
  const timeWithinBudget = totalTimeMinutes <= timeBudgetMinutes;
  const costWithinBudget = totalCostMax <= costBudgetTHB;
  const feasible = timeWithinBudget && costWithinBudget;
  
  // Generate warnings
  const warnings: string[] = [];
  const reasons: string[] = [];
  
  if (!timeWithinBudget) {
    reasons.push(`เวลาเกินงบประมาณ: ใช้เวลา ${totalTimeMinutes} นาที แต่มีเพียง ${timeBudgetMinutes} นาที`);
  } else if (totalTimeMinutes > timeBudgetMinutes * 0.8) {
    warnings.push(`ใกล้เกินเวลา: ใช้เวลา ${totalTimeMinutes} นาที จาก ${timeBudgetMinutes} นาที`);
  }
  
  if (!costWithinBudget) {
    reasons.push(`ค่าใช้จ่ายเกินงบประมาณ: ${totalCostMax} บาท แต่มีเพียง ${costBudgetTHB} บาท`);
  } else if (totalCostMax > costBudgetTHB * 0.8) {
    warnings.push(`ใกล้เกินงบประมาณ: ${totalCostMax} บาท จาก ${costBudgetTHB} บาท`);
  }
  
  // Generate timeline
  const startTime = "09:00";
  const stops: StopTime[] = [];
  let currentTimeMinutes = 9 * 60; // 09:00 in minutes
  
  for (let i = 0; i < route.length; i++) {
    const placeId = route[i];
    const segment = segments[i];
    
    // Add travel time to get arrival
    currentTimeMinutes += segment.durationMinutes;
    const arrivalTime = minutesToTime(currentTimeMinutes);
    
    // Add time per place
    currentTimeMinutes += timePerPlaceMinutes;
    const departureTime = minutesToTime(currentTimeMinutes);
    
    stops.push({
      placeId,
      placeName: placeId, // In production, would fetch actual name
      arrivalTime,
      departureTime,
      durationMinutes: timePerPlaceMinutes
    });
  }
  
  const endTime = minutesToTime(currentTimeMinutes);
  
  return {
    feasible,
    route: {
      order: route,
      segments,
      totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      totalTimeMinutes,
      totalCostMin: Math.round(totalCostMin),
      totalCostMax: Math.round(totalCostMax)
    },
    timeline: {
      startTime,
      endTime,
      stops
    },
    warnings,
    ...(reasons.length > 0 && { reasons })
  };
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
