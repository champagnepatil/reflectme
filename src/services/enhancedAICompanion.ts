import { GeminiAIService } from './geminiAIService';
import * as Sentry from "@sentry/react";

// Enhanced AI Companion Types
export interface EnhancedChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    triggerDetected?: string;
    moodDetected?: number;
    copingToolSuggested?: string;
    emotionalContext?: string;
    therapistNotesUsed?: string[];
    journalEntriesReferenced?: string[];
    responseType: 'mood-triggered' | 'journal-informed' | 'therapy-history' | 'proactive-checkin' | 'general';
    confidence: number;
    suggestions?: CopingSuggestion[];
  };
}

export interface CopingSuggestion {
  id: string;
  type: 'breathing' | 'mindfulness' | 'grounding' | 'cognitive' | 'physical' | 'journaling';
  title: string;
  description: string;
  steps: string[];
  duration: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface MoodContext {
  currentMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  recentMoods: Array<{ date: string; mood: number; trigger?: string }>;
  triggerPatterns: string[];
}

export interface JournalContext {
  recentEntries: Array<{
    id: string;
    date: string;
    content: string;
    mood?: number;
    tags: string[];
  }>;
  emotionalThemes: string[];
  progressIndicators: string[];
}

export interface TherapyContext {
  recentSessions: Array<{
    date: string;
    notes: string;
    goals: string[];
    homework: string[];
    techniques: string[];
  }>;
  therapeuticApproaches: string[];
  currentGoals: string[];
  assignedHomework: string[];
}

// MCP Project ID - Update this with your actual project ID
const PROJECT_ID = 'jjflfhcdxgmpustkffqo';

export class EnhancedAICompanion {
  
  /**
   * 1. MOOD-TRIGGERED SUGGESTIONS
   * Analyze current mood and provide immediate support
   */
  static async handleMoodTrigger(
    mood: number, 
    trigger?: string, 
    userId?: string
  ): Promise<{
    message: EnhancedChatMessage;
    suggestions: CopingSuggestion[];
  }> {
    const { logger } = Sentry;
    
    return Sentry.startSpan(
      {
        op: "ai.mood_analysis",
        name: "Handle Mood Trigger",
      },
      async (span) => {
        span.setAttribute("mood_score", mood);
        span.setAttribute("has_trigger", !!trigger);
        span.setAttribute("has_user_id", !!userId);
        
        logger.info("Starting mood trigger analysis", {
          mood,
          trigger,
          userId: userId ? '[REDACTED]' : undefined,
          severity: mood <= 2 ? 'critical' : mood <= 4 ? 'moderate' : 'low'
        });

        try {
          console.log('🎭 Handling mood trigger:', { mood, trigger, userId });

          // Log mood entry via MCP
          if (userId) {
            await this.logMoodEntryMCP(userId, mood, trigger);
          }

          // Get mood context via MCP
          const moodContext = await this.getMoodContextMCP(userId);
          
          // Generate personalized suggestions
          const suggestions = await this.generateMoodBasedSuggestions(mood, trigger, moodContext);
          
          // Create AI response
          const aiResponse = await this.generateMoodTriggeredResponse(mood, trigger, suggestions, moodContext);
          
          const message: EnhancedChatMessage = {
            id: this.generateId(),
            sender: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString(),
            metadata: {
              moodDetected: mood,
              triggerDetected: trigger,
              responseType: 'mood-triggered',
              confidence: 0.9,
              suggestions,
              emotionalContext: mood <= 3 ? 'crisis-support' : mood <= 5 ? 'low-mood-support' : 'general-support'
            }
          };

          // Log AI suggestion via MCP
          if (userId) {
            await this.logAISuggestionMCP(userId, message.id, 'mood-triggered');
          }

          span.setAttribute("suggestion_count", suggestions.length);
          span.setAttribute("response_length", aiResponse.length);
          span.setAttribute("success", true);
          
          logger.info("Successfully handled mood trigger", {
            mood,
            suggestionCount: suggestions.length,
            responseLength: aiResponse.length,
            emotionalContext: message.metadata?.emotionalContext
          });

          return { message, suggestions };
        } catch (error) {
          span.setAttribute("success", false);
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error('Error handling mood trigger', {
            mood,
            trigger,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          Sentry.captureException(error);
          throw new Error('Failed to process mood trigger');
        }
      }
    );
  }

  /**
   * 2. JOURNAL-INFORMED RESPONSES
   * Analyze journal entry and provide tailored feedback
   */
  static async analyzeJournalEntry(
    entryContent: string,
    userId?: string,
    moodScore?: number
  ): Promise<{
    message: EnhancedChatMessage;
    insights: string[];
    suggestions: CopingSuggestion[];
  }> {
    console.log('📝 Analyzing journal entry for user:', userId);

    // Log journal entry via MCP
    if (userId) {
      await this.logJournalEntryMCP(userId, entryContent, moodScore);
    }

    // Get journal context via MCP
    const journalContext = await this.getJournalContextMCP(userId);
    
    // Extract keywords and themes
    const extractedThemes = await this.extractThemesFromJournal(entryContent);
    
    // Generate insights based on patterns
    const insights = await this.generateJournalInsights(entryContent, journalContext, extractedThemes);
    
    // Create targeted suggestions
    const suggestions = await this.generateJournalBasedSuggestions(extractedThemes, journalContext);
    
    // Generate personalized response
    const aiResponse = await this.generateJournalInformedResponse(
      entryContent, 
      insights, 
      suggestions, 
      journalContext
    );

    const message: EnhancedChatMessage = {
      id: this.generateId(),
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: {
        responseType: 'journal-informed',
        confidence: 0.85,
        suggestions,
        journalEntriesReferenced: journalContext.recentEntries.map(e => e.id),
        emotionalContext: extractedThemes.join(', ')
      }
    };

    // Log AI suggestion via MCP
    if (userId) {
      await this.logAISuggestionMCP(userId, message.id, 'journal-informed');
    }

    return { message, insights, suggestions };
  }

  /**
   * 3. THERAPY HISTORY INTEGRATION
   * Leverage therapy history for personalized support
   */
  static async integrateTherapyHistory(
    userMessage: string,
    userId?: string
  ): Promise<{
    message: EnhancedChatMessage;
    relevantTechniques: string[];
    homeworkReminders: string[];
  }> {
    console.log('🧠 Integrating therapy history for user:', userId);

    // Get therapy context via MCP
    const therapyContext = await this.getTherapyContextMCP(userId);
    
    // Identify relevant therapeutic techniques
    const relevantTechniques = await this.identifyRelevantTechniques(userMessage, therapyContext);
    
    // Check for homework opportunities
    const homeworkReminders = await this.generateHomeworkReminders(userMessage, therapyContext);
    
    // Generate therapy-informed response
    const aiResponse = await this.generateTherapyInformedResponse(
      userMessage,
      therapyContext,
      relevantTechniques,
      homeworkReminders
    );

    const message: EnhancedChatMessage = {
      id: this.generateId(),
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: {
        responseType: 'therapy-history',
        confidence: 0.88,
        therapistNotesUsed: therapyContext.recentSessions.map((_, i) => `session_${i}`),
        emotionalContext: relevantTechniques.join(', ')
      }
    };

    // Log AI suggestion via MCP
    if (userId) {
      await this.logAISuggestionMCP(userId, message.id, 'therapy-history');
    }

    return { message, relevantTechniques, homeworkReminders };
  }

  /**
   * 4. PROACTIVE CHECK-INS
   * Generate proactive supportive messages based on patterns
   */
  static async generateProactiveCheckin(
    userId?: string
  ): Promise<{
    message: EnhancedChatMessage;
    checkinType: 'mood-pattern' | 'session-prep' | 'goal-progress' | 'general-support';
    suggestions: CopingSuggestion[];
  }> {
    console.log('🔔 Generating proactive check-in for user:', userId);

    // Analyze user patterns via MCP
    const patterns = await this.analyzeUserPatternsMCP(userId);
    
    // Determine check-in type
    const checkinType = this.determineCheckinType(patterns);
    
    // Generate appropriate suggestions
    const suggestions = await this.generateCheckinSuggestions(checkinType, patterns);
    
    // Create proactive message
    const aiResponse = await this.generateProactiveMessage(checkinType, patterns, suggestions);

    const message: EnhancedChatMessage = {
      id: this.generateId(),
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: {
        responseType: 'proactive-checkin',
        confidence: 0.82,
        suggestions,
        emotionalContext: checkinType
      }
    };

    // Log AI suggestion via MCP
    if (userId) {
      await this.logAISuggestionMCP(userId, message.id, 'proactive-checkin');
    }

    return { message, checkinType, suggestions };
  }

  // ===== MCP DATABASE OPERATIONS =====

  /**
   * Log mood entry using MCP
   */
  private static async logMoodEntryMCP(userId: string, moodScore: number, trigger?: string, notes?: string) {
    try {
      const insertQuery = `
        INSERT INTO public.mood_entries (user_id, mood_score, trigger, notes)
        VALUES ('${userId}', ${moodScore}, ${trigger ? `'${trigger.replace(/'/g, "''")}'` : 'NULL'}, ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'})
        RETURNING id;
      `;
      
      // Use your MCP execute_sql function here
      console.log('Logging mood entry via MCP:', { userId, moodScore, trigger });
      // await mcp_supabase_execute_sql(PROJECT_ID, insertQuery);
    } catch (error) {
      console.error('Error logging mood entry via MCP:', error);
    }
  }

  /**
   * Log journal entry using MCP
   */
  private static async logJournalEntryMCP(userId: string, content: string, moodScore?: number, tags?: string[]) {
    try {
      const tagsArray = tags ? `ARRAY[${tags.map(tag => `'${tag.replace(/'/g, "''")}'`).join(',')}]` : 'NULL';
      const insertQuery = `
        INSERT INTO public.journal_entries (user_id, content, mood_score, tags)
        VALUES ('${userId}', '${content.replace(/'/g, "''")}', ${moodScore || 'NULL'}, ${tagsArray})
        RETURNING id;
      `;
      
      console.log('Logging journal entry via MCP:', { userId, contentLength: content.length });
      // await mcp_supabase_execute_sql(PROJECT_ID, insertQuery);
    } catch (error) {
      console.error('Error logging journal entry via MCP:', error);
    }
  }

  /**
   * Log AI suggestion using MCP
   */
  private static async logAISuggestionMCP(userId: string, suggestionId: string, context: string, accepted?: boolean, feedback?: string) {
    try {
      const insertQuery = `
        INSERT INTO public.ai_suggestions_log (user_id, suggestion_id, context, accepted, feedback)
        VALUES ('${userId}', '${suggestionId}', '${context}', ${accepted || 'NULL'}, ${feedback ? `'${feedback.replace(/'/g, "''")}'` : 'NULL'})
        RETURNING id;
      `;
      
      console.log('Logging AI suggestion via MCP:', { userId, suggestionId, context });
      // await mcp_supabase_execute_sql(PROJECT_ID, insertQuery);
    } catch (error) {
      console.error('Error logging AI suggestion via MCP:', error);
    }
  }

  /**
   * Get mood context using MCP
   */
  private static async getMoodContextMCP(userId?: string): Promise<MoodContext> {
    if (!userId) {
      return this.getDefaultMoodContext();
    }

    try {
      const query = `
        SELECT mood_score, trigger, created_at
        FROM public.mood_entries
        WHERE user_id = '${userId}'
        ORDER BY created_at DESC
        LIMIT 30;
      `;
      
      console.log('Getting mood context via MCP for user:', userId);
      // const result = await mcp_supabase_execute_sql(PROJECT_ID, query);
      
      // For now, return default context
      // TODO: Process MCP result
      return this.getDefaultMoodContext();
    } catch (error) {
      console.error('Error getting mood context via MCP:', error);
      return this.getDefaultMoodContext();
    }
  }

  /**
   * Get journal context using MCP
   */
  private static async getJournalContextMCP(userId?: string): Promise<JournalContext> {
    if (!userId) {
      return this.getDefaultJournalContext();
    }

    try {
      const query = `
        SELECT id, content, mood_score, tags, created_at
        FROM public.journal_entries
        WHERE user_id = '${userId}'
        ORDER BY created_at DESC
        LIMIT 10;
      `;
      
      console.log('Getting journal context via MCP for user:', userId);
      // const result = await mcp_supabase_execute_sql(PROJECT_ID, query);
      
      // For now, return default context
      // TODO: Process MCP result
      return this.getDefaultJournalContext();
    } catch (error) {
      console.error('Error getting journal context via MCP:', error);
      return this.getDefaultJournalContext();
    }
  }

  /**
   * Get therapy context using MCP
   */
  private static async getTherapyContextMCP(userId?: string): Promise<TherapyContext> {
    if (!userId) {
      return this.getDefaultTherapyContext();
    }

    try {
      // Query therapist notes and tasks from existing tables
      const notesQuery = `
        SELECT content, created_at
        FROM public.notes
        WHERE user_id = '${userId}'
        ORDER BY created_at DESC
        LIMIT 5;
      `;
      
      const tasksQuery = `
        SELECT title, description, category, completion_criteria
        FROM public.tasks
        WHERE client_id = '${userId}' AND is_archived = false
        ORDER BY created_at DESC
        LIMIT 10;
      `;
      
      console.log('Getting therapy context via MCP for user:', userId);
      // const notesResult = await mcp_supabase_execute_sql(PROJECT_ID, notesQuery);
      // const tasksResult = await mcp_supabase_execute_sql(PROJECT_ID, tasksQuery);
      
      // For now, return default context
      // TODO: Process MCP results
      return this.getDefaultTherapyContext();
    } catch (error) {
      console.error('Error getting therapy context via MCP:', error);
      return this.getDefaultTherapyContext();
    }
  }

  /**
   * Analyze user patterns using MCP
   */
  private static async analyzeUserPatternsMCP(userId?: string): Promise<any> {
    if (!userId) {
      return {
        recentMoodTrend: 'stable',
        lastJournalEntry: null,
        upcomingSessions: [],
        pendingHomework: []
      };
    }

    try {
      // Get recent mood trends
      const moodQuery = `
        SELECT mood_score, created_at
        FROM public.mood_entries
        WHERE user_id = '${userId}'
        ORDER BY created_at DESC
        LIMIT 7;
      `;
      
      // Get monitoring entries
      const monitoringQuery = `
        SELECT mood_rating, energy_level, stress_level, anxiety_level, entry_date
        FROM public.monitoring_entries
        WHERE client_id = '${userId}'
        ORDER BY entry_date DESC
        LIMIT 7;
      `;
      
      console.log('Analyzing user patterns via MCP for user:', userId);
      // const moodResult = await mcp_supabase_execute_sql(PROJECT_ID, moodQuery);
      // const monitoringResult = await mcp_supabase_execute_sql(PROJECT_ID, monitoringQuery);
      
      // For now, return basic patterns
      // TODO: Process MCP results
      return {
        recentMoodTrend: 'stable',
        lastJournalEntry: null,
        upcomingSessions: [],
        pendingHomework: []
      };
    } catch (error) {
      console.error('Error analyzing user patterns via MCP:', error);
      return {
        recentMoodTrend: 'stable',
        lastJournalEntry: null,
        upcomingSessions: [],
        pendingHomework: []
      };
    }
  }

  // ===== EXISTING HELPER METHODS (UNCHANGED) =====

  private static async generateMoodBasedSuggestions(
    mood: number,
    trigger?: string,
    context?: MoodContext
  ): Promise<CopingSuggestion[]> {
    const suggestions: CopingSuggestion[] = [];

    // Crisis support for very low moods
    if (mood <= 3) {
      suggestions.push({
        id: this.generateId(),
        type: 'breathing',
        title: 'Emergency Breathing Exercise',
        description: 'A quick technique to help stabilize overwhelming emotions',
        steps: [
          'Breathe in slowly for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale slowly for 8 counts',
          'Repeat 4 times'
        ],
        duration: '2-3 minutes',
        priority: 'high',
        reasoning: 'Immediate grounding technique for crisis moments'
      });

      suggestions.push({
        id: this.generateId(),
        type: 'grounding',
        title: '5-4-3-2-1 Grounding',
        description: 'Use your senses to anchor yourself in the present moment',
        steps: [
          'Name 5 things you can see',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        duration: '3-5 minutes',
        priority: 'high',
        reasoning: 'Helps interrupt overwhelming emotional states'
      });
    }

    // Low mood support
    if (mood <= 5) {
      suggestions.push({
        id: this.generateId(),
        type: 'mindfulness',
        title: 'Brief Mindfulness Check-in',
        description: 'A gentle way to acknowledge your feelings without judgment',
        steps: [
          'Take three deep breaths',
          'Notice what you\'re feeling right now',
          'Remind yourself: "This feeling will pass"',
          'Set one small, achievable intention for today'
        ],
        duration: '5 minutes',
        priority: 'medium',
        reasoning: 'Provides emotional validation and forward momentum'
      });
    }

    // Trigger-specific suggestions
    if (trigger) {
      const triggerLower = trigger.toLowerCase();
      
      if (triggerLower.includes('work') || triggerLower.includes('stress')) {
        suggestions.push({
          id: this.generateId(),
          type: 'cognitive',
          title: 'Work Stress Reset',
          description: 'Reframe work challenges with perspective',
          steps: [
            'Write down the specific stressor',
            'Ask: "What can I control about this situation?"',
            'List 2 actions you can take today',
            'Set a boundary: when will you stop thinking about work today?'
          ],
          duration: '10 minutes',
          priority: 'medium',
          reasoning: 'Addresses work-related triggers with practical coping'
        });
      }

      if (triggerLower.includes('relationship') || triggerLower.includes('family')) {
        suggestions.push({
          id: this.generateId(),
          type: 'journaling',
          title: 'Relationship Reflection',
          description: 'Process relationship challenges with clarity',
          steps: [
            'Write about the situation without censoring',
            'Identify your emotions and needs',
            'Consider the other person\'s perspective',
            'Write one thing you\'re grateful for about this relationship'
          ],
          duration: '15 minutes',
          priority: 'medium',
          reasoning: 'Helps process interpersonal difficulties constructively'
        });
      }
    }

    return suggestions;
  }

  private static async generateMoodTriggeredResponse(
    mood: number,
    trigger?: string,
    suggestions: CopingSuggestion[],
    context?: MoodContext
  ): Promise<string> {
    let response = '';

    // Crisis response
    if (mood <= 3) {
      response = `I notice you're going through a really difficult time right now with a mood of ${mood}/10. Your feelings are completely valid, and I want you to know that you're not alone. `;
      
      if (trigger) {
        response += `It sounds like ${trigger} is particularly challenging right now. `;
      }
      
      response += `I'm here to support you with some immediate coping strategies that can help stabilize these overwhelming feelings. `;
      
      if (suggestions.length > 0) {
        response += `I've suggested some grounding techniques that many people find helpful in moments like this. Would you like to try the ${suggestions[0].title} together?`;
      }
    }
    // Low mood response
    else if (mood <= 5) {
      response = `I can see you're having a tough day with a mood of ${mood}/10. `;
      
      if (trigger) {
        response += `${trigger} seems to be affecting you right now. `;
      }
      
      response += `It's okay to have difficult days - they're part of the human experience. I'm here to help you navigate through this. `;
      
      if (suggestions.length > 0) {
        response += `I've prepared some gentle techniques that might help lift your spirits. The ${suggestions[0].title} could be a good starting point. `;
      }
      
      response += `Remember, you've gotten through difficult days before, and you have the strength to get through this one too.`;
    }
    // General support
    else {
      response = `Thanks for sharing your mood of ${mood}/10 with me. `;
      
      if (trigger) {
        response += `I understand that ${trigger} is on your mind. `;
      }
      
      response += `Even when we're doing relatively okay, it's always good to have some tools in our toolkit. `;
      
      if (suggestions.length > 0) {
        response += `I've suggested some techniques that could help you maintain or even improve your current state.`;
      }
    }

    return response;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static calculateMoodTrend(moods: Array<{ mood: number }>): 'improving' | 'declining' | 'stable' {
    if (moods.length < 2) return 'stable';
    
    const recent = moods.slice(0, Math.min(3, moods.length));
    const older = moods.slice(3, Math.min(6, moods.length));
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, m) => sum + m.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.mood, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private static extractTriggerPatterns(moods: Array<{ trigger?: string }>): string[] {
    const triggers = moods
      .map(m => m.trigger)
      .filter(Boolean) as string[];
    
    const triggerCounts = triggers.reduce((acc, trigger) => {
      const normalized = trigger.toLowerCase();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(triggerCounts)
      .filter(([_, count]) => count >= 2)
      .sort(([_a, a], [_b, b]) => b - a)
      .map(([trigger, _]) => trigger)
      .slice(0, 5);
  }

  private static getDefaultMoodContext(): MoodContext {
    return {
      currentMood: 5,
      moodTrend: 'stable',
      recentMoods: [],
      triggerPatterns: []
    };
  }

  private static getDefaultJournalContext(): JournalContext {
    return {
      recentEntries: [],
      emotionalThemes: [],
      progressIndicators: []
    };
  }

  private static getDefaultTherapyContext(): TherapyContext {
    return {
      recentSessions: [],
      therapeuticApproaches: ['CBT', 'Mindfulness'],
      currentGoals: [],
      assignedHomework: []
    };
  }

  private static getFallbackMoodResponse(mood: number, trigger?: string): string {
    if (mood <= 3) {
      return `I'm here for you during this difficult time. Your mood of ${mood}/10 indicates you're struggling, and that's okay. Let's work through this together with some coping strategies.`;
    } else if (mood <= 5) {
      return `I notice you're having a challenging day with a mood of ${mood}/10. ${trigger ? `It sounds like ${trigger} is affecting you. ` : ''}Let me suggest some techniques that might help.`;
    } else {
      return `Thanks for sharing your mood of ${mood}/10. ${trigger ? `I understand ${trigger} is on your mind. ` : ''}Even when things are going well, it's great to have coping tools ready.`;
    }
  }

  private static async extractThemesFromJournal(content: string): Promise<string[]> {
    const themes: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Emotional themes
    const emotionKeywords = {
      'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'overwhelmed'],
      'depression': ['sad', 'hopeless', 'empty', 'worthless', 'numb'],
      'stress': ['stressed', 'pressure', 'deadline', 'burden', 'exhausted'],
      'anger': ['angry', 'frustrated', 'irritated', 'furious', 'mad'],
      'joy': ['happy', 'excited', 'grateful', 'joyful', 'content'],
      'relationships': ['family', 'friend', 'partner', 'relationship', 'social'],
      'work': ['work', 'job', 'career', 'boss', 'colleague', 'deadline'],
      'health': ['sick', 'tired', 'pain', 'sleep', 'energy', 'physical']
    };
    
    for (const [theme, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  private static async generateJournalInsights(
    content: string, 
    context: JournalContext, 
    themes: string[]
  ): Promise<string[]> {
    const insights: string[] = [];
    
    if (themes.includes('anxiety')) {
      insights.push('I notice anxiety themes in your writing. This awareness is an important first step.');
    }
    
    if (themes.includes('progress') || content.toLowerCase().includes('better')) {
      insights.push('You mentioned some positive changes - that shows real growth and resilience.');
    }
    
    if (themes.length > 3) {
      insights.push('You\'re processing several different emotions, which shows emotional complexity and self-awareness.');
    }
    
    return insights;
  }

  private static async generateJournalBasedSuggestions(
    themes: string[], 
    context: JournalContext
  ): Promise<CopingSuggestion[]> {
    const suggestions: CopingSuggestion[] = [];
    
    if (themes.includes('anxiety')) {
      suggestions.push({
        id: this.generateId(),
        type: 'breathing',
        title: 'Anxiety-Relief Breathing',
        description: 'Calm your nervous system with this specialized breathing technique',
        steps: [
          'Place one hand on chest, one on belly',
          'Breathe slowly through your nose',
          'Feel your belly rise more than your chest',
          'Exhale slowly through pursed lips',
          'Continue for 5-10 breaths'
        ],
        duration: '5 minutes',
        priority: 'high',
        reasoning: 'Addresses anxiety themes identified in your journal entry'
      });
    }
    
    if (themes.includes('work')) {
      suggestions.push({
        id: this.generateId(),
        type: 'cognitive',
        title: 'Work-Life Boundary Setting',
        description: 'Create healthy separation between work stress and personal time',
        steps: [
          'Write down your work concerns',
          'Set a specific time to address them tomorrow',
          'Do a 5-minute transition activity (walk, stretch, music)',
          'Remind yourself: "I am more than my work"'
        ],
        duration: '10 minutes',
        priority: 'medium',
        reasoning: 'Helps process work-related stress mentioned in your journal'
      });
    }
    
    return suggestions;
  }

  private static async generateJournalInformedResponse(
    content: string,
    insights: string[],
    suggestions: CopingSuggestion[],
    context: JournalContext
  ): Promise<string> {
    let response = 'Thank you for sharing your thoughts in your journal. I can see you\'re taking time for self-reflection, which is really valuable. ';
    
    if (insights.length > 0) {
      response += insights[0] + ' ';
    }
    
    if (suggestions.length > 0) {
      response += `Based on what you've written, I think the ${suggestions[0].title} technique might be particularly helpful right now. `;
    }
    
    response += 'Journaling is a powerful tool for processing emotions and tracking your growth over time.';
    
    return response;
  }

  private static async identifyRelevantTechniques(
    userMessage: string,
    context: TherapyContext
  ): Promise<string[]> {
    const techniques: string[] = [];
    const messageLower = userMessage.toLowerCase();
    
    // CBT techniques
    if (messageLower.includes('negative') || messageLower.includes('thinking') || messageLower.includes('thought')) {
      techniques.push('Cognitive Restructuring');
      techniques.push('Thought Record');
    }
    
    // Mindfulness techniques
    if (messageLower.includes('overwhelmed') || messageLower.includes('anxious')) {
      techniques.push('Mindfulness Meditation');
      techniques.push('Body Scan');
    }
    
    // Behavioral techniques
    if (messageLower.includes('avoid') || messageLower.includes('stuck')) {
      techniques.push('Behavioral Activation');
      techniques.push('Gradual Exposure');
    }
    
    return techniques;
  }

  private static async generateHomeworkReminders(
    userMessage: string,
    context: TherapyContext
  ): Promise<string[]> {
    const reminders: string[] = [];
    
    if (context.assignedHomework.length > 0) {
      reminders.push('Remember your mood tracking homework from our last session');
      reminders.push('Consider practicing the breathing exercise we discussed');
    }
    
    return reminders;
  }

  private static async generateTherapyInformedResponse(
    userMessage: string,
    context: TherapyContext,
    techniques: string[],
    homework: string[]
  ): Promise<string> {
    let response = 'I hear what you\'re going through. ';
    
    if (techniques.length > 0) {
      response += `This reminds me of the ${techniques[0]} technique we've worked on before. `;
    }
    
    if (homework.length > 0) {
      response += `This might be a good opportunity to practice ${homework[0]}. `;
    }
    
    response += 'Remember, you have tools and strengths that have helped you through challenges before.';
    
    return response;
  }

  private static determineCheckinType(
    patterns: any
  ): 'mood-pattern' | 'session-prep' | 'goal-progress' | 'general-support' {
    if (patterns.recentMoodTrend === 'declining') {
      return 'mood-pattern';
    }
    
    if (patterns.upcomingSessions?.length > 0) {
      return 'session-prep';
    }
    
    if (patterns.pendingHomework?.length > 0) {
      return 'goal-progress';
    }
    
    return 'general-support';
  }

  private static async generateCheckinSuggestions(
    checkinType: string,
    patterns: any
  ): Promise<CopingSuggestion[]> {
    const suggestions: CopingSuggestion[] = [];
    
    switch (checkinType) {
      case 'mood-pattern':
        suggestions.push({
          id: this.generateId(),
          type: 'mindfulness',
          title: 'Mood Check-in Meditation',
          description: 'A gentle way to acknowledge and process your recent mood patterns',
          steps: [
            'Take a comfortable seated position',
            'Notice how you\'re feeling right now',
            'Breathe with whatever emotions arise',
            'Remind yourself that all feelings are temporary'
          ],
          duration: '10 minutes',
          priority: 'medium',
          reasoning: 'Addresses recent declining mood pattern'
        });
        break;
        
      case 'session-prep':
        suggestions.push({
          id: this.generateId(),
          type: 'journaling',
          title: 'Session Preparation',
          description: 'Reflect on what you want to discuss in your upcoming session',
          steps: [
            'Write about your week\'s highlights and challenges',
            'Note any patterns or insights you\'ve noticed',
            'List 2-3 topics you want to explore with your therapist',
            'Write one question you want to ask'
          ],
          duration: '15 minutes',
          priority: 'medium',
          reasoning: 'Helps maximize the value of upcoming therapy session'
        });
        break;
    }
    
    return suggestions;
  }

  private static async generateProactiveMessage(
    checkinType: string,
    patterns: any,
    suggestions: CopingSuggestion[]
  ): Promise<string> {
    let message = 'Hi there! I wanted to check in with you. ';
    
    switch (checkinType) {
      case 'mood-pattern':
        message += 'I\'ve noticed your mood has been a bit lower lately. I\'m here to support you. ';
        break;
      case 'session-prep':
        message += 'You have a therapy session coming up soon. Would you like to prepare together? ';
        break;
      case 'goal-progress':
        message += 'How are you feeling about the goals we\'ve been working on? ';
        break;
      default:
        message += 'Just wanted to say that I\'m here if you need support today. ';
    }
    
    if (suggestions.length > 0) {
      message += `I have a suggestion that might be helpful: ${suggestions[0].title}. `;
    }
    
    message += 'How are you doing today?';
    
    return message;
  }

  private static extractTherapeuticApproaches(sessions: any[]): string[] {
    // Default approaches if no session data
    return ['CBT', 'Mindfulness-Based', 'Solution-Focused'];
  }

  private static extractCurrentGoals(sessions: any[]): string[] {
    // Extract goals from session notes
    return ['Improve mood regulation', 'Develop coping strategies', 'Enhance self-awareness'];
  }

  private static extractAssignedHomework(sessions: any[]): string[] {
    // Extract homework from session notes
    return ['Daily mood tracking', 'Breathing exercises', 'Thought records'];
  }
}

// Helper functions for external use
export async function logMoodEntry(userId: string, mood_score: number, trigger?: string, notes?: string) {
  return EnhancedAICompanion['logMoodEntryMCP'](userId, mood_score, trigger, notes);
}

export async function logJournalEntry(userId: string, content: string, mood_score?: number, tags?: string[]) {
  return EnhancedAICompanion['logJournalEntryMCP'](userId, content, mood_score, tags);
}

export async function logAISuggestion(userId: string, suggestion_id: string, context: string, accepted?: boolean, feedback?: string) {
  return EnhancedAICompanion['logAISuggestionMCP'](userId, suggestion_id, context, accepted, feedback);
} 