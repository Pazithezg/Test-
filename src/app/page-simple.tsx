'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RecommendationResponse, RecommendationResultItem } from '@/domain/models';
import BrandNav from '@/components/BrandNav';
import MoodSelector from '@/components/MoodSelector';

const BangkokMap = dynamic(() => import('@/components/BangkokMap'), { ssr: false });

export default function DiscoveryPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [useGps, setUseGps] = useState(false);
  
  const [intentText, setIntentText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [budgetTHB, setBudgetTHB] = useState<number | ''>(500);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  const activeLocation = pinnedCoords || coords;

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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
      background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <BrandNav />
        
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--ocean-text)',
          margin: '1.5rem 0 0.5rem',
          textAlign: 'center'
        }}>
          ค้นหาสถานที่ใกล้คุณ
        </h1>
        
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--ocean-muted)',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          12,207+ สถานที่ในกรุงเทพฯ
        </p>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                color: 'var(--ocean-text)'
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
                      background: 'var(--ocean-primary)',
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
                      color: 'var(--ocean-primary)',
                      border: '2px solid var(--ocean-primary)',
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
                  background: '#e0f2fe',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem' }}>
                    {useGps ? '✓ GPS' : '✓ ปักหมุด'} ({activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)})
                  </span>
                  <button
                    type="button"
                    onClick={clearLocation}
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
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
                color: 'var(--ocean-text)'
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
                  border: '1px solid #d1d5db',
                  fontSize: '0.9375rem'
                }}
              />
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
                color: 'var(--ocean-text)'
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
                  border: '1px solid #d1d5db',
                  fontSize: '0.9375rem'
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !activeLocation}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: activeLocation ? 'var(--coral-orange)' : '#cbd5e1',
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
              color: 'var(--ocean-text)'
            }}>
              พบ {response.results.length} สถานที่
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {response.results.map((item: RecommendationResultItem) => (
                <article key={item.id} style={{
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {/* Mock Badge */}
                  {(item.source as any)?.isMock && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        color: '#d97706',
                        border: '1px solid rgba(251, 191, 36, 0.4)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        ⚠️ ข้อมูลจำลอง
                      </span>
                    </div>
                  )}

                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                    {item.titleTh || item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    📍 {item.venueName}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                    {item.address}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.distanceKm !== null && (
                      <span style={{
                        background: '#f3f4f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem'
                      }}>
                        📏 {item.distanceKm} กม.
                      </span>
                    )}
                    <span style={{
                      background: item.pricing?.isFree ? '#d1fae5' : '#f3f4f6',
                      color: item.pricing?.isFree ? '#065f46' : '#374151',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8125rem'
                    }}>
                      💰 {item.pricing?.isFree ? 'ฟรี' : item.pricing?.minPrice ? `${item.pricing.minPrice}฿` : 'ไม่ระบุ'}
                    </span>
                  </div>

                  {(item.descriptionTh || item.description) && (
                    <p style={{
                      fontSize: '0.9375rem',
                      marginTop: '0.75rem',
                      color: '#374151'
                    }}>
                      {item.descriptionTh || item.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(11, 122, 159, 0.1)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--ocean-text)' }}>
            ℹ️ ข้อมูลระยะทางและค่าใช้จ่ายเป็นข้อมูลจำลองสำหรับ Prototype
          </p>
        </div>
      </div>
    </div>
  );
}
