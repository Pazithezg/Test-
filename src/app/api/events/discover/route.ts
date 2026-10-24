/**
 * Upcoming events discovery API
 * GET /api/events/discover?province=optional
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockEvents } from '@/data/mock-data/mock-events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const province = searchParams.get('province');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Filter upcoming events
    let filtered = mockEvents.filter(event => {
      // Remove expired events
      if (event.endDate && event.endDate < today) return false;
      if (!event.endDate && event.startDate < today) return false;
      return true;
    });
    
    // Filter by province if provided
    if (province) {
      filtered = filtered.filter(event => event.location.province === province);
    }
    
    // Sort by startDate ascending
    filtered.sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    return NextResponse.json({
      status: 'success',
      events: filtered,
      meta: {
        total: filtered.length,
        isMock: true,
        note: 'Mock data - real events coming soon'
      }
    });
    
  } catch (error) {
    console.error('Events discover error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
