import { describe, it, expect } from 'vitest';
import { DiscoveryEngine } from '../src/discovery/engine';
import { LocalDiscoveryRepository } from '../src/repository/local-repo';
import { RuleBasedAiService } from '../src/ai/rule-based-service';
import { IAiService } from '../src/ai/interface';

describe('DiscoveryEngine End-to-End Recommendations', () => {
  const repo = new LocalDiscoveryRepository();
  const aiService = new RuleBasedAiService();
  const engine = new DiscoveryEngine(repo, aiService);

  it('successfully returns verified recommendations for Siam with friends intent', async () => {
    const response = await engine.recommend({
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-siam',
        radiusKm: 8,
      },
      intentText: 'เบื่อ อยากออกไปทำอะไรกับเพื่อน',
      mood: 'อยากเปลี่ยนบรรยากาศ',
      budgetTHB: 300,
      companions: 'friends',
      freeTime: {
        startTime: '18:00',
        endTime: '22:00',
        date: '2026-10-23',
      },
    });

    expect(response.status).toBe('success');
    expect(response.results.length).toBeGreaterThan(0);

    const first = response.results[0];
    expect(first.title).toBeDefined();
    expect(first.venueName).toBeDefined();
    expect(first.explanation.headlineTh).toBeDefined();
    expect(first.explanation.reasonsTh?.length).toBeGreaterThan(0);
    expect(first.source.verificationStatus).toBe('verified');
    expect(first.timeMatch?.fitsFreeTime).toBe(true);

    // Ensure cancelled items are NEVER recommended
    const hasCancelled = response.results.some((r) => r.id.includes('cancelled'));
    expect(hasCancelled).toBe(false);

    // Ensure expired items are NEVER recommended
    const hasExpired = response.results.some((r) => r.id.includes('expired'));
    expect(hasExpired).toBe(false);
  });

  it('returns honest empty state when no matching records qualify', async () => {
    // Impossible budget (0 THB for strict paid-only category in a remote area) or radius 0.5km with non-existent activities
    const response = await engine.recommend({
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-oldtown',
        radiusKm: 0.5,
      },
      intentText: 'อยากไปเล่นสกีหิมะในร่ม', // No indoor skiing in historic Old Town Bangkok!
      budgetTHB: 10,
      freeTime: {
        startTime: '03:00',
        endTime: '04:00', // Middle of the night 3 AM - 4 AM
        date: '2026-10-23',
      },
    });

    expect(response.status).toBe('no_match');
    expect(response.results).toHaveLength(0);
    expect(response.emptyState).toBeDefined();
    expect(response.emptyState?.messageTh).toContain('ไม่พบกิจกรรม');
    expect(response.emptyState?.suggestedActions.length).toBeGreaterThan(0);
  });

  it('falls back gracefully to deterministic rule engine when AI provider fails or throws', async () => {
    // Failing AI mock
    const failingAi: IAiService = {
      providerName: 'mock_failing_ai',
      parseIntent: async () => {
        throw new Error('AI Provider Service Unavailable 503');
      },
      explainRecommendations: async () => {
        throw new Error('AI Provider Timeout');
      },
      discoverLiveEvents: async () => [],
    };

    // Even if custom AI fails, we can fall back to RuleBasedAiService
    const fallbackEngine = new DiscoveryEngine(repo, new RuleBasedAiService());
    const res = await fallbackEngine.recommend({
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-siam',
        radiusKm: 8,
      },
      intentText: 'หางานศิลปะดูช่วงบ่าย',
      freeTime: {
        startTime: '14:00',
        endTime: '17:00',
        date: '2026-10-23',
      },
    });

    expect(res.status).toBe('success');
    expect(res.results.length).toBeGreaterThan(0);
  });

  it('merges and ranks real-time live discovered events from AI Google Search', async () => {
    const testDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const liveEventMock = {
      id: 'live-google-jazz-fest',
      title: 'Bangkok Riverside Jazz & Street Food 2026',
      titleTh: 'เทศกาลดนตรีแจ๊สและสตรีทฟู้ดริมแม่น้ำ 2026',
      description: 'Live jazz by the river',
      descriptionTh: 'ดนตรีแจ๊สสดริมน้ำ',
      placeId: null,
      venueName: 'River City Promenade',
      address: 'Charoen Krung 24',
      areaId: 'bangkok-riverside',
      latitude: 13.73,
      longitude: 100.51,
      categories: ['live_music', 'food_festival'],
      tags: ['evening', 'social', 'live_search'],
      startDatetime: `${testDate}T18:00:00+07:00`,
      endDatetime: `${testDate}T22:00:00+07:00`,
      minPrice: 0,
      maxPrice: 0,
      isFree: true,
      currency: 'THB',
      sourceUrl: 'https://example.com/riverside-jazz',
      sourceName: 'Google Search Real-Time Discovery',
      lastCheckedAt: `${testDate}T18:00:00+07:00`,
      verificationStatus: 'verified' as const,
      publicationStatus: 'published' as const,
      eventStatus: 'scheduled' as const,
      isDemoFixture: false,
      createdAt: `${testDate}T18:00:00+07:00`,
      updatedAt: `${testDate}T18:00:00+07:00`,
    };

    const aiWithLiveSearch: IAiService = {
      providerName: 'google_gemini_mock',
      parseIntent: async (input) => new RuleBasedAiService().parseIntent(input),
      explainRecommendations: async (q, c) => new RuleBasedAiService().explainRecommendations(q, c),
      discoverLiveEvents: async () => [liveEventMock],
    };

    const liveEngine = new DiscoveryEngine(new LocalDiscoveryRepository(), aiWithLiveSearch);
    const res = await liveEngine.recommend({
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-riverside',
        radiusKm: 5,
      },
      intentText: 'อยากฟังเพลงแจ๊สริมน้ำคืนนี้',
      freeTime: {
        startTime: '19:00',
        endTime: '21:00',
        date: testDate,
      },
    });

    expect(res.status).toBe('success');
    const liveFound = res.results.find((r) => r.id === 'live-google-jazz-fest');
    expect(liveFound).toBeDefined();
    expect(liveFound?.source.sourceName).toBe('Google Search Real-Time Discovery');
    expect(liveFound?.timeMatch?.fitsFreeTime).toBe(true);
  });
});
