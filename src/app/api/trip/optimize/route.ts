/**
 * Multi-stop trip optimizer API
 * POST /api/trip/optimize
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizeTripRoute } from '@/services/trip/optimizer';
import { TripRequest } from '@/services/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: TripRequest = await request.json();
    
    // Validate required fields
    if (!body.startLocation || !Array.isArray(body.startLocation) || body.startLocation.length !== 2) {
      return NextResponse.json(
        { status: 'error', message: 'startLocation must be [lat, lng] array' },
        { status: 400 }
      );
    }
    
    if (!body.places || !Array.isArray(body.places) || body.places.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'places array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    if (typeof body.timeBudgetHours !== 'number' || body.timeBudgetHours <= 0) {
      return NextResponse.json(
        { status: 'error', message: 'timeBudgetHours must be a positive number' },
        { status: 400 }
      );
    }
    
    if (typeof body.costBudgetTHB !== 'number' || body.costBudgetTHB < 0) {
      return NextResponse.json(
        { status: 'error', message: 'costBudgetTHB must be a non-negative number' },
        { status: 400 }
      );
    }
    
    const validModes = ['walk', 'bicycle', 'motorcycle', 'car'];
    if (!validModes.includes(body.travelMode)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid travelMode' },
        { status: 400 }
      );
    }
    
    // Optimize the trip
    const plan = optimizeTripRoute(body);
    
    return NextResponse.json({
      status: 'success',
      plan
    });
    
  } catch (error) {
    console.error('Trip optimize error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
