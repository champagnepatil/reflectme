/**
 * enhancedAICompanionWithMCP.ts
 *
 * This service provides advanced AI-powered mental health support, fully integrated with
 * the Model-Context-Protocol (MCP) via the `mcpService`. It replaces the direct Supabase
 * client calls with MCP-based interactions for all database operations, such as logging
 * mood and journal entries, and storing AI-generated suggestions.
 *
 * Key functionalities include:
 * - Responding to user mood entries with empathetic messages and coping strategies.
 * - Analyzing journal entries to identify themes, patterns, and provide insights.
 * - Logging all interactions and AI suggestions for therapist review and analytics.
 * - Leveraging user's historical data (e.g., recent journal entries) to provide
 *   more personalized and context-aware support.
 *
 * This service demonstrates a clean architecture where the core application logic is
 * decoupled from the specific data access implementation, thanks to the `mcpService` abstraction.
 */

import { mcpService } from './mcpService';
import { GeminiAIService } from './geminiAIService';

// --- Type Definitions ---

export interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CopingSuggestion {
  id: string;
  title: string;
  description: string;
  steps: string[];
  duration: string;
  type: 'breathing' | 'grounding' | 'reframing' | 'activity';
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

// --- Helper Functions ---

/**
 * Simulates a call to a generative AI model to get an empathetic response.
 * @param context - The context for the AI to generate a response.
 * @returns A promise that resolves to the AI's response.
 */
const getAIResponse = async (context: string): Promise<string> => {
    try {
        const response = await GeminiAIService.generaRispostaChat(context);
        return typeof response === 'string' ? response : response.contenuto || JSON.stringify(response);
    } catch (error) {
        if (error?.cause?.code === 'ERROR_OPENAI_RATE_LIMIT_EXCEEDED') {
            return "I'm experiencing a high volume of requests right now. Please try again in a moment. In the meantime, remember to be kind to yourself.";
        }
        console.error("Error getting AI response:", error);
        return "I'm having a little trouble connecting right now. Let's try again in a bit.";
    }
};

/**
 * Simulates a call to a generative AI model to parse structured data (suggestions, insights).
 * @param context - The context for the AI to generate structured data from.
 * @returns A promise that resolves to the parsed JSON object.
 */
const getStructuredAIResponse = async (context: string): Promise<any> => {
  // In a real implementation, this would use a tool-calling or function-calling AI model.
  // For this demo, we use a simple text generation and then parse the JSON.
  const rawResponse = await getAIResponse(context);
  try {
    // A common pattern is for the AI to return a JSON object within a markdown block.
    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(rawResponse); // Fallback for raw JSON
  } catch (error) {
    console.error("Failed to parse structured AI response:", error);
    // Return a default structure on failure
    return { suggestions: [], insights: [] };
  }
};


// --- Core Service Logic ---

export const EnhancedAICompanionWithMCP = {
  /**
   * Handles a mood entry, logs it via MCP, and returns an AI-powered response.
   * @param moodScore - The user's mood score (1-10).
   * @param trigger - An optional trigger for the mood.
   * @param userId - The ID of the user.
   * @returns An object containing the AI message and coping suggestions.
   */
  async handleMoodTrigger(moodScore: number, trigger: string | undefined, userId: string) {
    // 1. Log the mood entry using the MCP service
    const moodEntry = await mcpService.logMoodEntry({
      user_id: userId,
      mood_score: moodScore,
      trigger,
    });

    // 2. Fetch recent journal entries for context
    const recentEntries = await mcpService.getRecentJournalEntries(userId);
    const context_for_ai = `
      A user is feeling a mood of ${moodScore}/10. 
      Their stated trigger is: "${trigger || 'not specified'}".
      Here are some of their recent journal entries for context:
      ${recentEntries.map(e => `- "${e.content}"`).join('\n')}

      Please provide an empathetic and supportive message, followed by a JSON object with a 'suggestions' array.
      Each suggestion should be a practical, actionable coping mechanism.
    `;
    
    // 3. Generate AI response and suggestions
    const ai_response_json = await getStructuredAIResponse(context_for_ai);

    const responseMessage: EnhancedChatMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      content: ai_response_json.empathetic_message || "Thank you for sharing how you feel. I'm here to listen.",
      timestamp: new Date().toISOString(),
    };
    
    const suggestions: CopingSuggestion[] = (ai_response_json.suggestions || []).map((s: any) => ({ ...s, id: `sug-${Date.now()}-${Math.random()}` }));

    // 4. Log the AI suggestions via MCP
    for (const suggestion of suggestions) {
      await mcpService.logAiSuggestion({
        user_id: userId,
        suggestion_type: 'coping',
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        related_mood_entry_id: moodEntry.id,
      });
    }

    return { message: responseMessage, suggestions };
  },

  /**
   * Analyzes a journal entry, logs it, and provides AI-driven insights and suggestions.
   * @param journalContent - The content of the journal entry.
   * @param userId - The ID of the user.
   * @param moodScore - An optional mood score associated with the entry.
   * @returns An object with an AI message, suggestions, and deeper insights.
   */
  async analyzeJournalEntry(journalContent: string, userId: string, moodScore?: number) {
    // 1. Log the journal entry via MCP
    const journalEntry = await mcpService.logJournalEntry({
      user_id: userId,
      content: journalContent,
      mood_score: moodScore,
    });

    // 2. Prepare context and get AI analysis
    const context_for_ai = `
      A user has submitted a journal entry: "${journalContent}".
      Their associated mood is ${moodScore ? `${moodScore}/10` : 'not specified'}.
      
      Please provide:
      1. An empathetic and validating opening message.
      2. A 'suggestions' array of relevant coping strategies.
      3. An 'insights' array of 1-2 observations or patterns (e.g., "It seems like you often feel this way when...").
      The output should be a single JSON object.
    `;

    const ai_response_json = await getStructuredAIResponse(context_for_ai);

    const responseMessage: EnhancedChatMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      content: ai_response_json.empathetic_message || "Thank you for sharing your thoughts. It takes courage to write them down.",
      timestamp: new Date().toISOString(),
    };
    
    const suggestions: CopingSuggestion[] = (ai_response_json.suggestions || []).map((s: any) => ({ ...s, id: `sug-${Date.now()}-${Math.random()}` }));
    const insights: string[] = ai_response_json.insights || [];

    // 3. Log suggestions and insights via MCP
    for (const suggestion of suggestions) {
      await mcpService.logAiSuggestion({
        user_id: userId,
        suggestion_type: 'coping',
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        related_journal_entry_id: journalEntry.id,
      });
    }
    for (const insight of insights) {
        await mcpService.logAiSuggestion({
            user_id: userId,
            suggestion_type: 'insight',
            title: 'AI Insight',
            description: insight,
            priority: 'low',
            related_journal_entry_id: journalEntry.id,
        });
    }

    return { message: responseMessage, suggestions, insights };
  },
}; 