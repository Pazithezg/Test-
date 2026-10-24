/**
 * Search Engine - Match natural language queries to places
 * 
 * Flow:
 * 1. Parse query → extract activities/keywords
 * 2. Map activities → place categories  
 * 3. Search indexed places
 * 4. Rank and return results
 */

import { activityDictionary, type Activity } from './activity-dictionary';
import { getPlaceIndex, type IndexedPlace } from './place-index';
import { detectMood, getCategoriesFromMood } from './mood-detector';

export interface SearchQuery {
  text: string;
  language?: 'th' | 'en' | 'auto';
  mood?: string; // Mood ID
}

export interface SearchResult {
  place: IndexedPlace;
  score: number;
  matchReasons: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  query: {
    original: string;
    detectedActivities: Activity[];
    detectedKeywords: string[];
    detectedMood?: string;
    searchedCategories: string[];
  };
  stats: {
    totalMatches: number;
    searchTimeMs: number;
  };
}

export class SearchEngine {
  /**
   * Main search method
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    // Detect language
    const requestedLanguage = query.language || 'auto';
    const language: 'th' | 'en' = requestedLanguage === 'auto'
      ? this.detectLanguage(query.text)
      : requestedLanguage;
    
    // Detect mood from text if not provided
    const detectedMoods = detectMood(query.text);
    const primaryMood = query.mood || (detectedMoods.length > 0 ? detectedMoods[0].id : undefined);
    
    // Extract activities and keywords
    const { activities, keywords } = this.parseQuery(query.text, language);
    
    // Map to place categories
    let categories = this.mapToCategories(activities);
    
    // Add categories from mood if detected
    if (primaryMood) {
      const moodCategories = getCategoriesFromMood(primaryMood);
      categories = [...new Set([...categories, ...moodCategories])];
    }
    
    // Get place index
    const placeIndex = await getPlaceIndex();
    
    // Search places
    let candidates: IndexedPlace[] = [];
    
    // Search by categories first (if activities detected)
    if (categories.length > 0) {
      candidates = placeIndex.searchByCategories(categories);
    }
    
    // Search by keywords (if no activities or to supplement)
    if (keywords.length > 0) {
      const keywordMatches = placeIndex.searchByNamePatterns(keywords);
      
      // Merge with candidates
      const candidateIds = new Set(candidates.map(p => p.id));
      for (const match of keywordMatches) {
        if (!candidateIds.has(match.id)) {
          candidates.push(match);
        }
      }
    }
    
    // If nothing found, return empty
    if (candidates.length === 0) {
      return {
        results: [],
        query: {
          original: query.text,
          detectedActivities: activities,
          detectedKeywords: keywords,
          searchedCategories: categories,
        },
        stats: {
          totalMatches: 0,
          searchTimeMs: Date.now() - startTime,
        },
      };
    }
    
    // Score and rank results
    const scoredResults = this.scoreResults(candidates, activities, keywords, query.text);
    
    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);
    
    // Limit results
    const topResults = scoredResults.slice(0, 100);
    
    return {
      results: topResults,
      query: {
        original: query.text,
        detectedActivities: activities,
        detectedKeywords: keywords,
        detectedMood: primaryMood,
        searchedCategories: categories,
      },
      stats: {
        totalMatches: candidates.length,
        searchTimeMs: Date.now() - startTime,
      },
    };
  }
  
  /**
   * Detect language (simple heuristic)
   */
  private detectLanguage(text: string): 'th' | 'en' {
    const thaiChars = text.match(/[\u0E00-\u0E7F]/g);
    return (thaiChars && thaiChars.length > 0) ? 'th' : 'en';
  }
  
  /**
   * Parse query to extract activities and keywords
   */
  private parseQuery(text: string, language: 'th' | 'en'): {
    activities: Activity[];
    keywords: string[];
  } {
    const normalized = text.toLowerCase();
    const activities: Activity[] = [];
    const keywords: string[] = [];
    
    // Match activities from dictionary
    for (const activity of activityDictionary.activities) {
      const terms = language === 'th' ? activity.thai : activity.english;
      
      for (const term of terms) {
        if (normalized.includes(term.toLowerCase())) {
          activities.push(activity);
          break; // Don't add same activity twice
        }
      }
    }
    
    // Extract potential place names (simple word extraction)
    const words = text.split(/[\s,]+/).filter(w => w.length >= 3);
    
    // Keywords are words not matched to activities
    const activityTerms = new Set<string>();
    for (const activity of activities) {
      [...activity.thai, ...activity.english].forEach(t => 
        activityTerms.add(t.toLowerCase())
      );
    }
    
    for (const word of words) {
      if (!activityTerms.has(word.toLowerCase())) {
        keywords.push(word);
      }
    }
    
    return { activities, keywords };
  }
  
  /**
   * Map activities to place categories
   */
  private mapToCategories(activities: Activity[]): string[] {
    const categories = new Set<string>();
    
    for (const activity of activities) {
      for (const cat of activity.categories) {
        categories.add(cat);
      }
    }
    
    return Array.from(categories);
  }
  
  /**
   * Score results based on relevance
   */
  private scoreResults(
    candidates: IndexedPlace[],
    activities: Activity[],
    keywords: string[],
    originalQuery: string
  ): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const place of candidates) {
      let score = 0;
      const matchReasons: string[] = [];
      
      // Category match (from activities)
      const activityCategories = new Set(
        activities.flatMap(a => a.categories)
      );
      if (activityCategories.has(place.category)) {
        score += 10;
        matchReasons.push(`Category: ${place.category}`);
      }
      
      // Name match (exact keyword)
      for (const keyword of keywords) {
        const normalized = keyword.toLowerCase();
        if (place.nameNormalized.includes(normalized)) {
          score += 15;
          matchReasons.push(`Name contains: ${keyword}`);
        }
      }
      
      // Exact name match (bonus)
      const queryNormalized = originalQuery.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[\u0E48-\u0E4B]/g, '');
      if (place.nameNormalized === queryNormalized) {
        score += 30;
        matchReasons.push('Exact name match');
      }
      
      // Has coordinates (prefer places with location)
      if (place.latitude && place.longitude) {
        score += 5;
      }
      
      // Popular tags (bonus for important places)
      const tags = place.tags;
      if (tags.tourism === 'attraction' || tags.historic === 'monument') {
        score += 8;
        matchReasons.push('Major attraction');
      }
      if (tags.name_en || tags.name_th) {
        score += 3; // Has multiple language names
      }
      
      // Only include if some match
      if (score > 0) {
        results.push({
          place,
          score,
          matchReasons,
        });
      }
    }
    
    return results;
  }
}

// Singleton
let searchEngineInstance: SearchEngine | null = null;

export function getSearchEngine(): SearchEngine {
  if (!searchEngineInstance) {
    searchEngineInstance = new SearchEngine();
  }
  return searchEngineInstance;
}
