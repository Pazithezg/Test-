/**
 * Recommendations API
 * 
 * GET /api/recommendations
 * Query params:
 * - userId?: string
 * - lat?: number
 * - lng?: number
 * - timeOfDay?: morning|afternoon|evening|night
 * - limit?: number
 * 
 * Returns personalized place recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlaceIndex } from '@/search/place-index';
import { getRecommendationEngine } from '@/personalization/recommendation-engine';
import { createDefaultPreferences, UserProfile } from '@/personalization/user-profile';
import { getDiscoveryRepository } from '@/repository';
import { RuleBasedAiService } from '@/ai/rule-based-service';
import { DiscoveryEngine } from '@/discovery/engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse parameters
    const userId = searchParams.get('userId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const timeOfDay = searchParams.get('timeOfDay') as any;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get all places
    const placeIndex = await getPlaceIndex();
    const allPlaces = placeIndex.getAllPlaces();
    
    // Create mock user profile (in production, fetch from database)
    const userProfile: UserProfile = {
      userId: userId || 'guest',
      preferences: createDefaultPreferences(),
      activityHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // For demo: add some sample preferences if userId is provided
    if (userId) {
      // Example: user interested in fitness and cafes
      userProfile.preferences.favoriteCategories = {
        fitness: 0.9,
        cafe: 0.8,
        restaurant: 0.6,
        park: 0.5,
      };
    }
    
    // Build recommendation context
    const context: any = {};
    
    if (lat && lng) {
      context.currentLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      };
    }
    
    if (timeOfDay) {
      context.timeOfDay = timeOfDay;
    }
    
    // Get current time of day if not specified
    if (!timeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) context.timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) context.timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) context.timeOfDay = 'evening';
      else context.timeOfDay = 'night';
    }
    
    // Generate recommendations
    const recommendationEngine = getRecommendationEngine();
    const recommendations = recommendationEngine.recommend(
      allPlaces,
      userProfile,
      context,
      limit
    );
    
    return NextResponse.json({
      recommendations,
      context,
      total: recommendations.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
    
  } catch (error) {
    console.error('[Recommendations API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Homepage search: local data + deterministic Thai parser only.
// This is intentionally independent from Groq/Gemini and does not require a radius.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const location = body?.location;
    if (!location || location.mode !== 'coordinates' ||
        typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return NextResponse.json(
        { status: 'error', message: 'กรุณาปักหมุดหรืออนุญาต GPS ก่อนค้นหา' },
        { status: 400 }
      );
    }

    const engine = new DiscoveryEngine(getDiscoveryRepository(), new RuleBasedAiService());
    const result = await engine.recommend({
      ...body,
      location: {
        mode: 'coordinates',
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm: 10000,
      },
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Recommendations API POST] Error:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'ค้นหาไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
