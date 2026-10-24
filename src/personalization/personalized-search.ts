/**
 * Personalized Search
 * 
 * Combines search results with user preferences
 * for personalized ranking
 */

import { SearchEngine, SearchQuery, SearchResult } from '@/search/search-engine';
import { getSearchEngine } from '@/search/search-engine';
import { getRecommendationEngine, RecommendationContext } from './recommendation-engine';
import { UserProfile } from './user-profile';

export interface PersonalizedSearchQuery extends SearchQuery {
  userProfile?: UserProfile;
  context?: RecommendationContext;
}

export interface PersonalizedSearchResult extends SearchResult {
  personalizedScore: number;
  personalizedReasons: string[];
}

export class PersonalizedSearch {
  private searchEngine: SearchEngine;
  
  constructor() {
    this.searchEngine = getSearchEngine();
  }
  
  /**
   * Search with personalization
   */
  async search(query: PersonalizedSearchQuery): Promise<{
    results: PersonalizedSearchResult[];
    query: any;
    stats: any;
  }> {
    // First, do regular search
    const searchResponse = await this.searchEngine.search({
      text: query.text,
      language: query.language,
    });
    
    // If no user profile, return regular results
    if (!query.userProfile) {
      return {
        ...searchResponse,
        results: searchResponse.results.map(r => ({
          ...r,
          personalizedScore: r.score,
          personalizedReasons: r.matchReasons,
        })),
      };
    }
    
    // Apply personalization
    const recommendationEngine = getRecommendationEngine();
    
    const personalizedResults = searchResponse.results.map(result => {
      // Calculate personalized score
      const baseScore = result.score;
      const personalizedScore = this.calculatePersonalizedScore(
        result,
        query.userProfile!,
        query.context
      );
      
      // Generate personalized reasons
      const personalizedReasons = this.generatePersonalizedReasons(
        result,
        query.userProfile!,
        query.context
      );
      
      return {
        ...result,
        personalizedScore,
        personalizedReasons: [...result.matchReasons, ...personalizedReasons],
      };
    });
    
    // Re-sort by personalized score
    personalizedResults.sort((a, b) => b.personalizedScore - a.personalizedScore);
    
    return {
      results: personalizedResults,
      query: searchResponse.query,
      stats: {
        ...searchResponse.stats,
        personalized: true,
      },
    };
  }
  
  /**
   * Calculate personalized score
   */
  private calculatePersonalizedScore(
    result: SearchResult,
    profile: UserProfile,
    context?: RecommendationContext
  ): number {
    let score = result.score;
    
    // Boost based on category preference
    const categoryPref = profile.preferences.favoriteCategories[result.place.category] || 0;
    score += categoryPref * 20; // Up to +20 points
    
    // Boost based on location if available
    if (context?.currentLocation && result.place.latitude && result.place.longitude) {
      const distance = this.calculateDistance(
        context.currentLocation.latitude,
        context.currentLocation.longitude,
        result.place.latitude,
        result.place.longitude
      );
      
      if (distance < 2) score += 10;
      else if (distance < 5) score += 5;
    }
    
    // Boost based on time of day
    if (context?.timeOfDay) {
      const timeBoost = this.getTimeBoost(result.place.category, context.timeOfDay);
      score += timeBoost;
    }
    
    return score;
  }
  
  /**
   * Generate personalized reasons
   */
  private generatePersonalizedReasons(
    result: SearchResult,
    profile: UserProfile,
    context?: RecommendationContext
  ): string[] {
    const reasons: string[] = [];
    
    // Category preference
    const categoryPref = profile.preferences.favoriteCategories[result.place.category];
    if (categoryPref && categoryPref > 0.5) {
      reasons.push('✨ Based on your interests');
    }
    
    // Location proximity
    if (context?.currentLocation && result.place.latitude && result.place.longitude) {
      const distance = this.calculateDistance(
        context.currentLocation.latitude,
        context.currentLocation.longitude,
        result.place.latitude,
        result.place.longitude
      );
      
      if (distance < 1) {
        reasons.push('📍 Less than 1 km away');
      } else if (distance < 2) {
        reasons.push('📍 About ' + distance.toFixed(1) + ' km away');
      }
    }
    
    return reasons;
  }
  
  /**
   * Get time-based boost
   */
  private getTimeBoost(category: string, timeOfDay: string): number {
    const timeMap: Record<string, Record<string, number>> = {
      morning: { cafe: 5, park: 5, fitness: 5, market: 3 },
      afternoon: { museum: 3, shopping: 5, attraction: 5 },
      evening: { restaurant: 5, bar: 5, entertainment: 5 },
      night: { bar: 5, restaurant: 3, hotel: 3 },
    };
    
    return timeMap[timeOfDay]?.[category] || 0;
  }
  
  /**
   * Calculate distance (simplified Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Singleton
let personalizedSearchInstance: PersonalizedSearch | null = null;

export function getPersonalizedSearch(): PersonalizedSearch {
  if (!personalizedSearchInstance) {
    personalizedSearchInstance = new PersonalizedSearch();
  }
  return personalizedSearchInstance;
}
