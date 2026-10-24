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
  // Bangkok has real data from OSM files (not loaded here)
  if (province === 'กรุงเทพมหานคร' || province === 'Bangkok') {
    return {
      places: [], // Real data served by existing OSM system
      realCount: 12207,
      mockCount: 0
    };
  }
  
  // Filter mock places by province
  const filtered = mockPlaces.filter(p => p.province === province);
  
  // Verify all have isMock: true
  filtered.forEach(place => {
    if (!place.isMock) {
      console.warn(`Place ${place.id} missing isMock flag`);
    }
  });
  
  return {
    places: filtered,
    realCount: 0,
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
