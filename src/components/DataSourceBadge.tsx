'use client';

interface DataSourceBadgeProps {
  isMock: boolean;
  size?: 'sm' | 'md';
}

export default function DataSourceBadge({ isMock, size = 'sm' }: DataSourceBadgeProps) {
  const fontSize = size === 'sm' ? '0.6875rem' : '0.75rem';
  const padding = size === 'sm' ? '0.125rem 0.375rem' : '0.25rem 0.5rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding,
        borderRadius: '6px',
        fontSize,
        fontWeight: 600,
        background: isMock ? 'rgba(251, 191, 36, 0.15)' : 'rgba(34, 197, 94, 0.15)',
        color: isMock ? '#d97706' : '#16a34a',
        border: `1px solid ${isMock ? 'rgba(251, 191, 36, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
        whiteSpace: 'nowrap'
      }}
      aria-label={isMock ? 'ข้อมูลตัวอย่าง' : 'ข้อมูลจริง'}
    >
      <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.875rem' }}>
        {isMock ? '⚠️' : '✓'}
      </span>
      {isMock ? 'ตัวอย่าง' : 'ข้อมูลจริง'}
    </span>
  );
}
