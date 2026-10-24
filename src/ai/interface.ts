import { DiscoverableItem, RecommendationExplanation, EventItem } from '../domain/models';

export interface ParsedUserIntent {
  summary: string;
  summaryTh: string;
  categories: string[];
  vibeTags: string[];
  budgetLevel?: 'free' | 'low' | 'moderate' | 'high';
  freeTimeContext?: string;
  freeTimeContextTh?: string;
  companions?: string;
}

export interface IntentParseInput {
  intentText: string;
  mood?: string;
  activityPreferences?: string[];
  companions?: string;
  budgetTHB?: number;
  freeTimeAvailableNow?: boolean;
}

export interface CandidateForExplanation {
  item: DiscoverableItem;
  distanceKm: number | null;
  matchScore: number;
  categoryMatched: boolean;
  dateMatched: boolean;
  freeTimeMatched: boolean;
  budgetMatched: boolean;
  overlapMinutes?: number;
}

export interface LiveEventQuery {
  areaName: string;
  areaId: string;
  areaCoordinates: { latitude: number; longitude: number };
  intentText: string;
  dateStr: string;
  radiusKm: number;
}

export interface IAiService {
  readonly providerName: string;

  parseIntent(input: IntentParseInput): Promise<ParsedUserIntent>;

  explainRecommendations(
    userQuery: IntentParseInput,
    candidates: CandidateForExplanation[]
  ): Promise<Record<string, RecommendationExplanation>>;

  discoverLiveEvents(query: LiveEventQuery): Promise<EventItem[]>;
}
