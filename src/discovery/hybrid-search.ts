import { IAiService, IntentParseInput, ParsedUserIntent } from '../ai/interface';
import { RuleBasedAiService } from '../ai/rule-based-service';

export async function parseIntentWithFallback(
  input: IntentParseInput,
  aiService: IAiService
): Promise<ParsedUserIntent & { provider: string }> {
  
  // If already rule-based, use directly
  if (aiService.providerName === 'deterministic_rule_engine') {
    const result = await aiService.parseIntent(input);
    return { ...result, provider: 'deterministic_rule_engine' };
  }
  
  // Try AI first
  try {
    const result = await aiService.parseIntent(input);
    
    // Validate result
    if (result.summary && result.categories && Array.isArray(result.categories)) {
      console.log(`[HybridSearch] ${aiService.providerName} succeeded`);
      return { ...result, provider: aiService.providerName };
    }
    
    throw new Error('Invalid AI response structure');
  } catch (error) {
    // Fallback to rule-based
    console.log(`[HybridSearch] AI failed, falling back to rule-based`);
    const fallback = new RuleBasedAiService();
    const result = await fallback.parseIntent(input);
    return { ...result, provider: 'deterministic_rule_engine' };
  }
}
