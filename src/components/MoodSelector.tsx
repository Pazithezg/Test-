'use client';

import { useState, useEffect } from 'react';

interface Mood {
  id: string;
  description: string;
  descriptionTh: string;
  categories: string[];
}

interface MoodSelectorProps {
  onMoodSelect: (moodId: string | null) => void;
  selectedMood?: string | null;
}

export default function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available moods
    fetch('/api/moods')
      .then(res => res.json())
      .then(data => {
        setMoods(data.moods || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load moods:', error);
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

  // Mood emoji mapping
  const moodEmojis: Record<string, string> = {
    energetic: '⚡',
    relaxed: '😌',
    hungry: '🍽️',
    bored: '😐',
    stressed: '😫',
    curious: '🤔',
    social: '👥',
    romantic: '💕',
    adventurous: '🗺️',
    creative: '🎨',
    sporty: '⚽',
    cultural: '🏛️',
    shopping: '🛍️',
    nightlife: '🌃',
    nature: '🌳',
  };

  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'var(--ocean-text)'
      }}>
        😊 วันนี้คุณรู้สึกอย่างไร?
      </label>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '0.75rem'
      }}>
        {moods.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => {
              if (selectedMood === mood.id) {
                onMoodSelect(null);
              } else {
                onMoodSelect(mood.id);
              }
            }}
            style={{
              position: 'relative',
              padding: '0.875rem 0.5rem',
              borderRadius: '12px',
              border: `2px solid ${selectedMood === mood.id ? 'var(--ocean-primary)' : 'var(--ocean-border)'}`,
              background: selectedMood === mood.id ? 'var(--ocean-accent-soft)' : 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '88px'
            }}
            onMouseEnter={(e) => {
              if (selectedMood !== mood.id) {
                e.currentTarget.style.borderColor = 'var(--ocean-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 122, 159, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMood !== mood.id) {
                e.currentTarget.style.borderColor = 'var(--ocean-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            aria-pressed={selectedMood === mood.id}
            aria-label={`${mood.descriptionTh} ${selectedMood === mood.id ? 'เลือกอยู่' : ''}`}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{moodEmojis[mood.id] || '😊'}</span>
            <span style={{
              fontSize: '0.8125rem',
              textAlign: 'center',
              fontWeight: 500,
              color: 'var(--ocean-text)',
              lineHeight: 1.3
            }}>
              {mood.descriptionTh}
            </span>
            
            {selectedMood === mood.id && (
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

      {selectedMood && (
        <div style={{
          marginTop: '1rem',
          padding: '0.875rem',
          background: 'var(--ocean-accent-soft)',
          borderRadius: '10px',
          borderLeft: '3px solid var(--ocean-primary)'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ocean-primary)' }}>
            หมวดหมู่ที่แนะนำ:
          </span>{' '}
          <span style={{ fontSize: '0.875rem', color: 'var(--ocean-text)' }}>
            {moods.find(m => m.id === selectedMood)?.categories.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
