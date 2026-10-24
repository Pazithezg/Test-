'use client';

import DataSourceBadge from './DataSourceBadge';

interface ThailandMapProps {
  onProvinceSelect: (provinceId: string) => void;
  selectedProvince?: string;
  provinceStatus: Record<string, { hasRealData: boolean; hasMockData: boolean }>;
}

interface ProvinceMapData {
  id: string;
  nameTh: string;
  pathD: string;
  labelX: number;
  labelY: number;
}

// Simplified Thailand map with 11 provinces as clickable regions
const provinces: ProvinceMapData[] = [
  { id: 'chiang-rai', nameTh: 'เชียงราย', pathD: 'M100,30 L130,20 L150,40 L140,60 L110,55 Z', labelX: 125, labelY: 40 },
  { id: 'chiang-mai', nameTh: 'เชียงใหม่', pathD: 'M80,60 L110,55 L140,60 L135,90 L105,95 L75,85 Z', labelX: 105, labelY: 75 },
  { id: 'nakhon-ratchasima', nameTh: 'โคราช', pathD: 'M200,120 L240,115 L250,145 L220,155 L195,145 Z', labelX: 220, labelY: 135 },
  { id: 'bangkok', nameTh: 'กทม.', pathD: 'M180,180 L200,175 L210,195 L195,205 L175,200 Z', labelX: 193, labelY: 190 },
  { id: 'ayutthaya', nameTh: 'อยุธยา', pathD: 'M180,160 L200,155 L210,175 L195,180 L175,170 Z', labelX: 193, labelY: 167 },
  { id: 'chonburi', nameTh: 'ชลบุรี', pathD: 'M220,195 L245,190 L255,210 L240,220 L220,210 Z', labelX: 237, labelY: 205 },
  { id: 'prachuap-khiri-khan', nameTh: 'ประจวบฯ', pathD: 'M150,230 L175,225 L180,250 L165,260 L145,250 Z', labelX: 165, labelY: 243 },
  { id: 'surat-thani', nameTh: 'สุราษฎร์ฯ', pathD: 'M130,280 L155,275 L160,300 L145,310 L125,300 Z', labelX: 143, labelY: 293 },
  { id: 'phuket', nameTh: 'ภูเก็ต', pathD: 'M90,310 L110,305 L115,325 L100,330 L85,320 Z', labelX: 102, labelY: 318 },
  { id: 'krabi', nameTh: 'กระบี่', pathD: 'M115,325 L135,320 L140,340 L125,350 L110,340 Z', labelX: 127, labelY: 333 },
  { id: 'songkhla', nameTh: 'สงขลา', pathD: 'M130,360 L155,355 L160,380 L145,390 L125,380 Z', labelX: 143, labelY: 373 },
];

export default function ThailandMap({ onProvinceSelect, selectedProvince, provinceStatus }: ThailandMapProps) {
  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'var(--ocean-text)'
      }}>
        🗺️ แผนที่ประเทศไทย
      </label>

      <div style={{
        background: 'white',
        border: '2px solid var(--ocean-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        overflow: 'auto'
      }}>
        <svg
          viewBox="0 0 350 420"
          style={{
            width: '100%',
            height: 'auto',
            minHeight: '300px',
            maxHeight: '500px'
          }}
        >
          {/* Background */}
          <rect width="350" height="420" fill="#f0f9ff" />

          {/* Province regions */}
          {provinces.map((province) => {
            const status = provinceStatus[province.id];
            const isMock = status && !status.hasRealData && status.hasMockData;
            const isSelected = selectedProvince === province.id;

            return (
              <g key={province.id}>
                <path
                  d={province.pathD}
                  fill={isSelected ? '#0b7a9f' : isMock ? '#fef3c7' : '#dbeafe'}
                  stroke={isSelected ? '#0b7a9f' : '#0284c7'}
                  strokeWidth={isSelected ? '3' : '2'}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onProvinceSelect(province.id)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.setAttribute('fill', '#bfdbfe');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.setAttribute('fill', isMock ? '#fef3c7' : '#dbeafe');
                    }
                  }}
                />
                
                {/* Province label */}
                <text
                  x={province.labelX}
                  y={province.labelY}
                  textAnchor="middle"
                  style={{
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 600,
                    fill: isSelected ? 'white' : '#0c4a6e',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {province.nameTh}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--ocean-border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', background: '#dbeafe', border: '2px solid #0284c7', borderRadius: '4px' }}></div>
            <DataSourceBadge isMock={false} size="sm" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', background: '#fef3c7', border: '2px solid #0284c7', borderRadius: '4px' }}></div>
            <DataSourceBadge isMock={true} size="sm" />
          </div>
        </div>
      </div>

      {/* Fallback list for small screens */}
      <div style={{
        marginTop: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.5rem'
      }}>
        {provinces.map((province) => {
          const status = provinceStatus[province.id];
          const isMock = status && !status.hasRealData && status.hasMockData;
          const isSelected = selectedProvince === province.id;

          return (
            <button
              key={province.id}
              type="button"
              onClick={() => onProvinceSelect(province.id)}
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: '8px',
                border: `2px solid ${isSelected ? 'var(--ocean-primary)' : 'var(--ocean-border)'}`,
                background: isSelected ? 'var(--ocean-accent-soft)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--ocean-text)',
                transition: 'all 0.2s ease',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--ocean-border)';
                }
              }}
            >
              <span>{province.nameTh}</span>
              <DataSourceBadge isMock={isMock} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
