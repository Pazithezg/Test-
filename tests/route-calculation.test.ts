/**
 * Route Calculation Tests
 * Testing OSRM client, distance calculator, and cost calculator
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { getRoute } from '@/services/route/osrm-client';
import { calculateStraightLineDistance, estimateTravelTime } from '@/services/route/distance-calculator';
import { calculateTravelCost } from '@/services/route/travel-cost';

describe('OSRM Client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('builds correct URL with lng,lat order (not lat,lng)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{
          legs: [{
            distance: 10000, // meters
            duration: 600 // seconds
          }],
          geometry: { type: 'LineString', coordinates: [] }
        }]
      })
    });
    
    global.fetch = mockFetch as any;
    
    const start: [number, number] = [13.7563, 100.5018]; // [lat, lng]
    const end: [number, number] = [13.7463, 100.5118];
    
    await getRoute(start, end, 'driving');
    
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0];
    
    // Verify OSRM uses lng,lat order: lng1,lat1;lng2,lat2
    expect(callUrl).toContain('100.5018,13.7563;100.5118,13.7463');
  });
  
  it('returns null on network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch as any;
    
    const result = await getRoute([13.7563, 100.5018], [13.7463, 100.5118], 'driving');
    
    expect(result).toBeNull();
  });
  
  it('returns null on timeout', async () => {
    const mockFetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        // Simulate AbortController timeout behavior
        setTimeout(() => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        }, 100);
      });
    });
    
    global.fetch = mockFetch as any;
    
    const result = await getRoute([13.7563, 100.5018], [13.7463, 100.5118], 'driving');
    
    expect(result).toBeNull();
  });
});

describe('Distance Calculator', () => {
  it('calculates Bangkok to Chiang Mai distance ≈ 570km', () => {
    const bangkok: [number, number] = [13.7563, 100.5018];
    const chiangMai: [number, number] = [18.7883, 98.9853];
    
    const distance = calculateStraightLineDistance(bangkok, chiangMai);
    
    // Should be within 50km of 570km
    expect(distance).toBeGreaterThan(520);
    expect(distance).toBeLessThan(620);
  });
  
  it('estimates reasonable travel time for walking', () => {
    const minutes = estimateTravelTime(10, 'walk');
    
    // 10km walk at ~4.5 km/h with 1.3x road factor = ~173 minutes
    expect(minutes).toBeGreaterThan(150);
    expect(minutes).toBeLessThan(200);
  });
});

describe('Travel Cost Calculator', () => {
  it('returns zero cost for walking', () => {
    const cost = calculateTravelCost(10, 'walk');
    
    expect(cost.costMin).toBe(0);
    expect(cost.costMax).toBe(0);
    expect(cost.fuelCost).toBe(0);
    expect(cost.parkingCost).toBe(0);
    expect(cost.breakdown).toContain('ไม่มีค่าใช้จ่าย');
  });
  
  it('calculates car costs with fuel and parking', () => {
    const cost = calculateTravelCost(10, 'car');
    
    expect(cost.fuelCost).toBeGreaterThan(0);
    expect(cost.costMax).toBeGreaterThan(cost.costMin); // Parking range
    expect(cost.disclaimer).toBeTruthy();
    expect(cost.breakdown.length).toBeGreaterThan(0);
  });
  
  it('calculates motorcycle costs without parking variation', () => {
    const cost = calculateTravelCost(10, 'motorcycle');
    
    expect(cost.fuelCost).toBeGreaterThan(0);
    expect(cost.costMin).toBe(cost.costMax); // No parking cost variation
    expect(cost.parkingCost).toBe(0);
  });
});
