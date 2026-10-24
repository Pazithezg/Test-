/**
 * Shared type definitions for South Seek services
 * DO NOT modify existing domain types - these are NEW types only
 */

export type TravelMode = 'walk' | 'bicycle' | 'motorcycle' | 'car';

export type DataQuality = 'real' | 'mock';

export interface PlaceData {
  id: string;
  name: string;
  nameTh?: string;
  category: string;
  latitude: number;
  longitude: number;
  province: string;
  address?: string;
  source: string;
  sourceUrl?: string;
  lastUpdated: string;
  dataQuality: DataQuality;
  isMock: boolean;
  tags?: Record<string, any>;
}

export interface RouteSegment {
  from: [number, number]; // [lat, lng]
  to: [number, number];
  distanceKm: number;
  durationMinutes: number;
  mode: TravelMode;
  geometry?: string; // polyline if available
}

export interface TravelEstimate {
  distanceKm: number;
  durationMinutes: number;
  costMin: number;
  costMax: number;
  fuelCost?: number;
  parkingCost?: number;
  breakdown: string[];
  disclaimer: string;
  source: 'osrm' | 'fallback';
}

export interface TripRequest {
  startLocation: [number, number]; // [lat, lng]
  places: string[]; // Place IDs
  timeBudgetHours: number;
  costBudgetTHB: number;
  travelMode: TravelMode;
  timePerPlaceMinutes?: number; // Default 45
}

export interface TripPlan {
  feasible: boolean;
  route: {
    order: string[]; // Optimized place IDs
    segments: RouteSegment[];
    totalDistanceKm: number;
    totalTimeMinutes: number;
    totalCostMin: number;
    totalCostMax: number;
  };
  timeline: {
    startTime: string; // "09:00"
    endTime: string; // "12:00"
    stops: StopTime[];
  };
  warnings: string[];
  reasons?: string[];
}

export interface StopTime {
  placeId: string;
  placeName: string;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
}

export interface EventData {
  id: string;
  title: string;
  titleTh?: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate?: string;
  location: {
    name: string;
    latitude?: number;
    longitude?: number;
    province: string;
  };
  category: string;
  price?: {
    min: number;
    max: number;
    isFree: boolean;
  };
  source: string;
  sourceUrl?: string;
  imageUrl?: string;
  isMock: boolean;
  dataQuality: DataQuality;
}

export interface ProvinceData {
  code: string; // e.g., "TH-50" for Chiang Mai
  nameTh: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  realPlacesCount: number;
  mockPlacesCount: number;
  categories: string[];
  lastUpdated: string;
}
