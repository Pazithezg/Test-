/**
 * Activity Dictionary - Complete mapping between user activities and places
 * 
 * This is the SINGLE SOURCE OF TRUTH for activity-to-place matching.
 * No AI, no fuzzy logic, just direct pattern matching.
 */

export interface ActivityPattern {
  // Activity identifiers
  id: string;
  thai: string[];     // Thai phrases
  english: string[];  // English phrases
  
  // Matching rules
  categories: string[];           // OSM categories to search
  namePatterns: string[];        // Required patterns in place name
  exactMatch: boolean;           // Must contain exact pattern
  excludePatterns?: string[];    // Exclude if name contains these
  
  // Scoring
  confidence: number;            // Base confidence (0-1)
  priority: number;              // Search priority (1=highest)
}

/**
 * Complete Activity Dictionary for Bangkok
 * Organized by activity type
 */
export const ACTIVITY_DICTIONARY: ActivityPattern[] = [
  
  // === SPORTS & FITNESS ===
  {
    id: 'boxing_training',
    thai: ['ต่อยมวย', 'เรียนมวย', 'ฝึกมวย', 'เล่นมวย', 'ค่ายมวย'],
    english: ['boxing', 'box', 'muay thai', 'muay'],
    categories: ['fitness', 'attraction'],
    namePatterns: ['มวย', 'boxing', 'muay'],
    exactMatch: true,
    excludePatterns: ['ขาหมู', 'โจ๊ก', 'ร้านอาหาร'],  // Exclude restaurants named "มวย"
    confidence: 0.95,
    priority: 1
  },
  {
    id: 'gym_fitness',
    thai: ['ออกแรง', 'ออกกำลังกาย', 'ฟิตเนส', 'ยิม', 'เล่นเวท'],
    english: ['gym', 'fitness', 'workout', 'exercise'],
    categories: ['fitness'],
    namePatterns: ['fitness', 'gym', 'ยิม', 'ฟิตเนส', 'sport'],
    exactMatch: false,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'swimming',
    thai: ['ว่ายน้ำ', 'เล่นน้ำ', 'สระว่ายน้ำ'],
    english: ['swimming', 'swim', 'pool'],
    categories: ['fitness', 'park'],
    namePatterns: ['swimming', 'pool', 'ว่ายน้ำ', 'สระน้ำ'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'badminton',
    thai: ['แบดมินตัน', 'เล่นแบด', 'ตีแบด'],
    english: ['badminton'],
    categories: ['fitness'],
    namePatterns: ['badminton', 'แบดมินตัน', 'แบด'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'yoga',
    thai: ['โยคะ', 'โยเกิร์ต', 'ฝึกโยคะ'],
    english: ['yoga'],
    categories: ['fitness'],
    namePatterns: ['yoga', 'โยคะ', 'โยเกิร์ต'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'football',
    thai: ['ฟุตบอล', 'เตะบอล', 'เล่นบอล'],
    english: ['football', 'soccer'],
    categories: ['fitness', 'park'],
    namePatterns: ['football', 'soccer', 'ฟุตบอล', 'บอล'],
    exactMatch: true,
    confidence: 0.85,
    priority: 2
  },
  
  // === RELIGIOUS & SPIRITUAL ===
  {
    id: 'temple_buddhist',
    thai: ['วัด', 'ไปวัด', 'ไหว้พระ', 'ทำบุญ'],
    english: ['temple', 'wat'],
    categories: ['attraction', 'museum'],
    namePatterns: ['วัด', 'temple', 'wat'],
    exactMatch: true,
    excludePatterns: ['ตลาด', 'กาแฟ'],
    confidence: 1.0,
    priority: 1
  },
  {
    id: 'meditation_center',
    thai: ['สถานธรรม', 'ปฏิบัติธรรม', 'นั่งสมาธิ', 'วิปัสสนา'],
    english: ['meditation', 'dhamma', 'vipassana'],
    categories: ['attraction', 'park'],
    namePatterns: ['ธรรม', 'meditation', 'วิปัสสนา', 'สมาธิ'],
    exactMatch: true,
    confidence: 0.85,
    priority: 1
  },
  {
    id: 'church',
    thai: ['โบสถ์', 'คริสตจักร', 'โบสถ์คริสต์'],
    english: ['church', 'cathedral'],
    categories: ['attraction', 'building'],
    namePatterns: ['church', 'โบสถ์', 'cathedral', 'คริสต์'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'mosque',
    thai: ['มัสยิด', 'สุเหร่า'],
    english: ['mosque'],
    categories: ['attraction', 'building'],
    namePatterns: ['มัสยิด', 'mosque', 'สุเหร่า'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  
  // === FOOD & DINING ===
  {
    id: 'restaurant',
    thai: ['กินข้าว', 'หาอาหาร', 'ร้านอาหาร', 'กินอะไร'],
    english: ['restaurant', 'food', 'eat', 'dining'],
    categories: ['restaurant'],
    namePatterns: [],  // All restaurants
    exactMatch: false,
    confidence: 0.9,
    priority: 2
  },
  {
    id: 'cafe',
    thai: ['คาเฟ่', 'กาแฟ', 'นั่งชิล', 'ดื่มกาแฟ'],
    english: ['cafe', 'coffee', 'coffeeshop'],
    categories: ['cafe'],
    namePatterns: [],  // All cafes
    exactMatch: false,
    confidence: 0.95,
    priority: 1
  },
  {
    id: 'bar_pub',
    thai: ['บาร์', 'ผับ', 'ดื่ม', 'เหล้า'],
    english: ['bar', 'pub', 'drink'],
    categories: ['bar'],
    namePatterns: [],
    exactMatch: false,
    confidence: 0.9,
    priority: 2
  },
  
  // === SHOPPING & MARKETS ===
  {
    id: 'market',
    thai: ['ตลาด', 'ช้อป', 'ซื้อของ', 'เดินตลาด'],
    english: ['market', 'bazaar'],
    categories: ['market'],
    namePatterns: ['ตลาด', 'market'],
    exactMatch: true,
    confidence: 0.95,
    priority: 1
  },
  {
    id: 'shopping_mall',
    thai: ['ห้าง', 'ห้างสรรพสินค้า', 'ช้อปปิ้ง', 'ซื้อของ'],
    english: ['mall', 'shopping', 'department store'],
    categories: ['shopping', 'shop'],
    namePatterns: [],
    exactMatch: false,
    confidence: 0.9,
    priority: 2
  },
  
  // === CULTURE & EDUCATION ===
  {
    id: 'museum',
    thai: ['พิพิธภัณฑ์', 'ดูของเก่า', 'ประวัติศาสตร์'],
    english: ['museum', 'gallery'],
    categories: ['museum', 'attraction'],
    namePatterns: ['พิพิธภัณฑ์', 'museum', 'gallery'],
    exactMatch: true,
    confidence: 0.95,
    priority: 1
  },
  {
    id: 'art_gallery',
    thai: ['หอศิลป์', 'แกลเลอรี่', 'งานศิลปะ', 'ดูงานศิลป์'],
    english: ['gallery', 'art gallery', 'art'],
    categories: ['museum', 'attraction'],
    namePatterns: ['gallery', 'art', 'ศิลป', 'แกลเลอรี'],
    exactMatch: true,
    confidence: 0.9,
    priority: 1
  },
  {
    id: 'workshop',
    thai: ['เวิร์กช็อป', 'เรียน', 'อบรม', 'ปั้นดิน', 'เซรามิก'],
    english: ['workshop', 'class', 'course'],
    categories: ['attraction', 'building'],
    namePatterns: ['workshop', 'class', 'เวิร์กช็อป', 'เซรามิก', 'pottery'],
    exactMatch: true,
    confidence: 0.85,
    priority: 2
  },
  
  // === ENTERTAINMENT ===
  {
    id: 'cinema',
    thai: ['ดูหนัง', 'โรงหนัง', 'ภาพยนตร์'],
    english: ['cinema', 'movie', 'theater'],
    categories: ['entertainment'],
    namePatterns: ['cinema', 'movie', 'โรงหนัง', 'theater'],
    exactMatch: true,
    confidence: 0.95,
    priority: 1
  },
  {
    id: 'entertainment',
    thai: ['สนุก', 'เที่ยว', 'บันเทิง'],
    english: ['entertainment', 'fun'],
    categories: ['entertainment', 'attraction'],
    namePatterns: [],
    exactMatch: false,
    confidence: 0.7,
    priority: 3
  },
  
  // === NATURE & PARKS ===
  {
    id: 'park',
    thai: ['สวนสาธารณะ', 'สวน', 'ปาร์ค', 'เดินเล่น'],
    english: ['park', 'garden', 'green space'],
    categories: ['park'],
    namePatterns: ['สวน', 'park', 'garden'],
    exactMatch: true,
    confidence: 0.95,
    priority: 1
  },
  
  // === ACCOMMODATION ===
  {
    id: 'hotel',
    thai: ['นอน', 'โรงแรม', 'ที่พัก', 'หาที่นอน'],
    english: ['hotel', 'hostel', 'accommodation'],
    categories: ['hotel'],
    namePatterns: [],
    exactMatch: false,
    confidence: 0.9,
    priority: 2
  },
  
  // === TOURIST ATTRACTIONS ===
  {
    id: 'tourist_attraction',
    thai: ['ที่เที่ยว', 'สถานที่ท่องเที่ยว', 'แลนด์มาร์ค'],
    english: ['attraction', 'tourist', 'landmark'],
    categories: ['attraction'],
    namePatterns: [],
    exactMatch: false,
    confidence: 0.8,
    priority: 2
  },
];

/**
 * Helper: Find matching activities from user query
 */
export function findMatchingActivities(query: string): ActivityPattern[] {
  const normalized = query.toLowerCase().trim();
  const matches: Array<{ pattern: ActivityPattern; score: number }> = [];
  
  for (const pattern of ACTIVITY_DICTIONARY) {
    let score = 0;
    
    // Check Thai phrases
    for (const phrase of pattern.thai) {
      if (normalized.includes(phrase.toLowerCase())) {
        score += pattern.confidence * 100;
        break;
      }
    }
    
    // Check English phrases
    for (const phrase of pattern.english) {
      if (normalized.includes(phrase.toLowerCase())) {
        score += pattern.confidence * 80;  // Slightly lower for English
        break;
      }
    }
    
    if (score > 0) {
      matches.push({ pattern, score });
    }
  }
  
  // Sort by score (highest first), then priority (lowest number = highest priority)
  matches.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.01) {
      return a.pattern.priority - b.pattern.priority;
    }
    return b.score - a.score;
  });
  
  return matches.map(m => m.pattern);
}

/**
 * Helper: Get activity by ID
 */
export function getActivityById(id: string): ActivityPattern | undefined {
  return ACTIVITY_DICTIONARY.find(a => a.id === id);
}

/**
 * Compatibility export - wrapped dictionary object
 */
export interface Activity {
  id: string;
  thai: string[];
  english: string[];
  categories: string[];
}

export const activityDictionary = {
  activities: ACTIVITY_DICTIONARY.map(p => ({
    id: p.id,
    thai: p.thai,
    english: p.english,
    categories: p.categories,
  })) as Activity[]
};
