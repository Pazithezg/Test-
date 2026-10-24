/**
 * Ticketmelon Event Source (Investigation Only)
 * 
 * API Status: No public API available
 * Documentation: Not available
 * Auth: N/A
 * Free Tier: N/A
 * 
 * Recommendation: Contact Ticketmelon for partnership or affiliate program
 */

import { EventItem } from '../../domain/models';

export interface TicketmelonApiConfig {
  // apiKey: string; // Not available - requires partnership
  // baseUrl: string; // Not available
}

/**
 * Fetch events from Ticketmelon (stub implementation)
 * 
 * Note: This is investigation-only code. Ticketmelon does not provide a public API.
 * To use this source, you must:
 * 1. Contact Ticketmelon for partnership or affiliate access
 * 2. Obtain API credentials
 * 3. Replace stub with real API implementation
 */
export async function fetchTicketmelonEvents(
  config: TicketmelonApiConfig,
  query: { location: string; dateRange?: string }
): Promise<EventItem[]> {
  // TODO: Replace with real API call when API key available
  console.log('[Ticketmelon] No public API - stub implementation');
  console.log('[Ticketmelon] Query:', query);
  
  // Return empty array (no events)
  return [];
}

/**
 * Map Ticketmelon response to our EventItem schema
 * (Placeholder - actual mapping depends on Ticketmelon API structure)
 */
function mapTicketmelonToEventItem(ticketmelonEvent: any): EventItem {
  // TODO: Implement mapping when API structure is known
  throw new Error('Ticketmelon API not available');
}
