'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BrandNav from '@/components/BrandNav';

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
        background: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #e0f2fe',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
        <div style={{ color: '#0369a1' }}>กำลังโหลดแผนที่...</div>
      </div>
    </div>
  ),
});

export default function PlacesPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f0f9ff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <BrandNav active="places" />
      
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#075985',
        margin: '1.5rem 0',
        textAlign: 'center'
      }}>
        🏙️ สถานที่ทั้งหมด
      </h1>

      {/* Statistics */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e0f2fe',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1.125rem', color: '#0369a1', marginBottom: '1rem', fontWeight: 600 }}>
          📊 สถิติข้อมูล
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'ร้านอาหาร', value: '3,956', icon: '🍴', color: '#dc2626' },
            { label: 'ร้านค้า', value: '1,821', icon: '🛍️', color: '#0ea5e9' },
            { label: 'อาคาร', value: '1,715', icon: '🏢', color: '#64748b' },
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
                background: '#f0f9ff',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #e0f2fe',
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color, marginBottom: '0.2rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e0f2fe',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <OSMPlacesMap
          initialCenter={[13.7563, 100.5018]}
          initialZoom={13}
          height="700px"
          categories={['cafe', 'restaurant', 'park', 'museum', 'shopping']}
        />
      </div>

      {/* Footer */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
        <p>
          ข้อมูลจาก{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0ea5e9', fontWeight: 500 }}
          >
            © OpenStreetMap contributors
          </a>
        </p>
      </div>
      </div>
    </main>
  );
}
