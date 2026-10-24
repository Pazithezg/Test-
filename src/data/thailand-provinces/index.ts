/**
 * Thailand Province Metadata
 * Supporting 10 major tourist provinces + Bangkok
 */

import { ProvinceData } from '@/services/types';

export const provinces: ProvinceData[] = [
  {
    code: 'TH-10',
    nameTh: 'กรุงเทพมหานคร',
    nameEn: 'Bangkok',
    latitude: 13.7563,
    longitude: 100.5018,
    realPlacesCount: 12207, // From existing OSM data
    mockPlacesCount: 8, // From mock-places.ts
    categories: [
      'cafe', 'restaurant', 'museum', 'shopping', 'park',
      'shop', 'bar', 'hotel', 'fitness', 'attraction',
      'market', 'entertainment', 'building'
    ],
    lastUpdated: '2026-10-23'
  },
  {
    code: 'TH-50',
    nameTh: 'เชียงใหม่',
    nameEn: 'Chiang Mai',
    latitude: 18.7883,
    longitude: 98.9853,
    realPlacesCount: 0, // Will be populated from OSM
    mockPlacesCount: 5, // From mock-places.ts
    categories: ['cafe', 'restaurant', 'attraction', 'temple', 'market'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-83',
    nameTh: 'ภูเก็ต',
    nameEn: 'Phuket',
    latitude: 7.8804,
    longitude: 98.3923,
    realPlacesCount: 0,
    mockPlacesCount: 2,
    categories: ['beach', 'restaurant', 'hotel', 'attraction', 'bar'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-81',
    nameTh: 'กระบี่',
    nameEn: 'Krabi',
    latitude: 8.0863,
    longitude: 98.9063,
    realPlacesCount: 0,
    mockPlacesCount: 1,
    categories: ['beach', 'attraction', 'restaurant', 'hotel'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-20',
    nameTh: 'ชลบุรี',
    nameEn: 'Chonburi',
    latitude: 13.3611,
    longitude: 100.9847,
    realPlacesCount: 0,
    mockPlacesCount: 1,
    categories: ['beach', 'restaurant', 'shopping', 'entertainment'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-77',
    nameTh: 'ประจวบคีรีขันธ์',
    nameEn: 'Prachuap Khiri Khan',
    latitude: 11.8118,
    longitude: 99.7972,
    realPlacesCount: 0,
    mockPlacesCount: 0,
    categories: ['beach', 'restaurant', 'attraction'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-30',
    nameTh: 'นครราชสีมา',
    nameEn: 'Nakhon Ratchasima',
    latitude: 14.9799,
    longitude: 102.0977,
    realPlacesCount: 0,
    mockPlacesCount: 0,
    categories: ['restaurant', 'shopping', 'attraction', 'park'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-14',
    nameTh: 'พระนครศรีอยุธยา',
    nameEn: 'Ayutthaya',
    latitude: 14.3532,
    longitude: 100.5776,
    realPlacesCount: 0,
    mockPlacesCount: 2,
    categories: ['temple', 'attraction', 'restaurant', 'museum'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-84',
    nameTh: 'สุราษฎร์ธานี',
    nameEn: 'Surat Thani',
    latitude: 9.1382,
    longitude: 99.3331,
    realPlacesCount: 0,
    mockPlacesCount: 0,
    categories: ['beach', 'island', 'restaurant', 'hotel'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-90',
    nameTh: 'สงขลา',
    nameEn: 'Songkhla',
    latitude: 7.1894,
    longitude: 100.5951,
    realPlacesCount: 0,
    mockPlacesCount: 0,
    categories: ['beach', 'restaurant', 'market', 'attraction'],
    lastUpdated: '2026-10-24'
  },
  {
    code: 'TH-57',
    nameTh: 'เชียงราย',
    nameEn: 'Chiang Rai',
    latitude: 19.9105,
    longitude: 99.8406,
    realPlacesCount: 0,
    mockPlacesCount: 2,
    categories: ['temple', 'attraction', 'cafe', 'restaurant'],
    lastUpdated: '2026-10-24'
  }
];

/**
 * Get province by code
 */
export function getProvinceByCode(code: string): ProvinceData | undefined {
  return provinces.find(p => p.code === code);
}

/**
 * Get province by Thai name
 */
export function getProvinceByName(name: string): ProvinceData | undefined {
  return provinces.find(p => p.nameTh === name || p.nameEn === name);
}

/**
 * Get all province codes
 */
export function getAllProvinceCodes(): string[] {
  return provinces.map(p => p.code);
}

/**
 * Get provinces with real data
 */
export function getProvincesWithRealData(): ProvinceData[] {
  return provinces.filter(p => p.realPlacesCount > 0);
}

/**
 * Get total places count
 */
export function getTotalPlacesCount(): {
  real: number;
  mock: number;
  total: number;
} {
  const real = provinces.reduce((sum, p) => sum + p.realPlacesCount, 0);
  const mock = provinces.reduce((sum, p) => sum + p.mockPlacesCount, 0);
  return { real, mock, total: real + mock };
}
