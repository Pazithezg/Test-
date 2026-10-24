/**
 * Eventpop Event Source (Investigation Only)
 * 
 * API Status: No public API available
 * Documentation: Not available
 * Auth: N/A
 * Free Tier: N/A
 * 
 * Recommendation: Contact Eventpop for partnership API access
 */

import { EventItem } from '../../domain/models';

export interface EventpopApiConfig {
  // apiKey: string; // Not available - requires partnership
  // baseUrl: string; // Not available
}

/**
 * Fetch events from Eventpop (stub implementation)
 * 
 * Note: This is investigation-only code. Eventpop does not provide a public API.
 * To use this source, you must:
 * 1. Contact Eventpop for partnership or API access
 * 2. Obtain API credentials
 * 3. Replace stub with real API implementation
 */
export async function fetchEventpopEvents(
  config: EventpopApiConfig,
  query: { location: string; dateRange?: string }
): Promise<EventItem[]> {
  // TODO: Replace with real API call when API key available
  console.log('[Eventpop] No public API - stub implementation');
  console.log('[Eventpop] Query:', query);
  
  // Return empty array (no events)
  return [];
}

/**
 * Map Eventpop response to our EventItem schema
 * (Placeholder - actual mapping depends on Eventpop API structure)
 */
function mapEventpopToEventItem(eventpopEvent: any): EventItem {
  // TODO: Implement mapping when API structure is known
  throw new Error('Eventpop API not available');
}
