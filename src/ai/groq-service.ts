import {
  IAiService,
  IntentParseInput,
  ParsedUserIntent,
  CandidateForExplanation,
  LiveEventQuery,
} from './interface';
import { RecommendationExplanation, EventItem } from '../domain/models';
import { RuleBasedAiService } from './rule-based-service';

export class GroqAiService implements IAiService {
  readonly providerName = 'groq_ai';
  private apiKey: string;
  private modelName: string;
  private searchModelName: string;
  private fallbackService: RuleBasedAiService;
  private unavailableUntil = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Keep routine calls cheap; reserve the GPT-OSS model for browser search.
    this.modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    this.searchModelName = process.env.GROQ_SEARCH_MODEL || 'openai/gpt-oss-20b';
    this.fallbackService = new RuleBasedAiService();
    console.log(`[GroqAiService] Initialized with model: ${this.modelName}`);
  }

  private async callGroqChat(
    messages: Array<{ role: string; content: string }>,
    jsonMode = true,
    browserSearch = false,
    model = this.modelName
  ): Promise<string | null> {
    if (Date.now() < this.unavailableUntil) return null;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: browserSearch ? this.searchModelName : model,
        messages,
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        ...(browserSearch ? { tools: [{ type: 'browser_search' }] } : {}),
        ...(browserSearch ? { tool_choice: 'required' } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) {
        const retryMatch = errText.match(/try again in (?:(\d+)m)?([\d.]+)s/i);
        const retryMs = retryMatch
          ? Math.max(60_000, ((Number(retryMatch[1] || 0) * 60) + Number(retryMatch[2])) * 1000)
          : 60_000;
        this.unavailableUntil = Date.now() + retryMs;
      }
      throw new Error(`Groq API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  }

  async parseIntent(input: IntentParseInput): Promise<ParsedUserIntent> {
    try {
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

      const text = await this.callGroqChat([
        { role: 'system', content: 'You are an accurate JSON-only assistant for Bangkok travel intent extraction.' },
        { role: 'user', content: prompt },
      ]);

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
      console.warn('Groq intent parsing failed, falling back to deterministic rule engine:', err instanceof Error ? err.message : err);
      return this.fallbackService.parseIntent(input);
    }
  }

  async explainRecommendations(
    userQuery: IntentParseInput,
    candidates: CandidateForExplanation[]
  ): Promise<Record<string, RecommendationExplanation>> {
    try {
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

      const text = await this.callGroqChat([
        { role: 'system', content: 'You are an accurate recommendation assistant that outputs strictly valid JSON grounded on given candidate facts.' },
        { role: 'user', content: prompt },
      ]);

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
      console.warn('Groq explanation generation failed, falling back to deterministic rule engine:', err instanceof Error ? err.message : err);
      return this.fallbackService.explainRecommendations(userQuery, candidates);
    }
  }

  async discoverLiveEvents(query: LiveEventQuery): Promise<EventItem[]> {
    try {
      const prompt = `Search the public web for real, currently happening or upcoming events in ${query.areaName}, Bangkok, within ${query.radiusKm} km, related to: "${query.intentText}". Date: ${query.dateStr}.

Use browser search. Prefer official venue, organizer, Google event, and public Facebook event pages. Do not invent details. Return ONLY a JSON array. Include only events with a verifiable source URL, venue, and start date. Schema:
[{"title":"","titleTh":"","description":"","descriptionTh":"","venueName":"","address":"","addressTh":"","latitude":${query.areaCoordinates.latitude},"longitude":${query.areaCoordinates.longitude},"categories":[],"tags":[],"startDatetime":"ISO-8601 with +07:00","endDatetime":"ISO-8601 with +07:00","minPrice":null,"maxPrice":null,"isFree":false,"sourceUrl":"direct public source URL"}]
If nothing is verified, return [].`;

      const text = await this.callGroqChat([
        { role: 'system', content: 'You are a real-time event discovery agent. Search first, cite direct public sources, and output valid JSON only.' },
        { role: 'user', content: prompt },
      ], false, true, this.searchModelName);
      if (!text) return [];

      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      const parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
      if (!Array.isArray(parsed)) return [];

      const now = new Date().toISOString();
      return parsed.filter((item: any) => item?.title && item?.venueName && item?.startDatetime && item?.sourceUrl).map((item: any) => ({
        id: item.id || `live-groq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title,
        titleTh: item.titleTh || item.title,
        description: item.description || item.title,
        descriptionTh: item.descriptionTh || item.description || item.title,
        placeId: null,
        venueName: item.venueName,
        address: item.address || query.areaName,
        addressTh: item.addressTh || item.address || query.areaName,
        areaId: query.areaId,
        latitude: typeof item.latitude === 'number' ? item.latitude : query.areaCoordinates.latitude,
        longitude: typeof item.longitude === 'number' ? item.longitude : query.areaCoordinates.longitude,
        categories: Array.isArray(item.categories) ? item.categories : ['sightseeing'],
        tags: Array.isArray(item.tags) ? item.tags : ['live_search'],
        startDatetime: item.startDatetime,
        endDatetime: item.endDatetime || item.startDatetime,
        minPrice: typeof item.minPrice === 'number' ? item.minPrice : null,
        maxPrice: typeof item.maxPrice === 'number' ? item.maxPrice : null,
        isFree: item.isFree === true || item.minPrice === 0,
        currency: 'THB',
        sourceUrl: item.sourceUrl,
        sourceName: 'Groq Browser Search',
        lastCheckedAt: now,
        verificationStatus: 'verified',
        publicationStatus: 'published',
        eventStatus: 'scheduled',
        isDemoFixture: false,
        createdAt: now,
        updatedAt: now,
      }));
    } catch (err) {
      console.warn('Groq browser search live event discovery failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
