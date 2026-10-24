export const TIMEZONE = 'Asia/Bangkok';

export const BANGKOK_TEST_AREAS = [
  {
    id: 'bangkok-siam',
    nameEn: 'Siam & Pathum Wan',
    nameTh: 'สยามและปทุมวัน',
    descriptionEn: 'Central shopping, youth culture, modern art, and transit hub.',
    descriptionTh: 'ย่านศูนย์กลางการค้า วัฒนธรรมคนรุ่นใหม่ หอศิลป์ และจุดตัดรถไฟฟ้าหลัก',
    latitude: 13.7460,
    longitude: 100.5348,
    radiusKmDefault: 5,
    tags: ['shopping', 'art', 'cafe', 'creative', 'central', 'transit'],
  },
  {
    id: 'bangkok-sukhumvit',
    nameEn: 'Sukhumvit & Thong Lo',
    nameTh: 'สุขุมวิทและทองหล่อ',
    descriptionEn: 'Dining, international lifestyle, community spaces, and contemporary galleries.',
    descriptionTh: 'ย่านไลฟ์สไตล์ อาหารนานาชาติ พื้นที่คอมมูนิตี้ คาเฟ่ และแกลเลอรีร่วมสมัย',
    latitude: 13.7259,
    longitude: 100.5793,
    radiusKmDefault: 6,
    tags: ['dining', 'nightlife', 'cafe', 'community', 'modern', 'lifestyle'],
  },
  {
    id: 'bangkok-oldtown',
    nameEn: 'Rattanakosin & Old Town (Phra Nakhon)',
    nameTh: 'เกาะรัตนโกสินทร์และเมืองเก่า (พระนคร)',
    descriptionEn: 'Historic architecture, heritage culture, riverside walks, and street food.',
    descriptionTh: 'ย่านประวัติศาสตร์ วัฒนธรรมดั้งเดิม พิพิธภัณฑ์ ถนนคนเดิน และอาหารริมทางชื่อดัง',
    latitude: 13.7538,
    longitude: 100.4930,
    radiusKmDefault: 5,
    tags: ['history', 'culture', 'heritage', 'walking', 'street_food', 'riverside'],
  },
  {
    id: 'bangkok-ari',
    nameEn: 'Ari & Phaya Thai',
    nameTh: 'อารีย์และพญาไท',
    descriptionEn: 'Relaxed neighborhood, specialty cafes, craft shops, and quiet dining.',
    descriptionTh: 'ย่านพักผ่อนบรรยากาศอบอุ่น คาเฟ่เฉพาะทาง ร้านงานคราฟต์ และอาหารอร่อย',
    latitude: 13.7797,
    longitude: 100.5447,
    radiusKmDefault: 4,
    tags: ['cafe', 'chill', 'craft', 'neighborhood', 'relaxed', 'dining'],
  },
  {
    id: 'bangkok-riverside',
    nameEn: 'Charoen Krung & Talat Noi (Creative District)',
    nameTh: 'เจริญกรุงและตลาดน้อย (ย่านสร้างสรรค์)',
    descriptionEn: 'Art galleries, heritage buildings, riverside views, and creative workshops.',
    descriptionTh: 'ย่านสร้างสรรค์ แกลเลอรีศิลปะ สถาปัตยกรรมเก่าแก่ ริมแม่น้ำเจ้าพระยา',
    latitude: 13.7275,
    longitude: 100.5144,
    radiusKmDefault: 4,
    tags: ['art', 'creative', 'heritage', 'workshop', 'gallery', 'riverside', 'photography'],
  },
  {
    id: 'bangkok-chatuchak',
    nameEn: 'Chatuchak',
    nameTh: 'จตุจักร',
    descriptionEn: 'Weekend markets, public parks, vintage shopping, and outdoor strolls.',
    descriptionTh: 'ตลาดนัดจตุจักร สวนสาธารณะขนาดใหญ่ สินค้ามือสองวินเทจ และการเดินเล่นกลางแจ้ง',
    latitude: 13.8028,
    longitude: 100.5534,
    radiusKmDefault: 5,
    tags: ['market', 'park', 'outdoor', 'vintage', 'shopping', 'weekend'],
  },
] as const;

export const ACTIVITY_CATEGORIES = [
  'art_exhibition',
  'live_music',
  'workshop',
  'market',
  'food_festival',
  'sightseeing',
  'cafe_hopping',
  'nature_park',
  'performance',
  'community_gathering',
  'creative',
] as const;

export const COMPANION_TYPES = ['solo', 'friends', 'couple', 'family', 'any'] as const;

export const DEFAULT_SEARCH_RADIUS_KM = 8;
export const MAX_SEARCH_RADIUS_KM = 35;
export const MIN_SEARCH_RADIUS_KM = 0.5;
