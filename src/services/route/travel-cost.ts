/**
 * Travel Cost Calculator with Thai fuel prices
 */

import { TravelMode } from '../types';

export const FUEL_PRICE_PER_LITER = 35; // THB
export const CAR_KM_PER_LITER = 12;
export const MOTORCYCLE_KM_PER_LITER = 35;
export const PARKING_MIN_THB = 0;
export const PARKING_MAX_THB = 80;

export function calculateTravelCost(
  distanceKm: number,
  mode: TravelMode
): {
  costMin: number;
  costMax: number;
  fuelCost: number;
  parkingCost: number;
  breakdown: string[];
  disclaimer: string;
} {
  const disclaimer = 'ประมาณการณ์เท่านั้น ราคาจริงอาจแตกต่าง';
  
  if (mode === 'walk' || mode === 'bicycle') {
    return {
      costMin: 0,
      costMax: 0,
      fuelCost: 0,
      parkingCost: 0,
      breakdown: ['ไม่มีค่าใช้จ่าย'],
      disclaimer
    };
  }
  
  if (mode === 'car') {
    const fuelCost = Math.ceil((distanceKm / CAR_KM_PER_LITER) * FUEL_PRICE_PER_LITER);
    const parkingMin = PARKING_MIN_THB;
    const parkingMax = PARKING_MAX_THB;
    
    return {
      costMin: fuelCost + parkingMin,
      costMax: fuelCost + parkingMax,
      fuelCost,
      parkingCost: parkingMax, // Use max for display
      breakdown: [
        `ค่าน้ำมัน: ${fuelCost} บาท (${distanceKm.toFixed(1)} กม. × ${FUEL_PRICE_PER_LITER} บาท/ลิตร ÷ ${CAR_KM_PER_LITER} กม./ลิตร)`,
        `ค่าจอดรถ: ${parkingMin}-${parkingMax} บาท`
      ],
      disclaimer
    };
  }
  
  if (mode === 'motorcycle') {
    const fuelCost = Math.ceil((distanceKm / MOTORCYCLE_KM_PER_LITER) * FUEL_PRICE_PER_LITER);
    
    return {
      costMin: fuelCost,
      costMax: fuelCost,
      fuelCost,
      parkingCost: 0,
      breakdown: [
        `ค่าน้ำมัน: ${fuelCost} บาท (${distanceKm.toFixed(1)} กม. × ${FUEL_PRICE_PER_LITER} บาท/ลิตร ÷ ${MOTORCYCLE_KM_PER_LITER} กม./ลิตร)`
      ],
      disclaimer
    };
  }
  
  // Default fallback
  return {
    costMin: 0,
    costMax: 0,
    fuelCost: 0,
    parkingCost: 0,
    breakdown: [],
    disclaimer
  };
}
