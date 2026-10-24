/**
 * Province-based place discovery search API
 * POST /api/discovery/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { mergeRealAndMockData } from '@/services/data-adapter/data-merger';
import { calculateStraightLineDistance } from '@/services/route/distance-calculator';
import { PlaceData } from '@/services/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { province, query, lat, lng, radiusKm } = body;
    
    if (!province) {
      return NextResponse.json(
        { status: 'error', message: 'Province is required' },
        { status: 400 }
      );
    }
    
    // Get data for province
    const { places, realCount, mockCount } = mergeRealAndMockData(province);
    
    let filtered = places;
    
    // Filter by radius if lat/lng provided
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
      filtered = filtered.filter(place => {
        const distance = calculateStraightLineDistance(
          [lat, lng],
          [place.latitude, place.longitude]
        );
        return distance <= radiusKm;
      });
    }
    
    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(place => {
        return (
          place.name.toLowerCase().includes(lowerQuery) ||
          place.nameTh?.toLowerCase().includes(lowerQuery) ||
          place.category.toLowerCase().includes(lowerQuery)
        );
      });
    }
    
    return NextResponse.json({
      status: 'success',
      places: filtered,
      meta: {
        realCount,
        mockCount,
        lastUpdated: new Date().toISOString(),
        total: filtered.length
      }
    });
    
  } catch (error) {
    console.error('Discovery search error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
