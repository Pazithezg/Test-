import {
  IAiService,
  IntentParseInput,
  ParsedUserIntent,
  CandidateForExplanation,
  LiveEventQuery,
} from './interface';
import { RecommendationExplanation, EventItem } from '../domain/models';
import { RuleBasedAiService } from './rule-based-service';

export class GeminiAiService implements IAiService {
  readonly providerName = 'google_gemini';
  private apiKey: string;
  private modelName: string;
  private fallbackService: RuleBasedAiService;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    this.fallbackService = new RuleBasedAiService();
    console.log(`[GeminiAiService] Initialized with model: ${this.modelName}`);
  }

  async parseIntent(input: IntentParseInput): Promise<ParsedUserIntent> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const prompt = `
You are an expert location-aware activity planner for Bangkok, Thailand.
Analyze this user query:
Text: "${input.intentText}"
Mood: "${input.mood || 'none'}"
Companions: "${input.companions || 'unspecified'}"
Budget: ${input.budgetTHB ? `${input.budgetTHB} THB` : 'unspecified'}
Free time available now: ${input.freeTimeAvailableNow ? 'Yes' : 'No'}

Extract intent strictly into this JSON format:
{
  "summary": "Brief English summary of what the user wants to do",
  "summaryTh": "สรุปสั้นๆ เป็นภาษาไทยว่าผู้ใช้ต้องการทำอะไรและอยากได้บรรยากาศแบบไหน",
  "categories": ["relevant category tags from: art_exhibition, live_music, workshop, market, food_festival, sightseeing, cafe_hopping, creative, culture"],
  "vibeTags": ["e.g. chill, lively, inspiring, romantic, social"],
  "budgetLevel": "free" | "low" | "moderate" | "high",
  "freeTimeContext": "English context of time window",
  "freeTimeContextTh": "บริบทเวลาว่างภาษาไทย",
  "companions": "solo" | "friends" | "couple" | "family" | "any"
}
Return ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return this.fallbackService.parseIntent(input);
      }

      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || input.intentText,
        summaryTh: parsed.summaryTh || input.intentText,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : ['creative', 'sightseeing'],
        vibeTags: Array.isArray(parsed.vibeTags) ? parsed.vibeTags : ['leisure'],
        budgetLevel: parsed.budgetLevel || 'moderate',
        freeTimeContext: parsed.freeTimeContext,
        freeTimeContextTh: parsed.freeTimeContextTh,
        companions: parsed.companions || input.companions || 'any',
      };
    } catch (err) {
      console.warn('Gemini intent parsing failed, falling back to deterministic rule engine:', err instanceof Error ? err.message : err);
      return this.fallbackService.parseIntent(input);
    }
  }

  async explainRecommendations(
    userQuery: IntentParseInput,
    candidates: CandidateForExplanation[]
  ): Promise<Record<string, RecommendationExplanation>> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const facts = candidates.map((c) => {
        const item = c.item;
        const isEvent = item.itemType === 'event';
        const title = isEvent ? item.title : item.name;
        const titleTh = isEvent ? item.titleTh : item.nameTh;
        const venue = isEvent ? item.venueName : item.address;
        const price = isEvent
          ? (item.isFree ? 'Free' : item.minPrice !== null ? `${item.minPrice} THB` : 'Unknown')
          : item.priceTier;

        return {
          id: item.id,
          title,
          titleTh,
          venue,
          categories: item.categories,
          tags: item.tags,
          distanceKm: c.distanceKm,
          price,
          overlapMinutes: c.overlapMinutes,
        };
      });

      const prompt = `
You are an expert recommendation explainer for Bangkok activities.
Explain why each candidate matches the user's request.
CRITICAL RULES:
1. Grounding: Rely ONLY on the provided candidate facts below. NEVER invent facts, opening hours, or prices.
2. Provide both English and Thai explanations.
3. For each candidate, provide:
   - headline (English)
   - headlineTh (ภาษาไทย)
   - reasons (Array of strings in English)
   - reasonsTh (Array of strings in Thai explaining the match with free time, distance, price, and category)

User request:
Intent: "${userQuery.intentText}"
Mood: "${userQuery.mood || ''}"
Budget: ${userQuery.budgetTHB ? `${userQuery.budgetTHB} THB` : 'Flexible'}
Companions: "${userQuery.companions || 'Any'}"

Candidate facts:
${JSON.stringify(facts, null, 2)}

Return a JSON object where keys are candidate IDs and values match:
{
  "[id]": {
    "headline": "...",
    "headlineTh": "...",
    "reasons": ["..."],
    "reasonsTh": ["..."]
  }
}
Return ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return this.fallbackService.explainRecommendations(userQuery, candidates);
      }

      const parsed = JSON.parse(text);
      const result: Record<string, RecommendationExplanation> = {};

      for (const cand of candidates) {
        const p = parsed[cand.item.id];
        if (p && p.headline && p.reasons) {
          result[cand.item.id] = {
            headline: p.headline,
            headlineTh: p.headlineTh || p.headline,
            reasons: p.reasons,
            reasonsTh: p.reasonsTh || p.reasons,
            matchHighlights: {
              categoryMatch: cand.categoryMatched,
              dateMatch: cand.dateMatched,
              freeTimeMatch: cand.freeTimeMatched,
              budgetMatch: cand.budgetMatched,
              locationMatch: cand.distanceKm !== null,
              vibeMatch: true,
            },
          };
        }
      }

      // Fill any missing with fallback
      const fallbackExps = await this.fallbackService.explainRecommendations(userQuery, candidates);
      for (const cand of candidates) {
        if (!result[cand.item.id]) {
          result[cand.item.id] = fallbackExps[cand.item.id];
        }
      }

      return result;
    } catch (err) {
      console.warn('Gemini explanation generation failed, falling back to deterministic rule engine:', err instanceof Error ? err.message : err);
      return this.fallbackService.explainRecommendations(userQuery, candidates);
    }
  }

  async discoverLiveEvents(query: LiveEventQuery): Promise<EventItem[]> {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const searchPrompt = `
Search Google in real time for currently happening or upcoming public events, art exhibitions, concerts, food fairs, night markets, or cultural activities in Bangkok, Thailand.
Area focus: ${query.areaName} (within ${query.radiusKm} km)
User activity interest: "${query.intentText}"
Date reference: ${query.dateStr}

CRITICAL RULES:
1. Use the googleSearch tool to find actual real-world Bangkok events happening around ${query.dateStr}.
2. Extract verified details. Do not invent events.
3. Return ONLY a valid JSON array of event objects matching this schema:
[
  {
    "id": "live-bkk-...",
    "title": "Official English or Thai event title",
    "titleTh": "ชื่ออีเวนต์ภาษาไทย",
    "description": "Event description in English",
    "descriptionTh": "คำอธิบายอีเวนต์ภาษาไทย",
    "venueName": "Name of venue (e.g. BACC, EmQuartier, River City)",
    "address": "Address or landmark in Bangkok",
    "addressTh": "ที่อยู่หรือจุดสังเกต",
    "latitude": 13.74,
    "longitude": 100.53,
    "categories": ["art_exhibition", "live_music", "market", "food_festival", "workshop", "sightseeing"],
    "tags": ["social", "chill", "indoor", "outdoor"],
    "startDatetime": "ISO datetime e.g. 2026-10-23T18:00:00+07:00",
    "endDatetime": "ISO datetime e.g. 2026-10-23T22:00:00+07:00",
    "minPrice": 0,
    "maxPrice": 0,
    "isFree": true,
    "sourceUrl": "Direct URL found via Google Search"
  }
]
If no verified events are found, return [].
`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (!text) return [];

      let jsonStr = text;
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = text.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) return [];

      const nowIso = new Date().toISOString();
      const events: EventItem[] = [];

      for (const item of parsed) {
        if (!item.title || !item.venueName || !item.startDatetime) continue;

        events.push({
          id: item.id || `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: item.title,
          titleTh: item.titleTh || item.title,
          description: item.description || item.title,
          descriptionTh: item.descriptionTh || item.description || item.title,
          placeId: null,
          venueName: item.venueName,
          address: item.address || query.areaName,
          addressTh: item.addressTh || query.areaName,
          areaId: query.areaId,
          latitude: typeof item.latitude === 'number' ? item.latitude : query.areaCoordinates.latitude,
          longitude: typeof item.longitude === 'number' ? item.longitude : query.areaCoordinates.longitude,
          categories: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories : ['creative', 'sightseeing'],
          tags: Array.isArray(item.tags) ? item.tags : ['live_search'],
          startDatetime: item.startDatetime,
          endDatetime: item.endDatetime || item.startDatetime,
          minPrice: typeof item.minPrice === 'number' ? item.minPrice : null,
          maxPrice: typeof item.maxPrice === 'number' ? item.maxPrice : null,
          isFree: item.isFree === true || item.minPrice === 0,
          currency: 'THB',
          sourceUrl: item.sourceUrl || 'https://www.google.com',
          sourceName: 'Google Search Real-Time Discovery',
          lastCheckedAt: nowIso,
          verificationStatus: 'verified',
          publicationStatus: 'published',
          eventStatus: 'scheduled',
          isDemoFixture: false,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      return events;
    } catch (err) {
      console.warn('Real-time Google Search live event discovery skipped or limited:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
