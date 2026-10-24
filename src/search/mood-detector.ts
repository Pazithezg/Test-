/**
 * Mood Detector
 * 
 * Simple keyword-based mood detection from user input
 * Maps moods to activity categories
 */

export interface MoodPattern {
  id: string;
  keywords: string[]; // Thai & English keywords
  categories: string[]; // Suggested place categories
  description: string;
  descriptionTh: string;
}

/**
 * Comprehensive mood patterns
 */
export const MOOD_PATTERNS: MoodPattern[] = [
  {
    id: 'energetic',
    keywords: ['energetic', 'active', 'excited', 'กระตือรือร้น', 'อยากเล่น', 'มีพลัง', 'ฮึกเหิม'],
    categories: ['fitness', 'park', 'entertainment', 'attraction'],
    description: 'Energetic and active',
    descriptionTh: 'กระตือรือร้น อยากเคลื่อนไหว',
  },
  {
    id: 'relaxed',
    keywords: ['relaxed', 'chill', 'calm', 'peaceful', 'ผ่อนคลาย', 'ชิลๆ', 'สบายๆ', 'เย็นใจ', 'สงบ'],
    categories: ['cafe', 'park', 'museum', 'attraction'],
    description: 'Relaxed and peaceful',
    descriptionTh: 'ผ่อนคลาย สบายๆ',
  },
  {
    id: 'hungry',
    keywords: ['hungry', 'food', 'eat', 'dining', 'หิว', 'อยากกิน', 'กินข้าว', 'หาอาหาร'],
    categories: ['restaurant', 'market', 'cafe'],
    description: 'Hungry',
    descriptionTh: 'หิว อยากกิน',
  },
  {
    id: 'bored',
    keywords: ['bored', 'nothing to do', 'เบื่อ', 'ไม่รู้จะทำอะไร', 'ว่างเปล่า'],
    categories: ['entertainment', 'attraction', 'shopping', 'cafe'],
    description: 'Bored, need something fun',
    descriptionTh: 'เบื่อ อยากหาอะไรทำ',
  },
  {
    id: 'stressed',
    keywords: ['stressed', 'tired', 'exhausted', 'เครียด', 'เหนื่อย', 'อ่อนล้า', 'ล้า'],
    categories: ['cafe', 'park', 'spa', 'hotel'],
    description: 'Stressed, need relaxation',
    descriptionTh: 'เครียด ต้องการพักผ่อน',
  },
  {
    id: 'curious',
    keywords: ['curious', 'explore', 'discover', 'learn', 'อยากรู้', 'อยากเรียนรู้', 'สำรวจ', 'ค้นหา'],
    categories: ['museum', 'attraction', 'park', 'shopping'],
    description: 'Curious and exploratory',
    descriptionTh: 'อยากรู้ อยากสำรวจ',
  },
  {
    id: 'social',
    keywords: ['social', 'friends', 'party', 'hangout', 'สังสรรค์', 'เพื่อน', 'เจอเพื่อน', 'ปาร์ตี้'],
    categories: ['bar', 'restaurant', 'cafe', 'entertainment'],
    description: 'Social and outgoing',
    descriptionTh: 'อยากเจอเพื่อน สังสรรค์',
  },
  {
    id: 'romantic',
    keywords: ['romantic', 'date', 'couple', 'love', 'โรแมนติก', 'เดท', 'คู่', 'แฟน'],
    categories: ['restaurant', 'cafe', 'park', 'attraction'],
    description: 'Romantic mood',
    descriptionTh: 'อารมณ์โรแมนติก',
  },
  {
    id: 'adventurous',
    keywords: ['adventure', 'explore', 'exciting', 'ผจญภัย', 'สำรวจ', 'ตื่นเต้น', 'ท้าทาย'],
    categories: ['attraction', 'park', 'entertainment', 'fitness'],
    description: 'Adventurous spirit',
    descriptionTh: 'ชอบผจญภัย',
  },
  {
    id: 'creative',
    keywords: ['creative', 'art', 'artistic', 'inspire', 'สร้างสรรค์', 'ศิลปะ', 'แรงบันดาลใจ'],
    categories: ['museum', 'attraction', 'cafe', 'shopping'],
    description: 'Creative and artistic',
    descriptionTh: 'สร้างสรรค์ ชอบศิลปะ',
  },
  {
    id: 'sporty',
    keywords: ['sport', 'exercise', 'workout', 'fitness', 'กีฬา', 'ออกกำลังกาย', 'ฟิตเนส'],
    categories: ['fitness', 'park', 'attraction'],
    description: 'Sporty and active',
    descriptionTh: 'ชอบกีฬา เล่นกีฬา',
  },
  {
    id: 'cultural',
    keywords: ['culture', 'tradition', 'heritage', 'temple', 'วัฒนธรรม', 'ประเพณี', 'มรดก', 'วัด'],
    categories: ['attraction', 'museum', 'building'],
    description: 'Interested in culture',
    descriptionTh: 'สนใจวัฒนธรรม',
  },
  {
    id: 'shopping',
    keywords: ['shop', 'shopping', 'buy', 'mall', 'ช้อป', 'ช้อปปิ้ง', 'ซื้อของ', 'ห้าง'],
    categories: ['shopping', 'market', 'shop'],
    description: 'Shopping mood',
    descriptionTh: 'อยากช้อปปิ้ง',
  },
  {
    id: 'nightlife',
    keywords: ['nightlife', 'night', 'bar', 'club', 'ไนท์ไลฟ์', 'กลางคืน', 'บาร์', 'คลับ'],
    categories: ['bar', 'entertainment', 'restaurant'],
    description: 'Nightlife seeker',
    descriptionTh: 'ชอบไนท์ไลฟ์',
  },
  {
    id: 'nature',
    keywords: ['nature', 'outdoor', 'green', 'fresh air', 'ธรรมชาติ', 'กลางแจ้ง', 'สีเขียว', 'อากาศบริสุทธิ์'],
    categories: ['park', 'attraction'],
    description: 'Love nature',
    descriptionTh: 'ชอบธรรมชาติ',
  },
];

/**
 * Detect mood from text input
 */
export function detectMood(text: string): MoodPattern[] {
  const normalized = text.toLowerCase().trim();
  const detectedMoods: Array<{ mood: MoodPattern; score: number }> = [];
  
  for (const mood of MOOD_PATTERNS) {
    let score = 0;
    
    // Check each keyword
    for (const keyword of mood.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    if (score > 0) {
      detectedMoods.push({ mood, score });
    }
  }
  
  // Sort by score (most matches first)
  detectedMoods.sort((a, b) => b.score - a.score);
  
  // Return moods
  return detectedMoods.map(m => m.mood);
}

/**
 * Get suggested categories from mood
 */
export function getCategoriesFromMood(moodId: string): string[] {
  const mood = MOOD_PATTERNS.find(m => m.id === moodId);
  return mood ? mood.categories : [];
}

/**
 * Get all available moods for UI
 */
export function getAllMoods(): MoodPattern[] {
  return MOOD_PATTERNS;
}

/**
 * Get mood by ID
 */
export function getMoodById(id: string): MoodPattern | undefined {
  return MOOD_PATTERNS.find(m => m.id === id);
}
