/**
 * AI Intent Parser
 * 
 * แปลคำพูดของ user ให้เป็นข้อมูลที่ระบบเข้าใจ
 * - แปลความรู้สึก → mood
 * - แปลกิจกรรม → activities
 * - แปลสถานที่ → place names/types
 */

import { detectMood, getMoodById } from '@/search/mood-detector';
import { ACTIVITY_DICTIONARY } from '@/search/activity-dictionary';

export interface ParsedIntent {
  // Original input
  originalText: string;
  
  // Detected mood
  mood?: string;
  moodConfidence: number;
  
  // Detected activities
  activities: string[];
  activityConfidence: number;
  
  // Place keywords
  placeKeywords: string[];
  
  // Categories to search
  suggestedCategories: string[];
  activityCategories: string[];
  
  // Explanation in Thai
  explanation: string;
}

/**
 * Parse user input into structured intent
 */
export function parseIntent(text: string): ParsedIntent {
  const normalized = text.toLowerCase().trim();
  
  // 1. Detect mood
  const moods = detectMood(text);
  const primaryMood = moods.length > 0 ? moods[0] : null;
  
  // 2. Detect activities
  const detectedActivities: string[] = [];
  for (const activity of ACTIVITY_DICTIONARY) {
    const thaiMatch = activity.thai.some(t => normalized.includes(t.toLowerCase()));
    const englishMatch = activity.english.some(e => normalized.includes(e.toLowerCase()));
    
    if (thaiMatch || englishMatch) {
      detectedActivities.push(activity.id);
    }
  }
  
  // 3. Extract place keywords
  const placeKeywords = extractPlaceKeywords(text);
  
  // 4. Build suggested categories
    const categories = new Set<string>();
    const activityCategories = new Set<string>();

    // From mood
    if (primaryMood) {
      primaryMood.categories.forEach(c => categories.add(c));
    }

    // From activities
    detectedActivities.forEach(actId => {
      const activity = ACTIVITY_DICTIONARY.find(a => a.id === actId);
      if (activity) {
        activity.categories.forEach(c => {
          categories.add(c);
          activityCategories.add(c);
        });
      }
    });

    // 5. Generate explanation
    const explanation = generateExplanation(primaryMood, detectedActivities, placeKeywords);

    return {
      originalText: text,
      mood: primaryMood?.id,
      moodConfidence: moods.length > 0 ? 0.8 : 0,
      activities: detectedActivities,
      activityConfidence: detectedActivities.length > 0 ? 0.9 : 0,
      placeKeywords,
      suggestedCategories: Array.from(categories),
      activityCategories: Array.from(activityCategories),
      explanation,
    };
}

/**
 * Extract place-related keywords
 */
function extractPlaceKeywords(text: string): string[] {
  const keywords: string[] = [];
  const normalized = text.toLowerCase();
  
  // Common place patterns
  const placePatterns = [
    // Thai
    { pattern: /ร้าน([\u0E00-\u0E7F]+)/g, prefix: '' },
    { pattern: /คาเฟ่|กาแฟ/g, word: 'cafe' },
    { pattern: /ร้านอาหาร|ภัตตาคาร/g, word: 'restaurant' },
    { pattern: /โรงแรม|ที่พัก/g, word: 'hotel' },
    { pattern: /ห้าง|มอลล์|ช้อป/g, word: 'shopping' },
    { pattern: /สวน|สวนสาธารณะ/g, word: 'park' },
    { pattern: /วัด|โบสถ์/g, word: 'temple' },
    { pattern: /ตลาด/g, word: 'market' },
    { pattern: /บาร์|ผับ/g, word: 'bar' },
    { pattern: /ยิม|ฟิตเนส/g, word: 'gym' },
    { pattern: /ค่าย([\u0E00-\u0E7F]+)/g, prefix: 'camp' },
    
    // English
    { pattern: /cafe|coffee/gi, word: 'cafe' },
    { pattern: /restaurant|dining/gi, word: 'restaurant' },
    { pattern: /hotel|accommodation/gi, word: 'hotel' },
    { pattern: /mall|shopping/gi, word: 'shopping' },
    { pattern: /park|garden/gi, word: 'park' },
    { pattern: /temple|wat/gi, word: 'temple' },
    { pattern: /market/gi, word: 'market' },
    { pattern: /bar|pub/gi, word: 'bar' },
    { pattern: /gym|fitness/gi, word: 'gym' },
  ];
  
  for (const { pattern, word, prefix } of placePatterns) {
    const matches = normalized.match(pattern);
    if (matches) {
      if (word) {
        keywords.push(word);
      } else if (prefix) {
        matches.forEach(m => keywords.push(m));
      }
    }
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate explanation in Thai
 */
function generateExplanation(
  mood: any,
  activities: string[],
  placeKeywords: string[]
): string {
  const parts: string[] = [];
  
  if (mood) {
    parts.push(`คุณรู้สึก${mood.descriptionTh}`);
  }
  
  if (activities.length > 0) {
    const activityNames = activities.map(id => {
      const act = ACTIVITY_DICTIONARY.find(a => a.id === id);
      return act?.thai[0] || id;
    });
    parts.push(`ต้องการ${activityNames.join(', ')}`);
  }
  
  if (placeKeywords.length > 0) {
    parts.push(`กำลังมองหา: ${placeKeywords.join(', ')}`);
  }
  
  if (parts.length === 0) {
    return 'กำลังค้นหาสถานที่ที่น่าสนใจ';
  }
  
  return parts.join(' และ ');
}

/**
 * Translate user text to search query
 */
export function translateToSearchQuery(text: string): {
  query: string;
  mood?: string;
  categories: string[];
  explanation: string;
} {
  const intent = parseIntent(text);
  
  // Build search query from keywords
  const queryParts: string[] = [];
  
  if (intent.placeKeywords.length > 0) {
    queryParts.push(...intent.placeKeywords);
  }
  
  if (intent.activities.length > 0) {
    const activityKeywords = intent.activities.map(id => {
      const act = ACTIVITY_DICTIONARY.find(a => a.id === id);
      return act?.thai[0] || id;
    });
    queryParts.push(...activityKeywords);
  }
  
  return {
    query: queryParts.length > 0 ? queryParts.join(' ') : text,
    mood: intent.mood,
    categories: intent.suggestedCategories,
    explanation: intent.explanation,
  };
}

/**
 * AI-powered intent understanding (rule-based for now)
 * 
 * ในอนาคตสามารถเชื่อมกับ AI model จริง เช่น:
 * - OpenAI GPT
 * - Google Gemini
 * - Local LLM
 */
export async function aiParseIntent(text: string): Promise<ParsedIntent> {
  // For now, use rule-based parser
  // TODO: Add AI model integration here
  return parseIntent(text);
}

/**
 * Suggest what user might be looking for
 */
export function suggestQueries(text: string): string[] {
  const intent = parseIntent(text);
  const suggestions: string[] = [];
  
  // Based on mood
  if (intent.mood === 'hungry') {
    suggestions.push('ร้านอาหารใกล้ฉัน', 'คาเฟ่บรรยากาศดี', 'ร้านอาหารราคาไม่แพง');
  } else if (intent.mood === 'bored') {
    suggestions.push('ที่เที่ยวใกล้ฉัน', 'ทำอะไรดี', 'คาเฟ่นั่งชิล');
  } else if (intent.mood === 'stressed') {
    suggestions.push('สวนสาธารณะ', 'คาเฟ่เงียบๆ', 'สปา นวด');
  } else if (intent.mood === 'energetic') {
    suggestions.push('ยิม ฟิตเนส', 'สวนสาธารณะ', 'กิจกรรมกลางแจ้ง');
  }
  
  // Based on activities
  intent.activities.forEach(actId => {
    if (actId === 'boxing_training') {
      suggestions.push('ค่ายมวย', 'ฝึกมวยไทย', 'เรียนมวย');
    } else if (actId === 'cafe') {
      suggestions.push('คาเฟ่บรรยากาศดี', 'ร้านกาแฟ', 'คาเฟ่ทำงาน');
    } else if (actId === 'restaurant') {
      suggestions.push('ร้านอาหารแนะนำ', 'ร้านอาหารอร่อย', 'กินอะไรดี');
    }
  });
  
  return suggestions.slice(0, 5); // Top 5
}
