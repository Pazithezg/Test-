'use client';

export type TravelMode = 'walk' | 'bicycle' | 'motorcycle' | 'car';

interface TravelModeOption {
  id: TravelMode;
  labelTh: string;
  emoji: string;
  costInfo: string;
}

interface TravelModeSelectorProps {
  onSelect: (mode: TravelMode) => void;
  selected?: TravelMode;
}

const travelModes: TravelModeOption[] = [
  { id: 'walk', labelTh: 'เดิน', emoji: '🚶', costInfo: 'ฟรี' },
  { id: 'bicycle', labelTh: 'จักรยาน', emoji: '🚴', costInfo: 'ฟรี' },
  { id: 'motorcycle', labelTh: 'มอเตอร์ไซค์', emoji: '🏍️', costInfo: '~2-3฿/กม.' },
  { id: 'car', labelTh: 'รถยนต์', emoji: '🚗', costInfo: '~3-5฿/กม.' },
];

export default function TravelModeSelector({ onSelect, selected }: TravelModeSelectorProps) {
  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'var(--ocean-text)'
      }}>
        🚗 เลือกยานพาหนะ
      </label>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '0.75rem'
      }}>
        {travelModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            style={{
              position: 'relative',
              padding: '0.875rem 0.5rem',
              borderRadius: '12px',
              border: `2px solid ${selected === mode.id ? 'var(--ocean-primary)' : 'var(--ocean-border)'}`,
              background: selected === mode.id ? 'var(--ocean-accent-soft)' : 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '100px'
            }}
            onMouseEnter={(e) => {
              if (selected !== mode.id) {
                e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 122, 159, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selected !== mode.id) {
                e.currentTarget.style.borderColor = 'var(--ocean-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            aria-pressed={selected === mode.id}
            aria-label={`${mode.labelTh} ${mode.costInfo} ${selected === mode.id ? 'เลือกอยู่' : ''}`}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{mode.emoji}</span>
            <span style={{
              fontSize: '0.8125rem',
              textAlign: 'center',
              fontWeight: 600,
              color: 'var(--ocean-text)',
              lineHeight: 1.3
            }}>
              {mode.labelTh}
            </span>
            <span style={{
              fontSize: '0.6875rem',
              textAlign: 'center',
              color: 'var(--ocean-muted)',
              fontWeight: 500
            }}>
              {mode.costInfo}
            </span>
            
            {selected === mode.id && (
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
        ))}
      </div>
    </div>
  );
}
