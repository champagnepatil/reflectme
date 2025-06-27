import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/react';
import {
  rewriteQuery,
  getSemanticContext,
  getTransactionalContext,
  buildPrompt,
  outputGuard,
  alertTherapist,
  saveChatTurn,
  getSafeResponse,
  type ChatContext
} from '../../../../packages/ai/orchestrator';
import { retrieveNotes } from '../../../../packages/ai/retriever';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Sentry logger for structured logging
const { logger } = Sentry;

export async function POST(req: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/chat",
    },
    async (span) => {
      try {
        const { message, clientId } = await req.json();

        if (!message || !clientId) {
          logger.warn("Chat API called with missing required fields", {
            hasMessage: !!message,
            hasClientId: !!clientId
          });
          
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        span.setAttribute("client_id", clientId);
        span.setAttribute("message_length", message.length);

        logger.info("Processing chat request", {
          clientId,
          messageLength: message.length
        });

    // Step 1: Input Guard - Check user message for safety
    const inputGuardResponse = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/input-guard`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        },
        body: JSON.stringify({ text: message, client_id: clientId }),
      }
    );

    const inputGuardResult = await inputGuardResponse.json();

    if (!inputGuardResult.allowed) {
      // Log the blocked input
      await supabase.from('guardrail_log').insert({
        client_id: clientId,
        direction: 'in',
        reason: inputGuardResult.reason,
        raw: message
      });

      // Return safe response
      return NextResponse.json({
        response: getSafeResponse(inputGuardResult.reason),
        blocked: true,
        reason: inputGuardResult.reason
      });
    }

    // Step 2: Get client context
    const [clientProfile, recentMood, semanticContext, transactionalContext] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single(),
      
      supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      
      getSemanticContext(clientId, message, 3),
      
      getTransactionalContext(clientId)
    ]);

    const context: ChatContext = {
      semantic: semanticContext,
      transactional: transactionalContext,
      clientProfile: clientProfile.data,
      recentMood: recentMood.data
    };

    // Step 3: Rewrite query for better therapeutic response
    const rewrittenQuery = await rewriteQuery(message, clientId, context);

    // Step 4: Build comprehensive prompt
    const prompt = await buildPrompt(rewrittenQuery, clientId, context);

    // Step 5: Generate AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    // Step 6: Output Guard - Check AI response for safety
    const outputGuardResult = await outputGuard(aiResponse, clientId);

    let finalResponse = aiResponse;
    let wasBlocked = false;

    if (!outputGuardResult.allowed) {
      finalResponse = getSafeResponse(outputGuardResult.reason || 'ai_safety_violation');
      wasBlocked = true;
    }

    // Step 7: Check for crisis keywords in user message
    const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end it all', 'self harm'];
    const hasCrisisKeywords = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasCrisisKeywords) {
      await alertTherapist(clientId, 'crisis_keywords_detected', {
        originalMessage: message,
        aiResponse: finalResponse,
        timestamp: new Date().toISOString()
      });
    }

    // Step 8: Save conversation turn to semantic store
    const turnId = uuidv4();
    const conversationContent = `User: ${message}\nAI: ${finalResponse}`;
    
    await saveChatTurn(turnId, clientId, conversationContent);

    // Step 9: Save to transactional chat table (if exists)
    try {
      await supabase.from('chat_messages').insert({
        id: turnId,
        user_id: clientId,
        message: message,
        response: finalResponse,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('Transactional chat table not available, skipping...');
    }

        // Log successful chat completion
        logger.info("Chat request completed successfully", {
          clientId,
          turnId,
          responseLength: finalResponse.length,
          wasBlocked,
          hasCrisisKeywords
        });

        span.setAttribute("success", true);
        span.setAttribute("response_blocked", wasBlocked);
        span.setAttribute("turn_id", turnId);

        return NextResponse.json({
          response: finalResponse,
          blocked: wasBlocked,
          turnId,
          context: {
            semanticContext: semanticContext.length,
            hasRecentMood: !!recentMood.data,
            clientProfile: !!clientProfile.data
          }
        });

      } catch (error) {
        logger.error("Critical error in chat API", {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        // Log error to guardrail
        try {
          const { message, clientId } = await req.json();
          await supabase.from('guardrail_log').insert({
            client_id: clientId,
            direction: 'in',
            reason: 'api_error',
            raw: `Error: ${error}`
          });
        } catch (logError) {
          logger.error("Failed to log error to guardrail", {
            logError: logError instanceof Error ? logError.message : 'Unknown error'
          });
        }

        return NextResponse.json(
          { 
            response: getSafeResponse('system_error'),
            error: 'Internal server error'
          },
          { status: 500 }
        );
      }
    }
  );
}

// Helper function to create match_documents RPC if it doesn't exist
async function ensureMatchDocumentsFunction() {
  try {
    await supabase.rpc('match_documents', {
      query_embedding: new Array(768).fill(0),
      match_threshold: 0.5,
      match_count: 5,
      filter: {}
    });
  } catch (error) {
    // Function doesn't exist, create it
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION match_documents(
        query_embedding vector(768),
        match_threshold float,
        match_count int,
        filter jsonb DEFAULT '{}'
      )
      RETURNS TABLE (
        turn_id uuid,
        content text,
        similarity float,
        ts timestamptz
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          cs.turn_id,
          cs.content,
          1 - (cs.ctx_embedding <=> query_embedding) as similarity,
          cs.ts
        FROM chat_semantic cs
        WHERE 1 - (cs.ctx_embedding <=> query_embedding) > match_threshold
        AND (filter->>'client_id' IS NULL OR cs.client_id = (filter->>'client_id')::uuid)
        ORDER BY cs.ctx_embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `;
    
    await supabase.rpc('exec_sql', { sql: createFunctionSQL });
  }
} 