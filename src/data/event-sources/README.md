# Event Source Integration Research

## Overview
Research findings for Bangkok event sources. These are investigation-only modules, not production-integrated.

## Status Summary

| Source | API Available | Auth Method | Free Tier | Recommendation |
|--------|---------------|-------------|-----------|----------------|
| Eventpop | ❌ No public API | N/A | N/A | Contact for partnership |
| Ticketmelon | ❌ No public API | N/A | N/A | Contact for partnership |
| Meetup | ✅ Yes (GraphQL) | OAuth 2.0 | Yes (rate limited) | Can integrate |

## Eventpop
- **Website**: https://www.eventpop.me
- **API Status**: No public API documented
- **Alternative**: Web scraping (not recommended without permission)
- **Free Tier**: N/A
- **Rate Limits**: N/A
- **Recommendation**: Contact Eventpop directly for partnership API access or affiliate program

## Ticketmelon
- **Website**: https://www.ticketmelon.com
- **API Status**: No public API documented
- **Alternative**: Affiliate program may exist
- **Free Tier**: N/A
- **Rate Limits**: N/A
- **Recommendation**: Contact Ticketmelon for API access or explore affiliate options

## Meetup
- **Website**: https://www.meetup.com
- **API Status**: ✅ GraphQL API available
- **Documentation**: https://www.meetup.com/api/guide
- **Auth Method**: OAuth 2.0
- **Free Tier**: Yes (rate limits apply)
- **Rate Limits**: Varies by endpoint
- **Recommendation**: Can integrate with proper OAuth setup

### Meetup Integration Notes
- Requires OAuth 2.0 client credentials
- Good for community events, tech meetups, social gatherings
- Bangkok has active Meetup community
- Sample query: Search events by location + date range

## Implementation Priority

1. **Meetup** - Ready to integrate (has public API)
2. **Eventpop** - Requires partnership discussion
3. **Ticketmelon** - Requires partnership discussion

## Next Steps

1. Set up Meetup OAuth app
2. Implement Meetup event fetcher
3. Contact Eventpop and Ticketmelon for partnership opportunities
4. Consider other sources: Facebook Events, Google Events, local Bangkok event aggregators
