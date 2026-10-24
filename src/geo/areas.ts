import { BANGKOK_TEST_AREAS } from '../domain/constants';
import { BangkokArea } from '../domain/models';
import { calculateDistanceKm } from './distance';

export function getAllBangkokAreas(): BangkokArea[] {
  return BANGKOK_TEST_AREAS.map((area) => ({
    ...area,
    tags: [...area.tags],
  }));
}

export function findBangkokAreaById(areaId: string): BangkokArea | undefined {
  const area = BANGKOK_TEST_AREAS.find((a) => a.id === areaId);
  if (!area) return undefined;
  return {
    ...area,
    tags: [...area.tags],
  };
}

export function findClosestBangkokArea(latitude: number, longitude: number): {
  area: BangkokArea;
  distanceKm: number;
} | null {
  let closest: BangkokArea | null = null;
  let minDistance = Infinity;

  const areas = getAllBangkokAreas();
  for (const area of areas) {
    const dist = calculateDistanceKm(
      { latitude, longitude },
      { latitude: area.latitude, longitude: area.longitude }
    );
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      closest = area;
    }
  }

  if (!closest) return null;
  return { area: closest, distanceKm: minDistance };
}
