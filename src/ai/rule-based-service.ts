import {
  IAiService,
  IntentParseInput,
  ParsedUserIntent,
  CandidateForExplanation,
} from './interface';
import { RecommendationExplanation } from '../domain/models';
import { parseThaiIntent } from './thai-intent-parser';

export class RuleBasedAiService implements IAiService {
  readonly providerName = 'deterministic_rule_engine';

  async parseIntent(input: IntentParseInput): Promise<ParsedUserIntent> {
    // Use dictionary-based Thai intent parser
    return parseThaiIntent(input);
  }

  async explainRecommendations(
    userQuery: IntentParseInput,
    candidates: CandidateForExplanation[]
  ): Promise<Record<string, RecommendationExplanation>> {
    const explanations: Record<string, RecommendationExplanation> = {};

    for (const cand of candidates) {
      const item = cand.item;
      const isEvent = item.itemType === 'event';
      const reasons: string[] = [];
      const reasonsTh: string[] = [];

      // Category match reason
      if (cand.categoryMatched) {
        const matchingCats = item.categories.join(', ');
        const itemDisplayName = isEvent ? (item.titleTh || item.title) : (item.nameTh || item.name);
        reasons.push(`Matches your interest in ${matchingCats}`);
        reasonsTh.push(`ตรงกับหมวดหมู่ที่คุณสนใจ (${itemDisplayName})`);
      }

      // Distance match reason
      if (cand.distanceKm !== null) {
        reasons.push(`Close to your selected starting area (approx. ${cand.distanceKm} km away)`);
        reasonsTh.push(`อยู่ใกล้จุดเริ่มต้นของคุณเพียงประมาณ ${cand.distanceKm} กม.`);
      }

      // Free time match reason
      if (cand.freeTimeMatched) {
        if (cand.overlapMinutes && cand.overlapMinutes > 0) {
          reasons.push(`Perfect fit with your free time (${cand.overlapMinutes} mins overlap)`);
          reasonsTh.push(`ตรงกับช่วงเวลาว่างของคุณอย่างลงตัว (มีเวลาทำกิจกรรม ${cand.overlapMinutes} นาที)`);
        } else {
          reasons.push(`Operating during your available time window`);
          reasonsTh.push(`เปิดให้บริการและจัดตรงกับช่วงเวลาว่างของคุณ`);
        }
      }

      // Budget match reason
      if (cand.budgetMatched) {
        if (isEvent && item.isFree) {
          reasons.push(`Free admission (fits within any budget)`);
          reasonsTh.push(`ไม่มีค่าใช้จ่าย (เข้าชมฟรี เหมาะกับทุกงบประมาณ)`);
        } else if (isEvent && item.minPrice !== null) {
          reasons.push(`Price is ${item.minPrice} THB (within your budget of ${userQuery.budgetTHB || 'flexible'} THB)`);
          reasonsTh.push(`ราคา ${item.minPrice} บาท (อยู่ในงบประมาณที่คุณกำหนด)`);
        } else if (!isEvent && item.priceTier === 'free') {
          reasons.push(`Free public venue`);
          reasonsTh.push(`สถานที่สาธารณะเข้าชมฟรี`);
        }
      }

      // Companions / Vibe
      if (userQuery.companions && item.tags.includes(userQuery.companions)) {
        reasons.push(`Highly rated for ${userQuery.companions}`);
        reasonsTh.push(`เหมาะสำหรับการไปกับ${userQuery.companions === 'friends' ? 'กลุ่มเพื่อน' : userQuery.companions === 'couple' ? 'แฟน' : 'คนเดียว'}`);
      }

      // Headline
      const title = isEvent ? item.title : item.name;
      const titleTh = isEvent ? (item.titleTh || item.title) : (item.nameTh || item.name);
      let headline = `Recommended: ${title}`;
      let headlineTh = `แนะนำ: ${titleTh}`;

      if (cand.freeTimeMatched && cand.distanceKm !== null && cand.distanceKm < 3) {
        headline = `Nearby & ready during your free time`;
        headlineTh = `อยู่ใกล้และเปิดตรงกับช่วงเวลาว่างของคุณพอดี`;
      } else if (isEvent && item.isFree) {
        headline = `Verified free event matching your vibe`;
        headlineTh = `กิจกรรมฟรีที่ได้รับการยืนยันแล้วและตรงกับบรรยากาศที่คุณต้องการ`;
      }

      explanations[item.id] = {
        headline,
        headlineTh,
        reasons,
        reasonsTh,
        matchHighlights: {
          categoryMatch: cand.categoryMatched,
          dateMatch: cand.dateMatched,
          freeTimeMatch: cand.freeTimeMatched,
          budgetMatch: cand.budgetMatched,
          locationMatch: cand.distanceKm !== null,
          vibeMatch: true,
        },
      };
    }

    return explanations;
  }

  async discoverLiveEvents(): Promise<any[]> {
    // Offline deterministic rule-based engine does not perform live web search
    return [];
  }
}
