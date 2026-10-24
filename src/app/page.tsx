'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { RecommendationResponse, RecommendationResultItem } from '@/domain/models';

const BangkokMap = dynamic(() => import('@/components/BangkokMap'), { ssr: false });

export default function DiscoveryPage() {
  const [useGps, setUseGps] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [intentText, setIntentText] = useState('เบื่อ อยากออกไปทำอะไรกับเพื่อน');
  const [mood, setMood] = useState('อยากเปลี่ยนบรรยากาศ ชิลๆ หาแรงบันดาลใจ');
  const [budgetTHB, setBudgetTHB] = useState<number | ''>(300);
  const [companions, setCompanions] = useState('friends');
  const [radiusKm, setRadiusKm] = useState(8);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Free time state (ตามที่ user เน้นย้ำ)
  const [freeTimeMode, setFreeTimeMode] = useState<'now' | 'scheduled'>('now');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [durationHours, setDurationHours] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ไม่รองรับ GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGps(true);
      },
      (err) => {
        alert('ไม่สามารถดึงตำแหน่งพิกัดได้: ' + err.message);
      }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedbackSuccess(null);

    try {
      if (!pinnedCoords && !(useGps && coords)) {
        throw new Error('กรุณาปักหมุดจุดเริ่มต้น หรืออนุญาตให้ใช้ตำแหน่ง GPS ก่อนค้นหา');
      }
      const payload: any = {
        location: pinnedCoords || (useGps && coords)
          ? { mode: 'coordinates', latitude: (pinnedCoords || coords)!.lat, longitude: (pinnedCoords || coords)!.lng, radiusKm }
          : { mode: 'coordinates', latitude: (pinnedCoords || coords)!.lat, longitude: (pinnedCoords || coords)!.lng, radiusKm },
        intentText,
        mood,
        companions,
        budgetTHB: budgetTHB === '' ? undefined : Number(budgetTHB),
      };

      if (freeTimeMode === 'now') {
        payload.freeTime = {
          availableNow: true,
          durationHours,
        };
      } else {
        payload.freeTime = {
          startTime,
          endTime,
          date: '2026-10-23',
        };
      }

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการค้นหา');
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (itemId: string, type: 'useful' | 'not_relevant' | 'dismissed') => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          feedbackType: type,
        }),
      });
      if (res.ok) {
        setFeedbackSuccess(`บันทึกความคิดเห็นสำหรับรายการ ${itemId} เรียบร้อยแล้ว`);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  // Quick intent chips
  const quickIntents = [
    { icon: '🎨', label: 'ศิลปะ', intent: 'อยากดูงานศิลปะ หอศิลป์ แกลเลอรี' },
    { icon: '🎵', label: 'ดนตรี', intent: 'อยากฟังดนตรีสด คอนเสิร์ต' },
    { icon: '☕', label: 'คาเฟ่', intent: 'อยากนั่งชิลคาเฟ่ กาแฟ' },
    { icon: '🍜', label: 'ของกิน', intent: 'อยากหาของกิน อาหารอร่อย' },
    { icon: '🛍️', label: 'ตลาด', intent: 'อยากเดินตลาด ช้อปปิ้ง' },
    { icon: '🎭', label: 'วัฒนธรรม', intent: 'อยากดูพิพิธภัณฑ์ วัฒนธรรม' },
    { icon: '🌳', label: 'กลางแจ้ง', intent: 'อยากออกไปกลางแจ้ง สวนสาธารณะ' },
    { icon: '🎪', label: 'สนุกสนาน', intent: 'อยากทำอะไรสนุกๆ ตื่นเต้น' },
  ];

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
          ค้นหากิจกรรมและที่เที่ยวกรุงเทพฯ
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '1rem' }}>
          ระบบจับคู่กิจกรรมจริงและนิทรรศการตามเวลาว่าง อารมณ์ และงบประมาณของคุณ (Bangkok Travel Discovery)
        </p>
        <div style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'inline-block', border: '1px solid #334155' }}>
          <span style={{ color: '#10b981', fontWeight: 600 }}>📊 ข้อมูล: 12,207 สถานที่จริง</span>
          <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>+ ค้นพบอีเวนต์สดผ่าน AI</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#334155',
              color: '#38bdf8',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 500,
              border: '1px solid #475569',
            }}
          >
            🗺️ แผนที่พื้นฐาน
          </Link>
          <Link
            href="/places"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            }}
          >
            🏙️ สถานที่จริง 12,207 แห่ง
          </Link>
        </div>
      </header>

      {/* Search Form */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: '0.75rem' }}>📍 ปักหมุดจุดเริ่มต้น</h2>
        <p style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>คลิกหรือเลื่อนหมุดบนแผนที่ แล้วค้นหาสถานที่ใกล้จุดนี้ได้ทันที</p>
        <BangkokMap
          height="360px"
          onLocationSelect={(lat, lng) => {
            setPinnedCoords({ lat, lng });
            setUseGps(false);
          }}
        />
        {pinnedCoords && <div style={{ color: '#4ade80', marginTop: '0.5rem' }}>✓ ใช้จุดเริ่มต้น: {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}</div>}
      </section>
      <form
        onSubmit={handleSearch}
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.8rem',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Location selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              📍 จุดเริ่มต้น
            </label>
            {pinnedCoords ? (
              <div style={{ color: '#4ade80', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                ✓ ใช้จุดที่ปักหมุด: {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}
              </div>
            ) : useGps ? (
              <div style={{ color: '#4ade80', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                ✓ ใช้พิกัด GPS: {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
              </div>
            ) : (
              <div style={{ color: '#fbbf24', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                กรุณาคลิกแผนที่เพื่อปักหมุด หรือกดใช้ GPS
              </div>
            )}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleGetLocation}
                style={{
                  fontSize: '0.85rem',
                  background: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                📡 ใช้ตำแหน่งปัจจุบัน (GPS)
              </button>
              {(useGps || pinnedCoords) && (
                <button
                  type="button"
                  onClick={() => { setUseGps(false); setCoords(null); setPinnedCoords(null); }}
                  style={{
                    fontSize: '0.85rem',
                    background: 'transparent',
                    color: '#94a3b8',
                    border: '1px solid #475569',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ล้างจุดเริ่มต้น
                </button>
              )}
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              🎯 รัศมีการค้นหา (กม.)
            </label>
            <input
              type="number"
              min={0.1}
              step="any"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          {/* Free time / Available hours */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#38bdf8' }}>
              ⏰ เวลาว่างของคุณ (Free Time Matching)
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="freeTimeMode"
                  checked={freeTimeMode === 'now'}
                  onChange={() => setFreeTimeMode('now')}
                />
                ว่างตอนนี้เลย (หาอีเวนต์และที่เที่ยวเปิดอยู่ขณะนี้)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="freeTimeMode"
                  checked={freeTimeMode === 'scheduled'}
                  onChange={() => setFreeTimeMode('scheduled')}
                />
                ระบุช่วงเวลาว่าง
              </label>
            </div>

            {freeTimeMode === 'now' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0f172a', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>มีเวลาว่างประมาณ:</span>
                <input
                  type="number"
                  min={0.1}
                  step="any"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #475569',
                  }}
                /> ชั่วโมง
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', background: '#0f172a', padding: '0.75rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block' }}>เริ่มว่างตั้งแต่:</span>
                  <input
                    type="text"
                    placeholder="เช่น 18:00"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ padding: '0.4rem', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block' }}>ถึงเวลา:</span>
                  <input
                    type="text"
                    placeholder="เช่น 22:00"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ padding: '0.4rem', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '6px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* User intent */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              💬 บอกสิ่งที่คุณอยากทำด้วยภาษาธรรมชาติ
            </label>
            
            {/* Quick Intent Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {quickIntents.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIntentText(item.intent)}
                  style={{
                    background: '#334155',
                    color: '#e2e8f0',
                    border: '1px solid #475569',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#475569';
                    e.currentTarget.style.borderColor = '#64748b';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#334155';
                    e.currentTarget.style.borderColor = '#475569';
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            <input
              type="text"
              value={intentText}
              onChange={(e) => setIntentText(e.target.value)}
              placeholder="เช่น เบื่อ อยากออกไปเดินเล่นชิลๆ ฟังดนตรีสด หรือดูงานศิลปะ"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #475569',
              }}
            />
          </div>

          {/* Mood / Experience */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              ✨ อารมณ์ / บรรยากาศที่ต้องการ (Mood)
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="เช่น อยากเปลี่ยนบรรยากาศ, ผ่อนคลาย, ตื่นเต้น"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #475569',
              }}
            />
          </div>

          {/* Budget */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              💵 งบประมาณ (บาท)
            </label>
            <input
              type="number"
              value={budgetTHB}
              onChange={(e) => setBudgetTHB(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="ระบุงบ เช่น 300 หรือเว้นว่างถ้าไม่จำกัด"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #475569',
              }}
            />
          </div>

          {/* Companions */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#e2e8f0' }}>
              👥 ไปกับใคร
            </label>
            <select
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #475569',
              }}
            >
              <option value="friends">ไปกับเพื่อน (Friends)</option>
              <option value="couple">ไปกับแฟน / เดท (Couple)</option>
              <option value="solo">ไปคนเดียว ชิลๆ (Solo)</option>
              <option value="family">ครอบครัว / พาเด็กๆ ไป (Family)</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#64748b' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: '0.9rem 2.5rem',
              borderRadius: '10px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ กำลังวิเคราะห์ความต้องการและตรวจสอบข้อมูล...' : '🔍 ค้นหากิจกรรมที่เหมาะกับคุณ'}
          </button>
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Feedback notification */}
      {feedbackSuccess && (
        <div style={{ background: '#064e3b', color: '#a7f3d0', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ✓ {feedbackSuccess}
        </div>
      )}

      {/* Results Section */}
      {response && (
        <section>
          {/* Intent interpretation box */}
          <div
            style={{
              background: '#1e293b',
              padding: '1.2rem',
              borderRadius: '12px',
              borderLeft: '4px solid #38bdf8',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '0.4rem' }}>
              🧠 สรุปการตีความความต้องการของคุณ
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '0.4rem' }}>
              {response.interpretedIntent.querySummaryTh || response.interpretedIntent.querySummary}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ background: '#334155', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                📍 ย่าน: {response.interpretedIntent.targetAreaOrLocation}
              </span>
              <span style={{ background: '#334155', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                ⏰ {response.interpretedIntent.freeTimeContextTh || response.interpretedIntent.freeTimeContext}
              </span>
              <span style={{ background: '#334155', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                🏷️ หมวดหมู่: {response.interpretedIntent.detectedCategories.join(', ')}
              </span>
              <span style={{ 
                background: response.metadata?.aiProvider === 'deterministic_rule_engine' ? '#78350f' : '#065f46',
                color: response.metadata?.aiProvider === 'deterministic_rule_engine' ? '#fde68a' : '#6ee7b7',
                padding: '0.2rem 0.6rem', 
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                🤖 {response.metadata?.aiProvider === 'deterministic_rule_engine' ? 'Rule Engine' : 
                    response.metadata?.aiProvider === 'groq_ai' ? 'Groq AI' : 
                    response.metadata?.aiProvider === 'google_gemini' ? 'Gemini AI' : 'AI'}
              </span>
            </div>
          </div>

          {/* Honest Empty State */}
          {response.status === 'no_match' && (
            <div
              style={{
                background: '#1e293b',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px dashed #64748b',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏜️</div>
              <h2 style={{ fontSize: '1.4rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                {response.emptyState?.messageTh || response.emptyState?.message}
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                ระบบค้นหาจากฐานข้อมูลกิจกรรมจริง และไม่พบรายการที่ตรงกับเงื่อนไขทั้งหมดในขณะนี้
              </p>
              <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto', background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.5rem' }}>💡 สิ่งที่คุณสามารถลองทำได้:</strong>
                <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                  {response.emptyState?.suggestedActions.map((action, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Results list */}
          {response.results && response.results.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '1rem' }}>
                🎉 คำแนะนำที่ตรงกับคุณ ({response.results.length} รายการ)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {response.results.map((item: RecommendationResultItem) => (
                  <article
                    key={item.id}
                    style={{
                      background: '#1e293b',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid #334155',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* Top Row: Title, Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              background: item.type === 'event' ? '#7c3aed' : '#0284c7',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.type === 'event' ? 'อีเวนต์ / งานกิจกรรม' : 'สถานที่ / แหล่งท่องเที่ยว'}
                          </span>

                          {item.source.verificationStatus === 'verified' && (
                            <span
                              style={{
                                background: '#065f46',
                                color: '#6ee7b7',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              ✓ ข้อมูลจริงผ่านการตรวจสอบแล้ว
                            </span>
                          )}

                          {item.source.sourceName.includes('Google Search') && (
                            <span
                              style={{
                                background: '#1e3a8a',
                                color: '#93c5fd',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #3b82f6',
                              }}
                            >
                              🌐 ค้นพบสด Real-Time ผ่าน Google Search
                            </span>
                          )}

                          {item.source.isDemoFixture && (
                            <span
                              style={{
                                background: '#78350f',
                                color: '#fde68a',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              ข้อมูลตัวอย่างการทดสอบ (Fixture)
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', marginTop: '0.4rem', fontWeight: 700 }}>
                          {item.titleTh || item.title}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                          📍 {item.venueName} — {item.address}
                        </p>
                      </div>

                      {/* Score badge */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #334155' }}>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>คะแนนความตรง</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{item.matchScore} pt</div>
                        </div>
                      </div>
                    </div>

                    {/* Free time and distance badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '0.8rem 0' }}>
                      {item.timeMatch && (
                        <div
                          style={{
                            background: item.timeMatch.isHappeningNow ? '#064e3b' : '#1e1b4b',
                            color: item.timeMatch.isHappeningNow ? '#a7f3d0' : '#c7d2fe',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          ⏰ {item.timeMatch.timeLabelTh}
                        </div>
                      )}

                      {item.distanceKm !== null && (
                        <div
                          style={{
                            background: '#0f172a',
                            color: '#e2e8f0',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            border: '1px solid #334155',
                          }}
                        >
                          📏 ห่างจากจุดเริ่มต้น {item.distanceKm} กม.
                        </div>
                      )}

                      <div
                        style={{
                          background: item.pricing.isFree ? '#065f46' : '#0f172a',
                          color: item.pricing.isFree ? '#a7f3d0' : '#f8fafc',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          border: '1px solid #334155',
                        }}
                      >
                        💰 {item.pricing.isFree ? 'เข้าชมฟรี' : item.pricing.minPrice !== null ? `ราคา ${item.pricing.minPrice} บาท` : 'ไม่ระบุราคา'}
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0.8rem 0', lineHeight: 1.5 }}>
                      {item.descriptionTh || item.description}
                    </p>

                    {/* Match Explanation */}
                    <div
                      style={{
                        background: '#0f172a',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '0.8rem',
                        borderLeft: '3px solid #10b981',
                      }}
                    >
                      <strong style={{ color: '#10b981', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                        💡 ทำไมถึงเหมาะกับคุณ: {item.explanation.headlineTh || item.explanation.headline}
                      </strong>
                      <ul style={{ paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {(item.explanation.reasonsTh || item.explanation.reasons).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons and verification source */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.8rem',
                        marginTop: '1.2rem',
                        paddingTop: '0.8rem',
                        borderTop: '1px solid #334155',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        แหล่งข้อมูล: {item.source.sourceName} | ตรวจสอบล่าสุดเมื่อ: {new Date(item.source.lastCheckedAt).toLocaleDateString('th-TH')}
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {item.actionableLinks?.sourceUrl && (
                          <a
                            href={item.actionableLinks.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#334155',
                              color: '#38bdf8',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                            }}
                          >
                            🔗 ดูข้อมูลผู้จัดจริง
                          </a>
                        )}

                        {item.actionableLinks?.mapsUrl && (
                          <a
                            href={item.actionableLinks.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#0284c7',
                              color: '#fff',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                            }}
                          >
                            🗺️ อยากไป / ดูเส้นทาง
                          </a>
                        )}

                        {/* Feedback button */}
                        <button
                          type="button"
                          onClick={() => sendFeedback(item.id, 'useful')}
                          style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid #475569',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                          title="กดถูกใจคำแนะนำนี้"
                        >
                          👍 มีประโยชน์
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
