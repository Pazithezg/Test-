import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, isWithinRadius } from '../src/geo/distance';
import { findBangkokAreaById, findClosestBangkokArea, getAllBangkokAreas } from '../src/geo/areas';

describe('Geospatial & Bangkok Areas', () => {
  it('calculates accurate Haversine distance between Siam and Riverside', () => {
    // Siam: 13.7460, 100.5348
    // Riverside: 13.7275, 100.5144
    const dist = calculateDistanceKm(
      { latitude: 13.7460, longitude: 100.5348 },
      { latitude: 13.7275, longitude: 100.5144 }
    );
    expect(dist).not.toBeNull();
    // Distance between Siam and Charoen Krung is roughly 3.0 - 3.2 km
    expect(dist).toBeGreaterThan(2.5);
    expect(dist).toBeLessThan(3.5);
  });

  it('returns null distance if either point has null coordinates without fabricating numbers', () => {
    expect(
      calculateDistanceKm({ latitude: null, longitude: null }, { latitude: 13.75, longitude: 100.50 })
    ).toBeNull();

    expect(
      calculateDistanceKm({ latitude: 13.75, longitude: 100.50 }, { latitude: null, longitude: 100.50 })
    ).toBeNull();
  });

  it('correctly filters targets within radius', () => {
    const siam = { latitude: 13.7460, longitude: 100.5348 };
    const bacc = { latitude: 13.7466, longitude: 100.5304 }; // ~0.48 km from Siam center
    const chatuchak = { latitude: 13.8028, longitude: 100.5534 }; // ~6.5 km from Siam

    expect(isWithinRadius(siam, bacc, 2.0)).toBe(true);
    expect(isWithinRadius(siam, chatuchak, 3.0)).toBe(false);
    expect(isWithinRadius(siam, chatuchak, 10.0)).toBe(true);
  });

  it('resolves supported Bangkok test areas correctly', () => {
    const areas = getAllBangkokAreas();
    expect(areas.length).toBeGreaterThanOrEqual(6);

    const siam = findBangkokAreaById('bangkok-siam');
    expect(siam).toBeDefined();
    expect(siam?.nameEn).toContain('Siam');
    expect(siam?.nameTh).toContain('สยาม');

    const unknown = findBangkokAreaById('non-existent');
    expect(unknown).toBeUndefined();
  });

  it('finds closest Bangkok area for given coordinates', () => {
    // Coordinate near Ari: 13.7800, 100.5450
    const result = findClosestBangkokArea(13.7800, 100.5450);
    expect(result).not.toBeNull();
    expect(result?.area.id).toBe('bangkok-ari');
    expect(result?.distanceKm).toBeLessThan(1.0);
  });
});
