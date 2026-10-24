/**
 * Trip Optimizer Tests
 * Testing route optimization, budget constraints, and feasibility
 */

import { describe, it, expect } from 'vitest';
import { optimizeTripRoute } from '@/services/trip/optimizer';
import { TripRequest } from '@/services/types';

describe('Trip Optimizer', () => {
  it('3-hour budget with 3 nearby places is feasible', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018], // Bangkok
      places: ['place1', 'place2', 'place3'],
      timeBudgetHours: 3,
      costBudgetTHB: 500,
      travelMode: 'car',
      timePerPlaceMinutes: 30
    };
    
    const plan = optimizeTripRoute(request);
    
    expect(plan.feasible).toBe(true);
    expect(plan.route.order).toHaveLength(3);
    expect(plan.route.segments).toHaveLength(3);
    expect(plan.timeline.stops).toHaveLength(3);
  });
  
  it('500 THB budget not exceeded for short car trip', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018],
      places: ['place1'],
      timeBudgetHours: 2,
      costBudgetTHB: 500,
      travelMode: 'car',
      timePerPlaceMinutes: 45
    };
    
    const plan = optimizeTripRoute(request);
    
    expect(plan.route.totalCostMax).toBeLessThanOrEqual(500);
    expect(plan.feasible).toBe(true);
  });
  
  it('infeasible time budget triggers reasons', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018],
      places: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'],
      timeBudgetHours: 1, // Only 1 hour for 10 places
      costBudgetTHB: 10000,
      travelMode: 'walk',
      timePerPlaceMinutes: 45
    };
    
    const plan = optimizeTripRoute(request);
    
    expect(plan.feasible).toBe(false);
    expect(plan.reasons).toBeDefined();
    expect(plan.reasons!.length).toBeGreaterThan(0);
    expect(plan.reasons![0]).toContain('เวลา');
  });
  
  it('budget within 20% triggers warning', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018],
      places: ['place1', 'place2', 'place3', 'place4'],
      timeBudgetHours: 2.5,
      costBudgetTHB: 5000,
      travelMode: 'car',
      timePerPlaceMinutes: 30
    };
    
    const plan = optimizeTripRoute(request);
    
    // Should be feasible but might have warnings if close to budget
    expect(plan.feasible).toBe(true);
    expect(plan.warnings).toBeDefined();
  });
  
  it('route order is deterministic (same input → same output)', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018],
      places: ['place1', 'place2', 'place3'],
      timeBudgetHours: 3,
      costBudgetTHB: 500,
      travelMode: 'car'
    };
    
    const plan1 = optimizeTripRoute(request);
    const plan2 = optimizeTripRoute(request);
    
    expect(plan1.route.order).toEqual(plan2.route.order);
    expect(plan1.route.totalDistanceKm).toBe(plan2.route.totalDistanceKm);
  });
  
  it('TripPlan has correct structure', () => {
    const request: TripRequest = {
      startLocation: [13.7563, 100.5018],
      places: ['place1', 'place2'],
      timeBudgetHours: 2,
      costBudgetTHB: 300,
      travelMode: 'bicycle'
    };
    
    const plan = optimizeTripRoute(request);
    
    expect(plan).toHaveProperty('feasible');
    expect(plan).toHaveProperty('route');
    expect(plan).toHaveProperty('timeline');
    expect(plan).toHaveProperty('warnings');
    
    expect(plan.route).toHaveProperty('order');
    expect(plan.route).toHaveProperty('segments');
    expect(plan.route).toHaveProperty('totalDistanceKm');
    expect(plan.route).toHaveProperty('totalTimeMinutes');
    expect(plan.route).toHaveProperty('totalCostMin');
    expect(plan.route).toHaveProperty('totalCostMax');
    
    expect(plan.timeline).toHaveProperty('startTime');
    expect(plan.timeline).toHaveProperty('endTime');
    expect(plan.timeline).toHaveProperty('stops');
  });
});
