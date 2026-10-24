'use client';

import { useState, useEffect } from 'react';
import DataSourceBadge from './DataSourceBadge';

interface Province {
  id: string;
  nameTh: string;
  nameEn: string;
  region: string;
  emoji: string;
}

interface DataStatus {
  [provinceId: string]: {
    hasMockData: boolean;
    hasRealData: boolean;
  };
}

interface ProvinceSelectorProps {
  onSelect: (provinceId: string) => void;
  selected?: string;
}

export default function ProvinceSelector({ onSelect, selected }: ProvinceSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/status').then(res => res.json()),
      // Load provinces from data
      Promise.resolve({
        provinces: [
          { id: 'bangkok', nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok', region: 'central', emoji: '🏙️' },
          { id: 'chiang-mai', nameTh: 'เชียงใหม่', nameEn: 'Chiang Mai', region: 'north', emoji: '⛰️' },
          { id: 'phuket', nameTh: 'ภูเก็ต', nameEn: 'Phuket', region: 'south', emoji: '🏖️' },
          { id: 'krabi', nameTh: 'กระบี่', nameEn: 'Krabi', region: 'south', emoji: '🌊' },
          { id: 'chonburi', nameTh: 'ชลบุรี', nameEn: 'Chonburi', region: 'east', emoji: '🏖️' },
          { id: 'prachuap-khiri-khan', nameTh: 'ประจวบคีรีขันธ์', nameEn: 'Prachuap Khiri Khan', region: 'central', emoji: '🌅' },
          { id: 'nakhon-ratchasima', nameTh: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima', region: 'northeast', emoji: '🏛️' },
          { id: 'ayutthaya', nameTh: 'พระนครศรีอยุธยา', nameEn: 'Ayutthaya', region: 'central', emoji: '🏯' },
          { id: 'surat-thani', nameTh: 'สุราษฎร์ธานี', nameEn: 'Surat Thani', region: 'south', emoji: '🥥' },
          { id: 'songkhla', nameTh: 'สงขลา', nameEn: 'Songkhla', region: 'south', emoji: '🌴' },
          { id: 'chiang-rai', nameTh: 'เชียงราย', nameEn: 'Chiang Rai', region: 'north', emoji: '🗻' },
        ]
      })
    ])
      .then(([statusData, provincesData]) => {
        setDataStatus(statusData.provinces || {});
        setProvinces(provincesData.provinces);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load provinces:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ocean-muted)' }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid var(--ocean-accent-soft)',
            borderTopColor: 'var(--ocean-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'var(--ocean-text)'
      }}>
        📍 เลือกจังหวัดที่ต้องการสำรวจ
      </label>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.75rem'
      }}>
        {provinces.map((province) => {
          const status = dataStatus[province.id];
          const hasReal = status?.hasRealData;
          const hasMock = status?.hasMockData;
          const isMock = !hasReal && hasMock;

          return (
            <button
              key={province.id}
              type="button"
              onClick={() => onSelect(province.id)}
              style={{
                position: 'relative',
                padding: '0.875rem 0.625rem',
                borderRadius: '12px',
                border: `2px solid ${selected === province.id ? 'var(--ocean-primary)' : 'var(--ocean-border)'}`,
                background: selected === province.id ? 'var(--ocean-accent-soft)' : 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '100px'
              }}
              onMouseEnter={(e) => {
                if (selected !== province.id) {
                  e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 122, 159, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== province.id) {
                  e.currentTarget.style.borderColor = 'var(--ocean-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              aria-pressed={selected === province.id}
              aria-label={`${province.nameTh} ${selected === province.id ? 'เลือกอยู่' : ''}`}
            >
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{province.emoji}</span>
              <span style={{
                fontSize: '0.8125rem',
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--ocean-text)',
                lineHeight: 1.3
              }}>
                {province.nameTh}
              </span>
              
              <DataSourceBadge isMock={isMock} size="sm" />
              
              {selected === province.id && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '24px',
                  height: '24px',
                  background: 'var(--coral-orange)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 107, 74, 0.3)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
