'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RecommendationResponse, RecommendationResultItem } from '@/domain/models';
import BrandNav from '@/components/BrandNav';
import MoodSelector from '@/components/MoodSelector';
import NearbyPlaces from '@/components/NearbyPlaces';

const BangkokMap = dynamic(() => import('@/components/BangkokMap'), { ssr: false });

export default function DiscoveryPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [useGps, setUseGps] = useState(false);
  
  const [intentText, setIntentText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [budgetTHB, setBudgetTHB] = useState<number | ''>(500);
  const [travelMode, setTravelMode] = useState<'car' | 'walk' | 'transit'>('car');
  const [departureTime, setDepartureTime] = useState(''); // เวลาออก (optional)
  const [returnDeadline, setReturnDeadline] = useState(''); // เวลาที่ต้องกลับ (required)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  const activeLocation = pinnedCoords || coords;

  // Set default return deadline
  useEffect(() => {
    if (!returnDeadline) {
      const now = new Date();
      now.setHours(now.getHours() + 3); // default: 3 ชั่วโมงจากนี้
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setReturnDeadline(`${hours}:${minutes}`);
    }
  }, []);

  // Auto search when params change
  useEffect(() => {
    if (response && activeLocation) {
      handleSearch();
    }
  }, [intentText, selectedMood, budgetTHB, travelMode, departureTime, returnDeadline, activeLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ของคุณไม่รองรับ GPS');
      return;
    }

    setLocationError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGps(true);
        setPinnedCoords(null);
        setShowMap(false);
        setLoading(false);
      },
      (err) => {
        setLocationError('ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตในการตั้งค่า');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setPinnedCoords({ lat, lng });
    setUseGps(false);
    setCoords(null);
    setLocationError(null);
    setShowMap(false);
  };

  const clearLocation = () => {
    setUseGps(false);
    setCoords(null);
    setPinnedCoords(null);
    setLocationError(null);
    setShowMap(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const location = activeLocation;
      if (!location) {
        throw new Error('กรุณาเลือกตำแหน่งก่อนค้นหา');
      }

      const payload = {
        location: {
          mode: 'coordinates',
          latitude: location.lat,
          longitude: location.lng
        },
        intentText: intentText || 'ค้นหาสถานที่ใกล้ฉัน',
        budgetTHB: budgetTHB === '' ? undefined : Number(budgetTHB),
        mood: selectedMood,
        freeTime: { availableNow: true, durationHours: 3 }
      };

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f9ff',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <BrandNav />
        
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#075985',
          margin: '1.5rem 0 0.5rem',
          textAlign: 'center'
        }}>
          ทำไรดี
        </h1>
        
        <p style={{
          fontSize: '0.9375rem',
          color: '#0369a1',
          textAlign: 'center',
          marginBottom: '0.5rem',
          lineHeight: 1.5
        }}>
          <strong>วางแผนเวลาว่างให้คุ้มค่าที่สุด</strong> - ค้นหา คำนวณ วางแผนเส้นทาง<br/>
          จากเวลาว่างของคุณ เราจะบอกว่าไปไหนได้ ใช้เวลาเท่าไหร่ คุ้มค่าที่สุด
        </p>
        
        <p style={{
          fontSize: '0.8125rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          12,207+ สถานที่ในกรุงเทพฯ · ข้อมูลจำลองจังหวัดอื่น
        </p>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e0f2fe',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleSearch}>
            {/* Location */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                📍 ตำแหน่ง
              </label>

              {!activeLocation ? (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'กำลังหา...' : 'ใช้ GPS'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'white',
                      color: '#0ea5e9',
                      border: '2px solid #0ea5e9',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ปักหมุดแผนที่
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '0.75rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #bae6fd'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#075985' }}>
                    {useGps ? '✓ GPS' : '✓ ปักหมุด'} ({activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)})
                  </span>
                  <button
                    type="button"
                    onClick={clearLocation}
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    เปลี่ยน
                  </button>
                </div>
              )}

              {locationError && (
                <p style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '0.8125rem'
                }}>
                  {locationError}
                </p>
              )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                🔍 ค้นหา
              </label>
              <input
                type="text"
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="คาเฟ่, อยากวิ่ง, ว่ายน้ำ..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>

            {/* Travel Mode */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                🚗 การเดินทาง
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTravelMode('car')}
                  style={{
                    padding: '0.75rem 1rem',
                    background: travelMode === 'car' ? '#0ea5e9' : 'white',
                    color: travelMode === 'car' ? 'white' : '#0369a1',
                    border: `2px solid ${travelMode === 'car' ? '#0ea5e9' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🚗 รถยนต์
                </button>
                <button
                  type="button"
                  onClick={() => setTravelMode('walk')}
                  style={{
                    padding: '0.75rem 1rem',
                    background: travelMode === 'walk' ? '#0ea5e9' : 'white',
                    color: travelMode === 'walk' ? 'white' : '#0369a1',
                    border: `2px solid ${travelMode === 'walk' ? '#0ea5e9' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🚶 เดิน
                </button>
                <button
                  type="button"
                  onClick={() => setTravelMode('transit')}
                  style={{
                    padding: '0.75rem 1rem',
                    background: travelMode === 'transit' ? '#0ea5e9' : 'white',
                    color: travelMode === 'transit' ? 'white' : '#0369a1',
                    border: `2px solid ${travelMode === 'transit' ? '#0ea5e9' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🚌 ขนส่งสาธารณะ
                </button>
              </div>
            </div>

            {/* Mood */}
            <div style={{ marginBottom: '1.5rem' }}>
              <MoodSelector onMoodSelect={setSelectedMood} selectedMood={selectedMood} />
            </div>

            {/* Budget */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                💰 งบประมาณ (บาท)
              </label>
              <input
                type="number"
                value={budgetTHB}
                onChange={(e) => setBudgetTHB(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="500"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>

            {/* Departure Time */}
            {/* เวลาออก (Optional) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                🕐 เวลาออก (ไม่ใส่ก็ได้)
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="ไม่ระบุ"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>

            {/* เวลาที่ต้องกลับ (Required) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#0c4a6e'
              }}>
                🏠 ต้องกลับก่อน *
              </label>
              <input
                type="time"
                value={returnDeadline}
                onChange={(e) => setReturnDeadline(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !activeLocation}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: activeLocation ? '#0ea5e9' : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: activeLocation && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'กำลังค้นหา...' : !activeLocation ? 'เลือกตำแหน่งก่อน' : 'ค้นหา'}
            </button>
          </form>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>เลือกตำแหน่งบนแผนที่</h2>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
              <BangkokMap onSelect={handleMapSelect} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {response && response.status === 'success' && response.results.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#075985'
            }}>
              พบ {response.results.length} สถานที่
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {response.results.map((item: RecommendationResultItem) => {
                // คำนวณเวลาและราคาจำลอง
                const distKm = item.distanceKm || 0;
                const roadDistKm = distKm * 1.3; // ระยะทางถนนโดยประมาณ
                
                // เวลาเดินทาง (ขึ้นอยู่กับยานพาหนะ)
                let travelSpeed = 25; // รถยนต์ 25 km/h ในเมือง
                if (travelMode === 'walk') travelSpeed = 4; // เดิน 4 km/h
                if (travelMode === 'transit') travelSpeed = 20; // ขนส่งสาธารณะ 20 km/h
                
                const travelTimeMin = Math.round((roadDistKm / travelSpeed) * 60);
                
                // เวลาที่สถานที่ (ตามประเภท)
                const stayTimeMin = item.categories?.includes('restaurant') ? 90 : 
                                   item.categories?.includes('cafe') ? 60 :
                                   item.categories?.includes('park') ? 120 : 75;
                
                // คำนวณเวลาไป-กลับ
                const now = new Date();
                let departTime: Date;
                
                if (departureTime) {
                  // ใช้เวลาที่ผู้ใช้ใส่
                  const [depHour, depMin] = departureTime.split(':').map(Number);
                  departTime = new Date(now);
                  departTime.setHours(depHour, depMin, 0, 0);
                } else {
                  // ใช้เวลาปัจจุบัน + 10 นาที
                  departTime = new Date(now.getTime() + 10 * 60000);
                }
                
                const arrivalTime = new Date(departTime.getTime() + travelTimeMin * 60000);
                const leaveTime = new Date(arrivalTime.getTime() + stayTimeMin * 60000);
                const returnTime = new Date(leaveTime.getTime() + travelTimeMin * 60000);
                const totalTimeMin = travelTimeMin * 2 + stayTimeMin;
                
                const formatTime = (d: Date) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                
                // ค่าเดินทาง (ขึ้นอยู่กับยานพาหนะ)
                let travelCost = 0;
                if (travelMode === 'car') {
                  const fuelCost = Math.round((roadDistKm / 12) * 35);
                  const parkingCost = item.pricing?.isFree ? 0 : Math.floor(Math.random() * 40) + 20;
                  travelCost = fuelCost + parkingCost;
                } else if (travelMode === 'walk') {
                  travelCost = 0;
                } else if (travelMode === 'transit') {
                  travelCost = Math.ceil(roadDistKm / 5) * 15; // โดยสารประมาณ 15฿/5km
                }
                
                // ค่าใช้จ่ายในสถานที่
                const placeCost = item.pricing?.minPrice || 0;
                
                // รวม
                const totalCost = travelCost + placeCost;

                return (
                <article key={item.id} style={{
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e0f2fe'
                }}>
                  {/* Header with Mock Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: '0.375rem', fontSize: '1.125rem', fontWeight: 600 }}>
                        <a
                          href={item.actionableLinks?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${item.coordinates.latitude},${item.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#075985', textDecoration: 'none' }}
                        >
                          {item.titleTh || item.title} ↗
                        </a>
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        📍 {item.venueName}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                        {item.address}
                      </p>
                    </div>
                    {(item.source as any)?.isMock && (
                      <span style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        color: '#d97706',
                        border: '1px solid rgba(251, 191, 36, 0.4)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        ⚠️ จำลอง
                      </span>
                    )}
                  </div>

                  {/* Trip Timeline */}
                  <div style={{
                    padding: '0.875rem',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    borderLeft: '3px solid #0ea5e9'
                  }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>
                      ⏰ แผนเวลาที่แนะนำ
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>ออก:</span>
                      <span style={{ color: '#0c4a6e' }}>{formatTime(departTime)}</span>
                      
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>ถึง:</span>
                      <span style={{ color: '#0c4a6e' }}>{formatTime(arrivalTime)} ({travelTimeMin} นาที)</span>
                      
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>อยู่:</span>
                      <span style={{ color: '#0c4a6e' }}>{Math.floor(stayTimeMin/60)} ชม. {stayTimeMin%60} นาที</span>
                      
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>กลับ:</span>
                      <span style={{ color: '#0c4a6e' }}>{formatTime(returnTime)}</span>
                      
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>รวม:</span>
                      <span style={{ color: '#0c4a6e', fontWeight: 600 }}>
                        {Math.floor(totalTimeMin/60)} ชม. {totalTimeMin%60} นาที
                      </span>
                    </div>
                  </div>

                  {/* Distance, Cost Grid */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ padding: '0.625rem', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        ระยะทาง
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>
                        📏 {distKm.toFixed(1)} กม.
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {travelMode === 'car' ? 'ขับรถ' : travelMode === 'walk' ? 'เดิน' : 'ขนส่งสาธารณะ'}
                      </div>
                    </div>

                    <div style={{ padding: '0.625rem', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        ค่าใช้จ่าย
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>
                        💰 {totalCost} ฿
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        {travelMode === 'car' ? `เดินทาง ${travelCost}฿` : 
                         travelMode === 'walk' ? 'ฟรี' : 
                         `โดยสาร ${travelCost}฿`} + ที่นั่น {placeCost}฿
                      </div>
                    </div>
                  </div>

                  {/* Budget/Time Check */}
                  <div style={{
                    padding: '0.75rem',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    borderLeft: '3px solid #0ea5e9',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.375rem' }}>
                      💡 สรุป:
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#075985', lineHeight: 1.5 }}>
                      {(() => {
                        const budget = typeof budgetTHB === 'number' ? budgetTHB : 500;
                        const withinBudget = totalCost <= budget;
                        
                        // เช็คว่ากลับทันเวลาที่กำหนดหรือไม่
                        const [deadlineHour, deadlineMin] = returnDeadline.split(':').map(Number);
                        const deadline = new Date(now);
                        deadline.setHours(deadlineHour, deadlineMin, 0, 0);
                        const onTime = returnTime <= deadline;
                        
                        if (withinBudget && onTime) {
                          return `✓ ไปได้เลย! อยู่ในงบ ${budget}฿ และกลับทันเวลา ${returnDeadline} - คุ้มค่าที่สุด`;
                        } else if (!withinBudget && onTime) {
                          return `⚠️ เกินงบ ${Math.abs(budget - totalCost)}฿ แต่กลับทันเวลา`;
                        } else if (withinBudget && !onTime) {
                          const lateMin = Math.round((returnTime.getTime() - deadline.getTime()) / 60000);
                          return `⚠️ อยู่ในงบ แต่กลับไม่ทันเวลา (สาย ${Math.floor(lateMin/60)} ชม. ${lateMin%60} นาที)`;
                        } else {
                          return `❌ เกินงบและกลับไม่ทันเวลา - ลองหาที่ใกล้กว่านี้`;
                        }
                      })()}
                    </div>
                  </div>

                  {/* Nearby Hotels/Parks */}
                  {item.coordinates?.latitude && item.coordinates?.longitude && (
                    <div style={{
                      padding: '0.75rem',
                      background: '#f0f9ff',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      borderLeft: '3px solid #7dd3fc'
                    }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.5rem' }}>
                        🏨 ที่พัก/สถานที่พักผ่อนใกล้เคียง:
                      </div>
                      <NearbyPlaces lat={item.coordinates.latitude} lng={item.coordinates.longitude} />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${activeLocation?.lat},${activeLocation?.lng}&destination=${item.coordinates.latitude},${item.coordinates.longitude}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: '1 1 auto',
                        padding: '0.625rem 1rem',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      🗺️ เปิด Google Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${item.coordinates.latitude},${item.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: '1 1 auto',
                        padding: '0.625rem 1rem',
                        background: 'white',
                        color: '#0ea5e9',
                        border: '2px solid #0ea5e9',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                    >
                      📍 ดูพิกัด
                    </a>
                  </div>

                  {(item.descriptionTh || item.description) && (
                    <p style={{
                      fontSize: '0.875rem',
                      marginTop: '0.75rem',
                      color: '#4b5563',
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '0.75rem'
                    }}>
                      {item.descriptionTh || item.description}
                    </p>
                  )}
                </article>
              )})}
            </div>
          </div>
        )}

        {/* Info - REMOVED */}
      </div>
    </div>
  );
}
