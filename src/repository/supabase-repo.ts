import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BangkokArea,
  Place,
  EventItem,
  DiscoverableItem,
  FeedbackSubmission,
} from '../domain/models';
import { EventFilterInput, PlaceFilterInput } from '../domain/schemas';
import { DiscoveryRepository } from './interface';
import { getAllBangkokAreas } from '../geo/areas';

export class SupabaseDiscoveryRepository implements DiscoveryRepository {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async getAreas(): Promise<BangkokArea[]> {
    const { data, error } = await this.client
      .from('bangkok_areas')
      .select('*')
      .order('id');

    if (error || !data || data.length === 0) {
      // Fallback to constants if table is empty
      return getAllBangkokAreas();
    }

    return data.map((row) => ({
      id: row.id,
      nameEn: row.name_en,
      nameTh: row.name_th,
      descriptionEn: row.description_en,
      descriptionTh: row.description_th,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      radiusKmDefault: Number(row.radius_km_default),
      tags: row.tags || [],
    }));
  }

  async getAreaById(id: string): Promise<BangkokArea | null> {
    const { data, error } = await this.client
      .from('bangkok_areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      nameEn: data.name_en,
      nameTh: data.name_th,
      descriptionEn: data.description_en,
      descriptionTh: data.description_th,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      radiusKmDefault: Number(data.radius_km_default),
      tags: data.tags || [],
    };
  }

  async getPlaces(filter?: PlaceFilterInput): Promise<{ places: Place[]; total: number }> {
    let query = this.client
      .from('places')
      .select('*', { count: 'exact' })
      .eq('status', 'active');

    if (filter?.areaId) {
      query = query.eq('area_id', filter.areaId);
    }

    if (filter?.priceTier) {
      query = query.eq('price_tier', filter.priceTier);
    }

    if (filter?.maxPrice !== undefined) {
      query = query.lte('approx_min_price', filter.maxPrice);
    }

    if (filter?.category) {
      query = query.contains('categories', [filter.category]);
    }

    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      return { places: [], total: 0 };
    }

    const places: Place[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      nameTh: row.name_th,
      description: row.description,
      descriptionTh: row.description_th,
      areaId: row.area_id,
      address: row.address,
      addressTh: row.address_th,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      categories: row.categories || [],
      tags: row.tags || [],
      priceTier: row.price_tier,
      approxMinPrice: row.approx_min_price ? Number(row.approx_min_price) : null,
      approxMaxPrice: row.approx_max_price ? Number(row.approx_max_price) : null,
      currency: row.currency || 'THB',
      sourceUrl: row.source_url,
      sourceName: row.source_name,
      lastCheckedAt: row.last_checked_at,
      verificationStatus: row.verification_status,
      status: row.status,
      openingHours: row.opening_hours,
      typicalDurationMinutes: row.typical_duration_minutes,
      isDemoFixture: row.is_demo_fixture || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { places, total: count ?? places.length };
  }

  async getPlaceById(id: string): Promise<Place | null> {
    const { data, error } = await this.client
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      nameTh: data.name_th,
      description: data.description,
      descriptionTh: data.description_th,
      areaId: data.area_id,
      address: data.address,
      addressTh: data.address_th,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      categories: data.categories || [],
      tags: data.tags || [],
      priceTier: data.price_tier,
      approxMinPrice: data.approx_min_price ? Number(data.approx_min_price) : null,
      approxMaxPrice: data.approx_max_price ? Number(data.approx_max_price) : null,
      currency: data.currency || 'THB',
      sourceUrl: data.source_url,
      sourceName: data.source_name,
      lastCheckedAt: data.last_checked_at,
      verificationStatus: data.verification_status,
      status: data.status,
      openingHours: data.opening_hours,
      typicalDurationMinutes: data.typical_duration_minutes,
      isDemoFixture: data.is_demo_fixture || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getEvents(filter?: EventFilterInput): Promise<{ events: EventItem[]; total: number }> {
    let query = this.client
      .from('events')
      .select('*', { count: 'exact' })
      .eq('publication_status', 'published');

    if (filter?.areaId) {
      query = query.eq('area_id', filter.areaId);
    }

    if (filter?.verificationStatus) {
      query = query.eq('verification_status', filter.verificationStatus);
    }

    if (filter?.isFree !== undefined) {
      query = query.eq('is_free', filter.isFree);
    }

    if (filter?.maxPrice !== undefined) {
      query = query.lte('min_price', filter.maxPrice);
    }

    if (filter?.startDate) {
      query = query.gte('end_datetime', filter.startDate);
    }

    if (filter?.endDate) {
      query = query.lte('start_datetime', filter.endDate);
    }

    if (filter?.category) {
      query = query.contains('categories', [filter.category]);
    }

    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('start_datetime', { ascending: true });

    const { data, count, error } = await query;
    if (error || !data) {
      return { events: [], total: 0 };
    }

    const events: EventItem[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      titleTh: row.title_th,
      description: row.description,
      descriptionTh: row.description_th,
      placeId: row.place_id,
      venueName: row.venue_name,
      address: row.address,
      addressTh: row.address_th,
      areaId: row.area_id,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      categories: row.categories || [],
      tags: row.tags || [],
      startDatetime: row.start_datetime,
      endDatetime: row.end_datetime,
      minPrice: row.min_price != null ? Number(row.min_price) : null,
      maxPrice: row.max_price != null ? Number(row.max_price) : null,
      isFree: row.is_free,
      currency: row.currency || 'THB',
      sourceUrl: row.source_url,
      sourceName: row.source_name,
      lastCheckedAt: row.last_checked_at,
      verificationStatus: row.verification_status,
      publicationStatus: row.publication_status,
      eventStatus: row.event_status,
      isDemoFixture: row.is_demo_fixture || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { events, total: count ?? events.length };
  }

  async getEventById(id: string): Promise<EventItem | null> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      titleTh: data.title_th,
      description: data.description,
      descriptionTh: data.description_th,
      placeId: data.place_id,
      venueName: data.venue_name,
      address: data.address,
      addressTh: data.address_th,
      areaId: data.area_id,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      categories: data.categories || [],
      tags: data.tags || [],
      startDatetime: data.start_datetime,
      endDatetime: data.end_datetime,
      minPrice: data.min_price != null ? Number(data.min_price) : null,
      maxPrice: data.max_price != null ? Number(data.max_price) : null,
      isFree: data.is_free,
      currency: data.currency || 'THB',
      sourceUrl: data.source_url,
      sourceName: data.source_name,
      lastCheckedAt: data.last_checked_at,
      verificationStatus: data.verification_status,
      publicationStatus: data.publication_status,
      eventStatus: data.event_status,
      isDemoFixture: data.is_demo_fixture || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getItemById(id: string): Promise<DiscoverableItem | null> {
    const event = await this.getEventById(id);
    if (event) return { itemType: 'event', ...event };
    const place = await this.getPlaceById(id);
    if (place) return { itemType: 'place', ...place };
    return null;
  }

  async insertEvent(event: EventItem): Promise<EventItem> {
    const { data, error } = await this.client
      .from('events')
      .upsert({
        id: event.id,
        title: event.title,
        title_th: event.titleTh,
        description: event.description,
        description_th: event.descriptionTh,
        place_id: event.placeId,
        venue_name: event.venueName,
        address: event.address,
        address_th: event.addressTh,
        area_id: event.areaId,
        latitude: event.latitude,
        longitude: event.longitude,
        categories: event.categories,
        tags: event.tags,
        start_datetime: event.startDatetime,
        end_datetime: event.endDatetime,
        min_price: event.minPrice,
        max_price: event.maxPrice,
        is_free: event.isFree,
        currency: event.currency,
        source_url: event.sourceUrl,
        source_name: event.sourceName,
        last_checked_at: event.lastCheckedAt,
        verification_status: event.verificationStatus,
        publication_status: event.publicationStatus,
        event_status: event.eventStatus,
        is_demo_fixture: event.isDemoFixture,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert event into Supabase: ${error.message}`);
    }
    return event;
  }

  async insertPlace(place: Place): Promise<Place> {
    const { data, error } = await this.client
      .from('places')
      .upsert({
        id: place.id,
        name: place.name,
        name_th: place.nameTh,
        description: place.description,
        description_th: place.descriptionTh,
        area_id: place.areaId,
        address: place.address,
        address_th: place.addressTh,
        latitude: place.latitude,
        longitude: place.longitude,
        categories: place.categories,
        tags: place.tags,
        price_tier: place.priceTier,
        approx_min_price: place.approxMinPrice,
        approx_max_price: place.approxMaxPrice,
        currency: place.currency,
        source_url: place.sourceUrl,
        source_name: place.sourceName,
        last_checked_at: place.lastCheckedAt,
        verification_status: place.verificationStatus,
        status: place.status,
        opening_hours: place.openingHours,
        typical_duration_minutes: place.typicalDurationMinutes,
        is_demo_fixture: place.isDemoFixture,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert place into Supabase: ${error.message}`);
    }
    return place;
  }

  async findDuplicateEvents(
    title: string,
    venueName: string,
    startDatetime: string,
    sourceUrl?: string
  ): Promise<EventItem[]> {
    if (sourceUrl) {
      const { data } = await this.client
        .from('events')
        .select('*')
        .eq('source_url', sourceUrl);
      if (data && data.length > 0) {
        return data as unknown as EventItem[];
      }
    }

    const { data } = await this.client
      .from('events')
      .select('*')
      .ilike('venue_name', `%${venueName}%`);

    if (!data) return [];
    return data as unknown as EventItem[];
  }

  async saveFeedback(feedback: FeedbackSubmission): Promise<void> {
    const { error } = await this.client.from('recommendation_feedback').insert({
      recommendation_id: feedback.recommendationId,
      item_id: feedback.itemId,
      feedback_type: feedback.feedbackType,
      comment: feedback.comment,
    });
    if (error) {
      console.error('Failed to save feedback in Supabase:', error.message);
    }
  }

  async checkHealth(): Promise<{
    databaseConnected: boolean;
    totalPlaces: number;
    totalEvents: number;
    isFallbackStore: boolean;
  }> {
    try {
      const { count: placeCount, error: err1 } = await this.client
        .from('places')
        .select('*', { count: 'exact', head: true });
      const { count: eventCount, error: err2 } = await this.client
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (err1 || err2) {
        return {
          databaseConnected: false,
          totalPlaces: 0,
          totalEvents: 0,
          isFallbackStore: false,
        };
      }

      return {
        databaseConnected: true,
        totalPlaces: placeCount ?? 0,
        totalEvents: eventCount ?? 0,
        isFallbackStore: false,
      };
    } catch {
      return {
        databaseConnected: false,
        totalPlaces: 0,
        totalEvents: 0,
        isFallbackStore: false,
      };
    }
  }
}
