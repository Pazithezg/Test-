import { NextResponse } from 'next/server';
import { getDiscoveryRepository } from '@/repository';
import { getAiService } from '@/ai';
import { getBangkokNow, formatBangkokDate, formatBangkokTime } from '@/discovery/time-matching';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const repo = getDiscoveryRepository();
  const aiService = getAiService();

  const repoHealth = await repo.checkHealth();
  const now = getBangkokNow();

  const response = {
    status: 'healthy',
    timestamp: now.toISOString(),
    bangkokLocalTime: `${formatBangkokDate(now)} ${formatBangkokTime(now)} (Asia/Bangkok)`,
    services: {
      repository: {
        status: repoHealth.databaseConnected ? 'up' : 'degraded',
        storageMode: repoHealth.isFallbackStore ? 'local_resilient_store' : 'supabase_postgres',
        stats: {
          placesLoaded: repoHealth.totalPlaces,
          eventsLoaded: repoHealth.totalEvents,
        },
      },
      aiProvider: {
        activeProvider: aiService.providerName,
        status: 'up',
      },
    },
    latencyMs: Date.now() - startTime,
    version: '1.0.0',
  };

  return NextResponse.json(response);
}
