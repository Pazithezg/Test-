---
name: travel-discovery-system
description: Build, maintain, test, and extend the location-aware activity and event discovery backend. Use when working on event data, location filtering, intent parsing, recommendation ranking, APIs, database migrations, or source verification.
---

# Travel Discovery System — Engineering Skill

## 1. Mission

Maintain a reliable discovery system that helps users find relevant real-world activities and events based on:

- Where they want to start.
- What they want to do.
- How they feel or what kind of experience they want.
- Their budget and available time.
- Their interests and travel preferences.

The product must help users make real-world decisions. It is not a fictional itinerary generator or a generic chatbot.

## 2. Core engineering principles

### Truth before fluency

Never fabricate an event, venue, address, price, schedule, opening hour, source, or coordinate.

AI-generated explanations must be grounded in retrieved records.

### Separate retrieval from reasoning

The database and search services determine which candidates actually exist and meet the eligibility rules.

AI may interpret the request, normalize preferences, classify categories, and explain the results.

AI must not replace database retrieval or factual validation.

### Keep recommendations explainable

Every recommendation should have a traceable reason, such as:

- Matches a requested activity category.
- Fits the requested date.
- Falls within the search radius.
- Fits the stated budget based on known prices.
- Matches the user's desired experience.

Use explicit ranking features and tests rather than unexplained model-generated rankings.

### Design for replaceability

Keep these boundaries separate:

- Domain models.
- Database repositories.
- Data-source adapters.
- Geospatial calculations.
- Intent parsing.
- Recommendation scoring.
- AI provider integration.
- API request and response handling.

A change in AI provider must not require rewriting the recommendation engine.

A change in website design must not require rewriting the backend.

## 3. Domain rules

### Event validity

Before recommending an event, evaluate:

- Publication status.
- Cancellation status.
- Start and end timestamps.
- Timezone.
- Source availability.
- Verification status.
- Data freshness.
- Whether the event meets the user's requested time window.

An event with missing critical information must not be represented as fully verified.

### Location

Support two ways of defining a starting point:

1. A manually selected test area.
2. User-authorized coordinates.

Do not require geolocation permission.

Do not assume that a manually selected test area is the user's actual current location.

Use verified coordinates where possible. If coordinates are missing, do not invent a distance.

Keep geographic calculations in a dedicated module and test boundary conditions.

### Budget

Distinguish between:

- Known price.
- Price range.
- Free admission with a reliable source.
- Unknown price.

Do not treat unknown prices as zero.

If a user specifies a strict maximum budget, explain when the total cost cannot be verified.

### User mood and intent

Treat mood as a temporary preference for the requested experience, not as a mental-health diagnosis or a permanent user attribute.

Examples:

- Bored → explore new activities or events.
- Wants to relax → consider quieter activities where supported by data.
- Wants to socialize → consider suitable group activities or public events.
- Wants adventure → consider relevant active experiences.

These are relevance signals, not guaranteed psychological outcomes.

Do not infer diagnoses, personality traits, or sensitive personal characteristics.

## 4. Data integrity

Every published item must have sufficient information for its intended use.

Store source URLs and verification timestamps where applicable.

Prefer authorized APIs, official feeds, permitted imports, and curated records.

Do not introduce a web scraper without evaluating the source's access rules, terms, technical reliability, and data quality.

When source data changes:

1. Validate the new record.
2. Identify duplicates.
3. Preserve useful provenance.
4. Update verification timestamps accurately.
5. Flag conflicting or incomplete information for review.

Never update a verification timestamp simply because a record was read from the database.

Clearly distinguish fixtures, imported records, unverified records, and verified records.

## 5. AI integration rules

- Use a provider adapter rather than coupling domain code to a specific model SDK.
- Keep API credentials server-side.
- Validate model output with the application's schemas.
- Prefer structured output modes when supported.
- Handle timeouts, provider errors, and malformed responses.
- Provide a deterministic fallback for basic discovery.
- Do not expose hidden reasoning or depend on free-form explanations for application logic.
- Never treat an AI-generated source URL as proof that a source exists.
- Never let the model invent missing factual fields.

The recommendation engine must remain useful when AI is unavailable.

## 6. API design rules

- Validate every request at the boundary.
- Use consistent response structures.
- Return appropriate HTTP status codes.
- Avoid exposing database internals or private environment values.
- Use pagination for potentially large result sets.
- Document optional and required fields.
- Handle empty results explicitly.
- Keep API contracts independent of frontend component structure.

Changing a UI component must not require a change to the API unless the product contract itself changes.

## 7. Security and privacy

- Never commit real secrets.
- Never expose service-role credentials to a browser.
- Restrict administrative writes.
- Apply appropriate database access policies.
- Validate and limit untrusted inputs.
- Avoid storing precise location history unless required and explicitly justified.
- Do not persist raw mood descriptions by default.
- Avoid logging personal text unnecessarily.
- Use rate limits for expensive AI operations.

## 8. Required workflow for code changes

For each task:

1. Inspect the relevant existing files.
2. Identify the underlying problem and expected behavior.
3. Check whether the change affects domain logic, APIs, database schema, or external integrations.
4. Propose the smallest appropriate implementation.
5. Implement the change in the correct module.
6. Add or update tests.
7. Run type checking, linting, tests, and build checks where available.
8. Fix regressions caused by the change.
9. Update documentation when contracts or setup instructions change.
10. Report what was actually verified.

Do not rewrite unrelated modules or change the architecture solely for stylistic reasons.

Do not claim tests passed unless they were run and passed.

## 9. Testing expectations

Cover at least the relevant cases for:

- Invalid requests.
- Empty search results.
- Budget boundaries.
- Distance boundaries.
- Timezone and date boundaries.
- Cancelled or expired events.
- Unknown prices.
- Missing coordinates.
- Duplicate imported records.
- Stale source data.
- Invalid AI output.
- AI provider outages.
- Unauthorized data modifications.

Use controlled test fixtures. Do not make automated tests depend on live events or unpredictable external websites.

## 10. Examples

### Good behavior

A user asks:

"วันนี้เบื่อ อยากออกไปทำอะไรกับเพื่อน งบ 300 บาท แถวสยาม"

The system:

1. Parses the activity request and budget.
2. Searches available records near the selected starting area.
3. Filters by date and budget where sufficient data exists.
4. Ranks valid candidates.
5. Explains the match using supported facts.
6. Returns source links and uncertainty where relevant.

### Bad behavior

The model invents a concert because the database contains no suitable event.

This is a correctness failure, not a successful fallback.

### Good behavior when no results exist

The system reports that it could not find a verified match in the available data and offers to expand the radius or change the date.

It does not invent an alternative.

## 11. Definition of done

A change is complete when:

- The requested behavior is implemented.
- Relevant data and security rules remain intact.
- Relevant tests pass.
- Types and API contracts remain consistent.
- Documentation reflects any meaningful change.
- Remaining limitations are stated clearly.

Prefer small, verifiable improvements that preserve the integrity of the whole system.