import { IAiService } from './interface';
import { GeminiAiService } from './gemini-service';
import { GroqAiService } from './groq-service';
import { RuleBasedAiService } from './rule-based-service';

let aiServiceInstance: IAiService | null = null;

export function getAiService(): IAiService {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  // Keep the core product local-first. External AI is opt-in only.
  if (process.env.USE_EXTERNAL_AI !== 'true') {
    aiServiceInstance = new RuleBasedAiService();
    return aiServiceInstance;
  }

  // Groq is preferred when external AI is explicitly enabled.
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
