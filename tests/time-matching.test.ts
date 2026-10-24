import { describe, it, expect } from 'vitest';
import {
  resolveFreeTimeWindow,
  evaluateEventTime,
  evaluatePlaceTime,
  formatBangkokDate,
  formatBangkokTime,
} from '../src/discovery/time-matching';
import { EventItem, Place } from '../src/domain/models';

describe('Time Window & Free Time Matching Engine', () => {
  it('formats dates and times consistently in Asia/Bangkok (+07:00)', () => {
    // 2026-10-23T11:00:00Z = 2026-10-23 18:00:00 in UTC+7
    const utcDate = new Date('2026-10-23T11:00:00Z');
    expect(formatBangkokDate(utcDate)).toBe('2026-10-23');
    expect(formatBangkokTime(utcDate)).toBe('18:00');
  });

  it('resolves availableNow free time window from current moment', () => {
    const window = resolveFreeTimeWindow({ availableNow: true, durationHours: 2 });
    expect(window).not.toBeNull();
    expect(window?.isAvailableNow).toBe(true);
    expect(window?.endMs! - window?.startMs!).toBe(2 * 60 * 60 * 1000);
  });

  it('evaluates event overlap when event falls within user free time', () => {
    const event: EventItem = {
      id: 'test-event-1',
      title: 'Acoustic Sunset',
      description: 'Music event',
      placeId: null,
      venueName: 'The Commons',
      address: 'Thong Lo',
      areaId: 'bangkok-sukhumvit',
      latitude: 13.73,
      longitude: 100.58,
      categories: ['live_music'],
      tags: ['chill'],
      startDatetime: '2026-10-23T18:00:00+07:00',
      endDatetime: '2026-10-23T21:00:00+07:00',
      minPrice: 0,
      maxPrice: 0,
      isFree: true,
      currency: 'THB',
      sourceUrl: 'https://example.com',
      sourceName: 'Official',
      lastCheckedAt: '2026-10-20T00:00:00+07:00',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      eventStatus: 'scheduled',
      isDemoFixture: false,
      createdAt: '2026-10-01T00:00:00+07:00',
      updatedAt: '2026-10-01T00:00:00+07:00',
    };

    // User is free from 19:00 to 22:00 (overlap from 19:00 to 21:00 = 120 minutes)
    const freeWindow = resolveFreeTimeWindow({
      startTime: '19:00',
      endTime: '22:00',
      date: '2026-10-23',
    });

    const evalResult = evaluateEventTime(event, freeWindow);
    expect(evalResult.fitsFreeTime).toBe(true);
    expect(evalResult.overlapMinutes).toBe(120);
    expect(evalResult.timeLabelTh).toContain('ตรงกับเวลาว่าง 120 นาที');
  });

  it('rejects events that end before user free time begins', () => {
    const event: EventItem = {
      id: 'morning-event',
      title: 'Morning Yoga',
      description: 'Morning session',
      placeId: null,
      venueName: 'Lumpini Park',
      address: 'Rama IV',
      areaId: 'bangkok-siam',
      latitude: 13.73,
      longitude: 100.53,
      categories: ['workshop'],
      tags: ['morning'],
      startDatetime: '2026-10-23T07:00:00+07:00',
      endDatetime: '2026-10-23T09:00:00+07:00', // Ended at 09:00
      minPrice: 0,
      maxPrice: 0,
      isFree: true,
      currency: 'THB',
      sourceUrl: 'https://example.com',
      sourceName: 'Official',
      lastCheckedAt: '2026-10-20T00:00:00+07:00',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      eventStatus: 'scheduled',
      isDemoFixture: false,
      createdAt: '2026-10-01T00:00:00+07:00',
      updatedAt: '2026-10-01T00:00:00+07:00',
    };

    // User is free in the evening 18:00 - 21:00
    const eveningFreeWindow = resolveFreeTimeWindow({
      startTime: '18:00',
      endTime: '21:00',
      date: '2026-10-23',
    });

    const evalResult = evaluateEventTime(event, eveningFreeWindow);
    expect(evalResult.fitsFreeTime).toBe(false);
    expect(evalResult.overlapMinutes).toBe(0);
    expect(evalResult.timeLabelTh).toContain('หมดเวลาจัดก่อนช่วงที่คุณว่าง');
  });

  it('evaluates place opening hours against user free time', () => {
    const bacc: Place = {
      id: 'place-bacc',
      name: 'BACC',
      description: 'Art center',
      areaId: 'bangkok-siam',
      address: 'Rama I',
      latitude: 13.74,
      longitude: 100.53,
      categories: ['art_exhibition'],
      tags: ['gallery'],
      priceTier: 'free',
      approxMinPrice: 0,
      approxMaxPrice: 0,
      currency: 'THB',
      sourceUrl: 'https://bacc.or.th',
      sourceName: 'BACC',
      lastCheckedAt: '2026-10-20T00:00:00+07:00',
      verificationStatus: 'verified',
      status: 'active',
      openingHours: {
        openTime: '10:00',
        closeTime: '20:00',
        daysOpen: [0, 1, 2, 3, 4, 5, 6],
      },
      isDemoFixture: false,
      createdAt: '2026-10-01T00:00:00+07:00',
      updatedAt: '2026-10-01T00:00:00+07:00',
    };

    // Free time 14:00 - 17:00 (Open)
    const afternoon = resolveFreeTimeWindow({
      startTime: '14:00',
      endTime: '17:00',
      date: '2026-10-23',
    });
    const evalOpen = evaluatePlaceTime(bacc, afternoon);
    expect(evalOpen.fitsFreeTime).toBe(true);
    expect(evalOpen.overlapMinutes).toBe(180);

    // Free time 21:00 - 23:00 (BACC closes at 20:00 -> Closed!)
    const lateNight = resolveFreeTimeWindow({
      startTime: '21:00',
      endTime: '23:00',
      date: '2026-10-23',
    });
    const evalClosed = evaluatePlaceTime(bacc, lateNight);
    expect(evalClosed.fitsFreeTime).toBe(false);
    expect(evalClosed.timeLabelTh).toContain('สถานที่ปิดในช่วงเวลาที่คุณว่าง');
  });
});
