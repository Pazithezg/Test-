'use client';

import { useState } from 'react';
import MoodSelector from '@/components/MoodSelector';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceLabel: string;
  nameNormalized: string;
  tags: Record<string, string>;
}

interface IntentParseResult {
  originalText: string;
  mood?: string;
  moodConfidence: number;
  activities: string[];
  activityConfidence: number;
  placeKeywords: string[];
  suggestedCategories: string[];
  explanation: string;
}

export default function SearchDemoPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('อยากไปยิม ใกล้ฉัน');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<IntentParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseCurrentLocation(true);
        setError(null);
      },
      (err) => {
        setError('ไม่สามารถดึงตำแหน่งได้: ' + err.message);
      }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setIntent(null);

    try {
      const targetCoords = useCurrentLocation && coords 
        ? coords 
        : { lat: 13.7563, lng: 100.5018 }; // Default: Democracy Monument

      // 1. Parse intent
      const intentRes = await fetch('/api/intent-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: searchQuery }),
      });
      if (!intentRes.ok) {
        throw new Error(`Intent parse failed: ${intentRes.statusText}`);
      }
      const intentData = await intentRes.json();
      setIntent(intentData);

      // 2. Search nearby without radius filter (show all sorted by distance)
      const searchRes = await fetch('/api/search/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: targetCoords.lat,
          longitude: targetCoords.lng,
          query: searchQuery,
          mood: selectedMood || undefined,
        }),
      });
      if (!searchRes.ok) {
        throw new Error(`Search failed: ${searchRes.statusText}`);
      }
      const searchData = await searchRes.json();
      setResults(searchData.results || []);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    { label: '🏋️ ยิม ใกล้ฉัน', query: 'อยากไปยิม ใกล้ฉัน' },
    { label: '☕ คาเฟ่ชิลๆ', query: 'อยากนั่งคาเฟ่ชิลๆ ทำงาน' },
    { label: '🍽️ ร้านอาหาร', query: 'หิว อยากกินข้าว อร่อยๆ' },
    { label: '🌳 สวนสาธารณะ', query: 'อยากไปเดินเล่นสวนสาธารณะ' },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-sky-400">🔍 South Seek ค้นหาสถานที่ใกล้คุณ</h1>
          <p className="text-slate-400 text-sm">เรียงตามระยะทาง จากใกล้ไปไกลที่สุด</p>
        </header>

        <form onSubmit={handleSearch} className="bg-slate-800 p-6 rounded-xl space-y-4 border border-slate-700">
          {/* Location Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGetLocation}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              📡 ใช้ GPS ปัจจุบัน
            </button>
            <span className="text-xs text-slate-400">
              {useCurrentLocation && coords 
                ? `✓ พิกัด: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` 
                : 'เริ่มต้น: อนุสาวรีย์ประชาธิปไตย'}
            </span>
          </div>

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSearchQuery(q.query)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="อยากทำอะไร หรือไปไหน (ภาษาไทย)..."
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />

          {/* Mood Selector */}
          <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '⏳ กำลังค้นหา...' : '🔍 ค้นหา'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Intent Info */}
        {intent && (
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-1 text-sm">
            <span className="text-sky-400 font-semibold">💡 วิเคราะห์ความต้องการ: </span>
            <span className="text-slate-200">{intent.explanation}</span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-200">
              📍 ผลลัพธ์ {results.length} แห่ง (เรียงจากใกล้ไปไกล)
            </h2>
            {results.map((place) => (
              <div key={place.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-sky-900/60 text-sky-300 rounded font-mono mr-2">
                    {place.category}
                  </span>
                  <span className="font-semibold text-slate-100">{place.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">{place.distance}</div>
                  <div className="text-xs text-slate-400">กม.</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
