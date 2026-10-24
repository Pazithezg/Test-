import { DiscoverableItem } from '../domain/models';
import { ParsedUserIntent } from '../ai/interface';
import { TimeMatchEvaluation } from './time-matching';

export interface ScoreDetails {
  distanceScore: number;
  timeScore: number;
  categoryScore: number;
  companionScore: number;
  vibeScore: number;
  budgetScore: number;
  verificationScore: number;
  totalScore: number;
  categoryMatched: boolean;
  dateMatched: boolean;
  freeTimeMatched: boolean;
  budgetMatched: boolean;
}

export function scoreCandidate(
  item: DiscoverableItem,
  distanceKm: number | null,
  radiusKm: number,
  intent: ParsedUserIntent,
  timeEval: TimeMatchEvaluation,
  budgetTHB?: number
): ScoreDetails {
  let distanceScore = 0;
  if (distanceKm !== null) {
    if (distanceKm <= 2) {
      distanceScore = 35;
    } else if (distanceKm <= 5) {
      distanceScore = 25;
    } else if (distanceKm <= 10) {
      distanceScore = 15;
    } else if (distanceKm <= radiusKm) {
      distanceScore = 5;
    }
  }

  // Free Time / Temporal Score
  let timeScore = 0;
  if (timeEval.isHappeningNow) {
    timeScore += 40;
  } else if (timeEval.fitsFreeTime) {
    if (timeEval.overlapMinutes >= 60) {
      timeScore += 30;
    } else if (timeEval.overlapMinutes > 0) {
      timeScore += 20;
    } else {
      timeScore += 15;
    }
  }

  // Category Relevance
  let categoryScore = 0;
  let categoryMatched = false;
  const itemCats = item.categories.map((c) => c.toLowerCase());
  const itemTags = item.tags.map((t) => t.toLowerCase());

  for (const requestedCat of intent.categories) {
    const rCat = requestedCat.toLowerCase();
    if (itemCats.includes(rCat) || itemTags.includes(rCat)) {
      categoryScore += 15;
      categoryMatched = true;
    }
  }
  categoryScore = Math.min(30, categoryScore);

  // Companion & Vibe match
  let companionScore = 0;
  if (intent.companions && intent.companions !== 'any') {
    if (itemTags.includes(intent.companions.toLowerCase())) {
      companionScore = 10;
    }
  }

  let vibeScore = 0;
  for (const vibe of intent.vibeTags) {
    const v = vibe.toLowerCase();
    if (itemTags.includes(v) || item.description.toLowerCase().includes(v)) {
      vibeScore += 5;
    }
  }
  vibeScore = Math.min(10, vibeScore);

  // Budget Fit
  let budgetScore = 0;
  let budgetMatched = false;
  const isEvent = item.itemType === 'event';

  if (budgetTHB !== undefined) {
    if (isEvent) {
      if (item.isFree) {
        budgetScore = 15;
        budgetMatched = true;
      } else if (item.minPrice !== null && item.minPrice <= budgetTHB) {
        budgetScore = 10;
        budgetMatched = true;
      } else if (item.minPrice === null) {
        // Unknown price: no points, marked not strictly matched
        budgetScore = 0;
        budgetMatched = false;
      }
    } else {
      if (item.priceTier === 'free') {
        budgetScore = 15;
        budgetMatched = true;
      } else if (item.approxMinPrice !== null && item.approxMinPrice <= budgetTHB) {
        budgetScore = 10;
        budgetMatched = true;
      }
    }
  } else {
    budgetMatched = true; // No budget constraint specified
  }

  // Verification & Quality
  let verificationScore = 0;
  if (item.verificationStatus === 'verified') {
    verificationScore += 10;
  }
  if (item.isDemoFixture) {
    verificationScore -= 5;
  }

  const totalScore =
    distanceScore +
    timeScore +
    categoryScore +
    companionScore +
    vibeScore +
    budgetScore +
    verificationScore;

  return {
    distanceScore,
    timeScore,
    categoryScore,
    companionScore,
    vibeScore,
    budgetScore,
    verificationScore,
    totalScore,
    categoryMatched,
    dateMatched: timeEval.fitsFreeTime || timeEval.isHappeningNow,
    freeTimeMatched: timeEval.fitsFreeTime,
    budgetMatched,
  };
}
