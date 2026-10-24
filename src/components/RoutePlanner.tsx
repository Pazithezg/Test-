'use client';

import { useState, useEffect, useRef } from 'react';
import TravelModeSelector, { TravelMode } from './TravelModeSelector';

interface Location {
  name: string;
  lat: number;
  lng: number;
  province?: string;
}

interface RouteInfo {
  distance: number;
  duration: number;
  cost: {
    fuel?: number;
    parking?: number;
    total: number;
  };
  method: string;
}

interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  province: string;
  isMock?: boolean;
}

interface RoutePlannerProps {
  initialOrigin?: Location;
  initialDestination?: Location;
}

export default function RoutePlanner({ initialOrigin, initialDestination }: RoutePlannerProps) {
  const [origin, setOrigin] = useState<Location | null>(initialOrigin || null);
  const [destination, setDestination] = useState<Location | null>(initialDestination || null);
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<SearchResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SearchResult[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const originDebounceRef = useRef<NodeJS.Timeout>();
  const destDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (originInput.length >= 2) {
      if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
      originDebounceRef.current = setTimeout(() => {
        fetch(`/api/discovery/search?q=${encodeURIComponent(originInput)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            setOriginSuggestions(data.places || []);
            setShowOriginSuggestions(true);
          })
          .catch(err => console.error('Failed to search origin:', err));
      }, 300);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  }, [originInput]);

  useEffect(() => {
    if (destInput.length >= 2) {
      if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
      destDebounceRef.current = setTimeout(() => {
        fetch(`/api/discovery/search?q=${encodeURIComponent(destInput)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            setDestSuggestions(data.places || []);
            setShowDestSuggestions(true);
          })
          .catch(err => console.error('Failed to search destination:', err));
      }, 300);
    } else {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
    }
  }, [destInput]);

  useEffect(() => {
    if (origin && destination && travelMode) {
      calculateRoute();
    } else {
      setRouteInfo(null);
    }
  }, [origin, destination, travelMode]);

  const calculateRoute = async () => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/travel/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          mode: travelMode
        })
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถคำนวณเส้นทางได้');
      }

      const data = await response.json();
      setRouteInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setRouteInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.9375rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
          color: 'var(--ocean-text)'
        }}>
          🗺️ วางแผนเส้นทางของคุณ
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Origin Input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.125rem'
              }}>
                📍
              </span>
              <input
                type="text"
                placeholder="จุดเริ่มต้น..."
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                  borderRadius: '10px',
                  border: '2px solid var(--ocean-border)',
                  fontSize: '0.9375rem',
                  background: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                  if (originSuggestions.length > 0) setShowOriginSuggestions(true);
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ocean-border)';
                  setTimeout(() => setShowOriginSuggestions(false), 200);
                }}
              />
            </div>

            {showOriginSuggestions && originSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.25rem)',
                left: 0,
                right: 0,
                background: 'white',
                border: '2px solid var(--ocean-border)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {originSuggestions.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setOrigin({ name: place.name, lat: place.lat, lng: place.lng, province: place.province });
                      setOriginInput(place.name);
                      setShowOriginSuggestions(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderBottom: idx < originSuggestions.length - 1 ? '1px solid var(--ocean-border)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ocean-accent-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--ocean-text)' }}>{place.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ocean-muted)', marginTop: '0.125rem' }}>
                      {place.province} {place.isMock && '(ตัวอย่าง)'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.125rem'
              }}>
                🎯
              </span>
              <input
                type="text"
                placeholder="จุดหมายปลายทาง..."
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                  borderRadius: '10px',
                  border: '2px solid var(--ocean-border)',
                  fontSize: '0.9375rem',
                  background: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                  if (destSuggestions.length > 0) setShowDestSuggestions(true);
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ocean-border)';
                  setTimeout(() => setShowDestSuggestions(false), 200);
                }}
              />
            </div>

            {showDestSuggestions && destSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.25rem)',
                left: 0,
                right: 0,
                background: 'white',
                border: '2px solid var(--ocean-border)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {destSuggestions.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDestination({ name: place.name, lat: place.lat, lng: place.lng, province: place.province });
                      setDestInput(place.name);
                      setShowDestSuggestions(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderBottom: idx < destSuggestions.length - 1 ? '1px solid var(--ocean-border)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ocean-accent-soft)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--ocean-text)' }}>{place.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ocean-muted)', marginTop: '0.125rem' }}>
                      {place.province} {place.isMock && '(ตัวอย่าง)'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TravelModeSelector onSelect={setTravelMode} selected={travelMode} />

      {loading && (
        <div style={{
          padding: '1.5rem',
          background: 'var(--ocean-accent-soft)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid var(--ocean-accent-soft)',
            borderTopColor: 'var(--ocean-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ocean-text)' }}>
            กำลังคำนวณเส้นทาง...
          </span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#dc2626',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          ⚠️ {error}
        </div>
      )}

      {routeInfo && !loading && (
        <div style={{
          padding: '1.25rem',
          background: 'white',
          border: '2px solid var(--ocean-border)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--ocean-text)',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--ocean-border)'
          }}>
            📊 ข้อมูลเส้นทาง
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--ocean-muted)' }}>ระยะทาง:</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ocean-text)' }}>
                {routeInfo.distance.toFixed(1)} กม.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--ocean-muted)' }}>เวลาเดินทาง:</span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ocean-text)' }}>
                {Math.floor(routeInfo.duration / 60)} ชม. {Math.round(routeInfo.duration % 60)} นาที
              </span>
            </div>

            {routeInfo.cost.fuel && routeInfo.cost.fuel > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--ocean-muted)' }}>ค่าน้ำมัน:</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ocean-text)' }}>
                  {routeInfo.cost.fuel.toFixed(0)} ฿
                </span>
              </div>
            )}

            {routeInfo.cost.parking && routeInfo.cost.parking > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--ocean-muted)' }}>ค่าจอดรถ (โดยประมาณ):</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ocean-text)' }}>
                  {routeInfo.cost.parking.toFixed(0)} ฿
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '2px solid var(--ocean-border)'
            }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ocean-text)' }}>ค่าใช้จ่ายรวม:</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--coral-orange)' }}>
                {routeInfo.cost.total.toFixed(0)} ฿
              </span>
            </div>

            <div style={{
              marginTop: '0.5rem',
              padding: '0.625rem',
              background: 'var(--ocean-accent-soft)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'var(--ocean-muted)',
              textAlign: 'center'
            }}>
              วิธีคำนวณ: {routeInfo.method === 'osrm' ? 'OSRM (เส้นทางจริง)' : 'ระยะทางโดยตรง (โดยประมาณ)'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
