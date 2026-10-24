import {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationResultItem,
  DiscoverableItem,
  EventItem,
  Place,
} from '../domain/models';
import { RecommendationRequestSchema } from '../domain/schemas';
import { DiscoveryRepository } from '../repository/interface';
import { IAiService, CandidateForExplanation } from '../ai/interface';
import { findBangkokAreaById } from '../geo/areas';
import { calculateDistanceKm } from '../geo/distance';
import {
  resolveFreeTimeWindow,
  evaluateEventTime,
  evaluatePlaceTime,
  getBangkokNow,
  formatBangkokDate,
  formatBangkokTime,
  TimeMatchEvaluation,
} from './time-matching';
import { scoreCandidate, ScoreDetails } from './ranking';
import { parseIntentWithFallback } from './hybrid-search';

export class DiscoveryEngine {
  constructor(
    private repository: DiscoveryRepository,
    private aiService: IAiService
  ) {}

  async recommend(rawInput: unknown): Promise<RecommendationResponse> {
    const startTimeMs = Date.now();

    // 1. Validate request
    const parseResult = RecommendationRequestSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new Error(`Validation Error: ${parseResult.error.errors.map((e) => e.message).join(', ')}`);
    }
    const input: RecommendationRequest = parseResult.data;

    // 2. Resolve Starting Point & Radius
    let centerCoords: { latitude: number; longitude: number };
    let areaNameEn = 'Bangkok';
    let areaNameTh = 'กรุงเทพฯ';
    let searchRadiusKm = input.location.radiusKm || 8;

    if (input.location.mode === 'selected_area') {
      const area = findBangkokAreaById(input.location.areaId || '');
      if (!area) {
        throw new Error(`Unknown Bangkok area ID: ${input.location.areaId}`);
      }
      centerCoords = { latitude: area.latitude, longitude: area.longitude };
      areaNameEn = area.nameEn;
      areaNameTh = area.nameTh;
      if (!input.location.radiusKm) {
        searchRadiusKm = area.radiusKmDefault;
      }
    } else {
      if (input.location.latitude == null || input.location.longitude == null) {
        throw new Error('Coordinates mode requires both latitude and longitude');
      }
      centerCoords = { latitude: input.location.latitude, longitude: input.location.longitude };
      areaNameEn = `GPS (${centerCoords.latitude.toFixed(3)}, ${centerCoords.longitude.toFixed(3)})`;
      areaNameTh = `พิกัดปัจจุบัน (${centerCoords.latitude.toFixed(3)}, ${centerCoords.longitude.toFixed(3)})`;
    }

    // 3. Resolve Free Time and Date Window
    const resolvedTime = resolveFreeTimeWindow(input.freeTime, input.dateWindow);
    const bangkokNow = getBangkokNow();
    const todayStr = formatBangkokDate(bangkokNow);
    const nowTimeStr = formatBangkokTime(bangkokNow);

    // 4. Understand intent via Hybrid AI / Rule engine
    const interpretedIntentWithProvider = await parseIntentWithFallback({
      intentText: input.intentText,
      mood: input.mood,
      activityPreferences: input.activityPreferences,
      companions: input.companions,
      budgetTHB: input.budgetTHB,
      freeTimeAvailableNow: input.freeTime?.availableNow,
    }, this.aiService);

    const interpretedIntent = interpretedIntentWithProvider;
    const actualProvider = interpretedIntentWithProvider.provider;

    // 5. Retrieve eligible candidates from Repository & Live Search Discovery
    const [eventsRes, placesRes, liveEvents] = await Promise.all([
      this.repository.getEvents({
        areaId: input.location.mode === 'selected_area' ? input.location.areaId : undefined,
        limit: 50,
      }),
      this.repository.getPlaces({
        areaId: input.location.mode === 'selected_area' ? input.location.areaId : undefined,
        limit: 50,
      }),
      this.aiService.discoverLiveEvents({
        areaName: `${areaNameTh} (${areaNameEn})`,
        areaId: input.location.mode === 'selected_area' ? (input.location.areaId || 'bangkok-siam') : 'bangkok-siam',
        areaCoordinates: centerCoords,
        intentText: input.intentText,
        dateStr: resolvedTime?.dateStr || todayStr,
        radiusKm: searchRadiusKm,
      }),
    ]);

    // Merge real-time discovered events into the pool (skipping duplicates)
    const allEvents = [...eventsRes.events];
    for (const live of liveEvents) {
      const isDup = allEvents.some(
        (e) =>
          e.title.toLowerCase() === live.title.toLowerCase() ||
          (live.sourceUrl && e.sourceUrl === live.sourceUrl)
      );
      if (!isDup) {
        allEvents.push(live);
        // Cache to repository in background
        this.repository.insertEvent(live).catch(() => {});
      }
    }

    const candidates: Array<{
      item: DiscoverableItem;
      distanceKm: number | null;
      timeEval: TimeMatchEvaluation;
      scoreDetails: ScoreDetails;
    }> = [];

    let totalEvaluated = 0;

    // 6. Filter & Score Events (Stored + Real-Time Live)
    for (const event of allEvents) {
      totalEvaluated++;

      // Strict validity rules
      if (event.publicationStatus !== 'published') continue;
      if (event.eventStatus === 'cancelled') continue;

      // Expiration check: event ended before current time or user's requested window
      const eventEndMs = new Date(event.endDatetime).getTime();
      if (eventEndMs < bangkokNow.getTime() && !event.isDemoFixture) {
        continue; // Expired event
      }

      // Distance calculation
      const dist = calculateDistanceKm(centerCoords, event);
      if (dist !== null && dist > searchRadiusKm) {
        continue; // Outside radius
      }

      // Strict budget check: if user budget set and event has known minPrice > budget
      if (input.budgetTHB !== undefined && !event.isFree && event.minPrice !== null && event.minPrice > input.budgetTHB) {
        continue;
      }

      // Free time & temporal evaluation
      const timeEval = evaluateEventTime(event, resolvedTime);
      if (resolvedTime && !timeEval.fitsFreeTime) {
        continue; // Does not happen during user's free time
      }

      // Score candidate
      const score = scoreCandidate(
        { itemType: 'event', ...event },
        dist,
        searchRadiusKm,
        interpretedIntent,
        timeEval,
        input.budgetTHB
      );

      candidates.push({
        item: { itemType: 'event', ...event },
        distanceKm: dist,
        timeEval,
        scoreDetails: score,
      });
    }

    // 7. Filter & Score Places (ongoing activities / venues)
    for (const place of placesRes.places) {
      totalEvaluated++;

      if (place.status !== 'active') continue;

      // Distance calculation
      const dist = calculateDistanceKm(centerCoords, place);
      if (dist !== null && dist > searchRadiusKm) {
        continue;
      }

      // Strict budget check
      if (input.budgetTHB !== undefined && place.priceTier !== 'free' && place.approxMinPrice !== null && place.approxMinPrice > input.budgetTHB) {
        continue;
      }

      // Opening hours & free time evaluation
      const timeEval = evaluatePlaceTime(place, resolvedTime);
      if (resolvedTime && !timeEval.fitsFreeTime) {
        continue; // Closed during user's free time
      }

      const score = scoreCandidate(
        { itemType: 'place', ...place },
        dist,
        searchRadiusKm,
        interpretedIntent,
        timeEval,
        input.budgetTHB
      );

      candidates.push({
        item: { itemType: 'place', ...place },
        distanceKm: dist,
        timeEval,
        scoreDetails: score,
      });
    }

    // 8. Handle Honest Empty Result
    if (candidates.length === 0) {
      const freeTimeMsg = input.freeTime?.availableNow
        ? 'ในขณะนี้'
        : input.freeTime?.startTime
        ? `ช่วงเวลา ${input.freeTime.startTime} - ${input.freeTime.endTime || ''}`
        : '';

      return {
        status: 'no_match',
        interpretedIntent: {
          querySummary: interpretedIntent.summary,
          querySummaryTh: interpretedIntent.summaryTh,
          detectedCategories: interpretedIntent.categories,
          detectedVibes: interpretedIntent.vibeTags,
          budgetLevel: interpretedIntent.budgetLevel,
          targetDate: resolvedTime?.dateStr || todayStr,
          freeTimeContext: interpretedIntent.freeTimeContext,
          freeTimeContextTh: interpretedIntent.freeTimeContextTh,
          targetAreaOrLocation: `${areaNameTh} (${areaNameEn})`,
        },
        totalCandidatesEvaluated: totalEvaluated,
        results: [],
        emptyState: {
          message: `ไม่พบกิจกรรมหรือสถานที่ที่ตรงกับเงื่อนไขในรัศมี ${searchRadiusKm} กม. รอบ ${areaNameTh} ${freeTimeMsg}`,
          messageTh: `ไม่พบกิจกรรมที่ยืนยันแล้วในข้อมูลปัจจุบัน สำหรับย่าน ${areaNameTh} ในงบและช่วงเวลาที่ระบุ`,
          suggestedActions: [
            'ขยายรัศมีการค้นหา (เช่น จาก 5 กม. เป็น 15-20 กม.)',
            'ปรับเปลี่ยนช่วงเวลาว่าง หรือเลือกดูวันหยุดเสาร์-อาทิตย์',
            'เลือกพื้นที่อื่นในกรุงเทพฯ เช่น สยาม, ทองหล่อ, พระนคร, หรือเจริญกรุง',
            'เพิ่มเพดานงบประมาณ หรือค้นหากิจกรรมเข้าชมฟรี',
          ],
          suggestedActionsTh: [
            'ลองเพิ่มรัศมีการค้นหาเป็น 10-20 กม.',
            'ปรับช่วงเวลาว่างให้กว้างขึ้น',
            'เปลี่ยนย่านเริ่มต้นในกรุงเทพฯ',
          ],
        },
        metadata: {
          executionTimeMs: Date.now() - startTimeMs,
          aiAssisted: actualProvider !== 'deterministic_rule_engine',
          aiProvider: actualProvider,
          dataFreshnessReference: 'Verified Bangkok Dataset (2026)',
          bangkokLocalTime: `${todayStr} ${nowTimeStr} (Asia/Bangkok)`,
        },
      };
    }

    // 9. Deterministic Ranking Sort
    candidates.sort((a, b) => b.scoreDetails.totalScore - a.scoreDetails.totalScore);

    // Take top candidates
    const limit = input.limit || 10;
    const topCandidates = candidates.slice(0, limit);

    // 10. AI Grounded Explanations
    const explanationInput: CandidateForExplanation[] = topCandidates.map((c) => ({
      item: c.item,
      distanceKm: c.distanceKm,
      matchScore: c.scoreDetails.totalScore,
      categoryMatched: c.scoreDetails.categoryMatched,
      dateMatched: c.scoreDetails.dateMatched,
      freeTimeMatched: c.scoreDetails.freeTimeMatched,
      budgetMatched: c.scoreDetails.budgetMatched,
      overlapMinutes: c.timeEval.overlapMinutes,
    }));

    const explanations = await this.aiService.explainRecommendations(
      {
        intentText: input.intentText,
        mood: input.mood,
        companions: input.companions,
        budgetTHB: input.budgetTHB,
        freeTimeAvailableNow: input.freeTime?.availableNow,
      },
      explanationInput
    );

    // 11. Format Output Results
    const results: RecommendationResultItem[] = topCandidates.map((cand) => {
      const item = cand.item;
      const isEvent = item.itemType === 'event';
      const eventItem = isEvent ? (item as EventItem) : null;
      const placeItem = !isEvent ? (item as Place) : null;

      let minPrice: number | null = null;
      let maxPrice: number | null = null;
      let isFree = false;
      let priceKnown = true;
      let priceNote: string | undefined = undefined;
      let priceNoteTh: string | undefined = undefined;

      if (isEvent && eventItem) {
        isFree = eventItem.isFree;
        minPrice = eventItem.minPrice;
        maxPrice = eventItem.maxPrice;
        if (!isFree && minPrice === null) {
          priceKnown = false;
          priceNote = 'Price unconfirmed by official source';
          priceNoteTh = 'ราคาไม่ได้รับการยืนยันอย่างเป็นทางการจากผู้จัด';
        }
      } else if (placeItem) {
        isFree = placeItem.priceTier === 'free';
        minPrice = placeItem.approxMinPrice;
        maxPrice = placeItem.approxMaxPrice;
        if (!isFree && minPrice === null) {
          priceKnown = false;
          priceNote = 'Pay-as-you-order / varies';
          priceNoteTh = 'ชำระตามรายการที่สั่ง / มีความหลากหลาย';
        }
      }

      const area = findBangkokAreaById(item.areaId);

      const lat = item.latitude;
      const lng = item.longitude;
      const mapsUrl = lat && lng ? `https://www.google.com/maps/dir/?api=1&origin=${centerCoords.latitude},${centerCoords.longitude}&destination=${lat},${lng}` : null;

      const itemTitle = isEvent && eventItem ? eventItem.title : (placeItem ? placeItem.name : '');
      const itemTitleTh = isEvent && eventItem ? (eventItem.titleTh || eventItem.title) : (placeItem ? (placeItem.nameTh || placeItem.name) : undefined);
      const itemVenueName = isEvent && eventItem ? eventItem.venueName : (placeItem ? placeItem.name : '');

      return {
        id: item.id,
        type: isEvent ? 'event' : 'place',
        title: itemTitle,
        titleTh: itemTitleTh,
        description: item.description,
        descriptionTh: item.descriptionTh,
        venueName: itemVenueName,
        address: item.address,
        areaId: item.areaId,
        areaNameTh: area?.nameTh,
        coordinates: {
          latitude: item.latitude,
          longitude: item.longitude,
        },
        distanceKm: cand.distanceKm,
        dates: isEvent && eventItem
          ? {
              startDatetime: eventItem.startDatetime,
              endDatetime: eventItem.endDatetime,
              timezone: 'Asia/Bangkok',
            }
          : undefined,
        timeMatch: {
          isHappeningNow: cand.timeEval.isHappeningNow,
          fitsFreeTime: cand.timeEval.fitsFreeTime,
          overlapMinutes: cand.timeEval.overlapMinutes,
          timeLabelTh: cand.timeEval.timeLabelTh,
          timeLabelEn: cand.timeEval.timeLabelEn,
        },
        pricing: {
          isFree,
          minPrice,
          maxPrice,
          currency: item.currency || 'THB',
          priceKnown,
          priceNote,
          priceNoteTh,
        },
        categories: item.categories,
        tags: item.tags,
        source: {
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          lastCheckedAt: item.lastCheckedAt,
          verificationStatus: item.verificationStatus,
          isDemoFixture: item.isDemoFixture,
        },
        matchScore: cand.scoreDetails.totalScore,
        explanation: explanations[item.id] || {
          headline: `Matches your search: ${itemTitle}`,
          headlineTh: `ตรงกับการค้นหา: ${itemTitleTh || itemTitle}`,
          reasons: ['Fits category and location preferences'],
          reasonsTh: ['ตรงกับความสนใจและย่านที่คุณเลือก'],
          matchHighlights: {
            categoryMatch: cand.scoreDetails.categoryMatched,
            dateMatch: cand.scoreDetails.dateMatched,
            freeTimeMatch: cand.scoreDetails.freeTimeMatched,
            budgetMatch: cand.scoreDetails.budgetMatched,
            locationMatch: cand.distanceKm !== null,
            vibeMatch: true,
          },
        },
        actionableLinks: {
          sourceUrl: item.sourceUrl,
          mapsUrl,
        },
      };
    });

    return {
      status: 'success',
      interpretedIntent: {
        querySummary: interpretedIntent.summary,
        querySummaryTh: interpretedIntent.summaryTh,
        detectedCategories: interpretedIntent.categories,
        detectedVibes: interpretedIntent.vibeTags,
        budgetLevel: interpretedIntent.budgetLevel,
        targetDate: resolvedTime?.dateStr || todayStr,
        freeTimeContext: interpretedIntent.freeTimeContext,
        freeTimeContextTh: interpretedIntent.freeTimeContextTh,
        targetAreaOrLocation: `${areaNameTh} (${areaNameEn})`,
      },
      totalCandidatesEvaluated: totalEvaluated,
      results,
      metadata: {
        executionTimeMs: Date.now() - startTimeMs,
        aiAssisted: actualProvider !== 'deterministic_rule_engine',
        aiProvider: actualProvider,
        dataFreshnessReference: 'Verified Bangkok Dataset (2026)',
        bangkokLocalTime: `${todayStr} ${nowTimeStr} (Asia/Bangkok)`,
      },
    };
  }
}
