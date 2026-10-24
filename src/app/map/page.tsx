'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
    <main className="secondary-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Link
            href="/"
            style={{
              background: '#334155',
              color: '#e2e8f0',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← กลับหน้าหลัก
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
          🗺️ แผนที่กรุงเทพฯ แบบ Interactive
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          เลือกตำแหน่งบนแผนที่เพื่อค้นหากิจกรรมและสถานที่ท่องเที่ยวรอบๆ บริเวณนั้น
        </p>
      </header>

      {/* Map Section */}
      <section
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>
            📍 เลือกตำแหน่งบนแผนที่
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            คลิกที่แผนที่เพื่อเลือกจุดที่คุณต้องการค้นหา ระบบจะแสดงพิกัด Latitude และ Longitude
          </p>
        </div>

        <BangkokMap
          onLocationSelect={handleLocationSelect}
          initialCenter={[13.7563, 100.5018]}
          initialZoom={12}
          height="600px"
        />
      </section>

      {/* Selected Location Info */}
      {selectedLocation && (
        <section
          style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid #10b981',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '1rem' }}>
            ✅ ตำแหน่งที่เลือก
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                📐 Latitude (ละติจูด)
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {selectedLocation.lat.toFixed(6)}
              </div>
            </div>

            <div
              style={{
                background: '#0f172a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                📐 Longitude (ลองจิจูด)
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href={`/?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🔍 ค้นหากิจกรรมบริเวณนี้
            </Link>

            <a
              href={`https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lng}#map=15/${selectedLocation.lat}/${selectedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#334155',
                color: '#e2e8f0',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🗺️ เปิดใน OpenStreetMap
            </a>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '1.5rem' }}>
          ✨ คุณสมบัติของแผนที่
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              icon: '🖱️',
              title: 'คลิกเพื่อเลือกตำแหน่ง',
              desc: 'คลิกที่จุดใดก็ได้บนแผนที่เพื่อเลือกตำแหน่งและดูพิกัด',
            },
            {
              icon: '🔍',
              title: 'ซูมและเลื่อนได้อย่างอิสระ',
              desc: 'ใช้ scroll หรือปุ่ม +/- เพื่อซูม ลากเพื่อเลื่อนดูพื้นที่',
            },
            {
              icon: '📱',
              title: 'ใช้งานได้ทุกอุปกรณ์',
              desc: 'Responsive design รองรับทั้งคอมพิวเตอร์และมือถือ',
            },
            {
              icon: '🆓',
              title: 'ไม่ต้อง API Key',
              desc: 'ใช้ OpenStreetMap ฟรี ไม่ต้องลงทะเบียนหรือเสียค่าใช้จ่าย',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.5rem', fontWeight: 600 }}>
                {feature.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attribution */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>
          แผนที่และข้อมูลภูมิศาสตร์จาก{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#38bdf8', fontWeight: 500 }}
          >
            © OpenStreetMap contributors
          </a>
        </p>
      </footer>
    </main>
  );
}
