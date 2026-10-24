# 🚀 Quick Start Guide

## Get Started in 2 Minutes

### 1. Start the Server

```bash
npm run dev
```

Server starts at: `http://localhost:3001` (or 3000 if available)

### 2. Test the APIs

#### Basic Search

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "boxing"}'
```

#### Personalized Search

```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "cafe",
    "personalize": true,
    "userId": "demo123",
    "location": {"lat": 13.7563, "lng": 100.5018},
    "timeOfDay": "morning"
  }'
```

#### Get Recommendations

```bash
curl "http://localhost:3001/api/recommendations?userId=demo123&limit=10"
```

---

## 💡 Example Queries

### Find Activities

| Query | Finds |
|-------|-------|
| `ฝึกมวย` | Boxing gyms |
| `คาเฟ่` | Cafes |
| `กินข้าว` | Restaurants |
| `ออกกำลังกาย` | Fitness centers |
| `วัด` | Temples |
| `ตลาด` | Markets |
| `ช้อปปิ้ง` | Shopping malls |
| `ดูหนัง` | Cinemas |

### English Queries

| Query | Finds |
|-------|-------|
| `boxing` | Boxing gyms |
| `cafe` | Cafes |
| `restaurant` | Restaurants |
| `gym` | Fitness centers |
| `temple` | Temples |
| `market` | Markets |
| `shopping` | Shopping malls |

---

## 🎯 API Endpoints

### 1. Search

**POST** `/api/search`

```json
{
  "query": "ฝึกมวย",
  "language": "th",
  "personalize": false
}
```

### 2. Personalized Search

**POST** `/api/search`

```json
{
  "query": "cafe",
  "personalize": true,
  "userId": "user123",
  "location": {"lat": 13.7563, "lng": 100.5018},
  "timeOfDay": "morning"
}
```

### 3. Recommendations

**GET** `/api/recommendations`

Query params:
- `userId` - User ID
- `lat`, `lng` - Location
- `timeOfDay` - morning/afternoon/evening/night
- `limit` - Max results (default: 20)

---

## 📊 What You Get

- **12,207 real places** from OpenStreetMap
- **13 categories** (cafes, restaurants, gyms, etc.)
- **30+ activity patterns** (Thai + English)
- **2ms search time** (in-memory indexing)
- **Personalized ranking** based on preferences
- **Location-aware** scoring
- **Time-aware** suggestions

---

## 🔧 Troubleshooting

### Issue: Port 3001 already in use

**Solution**: Kill the process or change port in `package.json`

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Change port
# Edit package.json: "dev": "next dev -p 3002"
```

### Issue: Index loading slow

**Solution**: Normal on first request (~500ms). Subsequent requests are fast.

### Issue: No results found

**Solution**: Check query language or try different keywords.

---

## 📚 Full Documentation

- **API Docs**: See `SEARCH_ENGINE_DOCS.md`
- **Implementation**: See `IMPLEMENTATION_COMPLETE.md`

---

**Need help?** Check the logs in terminal for debugging info.
