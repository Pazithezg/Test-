export type VerificationStatus = 'verified' | 'unverified' | 'needs_review';
export type PublicationStatus = 'published' | 'draft' | 'archived';
export type EventStatus = 'scheduled' | 'rescheduled' | 'cancelled' | 'postponed';
export type PriceTier = 'free' | 'budget' | 'moderate' | 'expensive' | 'unknown';
export type CompanionType = 'solo' | 'friends' | 'couple' | 'family' | 'any';

export interface BangkokArea {
  id: string; // e.g., 'bangkok-siam'
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  latitude: number;
  longitude: number;
  radiusKmDefault: number;
  tags: string[];
}

export interface PlaceOpeningHours {
  openTime: string;  // "10:00"
  closeTime: string; // "20:00"
  daysOpen: number[]; // 0=Sunday, 1=Monday ... 6=Saturday
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  nameTh?: string;
  description: string;
  descriptionTh?: string;
  areaId: string;
  address: string;
  addressTh?: string;
  latitude: number | null;
  longitude: number | null;
  categories: string[];
  tags: string[];
  priceTier: PriceTier;
  approxMinPrice: number | null;
  approxMaxPrice: number | null;
  currency: string;
  sourceUrl: string | null;
  sourceName: string;
  lastCheckedAt: string;
  verificationStatus: VerificationStatus;
  status: 'active' | 'temporarily_closed' | 'permanently_closed';
  openingHours?: PlaceOpeningHours;
  typicalDurationMinutes?: number;
  isDemoFixture: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  placeId: string | null;
  venueName: string;
  address: string;
  addressTh?: string;
  areaId: string;
  latitude: number | null;
  longitude: number | null;
  categories: string[];
  tags: string[];
  startDatetime: string; // ISO 8601 in Asia/Bangkok
  endDatetime: string;   // ISO 8601 in Asia/Bangkok
  minPrice: number | null;
  maxPrice: number | null;
  isFree: boolean;
  currency: string;
  sourceUrl: string;
  sourceName: string;
  lastCheckedAt: string;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  eventStatus: EventStatus;
  isDemoFixture: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DiscoverableItem = 
  | ({ itemType: 'event' } & EventItem)
  | ({ itemType: 'place' } & Place);

export interface LocationQuery {
  mode: 'selected_area' | 'coordinates';
  areaId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface FreeTimeWindow {
  date?: string;            // YYYY-MM-DD
  startTime?: string;       // "14:00" or ISO string
  endTime?: string;         // "18:00" or ISO string
  durationHours?: number;   // e.g. 2, 3, 4
  availableNow?: boolean;   // Free starting right now
}

export interface RecommendationRequest {
  location: LocationQuery;
  intentText: string;
  mood?: string;
  activityPreferences?: string[];
  freeTime?: FreeTimeWindow;
  dateWindow?: {
    from: string; // YYYY-MM-DD or ISO
    to: string;   // YYYY-MM-DD or ISO
  };
  budgetTHB?: number;
  companions?: CompanionType | string;
  limit?: number;
}

export interface RecommendationExplanation {
  headline: string;
  headlineTh?: string;
  reasons: string[];
  reasonsTh?: string[];
  matchHighlights: {
    categoryMatch: boolean;
    dateMatch: boolean;
    freeTimeMatch: boolean;
    budgetMatch: boolean;
    locationMatch: boolean;
    vibeMatch: boolean;
  };
}

export interface RecommendationResultItem {
  id: string;
  type: 'event' | 'place';
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  venueName: string;
  address: string;
  areaId: string;
  areaNameTh?: string;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  distanceKm: number | null;
  dates?: {
    startDatetime: string;
    endDatetime: string;
    timezone: string;
  };
  timeMatch?: {
    isHappeningNow: boolean;
    fitsFreeTime: boolean;
    overlapMinutes: number;
    timeLabelTh: string;
    timeLabelEn: string;
  };
  pricing: {
    isFree: boolean;
    minPrice: number | null;
    maxPrice: number | null;
    currency: string;
    priceKnown: boolean;
    priceNote?: string;
    priceNoteTh?: string;
  };
  categories: string[];
  tags: string[];
  source: {
    sourceUrl: string | null;
    sourceName: string;
    lastCheckedAt: string;
    verificationStatus: VerificationStatus;
    isDemoFixture: boolean;
  };
  matchScore: number;
  explanation: RecommendationExplanation;
  actionableLinks?: {
    sourceUrl?: string | null;
    mapsUrl?: string | null;
  };
}

export interface RecommendationResponse {
  status: 'success' | 'no_match' | 'error';
  interpretedIntent: {
    querySummary: string;
    querySummaryTh?: string;
    detectedCategories: string[];
    detectedVibes: string[];
    budgetLevel?: string;
    targetDate: string;
    freeTimeContext?: string;
    freeTimeContextTh?: string;
    targetAreaOrLocation: string;
  };
  totalCandidatesEvaluated: number;
  results: RecommendationResultItem[];
  emptyState?: {
    message: string;
    messageTh?: string;
    suggestedActions: string[];
    suggestedActionsTh?: string[];
  };
  metadata: {
    executionTimeMs: number;
    aiAssisted: boolean;
    aiProvider: string;
    dataFreshnessReference: string;
    bangkokLocalTime: string;
  };
}

export interface FeedbackSubmission {
  id?: string;
  recommendationId?: string;
  itemId: string;
  feedbackType: 'useful' | 'not_relevant' | 'dismissed' | 'visited';
  comment?: string;
  createdAt: string;
}
