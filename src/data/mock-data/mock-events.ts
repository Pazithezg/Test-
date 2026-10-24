/**
 * Mock Events Data for Testing
 * CLEARLY LABELED - These are NOT real events
 */

import { EventData } from '@/services/types';

/**
 * Generate mock events for next 3 months
 */
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export const mockEvents: EventData[] = [
  {
    id: 'mock-event-001',
    title: 'งานเทศกาลดนตรีตัวอย่าง',
    titleTh: 'งานเทศกาลดนตรีตัวอย่าง',
    description: 'ตัวอย่างงานเทศกาลดนตรี - ข้อมูลจำลอง',
    startDate: getFutureDate(7),
    endDate: getFutureDate(9),
    location: {
      name: 'สถานที่จัดงานตัวอย่าง',
      latitude: 13.7563,
      longitude: 100.5018,
      province: 'กรุงเทพมหานคร'
    },
    category: 'entertainment',
    price: {
      min: 300,
      max: 1500,
      isFree: false
    },
    source: 'mock',
    sourceUrl: '',
    isMock: true,
    dataQuality: 'mock'
  },
  {
    id: 'mock-event-002',
    title: 'งานวิ่งการกุศลตัวอย่าง',
    titleTh: 'งานวิ่งการกุศลตัวอย่าง',
    description: 'ตัวอย่างงานวิ่ง - ข้อมูลจำลอง',
    startDate: getFutureDate(14),
    location: {
      name: 'สวนสาธารณะตัวอย่าง',
      latitude: 13.7363,
      longitude: 100.5312,
      province: 'กรุงเทพมหานคร'
    },
    category: 'fitness',
    price: {
      min: 0,
      max: 0,
      isFree: true
    },
    source: 'mock',
    isMock: true,
    dataQuality: 'mock'
  },
  {
    id: 'mock-event-003',
    title: 'ตลาดนัดวินเทจตัวอย่าง',
    titleTh: 'ตลาดนัดวินเทจตัวอย่าง',
    description: 'ตัวอย่างตลาดนัด - ข้อมูลจำลอง',
    startDate: getFutureDate(3),
    endDate: getFutureDate(3),
    location: {
      name: 'สถานที่ตัวอย่าง',
      latitude: 18.7883,
      longitude: 98.9853,
      province: 'เชียงใหม่'
    },
    category: 'market',
    price: {
      min: 0,
      max: 0,
      isFree: true
    },
    source: 'mock',
    isMock: true,
    dataQuality: 'mock'
  }
];

/**
 * Filter events by date range
 */
export function filterEventsByDate(
  events: EventData[],
  startDate?: string,
  endDate?: string
): EventData[] {
  const now = new Date().toISOString().split('T')[0];
  
  return events.filter(event => {
    // Remove expired events
    if (event.endDate && event.endDate < now) return false;
    if (!event.endDate && event.startDate < now) return false;
    
    // Filter by date range if provided
    if (startDate && event.startDate < startDate) return false;
    if (endDate && event.startDate > endDate) return false;
    
    return true;
  });
}

/**
 * Get events by province
 */
export function getEventsByProvince(province: string): EventData[] {
  return mockEvents.filter(e => e.location.province === province);
}

/**
 * Get upcoming events (next 30 days)
 */
export function getUpcomingEvents(): EventData[] {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 30);
  
  return filterEventsByDate(
    mockEvents,
    today.toISOString().split('T')[0],
    future.toISOString().split('T')[0]
  );
}
