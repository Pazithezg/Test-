import { NextResponse } from 'next/server';
import { BANGKOK_EVENT_SOURCES, fetchPublicCalendarEvents } from '@/data/event-sources/web-calendar-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const batches = await Promise.all(BANGKOK_EVENT_SOURCES.map(async (source) => ({
    source: source.name,
    events: await fetchPublicCalendarEvents(source),
  })));
  const events = batches.flatMap((batch) => batch.events);
  return NextResponse.json({
    status: 'success',
    city: 'Bangkok',
    total: events.length,
    sources: batches.map(({ source, events: rows }) => ({ source, count: rows.length })),
    events,
    note: 'Prototype data from public event pages; verify source terms before production use.',
  }, { headers: { 'Cache-Control': 'public, max-age=900' } });
}
