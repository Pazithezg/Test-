/**
 * User Profile System
 * 
 * Tracks user preferences and activity history
 * for personalized recommendations
 */

export interface UserPreferences {
  // Activity preferences (weighted 0-1)
  favoriteActivities: Record<string, number>;
  
  // Category preferences
  favoriteCategories: Record<string, number>;
  
  // Location preferences
  preferredAreas?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  
  // Time preferences
  preferredTimes?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  
  // Budget preferences
  budgetLevel?: 'low' | 'medium' | 'high' | 'any';
  
  // Language preference
  language: 'th' | 'en';
}

export interface UserActivity {
  placeId: string;
  placeName: string;
  category: string;
  timestamp: Date;
  action: 'viewed' | 'saved' | 'visited' | 'rated';
  rating?: number;
}

export interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  activityHistory: UserActivity[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default user preferences
 */
export function createDefaultPreferences(): UserPreferences {
  return {
    favoriteActivities: {},
    favoriteCategories: {},
    language: 'th',
  };
}

/**
 * Calculate activity preferences from history
 */
export function calculateActivityPreferences(
  history: UserActivity[]
): Record<string, number> {
  const activityCounts: Record<string, number> = {};
  const activityScores: Record<string, number> = {};
  
  // Count interactions per category
  for (const activity of history) {
    const cat = activity.category;
    activityCounts[cat] = (activityCounts[cat] || 0) + 1;
    
    // Weight by action type
    let score = 0;
    switch (activity.action) {
      case 'viewed':
        score = 1;
        break;
      case 'saved':
        score = 3;
        break;
      case 'visited':
        score = 5;
        break;
      case 'rated':
        score = (activity.rating || 0) * 2;
        break;
    }
    
    activityScores[cat] = (activityScores[cat] || 0) + score;
  }
  
  // Normalize to 0-1 range
  const maxScore = Math.max(...Object.values(activityScores), 1);
  const preferences: Record<string, number> = {};
  
  for (const cat in activityScores) {
    preferences[cat] = activityScores[cat] / maxScore;
  }
  
  return preferences;
}

/**
 * Update user preferences based on new activity
 */
export function updatePreferences(
  profile: UserProfile,
  newActivity: UserActivity
): UserProfile {
  // Add to history
  const history = [...profile.activityHistory, newActivity];
  
  // Recalculate preferences
  const categoryPrefs = calculateActivityPreferences(history);
  
  return {
    ...profile,
    preferences: {
      ...profile.preferences,
      favoriteCategories: categoryPrefs,
    },
    activityHistory: history,
    updatedAt: new Date(),
  };
}

/**
 * Get top preferred categories
 */
export function getTopCategories(
  preferences: UserPreferences,
  limit: number = 5
): string[] {
  const entries = Object.entries(preferences.favoriteCategories);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, limit).map(e => e[0]);
}

/**
 * Merge explicit and implicit preferences
 */
export function mergePreferences(
  explicit: UserPreferences,
  implicit: UserPreferences
): UserPreferences {
  return {
    ...explicit,
    favoriteCategories: {
      ...implicit.favoriteCategories,
      ...explicit.favoriteCategories, // Explicit takes priority
    },
    favoriteActivities: {
      ...implicit.favoriteActivities,
      ...explicit.favoriteActivities,
    },
  };
}
