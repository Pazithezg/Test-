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

  // Add more mock places for other provinces...
  // Total should be ~150 mock places across all categories and provinces
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
