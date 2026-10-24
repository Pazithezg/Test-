/**
 * Intent Parse API Endpoint
 * 
 * POST /api/intent-parse
 * Body: { text: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiParseIntent } from '@/ai/intent-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const intent = await aiParseIntent(text);

    return NextResponse.json(intent);

  } catch (error) {
    console.error('[Intent Parse API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
