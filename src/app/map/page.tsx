'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BrandNav from '@/components/BrandNav';

// Dynamically import the map component to avoid SSR issues with Leaflet
const BangkokMap = dynamic(() => import('@/components/BangkokMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e293b',
        borderRadius: '12px',
        border: '2px solid #334155',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
        <div style={{ color: '#94a3b8' }}>กำลังโหลดแผนที่...</div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f0f9ff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <BrandNav active="map" />
      
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#075985',
        margin: '1.5rem 0',
        textAlign: 'center'
      }}>
        🗺️ แผนที่
      </h1>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e0f2fe',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#0369a1', fontSize: '0.9375rem' }}>
            คลิกที่แผนที่เพื่อเลือกตำแหน่ง
          </p>
        </div>

        <BangkokMap
          onSelect={handleLocationSelect}
          initialCenter={[13.7563, 100.5018]}
          initialZoom={12}
          height="600px"
        />
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #bae6fd',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', color: '#0369a1', marginBottom: '1rem', fontWeight: 600 }}>
            ✅ ตำแหน่งที่เลือก
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              background: '#f0f9ff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e0f2fe',
            }}>
              <div style={{ fontSize: '0.8125rem', color: '#0369a1', marginBottom: '0.3rem', fontWeight: 600 }}>
                Latitude
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#075985', fontFamily: 'monospace' }}>
                {selectedLocation.lat.toFixed(6)}
              </div>
            </div>

            <div style={{
              background: '#f0f9ff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e0f2fe',
            }}>
              <div style={{ fontSize: '0.8125rem', color: '#0369a1', marginBottom: '0.3rem', fontWeight: 600 }}>
                Longitude
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#075985', fontFamily: 'monospace' }}>
                {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href={`/?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`}
              style={{
                background: '#0ea5e9',
                color: '#fff',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🔍 ค้นหาบริเวณนี้
            </Link>

            <a
              href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'white',
                color: '#0ea5e9',
                border: '2px solid #0ea5e9',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🗺️ เปิดใน Google Maps
            </a>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
