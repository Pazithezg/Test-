import { NextRequest, NextResponse } from 'next/server';
import { getDiscoveryRepository } from '@/repository';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Item ID is required' },
        { status: 400 }
      );
    }

    const repo = getDiscoveryRepository();
    const item = await repo.getItemById(id);

    if (!item) {
      return NextResponse.json(
        { status: 'error', message: `Item with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      item,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
