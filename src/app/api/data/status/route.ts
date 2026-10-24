/**
 * Data status summary API
 * GET /api/data/status
 */

import { NextResponse } from 'next/server';
import { provinces, getTotalPlacesCount } from '@/data/thailand-provinces/index';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getTotalPlacesCount();
    
    return NextResponse.json({
      status: 'success',
      provinces,
      summary: {
        totalReal: summary.real,
        totalMock: summary.mock,
        totalProvinces: provinces.length
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Data status error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
