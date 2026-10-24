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
import { getRecommendationEngine } from '@/personalization/recommendation-engine';
import { createDefaultPreferences, UserProfile } from '@/personalization/user-profile';
import { getPlaceIndex } from '@/search/place-index';
import { parseThaiIntent } from '@/ai/thai-intent-parser';
import { mapToOsmCategories } from '@/ai/thai-intent-dictionary';
import { calculateDistanceKm } from '@/geo/distance';
import { mockPlaces } from '@/data/mock-data/mock-places';

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

    const index = await getPlaceIndex();
    const realPlaces = index.getAllPlaces();
    
    // Combine real OSM places + mock places
    const allPlacesData = [...realPlaces, ...mockPlaces];
    
    const places = allPlacesData;
    const intentText = String(body.intentText || '').trim();
    const intent = parseThaiIntent({ intentText: intentText || 'สถานที่ใกล้ฉัน', mood: body.mood });
    const requestedCategories = new Set(mapToOsmCategories(intent.categories));
    const all = places.map((place) => ({
      place,
      distanceKm: calculateDistanceKm(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: place.latitude, longitude: place.longitude }
      ),
    })).filter((item) => item.distanceKm !== null);

    // Show all nearby records first. A query narrows by the local category
    // index, but never calls an external AI/API.
    const matching = intentText
      ? all.filter(({ place }) => requestedCategories.has(place.category))
      : all;
    const selected = (matching.length > 0 ? matching : all)
      .sort((a, b) => (a.distanceKm! - b.distanceKm!))
      .slice(0, 100);
    const now = new Date().toISOString();
    const result = {
      status: 'success',
      interpretedIntent: {
        querySummary: intent.summary,
        querySummaryTh: intent.summaryTh,
        detectedCategories: intent.categories,
        detectedVibes: intent.vibeTags,
        budgetLevel: intent.budgetLevel,
      },
      totalCandidatesEvaluated: all.length,
      results: selected.map(({ place, distanceKm }) => {
        const isMockPlace = (place as any).isMock === true;
        const sourceName = isMockPlace ? 'ข้อมูลจำลอง (Mock Data)' : 'OpenStreetMap local data';
        const priceInfo = (place as any).price ? {
          isFree: (place as any).price === 0,
          minPrice: (place as any).price,
          maxPrice: (place as any).price,
          currency: 'THB',
          priceKnown: true,
          priceNote: `ราคาโดยประมาณ ${(place as any).price} บาท`,
          priceNoteTh: `ราคาโดยประมาณ ${(place as any).price} บาท`
        } : {
          isFree: false,
          minPrice: null,
          maxPrice: null,
          currency: 'THB',
          priceKnown: false,
          priceNote: 'ไม่พบราคาในข้อมูลสถานที่',
          priceNoteTh: 'ไม่พบราคาในข้อมูลสถานที่'
        };
        
        return {
        id: place.id,
        type: 'place' as const,
        title: place.name,
        titleTh: place.name,
        description: isMockPlace 
          ? `${place.category} - ${(place as any).description || 'ข้อมูลจำลองสำหรับ Prototype'}` 
          : `${place.category} จากข้อมูล OpenStreetMap`,
        descriptionTh: isMockPlace
          ? `${place.category} - ${(place as any).description || 'ข้อมูลจำลองสำหรับ Prototype'}`
          : `สถานที่ประเภท ${place.category} จากข้อมูล OpenStreetMap`,
        venueName: place.name,
        address: (place as any).address || (place as any).province || 'กรุงเทพฯ',
        areaId: 'nearby-pin',
        coordinates: { latitude: place.latitude, longitude: place.longitude },
        distanceKm: Number(distanceKm!.toFixed(2)),
        pricing: priceInfo,
        categories: [place.category],
        tags: Object.keys(place.tags || {}),
        source: { 
          sourceUrl: null, 
          sourceName, 
          lastCheckedAt: now, 
          verificationStatus: isMockPlace ? ('mock' as any) : ('unverified' as const),
          isDemoFixture: isMockPlace,
          isMock: isMockPlace
        },
        matchScore: Math.max(1, 100 - Math.round(distanceKm! * 10)),
        explanation: { 
          headline: isMockPlace ? 'Mock place for testing' : 'Nearby place', 
          headlineTh: isMockPlace ? 'ข้อมูลจำลองสำหรับทดสอบ' : 'สถานที่ใกล้จุดที่ปักหมุด', 
          reasons: [`${Number(distanceKm!.toFixed(2))} km from your pin`], 
          reasonsTh: [`ห่างจากจุดที่ปักหมุด ${Number(distanceKm!.toFixed(2))} กม.`], 
          matchHighlights: { 
            categoryMatch: requestedCategories.has(place.category), 
            dateMatch: true, 
            freeTimeMatch: true, 
            budgetMatch: true, 
            locationMatch: true, 
            vibeMatch: false 
          } 
        },
        actionableLinks: { 
          sourceUrl: null, 
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${place.latitude},${place.longitude}` 
        },
      }}),
      metadata: { executionTimeMs: 0, aiAssisted: false, aiProvider: 'deterministic_local_search', dataFreshnessReference: 'Local OpenStreetMap dataset' },
    };
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Recommendations API POST] Error:', error);
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'ค้นหาไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
