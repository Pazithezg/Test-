import { NextResponse } from 'next/server';
import { getDiscoveryRepository } from '@/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = getDiscoveryRepository();
    const areas = await repo.getAreas();

    return NextResponse.json({
      status: 'success',
      total: areas.length,
      areas: areas.map((a) => ({
        id: a.id,
        nameEn: a.nameEn,
        nameTh: a.nameTh,
        descriptionEn: a.descriptionEn,
        descriptionTh: a.descriptionTh,
        coordinates: {
          latitude: a.latitude,
          longitude: a.longitude,
        },
        radiusKmDefault: a.radiusKmDefault,
        tags: a.tags,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Failed to retrieve areas' },
      { status: 500 }
    );
  }
}
