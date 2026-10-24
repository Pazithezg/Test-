# BUILD A MAP-FIRST NEARBY DISCOVERY PLATFORM FOR THAILAND

## 1. Product mission — understand this before coding

Build a real, functional web application that helps people discover, compare, and choose nearby places and activities quickly.

The primary value proposition is **saving users time**.

People often have limited free time and want to go somewhere, try an activity, exercise, relax, explore nature, visit a religious place, or spend time with friends. They should not have to open multiple apps, manually set a distance radius, search for prices separately, and compare destinations themselves.

When users open this app, they should immediately see useful nearby options, ordered from the closest to progressively farther places.

For each place, they should be able to understand:

- What the place is.
- What they can do there.
- What makes it interesting or distinctive.
- How far away it is.
- Approximately how much it costs, when reliable price data exists.
- How to get there using supported travel modes.
- How it compares with other places in the same category.

The user can scroll down to discover more options without repeatedly changing distance settings.

The application must also support natural-language activity search. For example, users can type “อยากไปต่อยมวย”, “อยากดำน้ำ”, “อยากไปน้ำตก”, or “อยากไปวัด”, and the system finds relevant real places in the available dataset.

**This is a location-aware discovery and comparison product, not an AI chatbot with a map attached. The map database and search engine are the foundation.**

Build a new project cleanly, but use any existing source data or files that are actually available in the environment. Do not claim access to files that you have not verified.

## 2. Core user experience

The primary experience must work without requiring the user to enter a query or configure a distance radius.

### When the user opens the app

1. Resolve the user's starting location using an explicitly authorized location permission, if available.
2. If permission was previously granted, use the authorized location automatically.
3. If permission has not been granted, offer a clear option to use the current location or select a starting point on the map.
4. If permission is denied, allow manual pin placement and provide a clearly labeled demo location when appropriate.
5. Do not pretend that a demo pin is the user's real location.
6. Immediately load and display relevant places around the selected starting point.
7. Sort places from nearest to farthest.
8. Display useful information and category comparisons without requiring the user to configure a search radius.

**Do not block the application behind a location permission prompt.** The user must still be able to use the app with a manually selected starting point.

### No manual distance-radius requirement

Do not require users to choose settings such as 1 km, 5 km, or 10 km before seeing results.

Do not make a distance slider or radius filter the primary interaction.

Instead:

- Show the nearest useful places first.
- Let users scroll to progressively farther places.
- Support efficient pagination or infinite scrolling.
- Preserve distance information on every result.
- Allow the user to explore farther destinations naturally.
- Avoid arbitrary hard cutoffs that hide relevant places without explanation.

The initial feed should prioritize useful nearby destinations, not attempt to render every record in the entire national dataset at once.

The full dataset must remain searchable, while results are loaded efficiently according to location, relevance, and distance.

## 3. Homepage design and information architecture

Create a polished, Thai-first, mobile-responsive homepage.

The design should feel like a modern travel and activity discovery platform, with a clear visual hierarchy and minimal friction.

### A. Header and starting location

Display:

- App identity.
- Current selected starting area.
- A location-change control.
- A clear indication of whether the starting point comes from authorized GPS, a manual pin, or demo mode.

Changing the starting point should refresh the nearby results and distance calculations.

### B. Natural-language search

Include a search field with a prompt such as:

“วันนี้อยากไปทำอะไรดี?”

Example inputs:

- อยากไปต่อยมวย
- อยากดำน้ำ
- อยากไปน้ำตก
- อยากไปวัด
- อยากทำกิจกรรมกับเพื่อน
- อยากหาที่เที่ยวใกล้ ๆ งบไม่เยอะ

The user must be able to press Enter or click Search.

Search is optional for initial discovery. Users should already see nearby options when the homepage opens.

### C. Nearby discovery feed

Create a prominent section such as “ใกล้คุณ” or “สถานที่ใกล้คุณ”.

Show real destinations ordered from nearest to farthest, with useful cards containing:

- Place name.
- Category.
- Distance.
- Estimated travel time, only when supported by a real routing result.
- Approximate cost, only when supported by reliable data.
- A short description or verified highlight.
- Available travel options.
- A button to view details.
- A button or link to navigate there.

The user should be able to scroll continuously through more options.

Do not make the interface look complete by filling it with fake data.

### D. Category-based discovery

Below the general nearby feed, create sections for categories actually supported by the available dataset.

Examples include:

- Sports and exercise.
- Nature and outdoors.
- Religious and spiritual places.
- Arts, culture, and learning.
- Entertainment and recreation.
- Food and drink.
- Shopping.
- Tourism and attractions.
- Other categories discovered in the real data.

Do not limit the product to these examples. Discover the actual categories available in the dataset and build the category system around them.

Each category should show relevant nearby places, sorted from nearest to farthest within that category.

For example, a sports section might show the nearest boxing facilities, badminton courts, gyms, and swimming facilities, organized into meaningful subcategories when enough data exists.

A nature section might show waterfalls, beaches, parks, mountains, and hiking destinations.

A religious section might show temples, churches, mosques, shrines, meditation centers, and other identifiable religious or spiritual sites supported by the data.

Do not assume that every category exists in every location.

### E. Interactive map

Provide an interactive map linked to the result list.

- Display the selected starting point.
- Display destination markers.
- Use different marker styles where useful to distinguish the starting point from destinations.
- Clicking a result focuses the map on the matching destination.
- Clicking a destination marker opens its place information.
- Changing the starting pin updates distances and nearby rankings.
- Load additional results efficiently as the user explores farther locations.

The map is part of the discovery experience, not a decorative background.

## 4. Place details: help users decide quickly

Every destination should have a useful detail view or expanded card.

Show available information in this order:

1. Place name and category.
2. What the place is.
3. What users can do there.
4. Why it may be worth visiting.
5. Distance from the selected starting point.
6. Available travel options and travel distance.
7. Estimated travel time, when calculated by a real routing provider.
8. Approximate admission fee or activity cost, when reliable data exists.
9. Additional available information, such as address, opening hours, contact information, or source link.

### Descriptions and highlights

Generate descriptions only from the actual record, verified metadata, or other data already available to the application.

For example, if a record is a waterfall, explain that it is a waterfall destination based on its actual classification. Do not invent swimming rules, facilities, safety conditions, entrance fees, or scenic features that the source does not establish.

AI may summarize known facts in natural Thai, but it must not manufacture facts.

If a place has very little metadata, show what is known and identify the missing information honestly.

## 5. Distance, travel options, and navigation

Distance is a primary feature and must always be tied to the selected starting point.

### Distance calculations

- Calculate geographic distance from the selected starting coordinates to each destination.
- Clearly label straight-line distance as straight-line distance.
- Use actual road or route distance when a real routing engine supplies it.
- Never label straight-line distance as driving distance.
- Never invent travel time or claim a road route was calculated when it was not.

### Ways to get there

Show supported travel options, such as:

- Walking.
- Driving.
- Cycling.
- Public transport, if a reliable provider or available dataset supports it.

For each supported option, show the actual route distance and estimated time when available.

If a routing provider does not support a particular mode, do not fabricate that mode's travel time.

Provide a convenient external navigation link when supported, using the actual destination coordinates or address.

If the app cannot calculate a route internally, clearly state the limitation and let the user open a navigation application. Do not display a decorative straight line as if it were a navigable route.

Do not add unnecessary routing infrastructure before the nearby discovery experience works. Reuse existing routing capabilities when available and document any missing dependencies.

## 6. Approximate prices and cost transparency

Users need to compare the likely cost of visiting places.

The application should distinguish:

- Free entry, when reliably established.
- Admission or entrance fee.
- Activity or class fee.
- Typical price range.
- Transportation cost, when supported by reliable data.
- Unknown or unavailable pricing.

Keep activity cost and transportation cost separate.

For example, a swimming pool's entrance fee should not be presented as the total cost of the trip.

Use price information already present in the dataset or other verified records available to the application. Preserve the source and last-verified date when possible.

Never invent prices to make the interface look useful.

If a price is missing, display “ยังไม่มีข้อมูลราคา” or another clear Thai label.

If the price varies by date, package, age, or provider, indicate that it is an estimate and show the basis of the estimate when known.

Do not use AI to guess a venue's price.

Do not browse the web or call a search engine every time a user searches. The core app should use its indexed place data and available pricing metadata.

If additional pricing data is essential but unavailable, document the gap rather than silently fabricating it.

## 7. Compare places within each category

Comparison is a core feature, not an optional decoration.

When users browse a category, help them compare actual places in that category using consistent information.

For example, when viewing boxing facilities, show the nearest matching gyms and compare:

- Distance.
- Route distance, when available.
- Travel time, when available.
- Approximate training or admission price, when available.
- Available activity or facility information.
- Verified highlights.
- Opening hours, if reliable information exists.

For swimming pools, compare pools using the same relevant fields.

For waterfalls, compare waterfalls using distance, travel options, available entrance-fee data, and verified destination information.

For temples, compare relevant temples using distance, available location information, and verified site details.

Comparison fields must adapt to the category. Do not force irrelevant attributes onto every place.

### Category comparison UI

Each category section should:

1. Show its nearest relevant options first.
2. Present comparable fields in a consistent layout.
3. Clearly distinguish verified facts from missing data.
4. Allow users to open each place's full details.
5. Let users explore more places in the same category by scrolling.
6. Optionally allow selecting up to three places for a direct side-by-side comparison, provided the core experience is already working.

Do not rank places as “best” without a transparent basis.

If a place is closest, label it as closest. If it has the lowest verified price, label it accordingly. Do not imply that the closest place is automatically the best overall choice.

## 8. Natural-language activity search

In addition to automatic nearby discovery, users must be able to search for places based on the activity they want.

Examples:

- “อยากไปต่อยมวย” → boxing gyms and Muay Thai training facilities.
- “อยากดำน้ำ” → diving-related facilities and destinations supported by the data.
- “อยากว่ายน้ำ” → swimming pools and swimming facilities.
- “อยากไปน้ำตก” → waterfalls.
- “อยากไปทะเล” → beaches and seaside destinations.
- “อยากไปวัด” → temples and relevant religious sites.
- “อยากไปสถานธรรม” → meditation centers and identifiable spiritual practice venues.
- “อยากเล่นแบด” → badminton courts.
- “อยากปีนเขา” → suitable climbing facilities or mapped climbing destinations.
- “อยากทำกิจกรรมกับเพื่อน” → suitable group activities represented by the data.

These are examples of expected behavior, not individual responses to hardcode.

### Matching architecture

Build a reusable activity-to-place matching system that uses:

- Canonical categories.
- Thai and English synonyms.
- Common slang and spelling variations.
- Actual source tags and categories.
- Place names and descriptions.
- Relevance ranking.
- Geographic proximity.
- Explicit user constraints and exclusions.

Direct activity matches must rank above loosely related results.

Do not equate different activities simply because they share a word. For example, a swimming pool is not automatically a scuba-diving destination.

When exact matches are unavailable, clearly separate related alternatives from direct matches.

### AI must not block search

The core search must be deterministic and independent of an LLM.

The primary pipeline is:

1. Parse the query.
2. Identify the requested activity.
3. Map the activity to canonical categories.
4. Search the local index.
5. Rank real records.
6. Return results.
7. Optionally summarize the results using AI.

Do not call an LLM for every query merely to identify obvious activities.

AI may summarize real results in Thai after they have been retrieved. If the AI service is slow or unavailable, display the results immediately and use a simple template-based fallback.

Do not use browser search, web search, or external browsing to find places for individual user queries.

## 9. Use the complete available map dataset

The dataset must support the actual product, not a small demo list.

First inspect all data sources available in the project environment.

If an existing OpenStreetMap XML file or another complete map dataset is available, verify its existence and inspect its format, source coverage, entity types, and tags before implementing the importer.

Do not assume a file exists just because its path was mentioned in an earlier conversation.

### Data ingestion requirements

- Process the complete available source, not just the first N records.
- Do not restrict processing to Bangkok unless the source itself is limited to Bangkok.
- Use streaming or memory-efficient processing for large files.
- Preserve original source IDs and tags.
- Handle nodes, ways, relations, coordinates, and geometry appropriately.
- Make imports repeatable without creating duplicate records.
- Keep a record of processing totals and errors.
- Build a searchable index.
- Preserve the original source data for auditing.
- Keep required source attribution and comply with applicable licensing terms.

Distinguish between actual destinations and non-destination map features such as roads, boundaries, and land-use geometry.

Retain relevant road and path data for map context or routing, but do not recommend random roads as activity venues.

### Data-driven categories

Discover categories from the actual source data.

Build a maintainable registry of canonical categories, source tags, Thai and English names, synonyms, and matching rules.

Keep unknown but potentially useful records available for future classification instead of silently discarding them.

### Data coverage report

Report:

- Total source records.
- Total processed and indexed records.
- Counts by category and entity type.
- Geographic coverage.
- Unmapped categories and tags.
- Records with missing coordinates.
- Records excluded from destination search and why.
- Duplicate records handled.
- Import and indexing errors.
- Source snapshot date, when available.

Processing all available records does not prove that the dataset contains every real-world place in Thailand. Make this limitation clear.

## 10. Location privacy and fallback behavior

The user must always know which starting point is being used.

Support:

- Previously authorized GPS location.
- Manually selected starting pin.
- Clearly labeled demo location.

Do not silently pretend that a demo location is the user's actual location.

Do not require GPS to test the app.

Do not block the entire application when location access is denied.

Changing the selected starting point must refresh nearby results, distances, and geographic rankings.

## 11. Performance and technical requirements

Build a maintainable application with a clear separation between data processing, search, ranking, map interaction, and optional AI summarization.

Choose the simplest suitable stack for the actual environment.

A reasonable default, if compatible with the project, is:

- Next.js and TypeScript.
- A reusable component architecture.
- Tailwind CSS or an equivalent styling system.
- Leaflet or MapLibre for the map.
- PostgreSQL with PostGIS or another suitable geospatial index.
- A streaming data importer.
- Server-side search endpoints.
- Automated tests.

These are defaults, not mandatory dependencies. Inspect the environment before choosing a stack.

Do not add a database, AI provider, routing service, or other dependency without a clear reason.

### Performance requirements

- Nearby discovery should not wait for an AI call.
- Use spatial indexing and indexed queries where appropriate.
- Avoid repeatedly parsing the source dataset for every search.
- Do not render the entire national dataset at once.
- Use pagination, infinite scrolling, or virtualization for large result lists.
- Avoid duplicate requests when the user scrolls.
- Keep map markers and result cards synchronized.
- Handle API failures and missing records gracefully.
- Do not expose secret API keys in client-side code.

Measure actual performance instead of claiming that the app is fast without testing it.

## 12. Development order — make the core work first

Do not attempt to implement every possible travel feature at once.

### Phase 1: Verify the data

Inspect the available source data, identify its geographic coverage, and verify that it can support real destination search.

Produce a data audit before making assumptions about available categories and pricing.

### Phase 2: Build the data ingestion and search engine

Import the complete available dataset and create a searchable index.

Implement activity-to-category matching and geographic proximity ranking.

Verify that actual queries return relevant real records.

### Phase 3: Build automatic nearby discovery

Make the homepage show nearby places without requiring a distance setting.

Sort results from nearest to farthest.

Allow scrolling to discover progressively farther places.

### Phase 4: Build the comparison experience

Add category sections with relevant, comparable place information.

Display distances, available price estimates, verified highlights, and supported travel information.

### Phase 5: Connect the interactive map

Add the starting pin, destination markers, synchronized results, and accurate distance calculations.

### Phase 6: Add route options and navigation

Integrate real route calculations where supported. Provide navigation links and clearly label any unavailable route information.

### Phase 7: Add optional AI summaries

Use AI only to summarize actual retrieved results. Verify that the app remains fully searchable with the AI service disabled.

### Phase 8: Validate and document

Run automated tests, build the app, and verify the real UI end to end.

Do not mark a phase complete until its acceptance criteria have been tested.

## 13. Required acceptance tests

Use the actual dataset and actual user interface.

### Test A: Automatic nearby discovery

Open the homepage with an authorized test location or demo pin.

Verify that:

- Nearby places appear without a distance-radius setting.
- Results are sorted from nearest to farthest.
- Distances are displayed correctly.
- The user can scroll to discover farther places.
- No fabricated destinations appear.
- The interface remains responsive.

### Test B: Category browsing

Verify that available categories are generated from actual data.

Open multiple categories and confirm that their places are relevant and sorted by distance.

### Test C: Category comparison

Verify that places in the same category can be compared using relevant available fields.

Ensure that missing prices or travel information are identified honestly.

### Test D: Natural-language search

Test at least:

- “อยากไปต่อยมวย”
- “อยากดำน้ำ”
- “อยากว่ายน้ำ”
- “อยากไปน้ำตก”
- “อยากไปวัด”
- “อยากเล่นแบด”
- “อยากทำกิจกรรมกับเพื่อน”
- “อยากไปที่ธรรมชาติใกล้ ๆ”
- One unfamiliar activity phrase not explicitly listed above.

For each query, record the detected intent, categories searched, number of matching records, actual returned places, and whether the results are relevant.

### Test E: Location behavior

Verify:

- Authorized location is used when available.
- Manual pin placement works.
- Moving the pin refreshes distances and rankings.
- Denied location permission does not block discovery.
- Demo locations are clearly labeled.

### Test F: AI failure

Disable the AI service or simulate an AI error.

Verify that the app still searches, returns real places, displays results, and provides a simple fallback response.

### Test G: Data integrity

Verify actual import counts, indexed records, category counts, missing-coordinate records, and processing errors.

Do not claim the entire dataset was processed unless the report supports that conclusion.

### Test H: Build and application verification

Run the application, relevant automated tests, and production build.

Report any test that could not be executed.

## 14. Definition of done

The MVP is complete only when all of the following work:

1. Opening the app immediately shows useful nearby destinations without requiring a distance setting.
2. Places are sorted from nearest to progressively farther destinations.
3. Users can scroll to discover more places.
4. Each result shows its distance and available useful information.
5. Price information is shown only when supported by reliable data.
6. Supported travel options and navigation information are available without fabricated distances or travel times.
7. Users can compare places within meaningful categories.
8. Natural Thai and English activity queries return relevant real places.
9. The complete available dataset is processed and indexed, with verified coverage reporting.
10. Search works even when AI is unavailable.
11. The starting location can be changed without breaking the homepage.
12. The application builds and its critical workflows pass real tests.

## 15. Reporting and uncertainty

After implementation, provide a concise but evidence-based report:

- What was implemented.
- Which data sources were actually available.
- How many records were processed and indexed.
- Which categories are supported.
- Which acceptance tests passed or failed.
- Whether nearby sorting and distance calculations were verified.
- Whether price data and routing data are available.
- What remains incomplete and why.

Do not claim a feature works merely because its UI exists.

If a critical source file is unavailable, a migration could destroy data, or a major product decision cannot be resolved through inspection, ask me before making that assumption.

For ordinary technical decisions that can be determined from the environment, inspect the project and choose a sensible implementation rather than asking me unnecessary questions.

**Final priority: save users time. Open the app, discover nearby places, compare useful information, and make it easy to decide where to go. Build that experience before adding anything unrelated.** if anything above is not working serach solution from internet or try think you self
