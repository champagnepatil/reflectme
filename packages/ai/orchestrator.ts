import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Sentry from '@sentry/react';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Sentry logger for structured logging
const { logger } = Sentry;

export interface ChatContext {
  semantic: string[];
  transactional: any[];
  clientProfile: any;
  recentMood: any;
}

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  severity?: string;
}

/**
 * Rewrite user query to be more therapeutic and context-aware
 */
export async function rewriteQuery(
  originalQuery: string, 
  clientId: string,
  context: ChatContext
): Promise<string> {
  return Sentry.startSpan(
    {
      op: "ai.query_rewrite",
      name: "Therapeutic Query Rewriting",
    },
    async (span) => {
      try {
        span.setAttribute("client_id", clientId);
        span.setAttribute("original_query_length", originalQuery.length);
        span.setAttribute("recent_mood", context.recentMood?.mood || 'unknown');
        span.setAttribute("semantic_context_count", context.semantic.length);

        logger.info("Starting therapeutic query rewrite", {
          clientId,
          originalQueryLength: originalQuery.length,
          semanticContextCount: context.semantic.length
        });

        const prompt = `
You are a therapeutic AI assistant. Rewrite the following user query to be more helpful and context-aware, while maintaining the user's intent:

Original query: "${originalQuery}"

Client context:
- Recent mood: ${context.recentMood?.mood || 'Unknown'}
- Recent topics: ${context.semantic.slice(0, 3).join(', ') || 'None'}

Rewrite the query to be more therapeutic, empathetic, and contextually relevant. Focus on:
1. Acknowledging their current state
2. Building on previous conversations
3. Encouraging deeper reflection
4. Maintaining therapeutic boundaries

Rewritten query:`;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rewrittenQuery = response.text().trim();

        span.setAttribute("rewritten_query_length", rewrittenQuery.length);
        logger.debug(logger.fmt`Query rewrite completed for client: ${clientId}`, {
          originalLength: originalQuery.length,
          rewrittenLength: rewrittenQuery.length
        });

        return rewrittenQuery;
      } catch (error) {
        logger.error("Failed to rewrite therapeutic query", {
          clientId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        Sentry.captureException(error);
        // Return original query as fallback
        return originalQuery;
      }
    }
  );
}

/**
 * Get semantic context from vector store
 */
export async function getSemanticContext(
  clientId: string, 
  topic: string, 
  k: number = 5
): Promise<string[]> {
  // Generate embedding for the topic
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  const embedding = await model.embedContent(topic);
  const embeddingArray = embedding.embedding;

  // Query similar content from chat_semantic
  const { data: similarContent } = await supabase.rpc('match_documents', {
    query_embedding: embeddingArray,
    match_threshold: 0.7,
    match_count: k,
    filter: { client_id: clientId }
  });

  return similarContent?.map((item: any) => item.content) || [];
}

/**
 * Get transactional context (recent assessments, mood entries, etc.)
 */
export async function getTransactionalContext(clientId: string): Promise<any[]> {
  const [moodData, assessmentData, journalData] = await Promise.all([
    supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(3),
    
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  return [
    ...(moodData.data || []),
    ...(assessmentData.data || []),
    ...(journalData.data || [])
  ];
}

/**
 * Build comprehensive prompt with context
 */
export async function buildPrompt(
  userQuery: string,
  clientId: string,
  context: ChatContext
): Promise<string> {
  const clientProfile = context.clientProfile;
  const recentMood = context.recentMood;
  
  return `
You are Zentia, an AI mental health companion designed to provide empathetic, evidence-based support while maintaining appropriate therapeutic boundaries.

CLIENT CONTEXT:
- Name: ${clientProfile?.full_name || 'Client'}
- Age: ${clientProfile?.age || 'Unknown'}
- Primary concerns: ${clientProfile?.primary_concerns || 'Not specified'}
- Recent mood: ${recentMood?.mood || 'Unknown'} (${recentMood?.intensity || 'Unknown'} intensity)
- Recent topics discussed: ${context.semantic.slice(0, 3).join(', ') || 'None'}

THERAPEUTIC GUIDELINES:
1. Always respond with empathy and validation
2. Use evidence-based therapeutic techniques (CBT, DBT, ACT)
3. Maintain professional boundaries - you are a support tool, not a replacement for therapy
4. Encourage professional help when appropriate
5. Never give medical advice or diagnose
6. Focus on coping strategies and skill-building
7. Acknowledge progress and strengths

SAFETY PROTOCOLS:
- If client expresses crisis thoughts, provide immediate support and encourage professional help
- Use crisis resources when appropriate
- Maintain calm, supportive tone even in difficult situations

RECENT CONTEXT:
${context.semantic.slice(0, 2).map((item, i) => `- Previous conversation ${i + 1}: ${item}`).join('\n')}

USER QUERY: "${userQuery}"

Please respond in a warm, supportive manner that builds on our previous conversations and acknowledges their current state.`;
}

/**
 * Guard AI output for safety and appropriateness
 */
export async function outputGuard(
  aiResponse: string,
  clientId: string
): Promise<GuardrailResult> {
  return Sentry.startSpan(
    {
      op: "ai.safety.output_guard",
      name: "AI Response Safety Validation",
    },
    async (span) => {
      try {
        span.setAttribute("client_id", clientId);
        span.setAttribute("response_length", aiResponse.length);

        logger.info("Starting AI response safety validation", {
          clientId,
          responseLength: aiResponse.length
        });

        // Check for crisis keywords in AI response
        const { data: crisisKeywords, error: keywordError } = await supabase
          .from('crisis_keywords')
          .select('keyword, severity')
          .eq('is_active', true);

        if (keywordError) {
          logger.error("Failed to fetch crisis keywords", {
            clientId,
            error: keywordError.message
          });
          Sentry.captureException(keywordError);
        }

        const lowerResponse = aiResponse.toLowerCase();
        const crisisMatch = crisisKeywords?.find(kw => 
          lowerResponse.includes(kw.keyword.toLowerCase())
        );

        if (crisisMatch) {
          span.setAttribute("safety_violation", "crisis_keyword");
          span.setAttribute("violation_severity", crisisMatch.severity);

          logger.warn("Crisis keyword detected in AI response", {
            clientId,
            keyword: crisisMatch.keyword,
            severity: crisisMatch.severity
          });

          await supabase.from('guardrail_log').insert({
            client_id: clientId,
            direction: 'out',
            reason: `ai_crisis_keyword_${crisisMatch.severity}`,
            raw: aiResponse
          });

          return {
            allowed: false,
            reason: 'crisis_keyword_in_response',
            severity: crisisMatch.severity
          };
        }

        // Gemini safety moderation for AI response
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const moderationPrompt = `
Analyze the following AI response for mental health safety concerns. 
Respond with "SAFE" if the content is appropriate for mental health therapy, or "UNSAFE" if it contains:
- Harmful medical advice
- Encouragement of dangerous behaviors
- Inappropriate therapeutic boundaries
- Crisis escalation content
- Non-therapeutic content

AI Response to analyze: "${aiResponse}"

Analysis:`;

        const moderationResult = await model.generateContent(moderationPrompt);
        const moderationResponse = await moderationResult.response;
        const moderationText = moderationResponse.text().trim().toLowerCase();
        
        const isUnsafe = moderationText.includes('unsafe') || 
                        moderationText.includes('flagged') || 
                        moderationText.includes('inappropriate');
        
        span.setAttribute("gemini_moderation_checked", true);
        span.setAttribute("gemini_flagged", isUnsafe);

        if (isUnsafe) {
          span.setAttribute("safety_violation", "gemini_moderation");

          logger.warn("Gemini moderation flagged AI response", {
            clientId,
            moderationResult: moderationText,
            originalResponse: aiResponse.substring(0, 200) + '...'
          });

          await supabase.from('guardrail_log').insert({
            client_id: clientId,
            direction: 'out',
            reason: 'ai_gemini_flag',
            raw: aiResponse
          });

          return {
            allowed: false,
            reason: 'ai_safety_violation'
          };
        }

        logger.debug(logger.fmt`AI response passed safety validation for client: ${clientId}`);
        span.setAttribute("safety_result", "passed");

        return { allowed: true };
      } catch (error) {
        logger.error("Critical error in AI output guard", {
          clientId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        Sentry.captureException(error);
        
        // Fail safe - block response if safety check fails
        return {
          allowed: false,
          reason: 'safety_check_failed'
        };
      }
    }
  );
}

/**
 * Alert therapist about crisis or concerning content
 */
export async function alertTherapist(
  clientId: string,
  reason: string,
  details: any
): Promise<void> {
  return Sentry.startSpan(
    {
      op: "ai.safety.alert_therapist",
      name: "Crisis Alert Generation",
    },
    async (span) => {
      try {
        span.setAttribute("client_id", clientId);
        span.setAttribute("alert_reason", reason);
        span.setAttribute("alert_severity", details?.severity || 'unknown');

        logger.warn("CRITICAL: Generating therapist alert", {
          clientId,
          reason,
          severity: details?.severity,
          keyword: details?.keyword
        });

        const { error } = await supabase.from('alerts').insert({
          client_id: clientId,
          reason,
          details,
          is_resolved: false
        });

        if (error) {
          logger.error("Failed to insert therapist alert", {
            clientId,
            reason,
            error: error.message
          });
          Sentry.captureException(error);
          throw error;
        }

        // Log successful alert creation
        logger.info("Therapist alert created successfully", {
          clientId,
          reason,
          alertId: 'generated' // Could capture actual ID if returned
        });

        // Could also send email/SMS notification here
        console.log(`ALERT: ${reason} for client ${clientId}`, details);

        // Track alert as a custom metric
        span.setAttribute("alert_created", true);

      } catch (error) {
        logger.fatal("CRITICAL: Failed to create therapist alert", {
          clientId,
          reason,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        Sentry.captureException(error);
        throw error; // Re-throw to ensure calling code knows alert failed
      }
    }
  );
}

/**
 * Save chat turn to semantic store with embedding
 */
export async function saveChatTurn(
  turnId: string,
  clientId: string,
  content: string
): Promise<void> {
  try {
    // Generate embedding
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const embedding = await model.embedContent(content);
    const embeddingArray = embedding.embedding;

    // Save to chat_semantic
    await supabase.from('chat_semantic').insert({
      turn_id: turnId,
      client_id: clientId,
      ctx_embedding: embeddingArray,
      content
    });
  } catch (error) {
    console.error('Error saving chat turn:', error);
  }
}

/**
 * Get safe response for blocked content
 */
export function getSafeResponse(reason: string): string {
  const safeResponses = {
    'crisis_detected': `I hear that you're going through a really difficult time, and I want you to know that your feelings are valid. It's important to talk to someone who can provide professional support right now. Please consider reaching out to a mental health professional, calling a crisis hotline, or talking to someone you trust. You don't have to go through this alone.`,
    'safety_violation': `I understand you're trying to communicate something important, but I want to make sure our conversation remains helpful and safe. Could you rephrase that in a different way? I'm here to support you.`,
    'system_error': `I'm having some technical difficulties right now. Please try again in a moment, or if you need immediate support, consider reaching out to a mental health professional.`
  };

  return safeResponses[reason as keyof typeof safeResponses] || 
    `I want to make sure I can provide you with the best support possible. Could you rephrase that? I'm here to help.`;
} 