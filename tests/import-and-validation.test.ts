import { describe, it, expect } from 'vitest';
import { EventImportItemSchema, RecommendationRequestSchema } from '../src/domain/schemas';
import { EventDataImporter } from '../src/import/importer';
import { LocalDiscoveryRepository } from '../src/repository/local-repo';

describe('Validation & Data Import Rules', () => {
  it('validates valid recommendation request', () => {
    const valid = {
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-siam',
        radiusKm: 8,
      },
      intentText: 'เบื่อ อยากออกไปทำอะไรกับเพื่อน',
      mood: 'อยากเปลี่ยนบรรยากาศ',
      activityPreferences: ['art_exhibition', 'food_festival'],
      dateWindow: {
        from: '2026-10-23',
        to: '2026-10-23',
      },
      budgetTHB: 300,
      companions: 'friends',
    };

    const res = RecommendationRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid request when intentText is empty or radius is invalid', () => {
    const invalid = {
      location: {
        mode: 'selected_area',
        areaId: 'bangkok-siam',
        radiusKm: -5, // Invalid negative radius
      },
      intentText: '', // Empty
    };

    const res = RecommendationRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects event import with malformed dates or start date after end date', () => {
    const malformed = {
      title: 'Bad Date Event',
      description: 'Test',
      venueName: 'Test Venue',
      address: 'Bangkok',
      areaId: 'bangkok-siam',
      categories: ['art_exhibition'],
      startDatetime: '2026-10-25T18:00:00+07:00',
      endDatetime: '2026-10-24T18:00:00+07:00', // End before start!
      sourceUrl: 'https://example.com/bad',
      sourceName: 'Test Source',
    };

    const res = EventImportItemSchema.safeParse(malformed);
    expect(res.success).toBe(false);
  });

  it('rejects coordinates outside Bangkok metropolitan region', () => {
    const outOfBounds = {
      title: 'Chiang Mai Event',
      description: 'Too far north',
      venueName: 'Chiang Mai Centre',
      address: 'Chiang Mai',
      areaId: 'bangkok-siam',
      latitude: 18.7883, // Chiang Mai lat (not Bangkok 13.0 - 14.5)
      longitude: 98.9853,
      categories: ['art_exhibition'],
      startDatetime: '2026-10-23T10:00:00+07:00',
      endDatetime: '2026-10-23T20:00:00+07:00',
      sourceUrl: 'https://example.com/cm',
      sourceName: 'Test',
    };

    const res = EventImportItemSchema.safeParse(outOfBounds);
    expect(res.success).toBe(false);
  });

  it('detects duplicates during import and avoids duplicate insertions', async () => {
    const repo = new LocalDiscoveryRepository([], []);
    const importer = new EventDataImporter(repo);

    const event = {
      id: 'event-dup-1',
      title: 'Bangkok Photography Exhibition',
      description: 'Photo gallery',
      venueName: 'BACC',
      address: 'Siam',
      areaId: 'bangkok-siam',
      latitude: 13.74,
      longitude: 100.53,
      categories: ['art_exhibition'],
      tags: ['photo'],
      startDatetime: '2026-10-23T10:00:00+07:00',
      endDatetime: '2026-10-23T20:00:00+07:00',
      minPrice: 0,
      maxPrice: 0,
      isFree: true,
      currency: 'THB',
      sourceUrl: 'https://bacc.or.th/photo',
      sourceName: 'BACC',
      verificationStatus: 'verified',
    };

    // First import
    const res1 = await importer.importFromJson([event]);
    expect(res1.inserted).toBe(1);
    expect(res1.skippedDuplicates).toBe(0);

    // Second import of the identical event
    const res2 = await importer.importFromJson([event]);
    expect(res2.inserted).toBe(0);
    expect(res2.skippedDuplicates).toBe(1);
  });
});
