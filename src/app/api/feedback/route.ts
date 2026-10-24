import { NextRequest, NextResponse } from 'next/server';
import { getDiscoveryRepository } from '@/repository';
import { FeedbackSubmissionSchema } from '@/domain/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: 'Feedback endpoint accepts POST requests',
    exampleBody: {
      itemId: 'event-bacc-contemporary-art',
      feedbackType: 'useful',
      comment: 'ชอบมาก แนะนำดีมาก',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FeedbackSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid feedback submission',
          errors: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const repo = getDiscoveryRepository();
    await repo.saveFeedback({
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      status: 'success',
      message: 'Feedback received successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
