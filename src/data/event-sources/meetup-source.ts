/**
 * Meetup Event Source
 * 
 * API Status: ✅ GraphQL API available
 * Documentation: https://www.meetup.com/api/guide
 * Auth: OAuth 2.0
 * Free Tier: Yes (rate limits apply)
 * 
 * Recommendation: Can integrate with proper OAuth setup
 */

import { EventItem } from '../../domain/models';

export interface MeetupApiConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string; // Obtained via OAuth 2.0 flow
  baseUrl?: string;
}

/**
 * Fetch events from Meetup GraphQL API
 * 
 * Setup required:
 * 1. Create OAuth app at https://www.meetup.com/api/oauth/list/
 * 2. Implement OAuth 2.0 flow to get access token
 * 3. Set MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_ACCESS_TOKEN in .env
 * 
 * GraphQL endpoint: https://api.meetup.com/gql
 */
export async function fetchMeetupEvents(
  config: MeetupApiConfig,
  query: { location: string; dateRange?: string; radiusKm?: number }
): Promise<EventItem[]> {
  const baseUrl = config.baseUrl || 'https://api.meetup.com/gql';
  
  // TODO: Implement OAuth token refresh if expired
  // TODO: Implement GraphQL query for events near location
  
  console.log('[Meetup] API available but requires OAuth setup');
  console.log('[Meetup] Query:', query);
  
  // Sample GraphQL query structure (not executed)
  const graphqlQuery = `
    query SearchEvents($lat: Float!, $lon: Float!, $radius: Int!) {
      rankedEvents(filter: {
        lat: $lat
        lon: $lon
        radius: $radius
        startDateRange: "today"
      }) {
        edges {
          node {
            id
            title
            description
            dateTime
            endTime
            eventUrl
            venue {
              name
              address
              city
              lat
              lng
            }
            group {
              name
            }
          }
        }
      }
    }
  `;
  
  // Return empty array until OAuth is set up
  return [];
}

/**
 * Map Meetup GraphQL response to our EventItem schema
 */
function mapMeetupToEventItem(meetupEvent: any, areaId: string): EventItem {
  return {
    id: `meetup-${meetupEvent.id}`,
    title: meetupEvent.title,
    titleTh: undefined,
    description: meetupEvent.description || '',
    descriptionTh: undefined,
    placeId: null,
    venueName: meetupEvent.venue?.name || meetupEvent.group?.name || 'Meetup Event',
    address: meetupEvent.venue?.address || meetupEvent.venue?.city || '',
    addressTh: undefined,
    areaId: areaId,
    latitude: meetupEvent.venue?.lat || null,
    longitude: meetupEvent.venue?.lng || null,
    categories: ['social', 'community'],
    tags: ['meetup', 'community'],
    startDatetime: meetupEvent.dateTime,
    endDatetime: meetupEvent.endTime || meetupEvent.dateTime,
    minPrice: null,
    maxPrice: null,
    isFree: true, // Most Meetup events are free
    currency: 'THB',
    sourceUrl: meetupEvent.eventUrl || '',
    sourceName: 'Meetup.com',
    lastCheckedAt: new Date().toISOString(),
    verificationStatus: 'verified',
    publicationStatus: 'published',
    eventStatus: 'scheduled',
    isDemoFixture: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
