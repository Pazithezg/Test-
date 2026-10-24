/**
 * Data Separation Tests
 * Verify Bangkok uses real data and mock provinces use mock data with correct flags
 */

import { describe, it, expect } from 'vitest';
import { mergeRealAndMockData } from '@/services/data-adapter/data-merger';

describe('Real vs Mock Data Separation', () => {
  it('Bangkok returns realCount=12207, mockCount=0', () => {
    const result = mergeRealAndMockData('กรุงเทพมหานคร');
    
    expect(result.realCount).toBe(12207);
    expect(result.mockCount).toBe(0);
    expect(result.places).toHaveLength(0); // Real data served by existing OSM system
  });
  
  it('Bangkok (English) returns same counts', () => {
    const result = mergeRealAndMockData('Bangkok');
    
    expect(result.realCount).toBe(12207);
    expect(result.mockCount).toBe(0);
  });
  
  it('mock province returns only mock data with isMock flag', () => {
    const result = mergeRealAndMockData('เชียงใหม่');
    
    expect(result.realCount).toBe(0);
    expect(result.mockCount).toBeGreaterThan(0);
    
    // All places should have isMock: true
    const allHaveMockFlag = result.places.every(p => p.isMock === true);
    expect(allHaveMockFlag).toBe(true);
  });
  
  it('Phuket returns correct mockCount', () => {
    const result = mergeRealAndMockData('ภูเก็ต');
    
    expect(result.mockCount).toBeGreaterThan(0);
    expect(result.realCount).toBe(0);
    expect(result.places.length).toBe(result.mockCount);
  });
  
  it('response includes realCount and mockCount fields', () => {
    const result = mergeRealAndMockData('เชียงใหม่');
    
    expect(result).toHaveProperty('realCount');
    expect(result).toHaveProperty('mockCount');
    expect(result).toHaveProperty('places');
    
    expect(typeof result.realCount).toBe('number');
    expect(typeof result.mockCount).toBe('number');
    expect(Array.isArray(result.places)).toBe(true);
  });
  
  it('mock province places have required fields', () => {
    const result = mergeRealAndMockData('เชียงใหม่');
    
    if (result.places.length > 0) {
      const place = result.places[0];
      
      expect(place).toHaveProperty('id');
      expect(place).toHaveProperty('name');
      expect(place).toHaveProperty('province');
      expect(place).toHaveProperty('isMock');
      expect(place).toHaveProperty('dataQuality');
      
      expect(place.isMock).toBe(true);
      expect(place.dataQuality).toBe('mock');
    }
  });
});
