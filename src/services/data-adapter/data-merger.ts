/**
 * Data Merger - Combine real and mock data by province
 */

import { PlaceData } from '../types';
import { mockPlaces } from '../../data/mock-data/mock-places';
import { provinces } from '../../data/thailand-provinces/index';

export function mergeRealAndMockData(
  province: string
): {
  places: PlaceData[];
  realCount: number;
  mockCount: number;
} {
  // Bangkok has real data from OSM files
  // For now, also include Bangkok mock places for demo
  const normalizedProvince = province === 'Bangkok' ? 'กรุงเทพมหานคร' : province;
  const filtered = mockPlaces.filter(p => p.province === normalizedProvince);
  
  // Verify all have isMock: true
  filtered.forEach(place => {
    if (!place.isMock) {
      console.warn(`Place ${place.id} missing isMock flag`);
    }
  });
  
  const isRealBangkok = normalizedProvince === 'กรุงเทพมหานคร';
  
  return {
    places: filtered,
    realCount: isRealBangkok ? 12207 : 0,
    mockCount: filtered.length
  };
}

export function getAllProvincesStatus(): Array<{
  province: string;
  provinceEn: string;
  realCount: number;
  mockCount: number;
}> {
  return provinces.map(p => ({
    province: p.nameTh,
    provinceEn: p.nameEn,
    realCount: p.realPlacesCount,
    mockCount: p.mockPlacesCount
  }));
}
