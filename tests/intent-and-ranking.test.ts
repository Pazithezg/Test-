import { describe, it, expect } from 'vitest';
import { RuleBasedAiService } from '../src/ai/rule-based-service';
import { scoreCandidate } from '../src/discovery/ranking';
import { EventItem, Place } from '../src/domain/models';

describe('Intent Parsing & Recommendation Ranking Engine', () => {
  const aiService = new RuleBasedAiService();

  it('correctly interprets Thai user intent and extracts categories, vibes, and budget', async () => {
    const intent = await aiService.parseIntent({
      intentText: 'วันนี้เบื่อ อยากออกไปดูนิทรรศการศิลปะกับเพื่อน งบ 300 บาท',
      mood: 'อยากเปลี่ยนบรรยากาศ',
      companions: 'friends',
      budgetTHB: 300,
    });

    expect(intent.categories).toContain('art_exhibition');
    expect(intent.companions).toBe('friends');
    expect(intent.vibeTags).toContain('social');
    expect(intent.budgetLevel).toBe('low');
    expect(intent.summaryTh).toContain('ไปกับเพื่อน');
  });

  it('produces deterministic ranking scores', () => {
    const event: EventItem = {
      id: 'event-art',
      title: 'Art Exhibition',
      description: 'Gallery show',
      placeId: null,
      venueName: 'BACC',
      address: 'Siam',
      areaId: 'bangkok-siam',
      latitude: 13.74,
      longitude: 100.53,
      categories: ['art_exhibition', 'creative'],
      tags: ['friends', 'indoor'],
      startDatetime: '2026-10-23T10:00:00+07:00',
      endDatetime: '2026-10-23T20:00:00+07:00',
      minPrice: 0,
      maxPrice: 0,
      isFree: true,
      currency: 'THB',
      sourceUrl: 'https://bacc.or.th',
      sourceName: 'BACC',
      lastCheckedAt: '2026-10-20T00:00:00+07:00',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      eventStatus: 'scheduled',
      isDemoFixture: false,
      createdAt: '2026-10-01T00:00:00+07:00',
      updatedAt: '2026-10-01T00:00:00+07:00',
    };

    const parsedIntent = {
      summary: 'Art with friends',
      summaryTh: 'ศิลปะกับเพื่อน',
      categories: ['art_exhibition'],
      vibeTags: ['creative'],
      companions: 'friends',
    };

    const timeEval = {
      isHappeningNow: true,
      fitsFreeTime: true,
      overlapMinutes: 120,
      timeLabelTh: 'กำลังจัดอยู่',
      timeLabelEn: 'Happening now',
    };

    // Calculate score twice to prove determinism
    const score1 = scoreCandidate({ itemType: 'event', ...event }, 1.5, 5, parsedIntent, timeEval, 500);
    const score2 = scoreCandidate({ itemType: 'event', ...event }, 1.5, 5, parsedIntent, timeEval, 500);

    expect(score1.totalScore).toBe(score2.totalScore);
    expect(score1.categoryMatched).toBe(true);
    expect(score1.budgetMatched).toBe(true);
    expect(score1.distanceScore).toBe(35); // <= 2km
    expect(score1.timeScore).toBe(40);     // Happening now
    expect(score1.verificationScore).toBe(10); // Verified
  });

  it('marks unknown prices as not budgetMatched when strict budget filtering is evaluated', () => {
    const unknownPriceEvent: EventItem = {
      id: 'event-unknown-price',
      title: 'Secret Music Night',
      description: 'Exclusive show',
      placeId: null,
      venueName: 'Club X',
      address: 'Sukhumvit',
      areaId: 'bangkok-sukhumvit',
      latitude: 13.72,
      longitude: 100.58,
      categories: ['live_music'],
      tags: ['night'],
      startDatetime: '2026-10-23T20:00:00+07:00',
      endDatetime: '2026-10-23T23:00:00+07:00',
      minPrice: null, // Unknown!
      maxPrice: null,
      isFree: false,
      currency: 'THB',
      sourceUrl: 'https://example.com',
      sourceName: 'Secret',
      lastCheckedAt: '2026-10-20T00:00:00+07:00',
      verificationStatus: 'unverified',
      publicationStatus: 'published',
      eventStatus: 'scheduled',
      isDemoFixture: false,
      createdAt: '2026-10-01T00:00:00+07:00',
      updatedAt: '2026-10-01T00:00:00+07:00',
    };

    const intent = {
      summary: 'Music',
      summaryTh: 'ดนตรี',
      categories: ['live_music'],
      vibeTags: [],
      companions: 'solo',
    };

    const timeEval = {
      isHappeningNow: false,
      fitsFreeTime: true,
      overlapMinutes: 60,
      timeLabelTh: 'ตรงกับเวลาว่าง',
      timeLabelEn: 'Fits time',
    };

    const score = scoreCandidate(
      { itemType: 'event', ...unknownPriceEvent },
      2.0,
      5,
      intent,
      timeEval,
      300 // User budget 300 THB
    );

    // Rule: Never treat unknown prices as 0
    expect(score.budgetScore).toBe(0);
    expect(score.budgetMatched).toBe(false);
  });
});
