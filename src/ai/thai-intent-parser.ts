import { IntentParseInput, ParsedUserIntent } from './interface';
import { matchCategory, extractMoodVibes, detectCompanionPreference } from './thai-intent-dictionary';

export function parseThaiIntent(input: IntentParseInput): ParsedUserIntent {
  const text = `${input.intentText} ${input.mood || ''}`.normalize('NFC').replace(/[ๆฯ]/g, '').replace(/\s+/g, ' ').trim();
  
  // Use dictionary matching
  const categoryMatches = matchCategory(text);
  const categories = Array.from(new Set([
    ...categoryMatches.slice(0, 8).map(m => m.categoryId),
    ...(input.activityPreferences || []),
  ]));
  // Semantic expansions point to categories that actually exist in the local
  // place data; they are broad fallbacks, not venue-specific answers.
  if (/พักใจ|ฮีลใจ|ผ่อนคลาย|ชิล|ชิว|นั่งนิ่ง|เปลี่ยนบรรยากาศ|หัวจะระเบิด|วุ่นวาย|ปล่อยจอย/i.test(text)) {
    categories.push('cafe_hopping', 'nature_park', 'sightseeing');
  }
  if (/ใหม่|ไม่เคย|แปลกใหม่|เบื่อ/i.test(text)) categories.push('creative', 'workshop', 'sightseeing');
  if (/ถ่ายรูป|รูปสวย|วิว/i.test(text)) categories.push('art_exhibition', 'culture', 'nature_park');
  if (/ไม่เอาห้าง|ไม่อยากเข้าห้าง|เบื่อห้าง/i.test(text)) categories.push('nature_park', 'culture', 'creative');
  if (/ไม่เอาห้าง|ไม่อยากเข้าห้าง|เบื่อห้าง/i.test(text)) {
    for (let i = categories.length - 1; i >= 0; i--) {
      if (categories[i] === 'shopping') categories.splice(i, 1);
    }
  }
  
  // Extract vibes
  const vibeTags = Array.from(new Set([
    ...extractMoodVibes(text),
    ...categoryMatches.slice(0, 8).flatMap(m => m.category.vibes),
  ]));
  if (categories.includes('art_exhibition')) vibeTags.push('creative', 'inspiring');
  
  // Detect companion
  const companion = input.companions || detectCompanionPreference(text);
  
  // Budget
  let budgetLevel: 'free' | 'low' | 'moderate' | 'high' = 'moderate';
  const budgetInText = text.match(/(?:งบ|ไม่เกิน|ราคาไม่เกิน|budget)\s*(?:ไม่เกิน\s*)?(\d[\d,]*)/i);
  const parsedBudget = budgetInText ? Number(budgetInText[1].replace(/,/g, '')) : undefined;
  if (input.budgetTHB === 0 || /ฟรี|ไม่เสียเงิน|free/i.test(text)) budgetLevel = 'free';
  else if ((input.budgetTHB ?? parsedBudget) !== undefined && (input.budgetTHB ?? parsedBudget)! <= 300) budgetLevel = 'low';
  else if ((input.budgetTHB ?? parsedBudget) !== undefined && (input.budgetTHB ?? parsedBudget)! > 1500) budgetLevel = 'high';
  
  // Fallback
  if (categories.length === 0) categories.push('creative', 'sightseeing');
  
  const freeTimeContext = input.freeTimeAvailableNow
    ? 'Looking for activities happening right now'
    : 'Matching scheduled free time window';
  const freeTimeContextTh = input.freeTimeAvailableNow
    ? 'ค้นหากิจกรรมที่กำลังจัดอยู่หรือเปิดให้บริการในเวลานี้'
    : 'ค้นหากิจกรรมตามช่วงเวลาที่คุณว่าง';

  return {
    summary: `Seeking ${companion} activities (${categories.join(', ')}) with ${vibeTags.join(', ') || 'recreational'} atmosphere`,
    summaryTh: `${input.intentText} — ค้นหากิจกรรมสำหรับ${companion === 'friends' ? 'ไปกับเพื่อน' : companion === 'couple' ? 'ไปกับแฟน' : companion === 'solo' ? 'ไปคนเดียว' : 'ทั่วไป'} หมวดหมู่: ${categories.join(', ')} บรรยากาศ: ${vibeTags.join(', ')}`,
    categories,
    vibeTags,
    budgetLevel,
    freeTimeContext,
    freeTimeContextTh,
    companions: companion,
  };
}
