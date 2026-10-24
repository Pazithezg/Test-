/**
 * Travel distance and cost estimation API
 * POST /api/travel/estimate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRoute } from '@/services/route/osrm-client';
import { calculateTravelCost } from '@/services/route/travel-cost';
import { calculateStraightLineDistance, estimateTravelTime } from '@/services/route/distance-calculator';
import { TravelMode, TravelEstimate } from '@/services/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end, mode }: { start: [number, number]; end: [number, number]; mode: TravelMode } = body;
    
    // Validate input
    if (!start || !end || !mode) {
      return NextResponse.json(
        { status: 'error', message: 'start, end, and mode are required' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(start) || start.length !== 2 || !Array.isArray(end) || end.length !== 2) {
      return NextResponse.json(
        { status: 'error', message: 'start and end must be [lat, lng] arrays' },
        { status: 400 }
      );
    }
    
    const validModes: TravelMode[] = ['walk', 'bicycle', 'motorcycle', 'car'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid travel mode' },
        { status: 400 }
      );
    }
    
    // Map mode to OSRM profile
    const profileMap: Record<TravelMode, 'driving' | 'cycling' | 'foot'> = {
      car: 'driving',
      motorcycle: 'driving',
      bicycle: 'cycling',
      walk: 'foot'
    };
    
    const profile = profileMap[mode];
    
    // Try OSRM first
    const osrmResult = await getRoute(start, end, profile);
    
    let distanceKm: number;
    let durationMinutes: number;
    let source: 'osrm' | 'fallback';
    
    if (osrmResult) {
      distanceKm = osrmResult.distance;
      durationMinutes = osrmResult.duration;
      source = 'osrm';
    } else {
      // Fallback to Haversine
      distanceKm = calculateStraightLineDistance(start, end);
      durationMinutes = estimateTravelTime(distanceKm, mode);
      source = 'fallback';
    }
    
    // Calculate costs
    const costs = calculateTravelCost(distanceKm, mode);
    
    const estimate: TravelEstimate = {
      distanceKm,
      durationMinutes,
      costMin: costs.costMin,
      costMax: costs.costMax,
      fuelCost: costs.fuelCost,
      parkingCost: costs.parkingCost,
      breakdown: costs.breakdown,
      disclaimer: costs.disclaimer,
      source
    };
    
    return NextResponse.json(estimate);
    
  } catch (error) {
    console.error('Travel estimate error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
