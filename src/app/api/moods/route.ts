/**
 * Moods API
 * 
 * GET /api/moods
 * Returns list of available moods for UI selection
 */

import { NextResponse } from 'next/server';
import { getAllMoods } from '@/search/mood-detector';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const moods = getAllMoods();
    
    return NextResponse.json({
      moods: moods.map(m => ({
        id: m.id,
        description: m.description,
        descriptionTh: m.descriptionTh,
        categories: m.categories,
      })),
      total: moods.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[Moods API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
