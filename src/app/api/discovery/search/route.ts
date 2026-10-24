import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    status: 'success',
    message: 'Search endpoint (use /api/recommendations instead)' 
  });
}
