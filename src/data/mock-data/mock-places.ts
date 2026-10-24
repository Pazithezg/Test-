/**
 * Mock Places Data for Testing
 * CLEARLY LABELED - These are NOT real places
 * Used for testing when real OSM data is insufficient
 */

import { PlaceData } from '@/services/types';

/**
 * Mock places spread across Thailand
 * Names are GENERIC to avoid confusion with real businesses
 */
export const mockPlaces: PlaceData[] = [
  // Chiang Mai Mock Places
  {
    id: 'mock-cm-cafe-001',
    name: 'ร้านกาแฟเหนือ',
    nameTh: 'ร้านกาแฟเหนือ',
    category: 'cafe',
    latitude: 18.7883,
    longitude: 98.9853,
    province: 'เชียงใหม่',
    address: 'ใกล้ประตูท่าแพ',
    source: 'mock',
    sourceUrl: '',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true,
    tags: { note: 'Test data only' }
  },
  {
    id: 'mock-cm-restaurant-001',
    name: 'ร้านอาหารล้านนา',
    nameTh: 'ร้านอาหารล้านนา',
    category: 'restaurant',
    latitude: 18.7965,
    longitude: 98.9901,
    province: 'เชียงใหม่',
    address: 'ใกล้แม่น้ำปิง',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-cm-temple-001',
    name: 'วัดตัวอย่าง',
    nameTh: 'วัดตัวอย่าง',
    category: 'attraction',
    latitude: 18.7883,
    longitude: 98.9685,
    province: 'เชียงใหม่',
    address: 'เมืองเก่าเชียงใหม่',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Phuket Mock Places
  {
    id: 'mock-pk-beach-001',
    name: 'ชายหาดตัวอย่าง',
    nameTh: 'ชายหาดตัวอย่าง',
    category: 'attraction',
    latitude: 7.8804,
    longitude: 98.3923,
    province: 'ภูเก็ต',
    address: 'ชายหาดภูเก็ต',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-pk-restaurant-001',
    name: 'ร้านอาหารทะเล',
    nameTh: 'ร้านอาหารทะเล',
    category: 'restaurant',
    latitude: 7.8850,
    longitude: 98.3950,
    province: 'ภูเก็ต',
    address: 'ใกล้หาดป่าตอง',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Krabi Mock Places
  {
    id: 'mock-kr-viewpoint-001',
    name: 'จุดชมวิวภูเขา',
    nameTh: 'จุดชมวิวภูเขา',
    category: 'attraction',
    latitude: 8.0863,
    longitude: 98.9063,
    province: 'กระบี่',
    address: 'เมืองกระบี่',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Chonburi Mock Places
  {
    id: 'mock-cb-beach-001',
    name: 'ชายหาดพัทยา',
    nameTh: 'ชายหาดพัทยา',
    category: 'attraction',
    latitude: 12.9236,
    longitude: 100.8825,
    province: 'ชลบุรี',
    address: 'หาดพัทยา',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Bangkok Mock Places
  {
    id: 'mock-bkk-cafe-001',
    name: 'คาเฟ่กลางเมือง',
    nameTh: 'คาเฟ่กลางเมือง',
    category: 'cafe',
    latitude: 13.7563,
    longitude: 100.5018,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้สยาม',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-park-001',
    name: 'สวนสาธารณะกลางเมือง',
    nameTh: 'สวนสาธารณะกลางเมือง',
    category: 'park',
    latitude: 13.7310,
    longitude: 100.5418,
    province: 'กรุงเทพมหานคร',
    address: 'ถนนพระราม 4',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-fitness-001',
    name: 'ฟิตเนสตัวอย่าง',
    nameTh: 'ฟิตเนสตัวอย่าง',
    category: 'fitness',
    latitude: 13.7460,
    longitude: 100.5340,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้ BTS',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-pool-001',
    name: 'สระว่ายน้ำสาธารณะ',
    nameTh: 'สระว่ายน้ำสาธารณะ',
    category: 'fitness',
    latitude: 13.7650,
    longitude: 100.5380,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้สวนลุม',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-market-001',
    name: 'ตลาดตัวอย่าง',
    nameTh: 'ตลาดตัวอย่าง',
    category: 'market',
    latitude: 13.7990,
    longitude: 100.5530,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้จตุจักร',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-museum-001',
    name: 'พิพิธภัณฑ์ตัวอย่าง',
    nameTh: 'พิพิธภัณฑ์ตัวอย่าง',
    category: 'museum',
    latitude: 13.7470,
    longitude: 100.4920,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้แม่น้ำเจ้าพระยา',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-restaurant-001',
    name: 'ร้านอาหารไทยตัวอย่าง',
    nameTh: 'ร้านอาหารไทยตัวอย่าง',
    category: 'restaurant',
    latitude: 13.7520,
    longitude: 100.4950,
    province: 'กรุงเทพมหานคร',
    address: 'ริมแม่น้ำ',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-bkk-shopping-001',
    name: 'ห้างสรรพสินค้าตัวอย่าง',
    nameTh: 'ห้างสรรพสินค้าตัวอย่าง',
    category: 'shopping',
    latitude: 13.7470,
    longitude: 100.5390,
    province: 'กรุงเทพมหานคร',
    address: 'ใกล้รัชดาภิเษก',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // More Chiang Mai
  {
    id: 'mock-cm-park-001',
    name: 'สวนสาธารณะเชียงใหม่',
    nameTh: 'สวนสาธารณะเชียงใหม่',
    category: 'park',
    latitude: 18.7900,
    longitude: 98.9800,
    province: 'เชียงใหม่',
    address: 'ในเมืองเชียงใหม่',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-cm-fitness-001',
    name: 'ฟิตเนสเชียงใหม่',
    nameTh: 'ฟิตเนสเชียงใหม่',
    category: 'fitness',
    latitude: 18.7950,
    longitude: 98.9920,
    province: 'เชียงใหม่',
    address: 'นิมมาน',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Ayutthaya
  {
    id: 'mock-ay-temple-001',
    name: 'วัดตัวอย่างอยุธยา',
    nameTh: 'วัดตัวอย่างอยุธยา',
    category: 'attraction',
    latitude: 14.3532,
    longitude: 100.5676,
    province: 'พระนครศรีอยุธยา',
    address: 'เกาะเมืองอยุธยา',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-ay-market-001',
    name: 'ตลาดอยุธยา',
    nameTh: 'ตลาดอยุธยา',
    category: 'market',
    latitude: 14.3580,
    longitude: 100.5710,
    province: 'พระนครศรีอยุธยา',
    address: 'ริมแม่น้ำ',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },

  // Chiang Rai
  {
    id: 'mock-cr-cafe-001',
    name: 'คาเฟ่เชียงราย',
    nameTh: 'คาเฟ่เชียงราย',
    category: 'cafe',
    latitude: 19.9105,
    longitude: 99.8406,
    province: 'เชียงราย',
    address: 'ใจกลางเมือง',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  },
  {
    id: 'mock-cr-temple-001',
    name: 'วัดตัวอย่างเชียงราย',
    nameTh: 'วัดตัวอย่างเชียงราย',
    category: 'attraction',
    latitude: 19.9150,
    longitude: 99.8320,
    province: 'เชียงราย',
    address: 'เมืองเชียงราย',
    source: 'mock',
    lastUpdated: '2026-10-24',
    dataQuality: 'mock',
    isMock: true
  }
];

/**
 * Get mock places by province
 */
export function getMockPlacesByProvince(province: string): PlaceData[] {
  return mockPlaces.filter(p => p.province === province);
}

/**
 * Get mock places by category
 */
export function getMockPlacesByCategory(category: string): PlaceData[] {
  return mockPlaces.filter(p => p.category === category);
}

/**
 * Get all mock place IDs
 */
export function getMockPlaceIds(): string[] {
  return mockPlaces.map(p => p.id);
}

/**
 * Statistics
 */
export const mockPlacesStats = {
  total: mockPlaces.length,
  byProvince: mockPlaces.reduce((acc, p) => {
    acc[p.province] = (acc[p.province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byCategory: mockPlaces.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};
