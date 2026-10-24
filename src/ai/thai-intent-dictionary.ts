import { CompanionType } from '../domain/models';

export interface CategoryDefinition {
  id: string;
  nameEn: string;
  nameTh: string;
  aliases: string[];
  vibes: string[];
  typicalCompanions: CompanionType[];
}

export const THAI_INTENT_DICTIONARY: CategoryDefinition[] = [
  { id: 'art_exhibition', nameEn: 'Art Exhibition', nameTh: 'งานศิลปะ', aliases: ['ศิลปะ', 'หอศิลป์', 'แกลเลอรี', 'นิทรรศการ', 'art', 'gallery', 'exhibit', 'museum', 'attraction'], vibes: ['inspiring', 'creative'], typicalCompanions: ['solo', 'friends', 'couple'] },
  { id: 'live_music', nameEn: 'Live Music', nameTh: 'ดนตรีสด', aliases: ['ดนตรี', 'เพลง', 'คอนเสิร์ต', 'music', 'concert', 'jazz', 'live band', 'entertainment'], vibes: ['lively', 'entertainment'], typicalCompanions: ['friends', 'couple'] },
  { id: 'cafe_hopping', nameEn: 'Cafe', nameTh: 'คาเฟ่', aliases: ['กาแฟ', 'คาเฟ่', 'cafe', 'coffee', 'coffeeshop', 'พักใจ', 'ฮีลใจ', 'ชิล', 'ชิว', 'นั่งนิ่ง', 'เปลี่ยนบรรยากาศ', 'ปล่อยจอย'], vibes: ['chill', 'peaceful', 'cozy', 'relaxing'], typicalCompanions: ['friends', 'couple', 'solo'] },
  { id: 'food_festival', nameEn: 'Food', nameTh: 'อาหาร', aliases: ['กิน', 'อาหาร', 'ของกิน', 'food', 'eat', 'dining', 'foodie', 'restaurant'], vibes: ['foodie', 'tasty', 'social'], typicalCompanions: ['friends', 'family'] },
  { id: 'market', nameEn: 'Market', nameTh: 'ตลาด', aliases: ['ตลาด', 'ช้อป', 'ซื้อของ', 'market', 'shopping', 'night market', 'shop'], vibes: ['stroll', 'walking', 'browsing'], typicalCompanions: ['friends', 'family', 'couple'] },
  { id: 'workshop', nameEn: 'Workshop', nameTh: 'เวิร์กชอป', aliases: ['เวิร์กชอป', 'เรียน', 'ทำมือ', 'workshop', 'craft', 'diy', 'class'], vibes: ['learning', 'hands_on', 'creative'], typicalCompanions: ['solo', 'friends'] },
  { id: 'culture', nameEn: 'Culture', nameTh: 'วัฒนธรรม', aliases: ['วัฒนธรรม', 'ประวัติศาสตร์', 'พิพิธภัณฑ์', 'museum', 'heritage', 'history'], vibes: ['educational', 'cultural', 'insightful'], typicalCompanions: ['solo', 'couple', 'family'] },
  { id: 'nightlife', nameEn: 'Nightlife', nameTh: 'ไนต์ไลฟ์', aliases: ['บาร์', 'ผับ', 'ดื่ม', 'bar', 'pub', 'nightlife', 'drinks'], vibes: ['lively', 'social', 'exciting'], typicalCompanions: ['friends', 'couple'] },
  { id: 'outdoor_recreation', nameEn: 'Outdoor', nameTh: 'กลางแจ้ง', aliases: ['กลางแจ้ง', 'ธรรมชาติ', 'outdoor', 'nature', 'park', 'สวน', 'หนีคน', 'หนีความวุ่นวาย', 'ไม่อยู่ในห้อง'], vibes: ['refreshing', 'healthy', 'natural', 'quiet'], typicalCompanions: ['solo', 'friends', 'family'] },
  { id: 'wellness_spa', nameEn: 'Wellness', nameTh: 'สปา', aliases: ['สปา', 'นวด', 'ผ่อนคลาย', 'spa', 'massage', 'wellness', 'relax', 'fitness'], vibes: ['peaceful', 'relaxing', 'rejuvenating'], typicalCompanions: ['solo', 'couple'] },
  { id: 'sightseeing', nameEn: 'Sightseeing', nameTh: 'เที่ยวชม', aliases: ['เดินเล่น', 'เที่ยว', 'sightseeing', 'walk', 'stroll', 'explore'], vibes: ['leisurely', 'exploratory', 'curious'], typicalCompanions: ['any'] },
  { id: 'creative', nameEn: 'Creative', nameTh: 'สร้างสรรค์', aliases: ['creative', 'coworking', 'innovation', 'startup'], vibes: ['inspiring', 'innovative', 'collaborative'], typicalCompanions: ['solo', 'friends'] },
  { id: 'nature_park', nameEn: 'Nature Park', nameTh: 'สวนและธรรมชาติ', aliases: ['สวน', 'สวนสาธารณะ', 'ป่า', 'น้ำตก', 'ธรรมชาติ', 'nature park'], vibes: ['natural', 'refreshing', 'quiet'], typicalCompanions: ['any'] },
  { id: 'photography', nameEn: 'Photography', nameTh: 'ถ่ายรูป', aliases: ['ถ่ายรูป', 'รูปสวย', 'จุดถ่ายรูป', 'photo', 'photography', 'วิวสวย'], vibes: ['inspiring', 'creative'], typicalCompanions: ['solo', 'friends', 'couple'] },
  { id: 'entertainment', nameEn: 'Entertainment', nameTh: 'ความบันเทิง', aliases: ['บันเทิง', 'สนุก', 'เกม', 'entertainment', 'fun'], vibes: ['fun', 'lively', 'exciting'], typicalCompanions: ['friends', 'family'] },
  { id: 'shopping', nameEn: 'Shopping', nameTh: 'ช้อปปิ้ง', aliases: ['ช้อปปิ้ง', 'ซื้อของ', 'ห้าง', 'shopping', 'mall'], vibes: ['browsing', 'social'], typicalCompanions: ['friends', 'family'] },
  { id: 'family', nameEn: 'Family', nameTh: 'ครอบครัว', aliases: ['ครอบครัว', 'เด็ก', 'ลูก', 'family', 'kid'], vibes: ['friendly', 'fun'], typicalCompanions: ['family'] },
  { id: 'quiet', nameEn: 'Quiet', nameTh: 'เงียบสงบ', aliases: ['เงียบ', 'คนไม่เยอะ', 'สงบ', 'quiet', 'peaceful', 'ไม่วุ่นวาย'], vibes: ['quiet', 'peaceful'], typicalCompanions: ['solo', 'couple'] },
  { id: 'romantic', nameEn: 'Romantic', nameTh: 'โรแมนติก', aliases: ['เดต', 'โรแมนติก', 'หวาน', 'date', 'romantic'], vibes: ['romantic', 'cozy'], typicalCompanions: ['couple'] },
  { id: 'novel_experience', nameEn: 'Novel Experience', nameTh: 'ประสบการณ์ใหม่', aliases: ['ใหม่', 'ไม่เคยทำ', 'แปลกใหม่', 'ลองอะไรใหม่', 'novel', 'new experience'], vibes: ['new_experience', 'exciting', 'curious'], typicalCompanions: ['any'] },
];

export function matchCategory(text: string): Array<{ categoryId: string; category: CategoryDefinition; confidence: number }> {
  const normalized = text.toLowerCase().normalize('NFC').replace(/[ๆฯ]/g, '').replace(/\s+/g, ' ');
  const matches: Array<{ categoryId: string; category: CategoryDefinition; confidence: number }> = [];
  for (const cat of THAI_INTENT_DICTIONARY) {
    let score = 0;
    for (const alias of cat.aliases) {
      if (normalized.includes(alias.toLowerCase())) score++;
    }
    if (score > 0) matches.push({ categoryId: cat.id, category: cat, confidence: Math.min(1.0, score * 0.3) });
  }
  return matches.sort((a, b) => b.confidence - a.confidence);
}

export function extractMoodVibes(text: string): string[] {
  const vibes: string[] = [];
  const n = text.toLowerCase();
  if (n.includes('เบื่อ') || n.includes('bored')) vibes.push('refreshing', 'new_experience');
  if (n.includes('ชิล') || n.includes('ชิว') || n.includes('chill') || n.includes('สบาย')) vibes.push('chill', 'peaceful');
  if (n.includes('สนุก') || n.includes('fun') || n.includes('ตื่นเต้น')) vibes.push('lively', 'fun', 'exciting');
  if (n.includes('ผ่อนคลาย') || n.includes('relax')) vibes.push('relaxing', 'peaceful');
  if (n.includes('พักใจ') || n.includes('ฮีลใจ') || n.includes('หัวจะระเบิด') || n.includes('วุ่นวาย')) vibes.push('relaxing', 'peaceful');
  if (n.includes('ปล่อยจอย') || n.includes('ไม่รู้จะทำอะไร') || n.includes('ออกไปข้างนอก')) vibes.push('leisurely', 'fun');
  if (n.includes('เพื่อน') || n.includes('friends')) vibes.push('social', 'friends');
  if (n.includes('แฟน') || n.includes('เดท') || n.includes('couple')) vibes.push('romantic');
  if (n.includes('เงียบ') || n.includes('สงบ') || n.includes('คนไม่เยอะ') || n.includes('quiet')) vibes.push('quiet', 'peaceful');
  if (n.includes('ใหม่') || n.includes('ไม่เคย') || n.includes('เบื่อ')) vibes.push('new_experience');
  return vibes;
}

export function detectCompanionPreference(text: string): CompanionType {
  const n = text.toLowerCase();
  if (n.includes('เพื่อน') || n.includes('friends')) return 'friends';
  if (n.includes('แฟน') || n.includes('couple') || n.includes('เดท')) return 'couple';
  if (n.includes('คนเดียว') || n.includes('solo') || n.includes('alone')) return 'solo';
  if (n.includes('ครอบครัว') || n.includes('family') || n.includes('เด็ก')) return 'family';
  return 'any';
}


/**
 * Map Thai intent categories to OSM/database categories
 * This ensures Thai parser output matches with real place categories
 */
export function mapToOsmCategories(intentCategories: string[]): string[] {
  const osmCategories = new Set<string>();
  
  const mapping: Record<string, string[]> = {
    'art_exhibition': ['museum', 'attraction', 'gallery'],
    'live_music': ['entertainment', 'bar'],
    'cafe_hopping': ['cafe'],
    'food_festival': ['restaurant', 'food'],
    'market': ['market', 'shopping', 'shop'],
    'workshop': ['education', 'attraction'],
    'culture': ['museum', 'attraction'],
    'nightlife': ['bar', 'entertainment'],
    'outdoor_recreation': ['park'],
    'nature_park': ['park'],
    'photography': ['attraction', 'park', 'museum'],
    'entertainment': ['entertainment'],
    'shopping': ['shopping', 'shop'],
    'quiet': ['park', 'cafe', 'museum'],
    'romantic': ['cafe', 'restaurant', 'attraction'],
    'novel_experience': ['attraction', 'entertainment', 'museum'],
    'wellness_spa': ['fitness', 'spa'],
    // Buildings are an OSM structural category, not necessarily a destination.
    'sightseeing': ['attraction', 'park'],
    'creative': ['coworking', 'attraction'],
  };
  
  for (const intentCat of intentCategories) {
    const osmCats = mapping[intentCat] || [];
    osmCats.forEach(cat => osmCategories.add(cat));
  }
  
  // If no mapping found, return original categories
  if (osmCategories.size === 0) {
    return intentCategories;
  }
  
  return Array.from(osmCategories);
}
