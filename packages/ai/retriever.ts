import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RetrievedNote {
  id: string;
  content: string;
  similarity: number;
  source: 'chat' | 'journal' | 'assessment' | 'mood';
  timestamp: string;
}

/**
 * Retrieve relevant notes using semantic search
 */
export async function retrieveNotes(
  clientId: string,
  topic: string,
  k: number = 5,
  sources: ('chat' | 'journal' | 'assessment' | 'mood')[] = ['chat', 'journal']
): Promise<RetrievedNote[]> {
  try {
    // Generate embedding for the topic
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const embedding = await model.embedContent(topic);
    const embeddingArray = embedding.embedding;

    const results: RetrievedNote[] = [];

    // Search chat semantic store
    if (sources.includes('chat')) {
      const { data: chatResults } = await supabase.rpc('match_documents', {
        query_embedding: embeddingArray,
        match_threshold: 0.6,
        match_count: Math.ceil(k / 2),
        filter: { client_id: clientId }
      });

      if (chatResults) {
        results.push(...chatResults.map((item: any) => ({
          id: item.turn_id,
          content: item.content,
          similarity: item.similarity,
          source: 'chat' as const,
          timestamp: item.ts
        })));
      }
    }

    // Search journal entries (if they have embeddings)
    if (sources.includes('journal')) {
      const { data: journalResults } = await supabase
        .from('journal_entries')
        .select('id, content, created_at')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(k / 2));

      if (journalResults) {
        // Simple keyword matching for journal entries (could be enhanced with embeddings)
        const relevantJournals = journalResults.filter(entry =>
          entry.content.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(entry.content.toLowerCase().substring(0, 50))
        );

        results.push(...relevantJournals.map(entry => ({
          id: entry.id,
          content: entry.content,
          similarity: 0.5, // Placeholder similarity
          source: 'journal' as const,
          timestamp: entry.created_at
        })));
      }
    }

    // Search assessment data
    if (sources.includes('assessment')) {
      const { data: assessmentResults } = await supabase
        .from('assessments')
        .select('id, responses, created_at')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (assessmentResults) {
        results.push(...assessmentResults.map(assessment => ({
          id: assessment.id,
          content: JSON.stringify(assessment.responses),
          similarity: 0.4,
          source: 'assessment' as const,
          timestamp: assessment.created_at
        })));
      }
    }

    // Search mood entries
    if (sources.includes('mood')) {
      const { data: moodResults } = await supabase
        .from('mood_entries')
        .select('id, mood, intensity, notes, created_at')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (moodResults) {
        results.push(...moodResults.map(mood => ({
          id: mood.id,
          content: `Mood: ${mood.mood}, Intensity: ${mood.intensity}, Notes: ${mood.notes || 'None'}`,
          similarity: 0.3,
          source: 'mood' as const,
          timestamp: mood.created_at
        })));
      }
    }

    // Sort by similarity and return top k results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

  } catch (error) {
    console.error('Error retrieving notes:', error);
    return [];
  }
}

/**
 * Get conversation history for context
 */
export async function getConversationHistory(
  clientId: string,
  limit: number = 10
): Promise<string[]> {
  try {
    const { data: history } = await supabase
      .from('chat_semantic')
      .select('content')
      .eq('client_id', clientId)
      .order('ts', { ascending: false })
      .limit(limit);

    return history?.map(item => item.content) || [];
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

/**
 * Get recent therapeutic themes and patterns
 */
export async function getTherapeuticThemes(
  clientId: string,
  days: number = 30
): Promise<string[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: recentContent } = await supabase
      .from('chat_semantic')
      .select('content')
      .eq('client_id', clientId)
      .gte('ts', cutoffDate.toISOString())
      .order('ts', { ascending: false });

    if (!recentContent || recentContent.length === 0) {
      return [];
    }

    // Combine all content for theme analysis
    const combinedContent = recentContent.map(item => item.content).join(' ');

    // Use AI to extract themes (simplified approach)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
Analyze the following conversation content and extract 3-5 key therapeutic themes or topics that have been discussed:

Content: "${combinedContent.substring(0, 2000)}"

Return only the themes as a comma-separated list, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const themes = response.text().split(',').map(t => t.trim());

    return themes;
  } catch (error) {
    console.error('Error getting therapeutic themes:', error);
    return [];
  }
}

/**
 * Get client progress indicators
 */
export async function getProgressIndicators(
  clientId: string,
  days: number = 30
): Promise<any> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [moodData, assessmentData] = await Promise.all([
      supabase
        .from('mood_entries')
        .select('mood, intensity, created_at')
        .eq('user_id', clientId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true }),
      
      supabase
        .from('assessments')
        .select('responses, created_at')
        .eq('user_id', clientId)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true })
    ]);

    return {
      moodTrend: moodData.data || [],
      assessmentTrend: assessmentData.data || [],
      engagementLevel: moodData.data?.length || 0
    };
  } catch (error) {
    console.error('Error getting progress indicators:', error);
    return { moodTrend: [], assessmentTrend: [], engagementLevel: 0 };
  }
} 