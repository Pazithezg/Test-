'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the map component to avoid SSR issues
const OSMPlacesMap = dynamic(() => import('@/components/OSMPlacesMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '600px',
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
        <div style={{ color: '#94a3b8' }}>กำลังโหลดแผนที่และข้อมูลสถานที่...</div>
      </div>
    </div>
  ),
});

export default function PlacesPage() {
  return (
    <main className="secondary-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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

          <Link
            href="/map"
            style={{
              background: '#334155',
              color: '#38bdf8',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🗺️ แผนที่พื้นฐาน
          </Link>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
          🏙️ สถานที่จริงในกรุงเทพฯ จาก OpenStreetMap
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
          ข้อมูล 12,207 สถานที่จริงที่ดึงมาจาก OpenStreetMap รวมร้านอาหาร คาเฟ่ สวนสาธารณะ พิพิธภัณฑ์ และแหล่งท่องเที่ยวต่างๆ
        </p>
      </header>

      {/* Statistics */}
      <section
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #334155',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.3rem', color: '#f1f5f9', marginBottom: '1rem' }}>
          📊 สถิติข้อมูล
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'ร้านอาหาร', value: '3,956', icon: '🍴', color: '#dc2626' },
            { label: 'ร้านค้า', value: '1,821', icon: '🛍️', color: '#2563eb' },
            { label: 'อาคาร', value: '1,715', icon: '🏢', color: '#475569' },
            { label: 'คาเฟ่', value: '1,650', icon: '☕', color: '#d97706' },
            { label: 'โรงแรม', value: '1,276', icon: '🏨', color: '#64748b' },
            { label: 'บาร์/ผับ', value: '604', icon: '🍺', color: '#7c3aed' },
            { label: 'สวนสาธารณะ', value: '308', icon: '🌳', color: '#16a34a' },
            { label: 'ฟิตเนส/กีฬา', value: '183', icon: '💪', color: '#10b981' },
            { label: 'แหล่งท่องเที่ยว', value: '181', icon: '🎭', color: '#ec4899' },
            { label: 'ห้างสรรพสินค้า', value: '170', icon: '🏬', color: '#0891b2' },
            { label: 'ตลาด', value: '145', icon: '🏪', color: '#059669' },
            { label: 'พิพิธภัณฑ์', value: '131', icon: '🏛️', color: '#8b5cf6' },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: '#0f172a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, marginBottom: '0.2rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <OSMPlacesMap
          initialCenter={[13.7563, 100.5018]}
          initialZoom={13}
          height="700px"
          categories={['cafe', 'restaurant', 'park', 'museum', 'shopping']}
        />
      </section>

      {/* Data Info */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '1.5rem' }}>
          ℹ️ เกี่ยวกับข้อมูล
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📥</div>
            <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.5rem', fontWeight: 600 }}>
              แหล่งข้อมูล
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              ข้อมูลดึงมาจาก OpenStreetMap ผ่าน Overpass API วันที่ 23 ตุลาคม 2026
              <br />
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#38bdf8' }}
              >
                © OpenStreetMap contributors
              </a>
            </p>
          </div>

          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💾</div>
            <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.5rem', fontWeight: 600 }}>
              การประมวลผล
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              ไฟล์ต้นฉบับ 399 MB ถูกประมวลผลเป็น GeoJSON ขนาด 5.4 MB
              <br />
              ใช้เวลาประมวลผล 9.8 วินาที
              <br />
              ตรวจสอบ 1,586,048 nodes และ 349,536 ways
            </p>
          </div>

          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', marginBottom: '0.5rem', fontWeight: 600 }}>
              การแสดงผล
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
              ใช้ Marker Clustering เพื่อจัดการข้อมูลหลายพันจุดบนแผนที่
              <br />
              โหลดเฉพาะหมวดหมู่ที่เลือกเพื่อประสิทธิภาพที่ดี
              <br />
              ไม่โหลดไฟล์ทั้งหมดในเบราว์เซอร์
            </p>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section
        style={{
          marginTop: '3rem',
          background: '#1e293b',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginBottom: '1rem' }}>
          ⚠️ ข้อจำกัดของข้อมูล
        </h3>
        <ul style={{ color: '#94a3b8', lineHeight: 1.7, marginLeft: '1.2rem' }}>
          <li>
            <strong style={{ color: '#e2e8f0' }}>Snapshot ณ วันที่ 23 ตุลาคม 2026:</strong> ข้อมูลไม่อัปเดตแบบเรียลไทม์
            สถานที่ใหม่หลังวันนี้จะไม่ปรากฏในแผนที่
          </li>
          <li>
            <strong style={{ color: '#e2e8f0' }}>ความสมบูรณ์ของข้อมูล:</strong> ขึ้นอยู่กับผู้ใช้ OpenStreetMap
            บางสถานที่อาจไม่มีข้อมูลครบถ้วน
          </li>
          <li>
            <strong style={{ color: '#e2e8f0' }}>สถานะการเปิด-ปิด:</strong> ข้อมูล opening_hours อาจไม่ถูกต้อง
            แนะนำให้ตรวจสอบกับสถานที่จริงก่อนเดินทาง
          </li>
          <li>
            <strong style={{ color: '#e2e8f0' }}>ไม่มีรีวิวหรือเรตติ้ง:</strong> OSM ไม่มีข้อมูลคุณภาพหรือความนิยม
            เหมาะสำหรับค้นหาตำแหน่งเท่านั้น
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>
          แผนที่และข้อมูลสถานที่จาก{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#38bdf8', fontWeight: 500 }}
          >
            © OpenStreetMap contributors
          </a>
          {' '}• ใช้งานภายใต้ ODbL License
        </p>
      </footer>
    </main>
  );
}
