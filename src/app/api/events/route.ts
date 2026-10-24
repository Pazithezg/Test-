import { NextRequest, NextResponse } from 'next/server';
import { getDiscoveryRepository } from '@/repository';
import { EventFilterSchema } from '@/domain/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawFilter: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      rawFilter[key] = value;
    });

    const parsedFilter = EventFilterSchema.safeParse(rawFilter);
    if (!parsedFilter.success) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid filter parameters',
          errors: parsedFilter.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const repo = getDiscoveryRepository();
    const { events, total } = await repo.getEvents(parsedFilter.data);

    return NextResponse.json({
      status: 'success',
      total,
      limit: parsedFilter.data.limit,
      offset: parsedFilter.data.offset,
      events,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
