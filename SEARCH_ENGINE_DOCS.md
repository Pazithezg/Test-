# South Seek Search Engine Documentation

## Overview

Intelligent search and recommendation system for Bangkok places using **12,207 real OSM locations**.

### Key Features

- ✅ **Natural Language Search** - Thai & English queries
- ✅ **Activity-Based Matching** - 30+ activity patterns  
- ✅ **Personalized Recommendations** - Based on user preferences
- ✅ **Context-Aware Ranking** - Location, time, weather
- ✅ **Fast Performance** - In-memory indexing (~2ms search)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Query                               │
│              "อยากฝึกมวยที่ไหนดี"                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Activity Dictionary                             │
│  - Parse query → detect activities                           │
│  - Map "ฝึกมวย" → boxing_training                           │
│  - Get categories: [fitness, attraction]                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               Place Index (12,207 places)                    │
│  - Search by categories                                      │
│  - Search by name patterns                                   │
│  - Return candidates                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Search Engine                                   │
│  - Score each candidate                                      │
│  - Category match: +10                                       │
│  - Name match: +15                                           │
│  - Exact match: +30                                          │
│  - Has location: +5                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         Personalization (Optional)                           │
│  - Apply user preferences: +20                               │
│  - Location proximity: +10                                   │
│  - Time relevance: +5                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Ranked Results                                  │
│  1. ค่ายมวยลูกนอกแบตส์ (score: 45)                         │
│  2. Chuwattana Muay Thai Gym (score: 42)                    │
│  3. Bangkok Fight Lab (score: 38)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Search API

**POST /api/search**

Search for places using natural language.

#### Request Body

```json
{
  "query": "ฝึกมวย",
  "language": "th",
  "personalize": false
}
```

#### Response

```json
{
  "results": [
    {
      "place": {
        "id": "fitness-10310",
        "name": "ค่ายมวยลูกนอกแบตส์",
        "category": "fitness",
        "latitude": 13.7460584,
        "longitude": 100.5999818,
        "tags": {},
        "nameNormalized": "คายมวยลูกนอกแบตส"
      },
      "score": 45,
      "matchReasons": [
        "Category: fitness",
        "Name contains: มวย"
      ]
    }
  ],
  "query": {
    "original": "ฝึกมวย",
    "detectedActivities": [
      {
        "id": "boxing_training",
        "thai": ["ต่อยมวย", "เรียนมวย", "ฝึกมวย"],
        "english": ["boxing", "muay thai"],
        "categories": ["fitness", "attraction"]
      }
    ],
    "detectedKeywords": [],
    "searchedCategories": ["fitness", "attraction"]
  },
  "stats": {
    "totalMatches": 364,
    "searchTimeMs": 2
  }
}
```

### 2. Personalized Search

**POST /api/search** (with personalization)

#### Request Body

```json
{
  "query": "อยากกินอะไร",
  "language": "th",
  "personalize": true,
  "userId": "user123",
  "location": {
    "lat": 13.7563,
    "lng": 100.5018
  },
  "timeOfDay": "evening"
}
```

#### Response

```json
{
  "results": [
    {
      "place": { ... },
      "score": 35,
      "personalizedScore": 55,
      "matchReasons": ["Category: restaurant"],
      "personalizedReasons": [
        "Category: restaurant",
        "✨ Based on your interests",
        "📍 About 0.8 km away",
        "Perfect for evening"
      ]
    }
  ]
}
```

### 3. Recommendations API

**GET /api/recommendations**

Get personalized recommendations without a search query.

#### Query Parameters

- `userId` - User ID (optional, for personalization)
- `lat` - Latitude (optional, for location-based)
- `lng` - Longitude (optional)
- `timeOfDay` - Time context: morning/afternoon/evening/night
- `limit` - Max results (default: 20)

#### Example

```
GET /api/recommendations?userId=user123&lat=13.7563&lng=100.5018&timeOfDay=morning&limit=10
```

#### Response

```json
{
  "recommendations": [
    {
      "place": {
        "id": "cafe-123",
        "name": "Blue Whale Cafe",
        "category": "cafe",
        "latitude": 13.7234,
        "longitude": 100.4905
      },
      "score": 78,
      "reasons": [
        "Matches your interest in cafe",
        "Very close to you",
        "Great for morning activities"
      ]
    }
  ],
  "context": {
    "currentLocation": { "latitude": 13.7563, "longitude": 100.5018 },
    "timeOfDay": "morning"
  },
  "total": 10
}
```

---

## Activity Dictionary

30+ supported activities with Thai & English patterns:

### Sports & Fitness
- **Boxing** - ฝึกมวย, boxing, muay thai → fitness, attraction
- **Gym** - ออกกำลังกาย, gym, fitness → fitness
- **Swimming** - ว่ายน้ำ, swimming → fitness, park
- **Yoga** - โยคะ, yoga → fitness

### Food & Dining
- **Restaurant** - กินข้าว, restaurant, food → restaurant
- **Cafe** - คาเฟ่, กาแฟ, cafe → cafe
- **Bar** - บาร์, ดื่ม, bar → bar

### Shopping
- **Market** - ตลาด, market → market
- **Mall** - ห้าง, shopping mall → shopping

### Culture
- **Temple** - วัด, temple → attraction, museum
- **Museum** - พิพิธภัณฑ์, museum → museum

### Entertainment
- **Cinema** - ดูหนัง, movie → entertainment
- **Park** - สวน, park → park

[See full list in `src/search/activity-dictionary.ts`]

---

## Data Structure

### OSM Places (12,207 total)

```
public/data/osm-places/
├── index.json              # Category metadata
├── cafe.geojson           # 1,650 cafes
├── restaurant.geojson     # 3,956 restaurants
├── museum.geojson         # 131 museums
├── shopping.geojson       # 170 shopping malls
├── park.geojson           # 308 parks
├── shop.geojson           # 1,821 shops
├── entertainment.geojson  # 67 entertainment venues
├── attraction.geojson     # 181 tourist attractions
├── market.geojson         # 145 markets
├── bar.geojson            # 604 bars
├── hotel.geojson          # 1,276 hotels
├── fitness.geojson        # 183 fitness centers
└── building.geojson       # 1,715 notable buildings
```

### GeoJSON Format

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [100.5018, 13.7563]
      },
      "properties": {
        "id": "node/123456",
        "name": "Blue Whale Cafe",
        "name_en": "Blue Whale Cafe",
        "name_th": "บลูเวล คาเฟ่",
        "tags": {
          "amenity": "cafe",
          "cuisine": "coffee_shop"
        }
      }
    }
  ]
}
```

---

## Scoring Algorithm

### Base Search Score (0-100)

1. **Category Match** (+10 points)
   - Query activity matches place category

2. **Name Pattern Match** (+15 points)
   - Place name contains search keyword

3. **Exact Name Match** (+30 points)
   - Complete name match (normalized)

4. **Has Location** (+5 points)
   - Place has valid GPS coordinates

5. **Popular Tags** (+8-15 points)
   - tourism=attraction: +15
   - historic=monument: +12
   - Multiple language names: +8

### Personalization Boost (0-50)

1. **User Preference** (+20 points)
   - Category in user's favorite categories

2. **Location Proximity** (+10 points)
   - Distance < 1km: +10
   - Distance < 2km: +5

3. **Time Relevance** (+10 points)
   - Morning: cafe, park, fitness
   - Afternoon: museum, shopping, attraction
   - Evening: restaurant, bar, entertainment
   - Night: bar, restaurant, hotel

4. **Weather Relevance** (+5 points)
   - Rainy: indoor categories
   - Sunny: outdoor categories

---

## Performance

- **Index Loading**: ~500ms (one-time on startup)
- **Search Time**: 2-5ms per query
- **Memory Usage**: ~15MB for 12k places
- **Concurrent Requests**: Unlimited (in-memory, no I/O)

### Optimization Techniques

1. **In-Memory Index** - All data loaded once
2. **Pre-normalized Names** - No runtime normalization
3. **Category Maps** - O(1) category lookup
4. **Pattern Index** - Common patterns pre-indexed
5. **Lazy Loading** - Index loads on first request

---

## Usage Examples

### Example 1: Find Boxing Gyms

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "ฝึกมวย"}'
```

### Example 2: Find Nearby Cafes (Personalized)

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "คาเฟ่",
    "personalize": true,
    "userId": "user123",
    "location": {"lat": 13.7563, "lng": 100.5018}
  }'
```

### Example 3: Morning Recommendations

```bash
curl "http://localhost:3001/api/recommendations?userId=user123&lat=13.7563&lng=100.5018&timeOfDay=morning&limit=10"
```

### Example 4: Find Restaurants for Dinner

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "อยากกินข้าว",
    "personalize": true,
    "userId": "user123",
    "timeOfDay": "evening"
  }'
```

---

## Implementation Files

```
src/
├── search/
│   ├── activity-dictionary.ts    # 30+ activity patterns
│   ├── place-index.ts            # In-memory place index
│   └── search-engine.ts          # Core search logic
├── personalization/
│   ├── user-profile.ts           # User preferences model
│   ├── recommendation-engine.ts  # Personalized recommendations
│   └── personalized-search.ts    # Personalized search wrapper
└── app/api/
    ├── search/route.ts           # Search endpoint
    └── recommendations/route.ts  # Recommendations endpoint
```

---

## Future Enhancements

### Phase 4 (Optional)
- [ ] User activity tracking (views, saves, visits)
- [ ] Collaborative filtering recommendations
- [ ] Real-time popularity scoring
- [ ] Multi-language NLP (better Thai support)
- [ ] Fuzzy name matching
- [ ] Opening hours filtering
- [ ] Price range filtering
- [ ] User reviews integration
- [ ] Route optimization (multi-place trips)

---

## Credits

- **Data Source**: OpenStreetMap (ODbL License)
- **Total Places**: 12,207 locations in Bangkok
- **Last Updated**: 2026-10-23

---

## License

Data: © OpenStreetMap contributors (ODbL)
Code: MIT License
