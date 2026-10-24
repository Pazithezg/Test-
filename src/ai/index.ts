import { IAiService } from './interface';
import { GeminiAiService } from './gemini-service';
import { GroqAiService } from './groq-service';
import { RuleBasedAiService } from './rule-based-service';

let aiServiceInstance: IAiService | null = null;

export function getAiService(): IAiService {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  // Groq is preferred for fast intent parsing and explanations. If Gemini is
  // also configured, it supplies Google Search grounding for live events.
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '') {
    aiServiceInstance = new GroqAiService(groqKey.trim());
    return aiServiceInstance;
  }

  // Fall back to Gemini for both AI and grounded live search.
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    aiServiceInstance = new GeminiAiService(geminiKey.trim());
    return aiServiceInstance;
  }

  // 3. Fall back to deterministic rule engine
  aiServiceInstance = new RuleBasedAiService();
  return aiServiceInstance;
}

export function setAiService(service: IAiService | null): void {
  aiServiceInstance = service;
}
