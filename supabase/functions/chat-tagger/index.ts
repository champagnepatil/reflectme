// =============================================================================
// Chat Tagger Edge Function
// =============================================================================
// Triggered on new chat messages to extract tags using Gemini AI

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  id: string;
  client_id: string;
  content: string;
  sender: 'user' | 'assistant';
  created_at: string;
}

interface ExtractedTag {
  tag: string;
  score: number;
  category: 'emotion' | 'topic' | 'symptom' | 'coping-strategy' | 'trigger';
  confidence: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    console.log('🤖 Chat Tagger triggered')

    // Parse the request
    const { record } = await req.json()
    const message: ChatMessage = record

    console.log(`📝 Processing message: ${message.id} from ${message.client_id}`)

    // Only process user messages (not assistant responses)
    if (message.sender !== 'user') {
      console.log('⏭️ Skipping assistant message')
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let extractedTags: ExtractedTag[] = []

    // Try Gemini AI extraction first
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      console.log('🧠 Using Gemini AI for tag extraction')
      try {
        extractedTags = await extractTagsWithGemini(message.content, geminiApiKey)
      } catch (error) {
        console.error('❌ Gemini extraction failed:', error)
        extractedTags = extractTagsWithRules(message.content)
      }
    } else {
      console.log('📋 Using rule-based tag extraction')
      extractedTags = extractTagsWithRules(message.content)
    }

    console.log(`🏷️ Extracted ${extractedTags.length} tags:`, extractedTags.map(t => t.tag))

    // Insert tags into database
    const insertPromises = extractedTags.map(tag => 
      supabase
        .from('chat_tags')
        .insert({
          turn_id: message.id,
          client_id: message.client_id,
          tag: tag.tag,
          score: tag.score,
          tag_category: tag.category,
          confidence: tag.confidence,
          extracted_by: geminiApiKey ? 'gemini-ai' : 'rule-based'
        })
    )

    await Promise.all(insertPromises)

    console.log('✅ Tags inserted successfully')

    return new Response(
      JSON.stringify({ 
        inserted: extractedTags.length,
        tags: extractedTags.map(t => t.tag)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('💥 Error in chat-tagger:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/**
 * Extract tags using Gemini AI
 */
async function extractTagsWithGemini(content: string, apiKey: string): Promise<ExtractedTag[]> {
  const prompt = `
Analizza questo messaggio e estrai i tag più rilevanti per il supporto terapeutico.

MESSAGGIO: "${content}"

Estrai fino a 5 tag per emozioni, argomenti, sintomi, strategie di coping o trigger.

Rispondi SOLO con JSON valido:
{
  "tags": [
    {
      "tag": "ansia",
      "score": 0.8,
      "category": "emotion",
      "confidence": 0.9
    }
  ]
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('No response from Gemini')
  }

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No valid JSON in Gemini response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.tags || []
}

/**
 * Fallback rule-based tag extraction
 */
function extractTagsWithRules(content: string): ExtractedTag[] {
  const contentLower = content.toLowerCase()
  const tags: ExtractedTag[] = []

  // Emotion detection
  const emotions = [
    { keywords: ['ansioso', 'ansia', 'preoccupato'], tag: 'ansia', score: 0.8 },
    { keywords: ['triste', 'depresso', 'giù'], tag: 'tristezza', score: 0.7 },
    { keywords: ['arrabbiato', 'furioso'], tag: 'rabbia', score: 0.8 },
    { keywords: ['stressato', 'stress'], tag: 'stress', score: 0.7 }
  ]

  // Topic detection  
  const topics = [
    { keywords: ['lavoro', 'ufficio'], tag: 'lavoro', score: 0.7 },
    { keywords: ['famiglia', 'genitori'], tag: 'famiglia', score: 0.7 },
    { keywords: ['relazione', 'partner'], tag: 'relazioni', score: 0.8 }
  ]

  // Check emotions
  emotions.forEach(({ keywords, tag, score }) => {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      tags.push({
        tag,
        score,
        category: 'emotion',
        confidence: 0.8
      })
    }
  })

  // Check topics
  topics.forEach(({ keywords, tag, score }) => {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      tags.push({
        tag,
        score,
        category: 'topic', 
        confidence: 0.7
      })
    }
  })

  // Remove duplicates and limit to top 5
  const uniqueTags = tags.filter((tag, index, self) => 
    index === self.findIndex(t => t.tag === tag.tag)
  )

  return uniqueTags
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
} 