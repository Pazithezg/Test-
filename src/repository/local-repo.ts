import {
  BangkokArea,
  Place,
  EventItem,
  DiscoverableItem,
  FeedbackSubmission,
} from '../domain/models';
import { EventFilterInput, PlaceFilterInput } from '../domain/schemas';
import { DiscoveryRepository } from './interface';
import { BANGKOK_TEST_AREAS } from '../domain/constants';
import { isWithinRadius, calculateDistanceKm } from '../geo/distance';
import { findBangkokAreaById, getAllBangkokAreas } from '../geo/areas';

import placesData from '../data/seed-places.json';
import eventsData from '../data/seed-events.json';

export class LocalDiscoveryRepository implements DiscoveryRepository {
  private areas: BangkokArea[];
  private places: Place[];
  private events: EventItem[];
  private feedbackStore: FeedbackSubmission[];

  constructor(initialPlaces?: Place[], initialEvents?: EventItem[]) {
    this.areas = getAllBangkokAreas();
    this.places = initialPlaces ? [...initialPlaces] : (placesData as Place[]);
    this.events = initialEvents ? [...initialEvents] : (eventsData as EventItem[]);
    this.feedbackStore = [];
  }

  async getAreas(): Promise<BangkokArea[]> {
    return [...this.areas];
  }

  async getAreaById(id: string): Promise<BangkokArea | null> {
    const area = this.areas.find((a) => a.id === id);
    return area ? { ...area } : null;
  }

  async getPlaces(filter?: PlaceFilterInput): Promise<{ places: Place[]; total: number }> {
    let result = this.places.filter((p) => p.status === 'active');

    if (filter?.areaId) {
      result = result.filter((p) => p.areaId === filter.areaId);
    }

    if (filter?.category) {
      const cat = filter.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.categories.some((c) => c.toLowerCase() === cat) ||
          p.tags.some((t) => t.toLowerCase() === cat)
      );
    }

    if (filter?.priceTier) {
      result = result.filter((p) => p.priceTier === filter.priceTier);
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter((p) => {
        if (p.priceTier === 'free') return true;
        if (p.approxMinPrice === null) return false;
        return p.approxMinPrice <= (filter.maxPrice as number);
      });
    }

    // Radius filtering if coordinates provided
    if (filter?.latitude !== undefined && filter?.longitude !== undefined) {
      const center = { latitude: filter.latitude, longitude: filter.longitude };
      const radius = filter.radiusKm ?? 10;
      result = result.filter((p) => isWithinRadius(center, p, radius));
    }

    const total = result.length;
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? 20;
    const paginated = result.slice(offset, offset + limit);

    return { places: paginated, total };
  }

  async getPlaceById(id: string): Promise<Place | null> {
    const place = this.places.find((p) => p.id === id);
    return place ? { ...place } : null;
  }

  async getEvents(filter?: EventFilterInput): Promise<{ events: EventItem[]; total: number }> {
    let result = this.events.filter((e) => e.publicationStatus === 'published');

    if (filter?.areaId) {
      result = result.filter((e) => e.areaId === filter.areaId);
    }

    if (filter?.verificationStatus) {
      result = result.filter((e) => e.verificationStatus === filter.verificationStatus);
    }

    if (filter?.category) {
      const cat = filter.category.toLowerCase();
      result = result.filter(
        (e) =>
          e.categories.some((c) => c.toLowerCase() === cat) ||
          e.tags.some((t) => t.toLowerCase() === cat)
      );
    }

    if (filter?.isFree !== undefined) {
      result = result.filter((e) => e.isFree === filter.isFree);
    }

    if (filter?.maxPrice !== undefined) {
      result = result.filter((e) => {
        if (e.isFree) return true;
        if (e.minPrice === null) return false;
        return e.minPrice <= (filter.maxPrice as number);
      });
    }

    if (filter?.startDate) {
      const filterStart = new Date(filter.startDate).getTime();
      result = result.filter((e) => new Date(e.endDatetime).getTime() >= filterStart);
    }

    if (filter?.endDate) {
      const filterEnd = new Date(filter.endDate).getTime();
      result = result.filter((e) => new Date(e.startDatetime).getTime() <= filterEnd);
    }

    // Coordinate filtering
    if (filter?.latitude !== undefined && filter?.longitude !== undefined) {
      const center = { latitude: filter.latitude, longitude: filter.longitude };
      const radius = filter.radiusKm ?? 10;
      result = result.filter((e) => isWithinRadius(center, e, radius));
    }

    const total = result.length;
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? 20;
    const paginated = result.slice(offset, offset + limit);

    return { events: paginated, total };
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const event = this.events.find((e) => e.id === id);
    return event ? { ...event } : null;
  }

  async getItemById(id: string): Promise<DiscoverableItem | null> {
    const event = await this.getEventById(id);
    if (event) {
      return { itemType: 'event', ...event };
    }
    const place = await this.getPlaceById(id);
    if (place) {
      return { itemType: 'place', ...place };
    }
    return null;
  }

  async insertEvent(event: EventItem): Promise<EventItem> {
    const existingIndex = this.events.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      this.events[existingIndex] = { ...event, updatedAt: new Date().toISOString() };
      return this.events[existingIndex];
    }
    this.events.push(event);
    return event;
  }

  async insertPlace(place: Place): Promise<Place> {
    const existingIndex = this.places.findIndex((p) => p.id === place.id);
    if (existingIndex >= 0) {
      this.places[existingIndex] = { ...place, updatedAt: new Date().toISOString() };
      return this.places[existingIndex];
    }
    this.places.push(place);
    return place;
  }

  async findDuplicateEvents(
    title: string,
    venueName: string,
    startDatetime: string,
    sourceUrl?: string
  ): Promise<EventItem[]> {
    const normTitle = title.trim().toLowerCase();
    const normVenue = venueName.trim().toLowerCase();
    const startTime = new Date(startDatetime).getTime();

    return this.events.filter((e) => {
      if (sourceUrl && e.sourceUrl === sourceUrl) return true;

      const eTitle = e.title.trim().toLowerCase();
      const eVenue = e.venueName.trim().toLowerCase();
      const eStart = new Date(e.startDatetime).getTime();

      const sameVenue = eVenue === normVenue;
      const similarTitle =
        eTitle === normTitle || eTitle.includes(normTitle) || normTitle.includes(eTitle);
      const closeTime = Math.abs(eStart - startTime) < 24 * 60 * 60 * 1000; // within 24 hours

      return sameVenue && similarTitle && closeTime;
    });
  }

  async saveFeedback(feedback: FeedbackSubmission): Promise<void> {
    this.feedbackStore.push({
      ...feedback,
      id: feedback.id || `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: feedback.createdAt || new Date().toISOString(),
    });
  }

  async checkHealth(): Promise<{
    databaseConnected: boolean;
    totalPlaces: number;
    totalEvents: number;
    isFallbackStore: boolean;
  }> {
    return {
      databaseConnected: true,
      totalPlaces: this.places.length,
      totalEvents: this.events.length,
      isFallbackStore: true,
    };
  }
}
