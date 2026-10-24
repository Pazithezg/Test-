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
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-400">กำลังโหลด...</div>
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
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        เลือกความรู้สึกของคุณ (เลือก 1 อย่าง)
      </label>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => {
              if (selectedMood === mood.id) {
                onMoodSelect(null); // Deselect
              } else {
                onMoodSelect(mood.id); // Select
              }
            }}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              flex flex-col items-center justify-center gap-1
              ${
                selectedMood === mood.id
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
              }
            `}
          >
            <span className="text-2xl">{moodEmojis[mood.id] || '😊'}</span>
            <span className="text-xs text-center font-medium text-gray-700">
              {mood.descriptionTh}
            </span>
            
            {selectedMood === mood.id && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">หมวดหมู่ที่แนะนำ:</span>{' '}
          {moods.find(m => m.id === selectedMood)?.categories.join(', ')}
        </div>
      )}
    </div>
  );
}
