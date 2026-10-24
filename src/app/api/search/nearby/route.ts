/**
 * Nearby Search API Endpoint
 * 
 * POST /api/search/nearby
 * Body: {
 *   latitude: number,
 *   longitude: number,
 *   radiusKm: number,
 *   query?: string,
 *   mood?: string
 * }
 * 
 * Returns places filtered by distance AND activity/category match,
 * sorted by distance (closest first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlaceIndex } from '@/search/place-index';
import { calculateDistanceKm } from '@/geo/distance';
import { parseThaiIntent } from '@/ai/thai-intent-parser';
import { mapToOsmCategories } from '@/ai/thai-intent-dictionary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, query, mood } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const placeIndex = await getPlaceIndex();
    const allPlaces = placeIndex.getAllPlaces();

    // 1. Parse intent to get categories from the query
    let targetCategories: string[] = [];
    if (query) {
      // Nearby search must work without an AI provider. Use the deterministic
      // Thai parser and translate its canonical categories to the OSM index.
      const intent = parseThaiIntent({ intentText: query, mood });
      targetCategories = mapToOsmCategories(intent.categories);
    } else if (mood) {
      // If no query but mood provided, we'll filter by mood categories later
      targetCategories = [];
    }

    // 2. Filter by distance and category
    let results = allPlaces
      .map(place => {
        const distance = calculateDistanceKm(
          { latitude, longitude },
          { latitude: place.latitude, longitude: place.longitude }
        );
        return { 
          ...place, 
          distance,
          distanceLabel: distance !== null ? `${distance} km away` : 'Unknown distance'
        };
      })
      .filter(p => p.distance !== null);

    // 3. Filter by categories (from intent or mood)
    if (targetCategories.length > 0) {
      const categorySet = new Set(targetCategories.map(category => category.toLowerCase()));
      results = results.filter(p => categorySet.has(p.category.toLowerCase()));
    } else if (mood && !query) {
      // If only mood provided, filter by mood categories
      const searchEngine = (await import('@/search/search-engine')).getSearchEngine();
      const searchResponse = await searchEngine.search({ text: '', mood });
      const moodCategorySet = new Set(
        searchResponse.query.searchedCategories
      );
      if (moodCategorySet.size > 0) {
        results = results.filter(p => moodCategorySet.has(p.category));
      }
    }

    // 4. Sort by distance (closest first)
    results.sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));

    return NextResponse.json({
      results: results.slice(0, 50),
      stats: {
        totalMatches: results.length,
        searchTimeMs: Date.now() - startTime,
        categoriesUsed: targetCategories
      }
    });

  } catch (error) {
    console.error('[Nearby Search API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
