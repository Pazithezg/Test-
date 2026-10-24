/**
 * Search API Endpoint
 * 
 * POST /api/search
 * Body: { 
 *   query: string, 
 *   language?: 'th' | 'en' | 'auto',
 *   userId?: string,
 *   location?: { lat: number, lng: number },
 *   timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night',
 *   personalize?: boolean
 * }
 * 
 * Returns matching places with scores and reasons
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSearchEngine } from '@/search/search-engine';
import { getPlaceIndex } from '@/search/place-index';
import { getPersonalizedSearch } from '@/personalization/personalized-search';
import { createDefaultPreferences, UserProfile } from '@/personalization/user-profile';

export const dynamic = 'force-dynamic';

// Initialize place index on first request (cold start)
let indexInitialized = false;
async function ensureIndexLoaded() {
  if (!indexInitialized) {
    console.log('[Search API] Initializing place index...');
    await getPlaceIndex();
    indexInitialized = true;
    console.log('[Search API] Place index ready');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request with error handling
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { query, language, userId, location, timeOfDay, personalize, mood } = body;
    
    // Validate
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query too short (min 2 characters)' },
        { status: 400 }
      );
    }
    
    if (query.length > 200) {
      return NextResponse.json(
        { error: 'Query too long (max 200 characters)' },
        { status: 400 }
      );
    }
    
    // Ensure index loaded
    await ensureIndexLoaded();
    
    // Check if personalization is requested
    if (personalize && userId) {
      // Use personalized search
      const personalizedSearch = getPersonalizedSearch();
      
      // Create user profile (in production, fetch from database)
      const userProfile: UserProfile = {
        userId,
        preferences: createDefaultPreferences(),
        activityHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add sample preferences for demo
      userProfile.preferences.favoriteCategories = {
        fitness: 0.9,
        cafe: 0.8,
        restaurant: 0.6,
      };
      
      // Build context
      const context: any = {};
      if (location) {
        context.currentLocation = {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      if (timeOfDay) {
        context.timeOfDay = timeOfDay;
      }
      
      const results = await personalizedSearch.search({
        text: query,
        language: language || 'auto',
        userProfile,
        context,
      });
      
      return NextResponse.json(results, {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
    
    // Regular search
    const searchEngine = getSearchEngine();
    const results = await searchEngine.search({
      text: query,
      language: language || 'auto',
      mood: mood, // Add mood parameter
    });
    
    // Return results
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
    
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for debugging/testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    // Return stats if no query
    await ensureIndexLoaded();
    const placeIndex = await getPlaceIndex();
    const stats = placeIndex.getStats();
    
    return NextResponse.json({
      message: 'Search API is ready',
      stats,
      usage: 'POST /api/search with { query: string, language?: "th" | "en" | "auto" }',
    });
  }
  
  // Perform search
  return POST(request);
}
