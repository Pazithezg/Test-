import { EventItem } from '../../domain/models';

export type WebCalendarSource = {
  name: string;
  url: string;
};

export const BANGKOK_EVENT_SOURCES: WebCalendarSource[] = [
  { name: 'Visit Bangkok', url: 'https://visit.bangkok.go.th/th/festival-calendar' },
  { name: 'ThaiTicketMajor', url: 'https://www.thaiticketmajor.com/' },
  { name: 'Eventpop', url: 'https://www.eventpop.me/' },
  { name: 'การท่องเที่ยวแห่งประเทศไทย', url: 'https://thai.tourismthailand.org/' },
];

/**
 * Prototype-friendly importer: reads public JSON-LD event cards when a source
 * exposes them. Sources that block automated requests simply return no rows.
 * Every imported row keeps its source URL so the UI never presents scraped data
 * as first-party truth.
 */
export async function fetchPublicCalendarEvents(source: WebCalendarSource): Promise<EventItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'SouthSeekPrototype/1.0 (+local prototype)' },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const html = await response.text();
    const events: any[] = [];
    const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
    for (const block of blocks) {
      const raw = block.replace(/^.*?>|<\/script>$/gis, '').trim();
      try {
        const parsed = JSON.parse(raw);
        const values: any[] = Array.isArray(parsed) ? parsed : parsed?.['@graph'] || [parsed];
        events.push(...values.filter((item) => item?.['@type'] === 'Event' || item?.eventType));
      } catch {
        // One malformed card must not break the complete source sync.
      }
    }
    return events.map((event, index) => mapJsonLdEvent(event, source, index)).filter(Boolean) as EventItem[];
  } catch {
    return [];
  }
}

function mapJsonLdEvent(event: any, source: WebCalendarSource, index: number): EventItem | null {
  const start = event.startDate;
  if (!event.name || !start) return null;
  const location = typeof event.location === 'object' ? event.location : {};
  const address = typeof location.address === 'object' ? location.address : {};
  const latitude = Number(location.geo?.latitude);
  const longitude = Number(location.geo?.longitude);
  const price = Number(event.offers?.price);
  const now = new Date().toISOString();
  return {
    id: `web-${source.name.toLowerCase().replace(/\W+/g, '-')}-${index}-${String(event.name).slice(0, 20)}`,
    title: String(event.name), titleTh: String(event.name),
    description: String(event.description || ''), descriptionTh: String(event.description || ''),
    placeId: null, venueName: String(location.name || 'สถานที่จัดงาน'),
    address: String(address.streetAddress || address.addressLocality || ''), addressTh: String(address.streetAddress || address.addressLocality || ''),
    areaId: 'bangkok', latitude: Number.isFinite(latitude) ? latitude : null, longitude: Number.isFinite(longitude) ? longitude : null,
    categories: ['event'], tags: ['bangkok', source.name], startDatetime: String(start),
    endDatetime: String(event.endDate || start), minPrice: Number.isFinite(price) ? price : null,
    maxPrice: Number.isFinite(price) ? price : null, isFree: Number.isFinite(price) ? price === 0 : false,
    currency: 'THB', sourceUrl: String(event.url || source.url), sourceName: source.name,
    lastCheckedAt: now, verificationStatus: 'unverified', publicationStatus: 'published', eventStatus: 'scheduled',
    isDemoFixture: false, createdAt: now, updatedAt: now,
  };
}
