'use client';

import { useState, useEffect } from 'react';
import ProvinceSelector from '@/components/ProvinceSelector';
import TravelModeSelector, { TravelMode } from '@/components/TravelModeSelector';
import RoutePlanner from '@/components/RoutePlanner';
import ThailandMap from '@/components/ThailandMap';

interface DataStatus {
  [provinceId: string]: {
    hasMockData: boolean;
    hasRealData: boolean;
  };
}

export default function ThailandDemoPage() {
  const [selectedProvince, setSelectedProvince] = useState<string>('bangkok');
  const [selectedMode, setSelectedMode] = useState<TravelMode>('car');
  const [provinceStatus, setProvinceStatus] = useState<DataStatus>({});

  useEffect(() => {
    fetch('/api/data/status')
      .then(res => res.json())
      .then(data => setProvinceStatus(data.provinces || {}))
      .catch(err => console.error('Failed to load data status:', err));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--ocean-text)',
            marginBottom: '0.5rem'
          }}>
            🇹🇭 สำรวจประเทศไทย
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--ocean-muted)',
            fontWeight: 500
          }}>
            ค้นหาสถานที่น่าสนใจ วางแผนเส้นทาง และคำนวณค่าใช้จ่ายในการเดินทาง
          </p>
        </div>

        {/* Components Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Province Selector Card */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '2px solid var(--ocean-border)'
          }}>
            <ProvinceSelector
              onSelect={setSelectedProvince}
              selected={selectedProvince}
            />
          </div>

          {/* Travel Mode Selector Card */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '2px solid var(--ocean-border)'
          }}>
            <TravelModeSelector
              onSelect={setSelectedMode}
              selected={selectedMode}
            />
          </div>
        </div>

        {/* Thailand Map */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '2px solid var(--ocean-border)',
          marginBottom: '2rem'
        }}>
          <ThailandMap
            onProvinceSelect={setSelectedProvince}
            selectedProvince={selectedProvince}
            provinceStatus={provinceStatus}
          />
        </div>

        {/* Route Planner */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '2px solid var(--ocean-border)'
        }}>
          <RoutePlanner />
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'rgba(11, 122, 159, 0.1)',
          borderRadius: '12px',
          border: '2px solid var(--ocean-primary)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--ocean-text)',
            fontWeight: 500,
            marginBottom: '0.5rem'
          }}>
            💡 <strong>หน้าทดสอบ Component</strong>
          </p>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--ocean-muted)',
            lineHeight: 1.5
          }}>
            หน้านี้แสดง 5 components ใหม่: ProvinceSelector, TravelModeSelector, RoutePlanner, DataSourceBadge, และ ThailandMap
            <br />
            ข้อมูลกรุงเทพฯ มาจาก OSM จริง ({Object.values(provinceStatus).filter(s => s.hasRealData).length} จังหวัด) 
            · ข้อมูลจังหวัดอื่นเป็นข้อมูลตัวอย่าง ({Object.values(provinceStatus).filter(s => s.hasMockData && !s.hasRealData).length} จังหวัด)
          </p>
        </div>
      </div>
    </div>
  );
}
