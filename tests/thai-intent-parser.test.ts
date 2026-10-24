import { describe, it, expect } from 'vitest';
import { parseThaiIntent } from '../src/ai/thai-intent-parser';
import {
  THAI_INTENT_DICTIONARY,
  matchCategory,
  extractMoodVibes,
  detectCompanionPreference,
} from '../src/ai/thai-intent-dictionary';

describe('Thai Intent Dictionary & Parser', () => {
  it('dictionary contains 20+ categories with 60+ total aliases', () => {
    expect(THAI_INTENT_DICTIONARY.length).toBeGreaterThanOrEqual(20);

    const totalAliases = THAI_INTENT_DICTIONARY.reduce(
      (sum, category) => sum + category.aliases.length,
      0
    );
    expect(totalAliases).toBeGreaterThanOrEqual(60);
  });

  it('correctly parses Thai phrase for sightseeing intent', () => {
    const result = parseThaiIntent({
      intentText: 'เบื่อ อยากเดินเล่น',
    });

    expect(result.categories).toContain('sightseeing');
    expect(result.vibeTags).toContain('refreshing');
    expect(result.vibeTags).toContain('new_experience');
    expect(result.summaryTh).toContain('เดินเล่น');
  });

  it('identifies art exhibition and creative categories from Thai art query', () => {
    const result = parseThaiIntent({
      intentText: 'อยากดูศิลปะ',
    });

    expect(result.categories).toContain('art_exhibition');
    expect(result.vibeTags).toContain('creative');
    expect(result.vibeTags).toContain('inspiring');
  });

  it('detects companion preference from input text', () => {
    const friendsResult = parseThaiIntent({
      intentText: 'อยากไปดูนิทรรศการกับเพื่อน',
    });

    expect(friendsResult.companions).toBe('friends');
    expect(friendsResult.vibeTags).toContain('social');
    expect(friendsResult.vibeTags).toContain('friends');

    const coupleResult = parseThaiIntent({
      intentText: 'อยากไปเดทกับแฟน',
    });

    expect(coupleResult.companions).toBe('couple');
    expect(coupleResult.vibeTags).toContain('romantic');
  });

  it('parses budget from Thai text and sets budgetLevel', () => {
    const lowBudgetResult = parseThaiIntent({
      intentText: 'อยากไปเที่ยว งบ 300',
    });

    expect(lowBudgetResult.budgetLevel).toBe('low');

    const freeBudgetResult = parseThaiIntent({
      intentText: 'อยากหากิจกรรมฟรี',
      budgetTHB: 0,
    });

    expect(freeBudgetResult.budgetLevel).toBe('free');
  });

  it('returns default categories for ambiguous input', () => {
    const result = parseThaiIntent({
      intentText: 'อยากทำอะไรสักอย่าง',
    });

    // Should fall back to creative + sightseeing
    expect(result.categories).toContain('creative');
    expect(result.categories).toContain('sightseeing');
    expect(result.categories.length).toBeGreaterThan(0);
  });

  it('provides confidence scoring for category matches', () => {
    const matches = matchCategory('ศิลปะ หอศิลป์ แกลเลอรี');

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].confidence).toBeGreaterThan(0);
    expect(matches[0].confidence).toBeLessThanOrEqual(1.0);
    
    // Strong match should have high confidence
    expect(matches[0].category.id).toBe('art_exhibition');
    expect(matches[0].confidence).toBeGreaterThan(0.3);
  });

  it('extracts mood vibes correctly from Thai and English text', () => {
    const boredVibes = extractMoodVibes('เบื่อมาก');
    expect(boredVibes).toContain('refreshing');
    expect(boredVibes).toContain('new_experience');

    const chillVibes = extractMoodVibes('อยากชิลๆ ผ่อนคลาย');
    expect(chillVibes).toContain('chill');
    expect(chillVibes).toContain('peaceful');

    const funVibes = extractMoodVibes('อยากสนุกๆ');
    expect(funVibes).toContain('fun');
    expect(funVibes).toContain('exciting');
  });

  it('detects companion preferences correctly', () => {
    expect(detectCompanionPreference('ไปกับเพื่อน')).toBe('friends');
    expect(detectCompanionPreference('ไปกับแฟน')).toBe('couple');
    expect(detectCompanionPreference('ไปคนเดียว')).toBe('solo');
    expect(detectCompanionPreference('ไปกับครอบครัว')).toBe('family');
    expect(detectCompanionPreference('อยากไปเที่ยว')).toBe('any');
  });

  it('handles multiple category matches with proper priority', () => {
    const result = parseThaiIntent({
      intentText: 'อยากไปดูศิลปะ ฟังดนตรี แล้วไปกินอาหาร',
    });

    // Should detect all three main categories
    expect(result.categories).toContain('art_exhibition');
    expect(result.categories).toContain('live_music');
    expect(result.categories).toContain('food_festival');
  });

  it('preserves backward compatibility with activityPreferences input', () => {
    const result = parseThaiIntent({
      intentText: 'อยากทำอะไรสนุกๆ',
      activityPreferences: ['workshop', 'cafe_hopping'],
    });

    // Should include pre-specified preferences
    expect(result.categories).toContain('workshop');
    expect(result.categories).toContain('cafe_hopping');
  });

  it('generalizes semantic Thai paraphrases without venue-specific hardcoding', () => {
    const cases = [
      { text: 'วันนี้เหนื่อยมาก อยากไปพักใจ', expected: 'cafe_hopping' },
      { text: 'หัวจะระเบิด ขอหนีคนสักพัก', expected: 'nature_park' },
      { text: 'มีที่ชิวๆๆ งบน้อยๆ', expected: 'cafe_hopping' },
      { text: 'เบื่อห้างแล้ว มีอะไรแปลกใหม่ให้ทำกับเพื่อน', expected: 'creative' },
      { text: 'อยากเดินเล่นถ่ายรูป กินของอร่อย แล้วกลับไม่ดึก', expected: 'photography' },
    ];

    for (const testCase of cases) {
      const result = parseThaiIntent({ intentText: testCase.text });
      expect(result.categories, testCase.text).toContain(testCase.expected);
      expect(result.summaryTh, testCase.text).toContain(testCase.text);
    }
  });

  it('does not keep shopping as a preferred category when malls are explicitly excluded', () => {
    const result = parseThaiIntent({ intentText: 'ไม่เอาห้าง อยากทำกิจกรรมกับเพื่อน' });
    expect(result.categories).not.toContain('shopping');
    expect(result.categories).toContain('creative');
    expect(result.companions).toBe('friends');
  });
});
