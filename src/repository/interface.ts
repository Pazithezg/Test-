import {
  BangkokArea,
  Place,
  EventItem,
  DiscoverableItem,
  FeedbackSubmission,
} from '../domain/models';
import { EventFilterInput, PlaceFilterInput } from '../domain/schemas';

export interface DiscoveryRepository {
  getAreas(): Promise<BangkokArea[]>;
  getAreaById(id: string): Promise<BangkokArea | null>;
  
  getPlaces(filter?: PlaceFilterInput): Promise<{ places: Place[]; total: number }>;
  getPlaceById(id: string): Promise<Place | null>;
  
  getEvents(filter?: EventFilterInput): Promise<{ events: EventItem[]; total: number }>;
  getEventById(id: string): Promise<EventItem | null>;
  
  getItemById(id: string): Promise<DiscoverableItem | null>;
  
  insertEvent(event: EventItem): Promise<EventItem>;
  insertPlace(place: Place): Promise<Place>;
  
  findDuplicateEvents(
    title: string,
    venueName: string,
    startDatetime: string,
    sourceUrl?: string
  ): Promise<EventItem[]>;
  
  saveFeedback(feedback: FeedbackSubmission): Promise<void>;
  
  checkHealth(): Promise<{
    databaseConnected: boolean;
    totalPlaces: number;
    totalEvents: number;
    isFallbackStore: boolean;
  }>;
}
