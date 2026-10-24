/**
 * Recommendation Engine
 * 
 * Generates personalized place recommendations
 * based on user profile and context
 */

import { IndexedPlace } from '@/search/place-index';
import { UserProfile, UserPreferences } from './user-profile';

export interface RecommendationContext {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy';
  dayOfWeek?: 'weekday' | 'weekend';
}

export interface RecommendedPlace {
  place: IndexedPlace;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  /**
   * Generate personalized recommendations
   */
  recommend(
    places: IndexedPlace[],
    profile: UserProfile,
    context: RecommendationContext = {},
    limit: number = 20
  ): RecommendedPlace[] {
    const scored = places.map(place => ({
      place,
      score: this.calculateScore(place, profile, context),
      reasons: this.generateReasons(place, profile, context),
    }));
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    // Return top N
    return scored.slice(0, limit);
  }
  
  /**
   * Calculate recommendation score for a place
   */
  private calculateScore(
    place: IndexedPlace,
    profile: UserProfile,
    context: RecommendationContext
  ): number {
    let score = 0;
    
    // Category preference score (0-40 points)
    const categoryPref = profile.preferences.favoriteCategories[place.category] || 0;
    score += categoryPref * 40;
    
    // Location proximity score (0-30 points)
    if (context.currentLocation && place.latitude && place.longitude) {
      const distance = this.calculateDistance(
        context.currentLocation.latitude,
        context.currentLocation.longitude,
        place.latitude,
        place.longitude
      );
      
      // Score decreases with distance
      if (distance < 1) score += 30;
      else if (distance < 3) score += 20;
      else if (distance < 5) score += 10;
      else if (distance < 10) score += 5;
    }
    
    // Popularity score (0-15 points)
    // Places with certain tags are considered more popular
    if (place.tags.tourism === 'attraction') score += 15;
    else if (place.tags.historic === 'monument') score += 12;
    else if (place.tags.name_en && place.tags.name_th) score += 8;
    
    // Time of day relevance (0-10 points)
    score += this.getTimeRelevanceScore(place, context.timeOfDay);
    
    // Weather relevance (0-5 points)
    score += this.getWeatherRelevanceScore(place, context.weatherCondition);
    
    return score;
  }
  
  /**
   * Generate human-readable recommendation reasons
   */
  private generateReasons(
    place: IndexedPlace,
    profile: UserProfile,
    context: RecommendationContext
  ): string[] {
    const reasons: string[] = [];
    
    // Category match
    const categoryPref = profile.preferences.favoriteCategories[place.category];
    if (categoryPref && categoryPref > 0.5) {
      reasons.push(`Matches your interest in ${place.category}`);
    }
    
    // Location proximity
    if (context.currentLocation && place.latitude && place.longitude) {
      const distance = this.calculateDistance(
        context.currentLocation.latitude,
        context.currentLocation.longitude,
        place.latitude,
        place.longitude
      );
      
      if (distance < 1) {
        reasons.push('Very close to you');
      } else if (distance < 3) {
        reasons.push('Nearby');
      }
    }
    
    // Popularity
    if (place.tags.tourism === 'attraction') {
      reasons.push('Popular tourist attraction');
    }
    
    // Time relevance
    if (context.timeOfDay === 'morning' && 
        ['cafe', 'park', 'fitness'].includes(place.category)) {
      reasons.push('Great for morning activities');
    }
    
    if (context.timeOfDay === 'evening' && 
        ['bar', 'restaurant', 'entertainment'].includes(place.category)) {
      reasons.push('Perfect for evening');
    }
    
    return reasons;
  }
  
  /**
   * Calculate time of day relevance
   */
  private getTimeRelevanceScore(
    place: IndexedPlace,
    timeOfDay?: string
  ): number {
    if (!timeOfDay) return 0;
    
    const timeScores: Record<string, string[]> = {
      morning: ['cafe', 'park', 'fitness', 'market'],
      afternoon: ['museum', 'shopping', 'attraction', 'park'],
      evening: ['restaurant', 'bar', 'entertainment', 'shopping'],
      night: ['bar', 'restaurant', 'entertainment', 'hotel'],
    };
    
    const relevantCategories = timeScores[timeOfDay] || [];
    return relevantCategories.includes(place.category) ? 10 : 0;
  }
  
  /**
   * Calculate weather relevance
   */
  private getWeatherRelevanceScore(
    place: IndexedPlace,
    weather?: string
  ): number {
    if (!weather) return 0;
    
    // Indoor categories preferred when raining
    if (weather === 'rainy') {
      const indoor = ['museum', 'shopping', 'cafe', 'restaurant', 'entertainment'];
      return indoor.includes(place.category) ? 5 : 0;
    }
    
    // Outdoor categories preferred when sunny
    if (weather === 'sunny') {
      const outdoor = ['park', 'attraction', 'market'];
      return outdoor.includes(place.category) ? 5 : 0;
    }
    
    return 0;
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Singleton
let recommendationEngineInstance: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngineInstance) {
    recommendationEngineInstance = new RecommendationEngine();
  }
  return recommendationEngineInstance;
}
