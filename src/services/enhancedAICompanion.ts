import { supabase } from '../lib/supabase';
import { GeminiAIService } from './geminiAIService';

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
    console.log('🎭 Handling mood trigger:', { mood, trigger, userId });

    // Get mood context
    const moodContext = await this.getMoodContext(userId);
    
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

    return { message, suggestions };
  }

  /**
   * 2. JOURNAL-INFORMED RESPONSES
   * Analyze journal entry and provide tailored feedback
   */
  static async analyzeJournalEntry(
    entryContent: string,
    userId?: string
  ): Promise<{
    message: EnhancedChatMessage;
    insights: string[];
    suggestions: CopingSuggestion[];
  }> {
    console.log('📝 Analyzing journal entry for user:', userId);

    // Get journal context
    const journalContext = await this.getJournalContext(userId);
    
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

    // Get therapy context
    const therapyContext = await this.getTherapyContext(userId);
    
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

    return { message, relevantTechniques, homeworkReminders };
  }

  /**
   * 4. PROACTIVE CHECK-INS
   * Initiate supportive conversations based on patterns
   */
  static async generateProactiveCheckin(
    userId?: string
  ): Promise<{
    message: EnhancedChatMessage;
    checkinType: 'mood-pattern' | 'session-prep' | 'goal-progress' | 'general-support';
    suggestions: CopingSuggestion[];
  }> {
    console.log('🤝 Generating proactive check-in for user:', userId);

    // Analyze user patterns
    const patterns = await this.analyzeUserPatterns(userId);
    
    // Determine check-in type
    const checkinType = this.determineCheckinType(patterns);
    
    // Generate contextual suggestions
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
        confidence: 0.75,
        suggestions,
        emotionalContext: checkinType
      }
    };

    return { message, checkinType, suggestions };
  }

  // === HELPER METHODS ===

  private static async getMoodContext(userId?: string): Promise<MoodContext> {
    if (!userId) return this.getDefaultMoodContext();

    try {
      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      const recentMoods = (moodEntries || []).map(entry => ({
        date: entry.created_at,
        mood: entry.mood_score,
        trigger: entry.trigger
      }));

      const currentMood = recentMoods[0]?.mood || 5;
      const moodTrend = this.calculateMoodTrend(recentMoods);
      const triggerPatterns = this.extractTriggerPatterns(recentMoods);

      return {
        currentMood,
        moodTrend,
        recentMoods,
        triggerPatterns
      };
    } catch (error) {
      console.error('Error fetching mood context:', error);
      return this.getDefaultMoodContext();
    }
  }

  private static async getJournalContext(userId?: string): Promise<JournalContext> {
    if (!userId) return this.getDefaultJournalContext();

    try {
      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const recentEntries = (journalEntries || []).map(entry => ({
        id: entry.id,
        date: entry.created_at,
        content: entry.content,
        mood: entry.mood_score,
        tags: entry.tags || []
      }));

      const emotionalThemes = this.extractEmotionalThemes(recentEntries);
      const progressIndicators = this.identifyProgressIndicators(recentEntries);

      return {
        recentEntries,
        emotionalThemes,
        progressIndicators
      };
    } catch (error) {
      console.error('Error fetching journal context:', error);
      return this.getDefaultJournalContext();
    }
  }

  private static async getTherapyContext(userId?: string): Promise<TherapyContext> {
    if (!userId) return this.getDefaultTherapyContext();

    try {
      const { data: sessions } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('client_id', userId)
        .order('session_date', { ascending: false })
        .limit(5);

      const recentSessions = (sessions || []).map(session => ({
        date: session.session_date,
        notes: session.notes || '',
        goals: session.goals || [],
        homework: session.homework || [],
        techniques: session.techniques_used || []
      }));

      const therapeuticApproaches = this.extractTherapeuticApproaches(recentSessions);
      const currentGoals = this.extractCurrentGoals(recentSessions);
      const assignedHomework = this.extractAssignedHomework(recentSessions);

      return {
        recentSessions,
        therapeuticApproaches,
        currentGoals,
        assignedHomework
      };
    } catch (error) {
      console.error('Error fetching therapy context:', error);
      return this.getDefaultTherapyContext();
    }
  }

  private static async generateMoodBasedSuggestions(
    mood: number,
    trigger?: string,
    context?: MoodContext
  ): Promise<CopingSuggestion[]> {
    const suggestions: CopingSuggestion[] = [];

    if (mood <= 3) {
      // Crisis support suggestions
      suggestions.push({
        id: 'crisis-breathing',
        type: 'breathing',
        title: 'Emergency Calm Breathing',
        description: 'Immediate relief technique for intense distress',
        steps: [
          'Find a safe, quiet space',
          'Breathe in for 4 counts',
          'Hold for 4 counts',
          'Breathe out for 6 counts',
          'Repeat 10 times'
        ],
        duration: '3-5 minutes',
        priority: 'high',
        reasoning: 'Your mood indicates high distress. This breathing technique can provide immediate relief.'
      });

      suggestions.push({
        id: 'crisis-grounding',
        type: 'grounding',
        title: '5-4-3-2-1 Grounding',
        description: 'Sensory grounding technique for overwhelming emotions',
        steps: [
          'Name 5 things you can see',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        duration: '5-10 minutes',
        priority: 'high',
        reasoning: 'Grounding techniques help when feeling overwhelmed or disconnected.'
      });
    } else if (mood <= 5) {
      // Low mood support
      suggestions.push({
        id: 'low-mood-mindfulness',
        type: 'mindfulness',
        title: 'Gentle Self-Compassion',
        description: 'Kind, nurturing practice for difficult emotions',
        steps: [
          'Place hand on heart',
          'Acknowledge: "This is a moment of suffering"',
          'Remember: "Suffering is part of the human experience"',
          'Offer yourself kindness: "May I be kind to myself in this moment"'
        ],
        duration: '5-10 minutes',
        priority: 'high',
        reasoning: 'Self-compassion practices help during low mood periods.'
      });
    }

    // Add trigger-specific suggestions
    if (trigger) {
      const triggerSuggestions = await this.generateTriggerSpecificSuggestions(trigger);
      suggestions.push(...triggerSuggestions);
    }

    return suggestions;
  }

  private static async generateMoodTriggeredResponse(
    mood: number,
    trigger?: string,
    suggestions: CopingSuggestion[],
    context?: MoodContext
  ): Promise<string> {
    const prompt = `
    As an empathetic AI companion, respond to a user who has logged a mood of ${mood}/10.
    ${trigger ? `They mentioned their trigger was: "${trigger}"` : ''}
    
    Mood context:
    - Recent mood trend: ${context?.moodTrend || 'unknown'}
    - Common triggers: ${context?.triggerPatterns.join(', ') || 'none identified'}
    
    Available coping suggestions: ${suggestions.map(s => s.title).join(', ')}
    
    Provide a warm, empathetic response that:
    1. Validates their experience
    2. Offers immediate support
    3. Suggests specific coping strategies
    4. Encourages hope without minimizing their feelings
    
    Keep response concise but caring (2-3 paragraphs max).
    `;

    try {
      const response = await GeminiAIService.generaRispostaChat(prompt);
      return response.contenuto;
    } catch (error) {
      console.error('Error generating mood response:', error);
      return this.getFallbackMoodResponse(mood, trigger);
    }
  }

  // Additional helper methods...
  
  private static generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateMoodTrend(moods: Array<{ mood: number }>): 'improving' | 'declining' | 'stable' {
    if (moods.length < 3) return 'stable';
    
    const recent = moods.slice(0, 3).map(m => m.mood);
    const older = moods.slice(3, 6).map(m => m.mood);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private static extractTriggerPatterns(moods: Array<{ trigger?: string }>): string[] {
    const triggers = moods
      .map(m => m.trigger)
      .filter(Boolean) as string[];
    
    const triggerCounts: Record<string, number> = {};
    triggers.forEach(trigger => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
    
    return Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger]) => trigger);
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
      therapeuticApproaches: ['CBT', 'mindfulness'],
      currentGoals: ['manage anxiety', 'improve sleep'],
      assignedHomework: ['daily mood tracking', 'breathing exercises']
    };
  }

  private static getFallbackMoodResponse(mood: number, trigger?: string): string {
    if (mood <= 3) {
      return `I can see you're going through a really difficult time right now. Your feelings are completely valid, and I want you to know that you're not alone. Let's focus on some immediate techniques that can help you feel more grounded and safe. Would you like to try a breathing exercise together?`;
    } else if (mood <= 5) {
      return `Thank you for sharing how you're feeling with me. It takes courage to acknowledge when we're struggling. These difficult moments are temporary, even when they feel overwhelming. I have some gentle techniques that might help you feel a bit better. Would you like to explore some options together?`;
    } else {
      return `I appreciate you checking in with me about how you're feeling. It sounds like you're managing things reasonably well today. Is there anything specific you'd like to talk about or work on together?`;
    }
  }

  // Placeholder methods for full implementation
  private static async extractThemesFromJournal(content: string): Promise<string[]> {
    // Simple keyword extraction for now
    const anxietyKeywords = ['anxious', 'worried', 'nervous', 'stress', 'panic'];
    const depressionKeywords = ['sad', 'down', 'depressed', 'hopeless', 'empty'];
    const workKeywords = ['work', 'job', 'boss', 'deadline', 'meeting'];
    
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (anxietyKeywords.some(keyword => lowerContent.includes(keyword))) {
      themes.push('anxiety');
    }
    if (depressionKeywords.some(keyword => lowerContent.includes(keyword))) {
      themes.push('depression');
    }
    if (workKeywords.some(keyword => lowerContent.includes(keyword))) {
      themes.push('work-stress');
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
      insights.push('I notice you mentioned feeling anxious. This is a common experience, and there are effective ways to manage these feelings.');
    }
    
    if (themes.includes('work-stress')) {
      insights.push('Work-related stress seems to be a recurring theme. Consider exploring work-life balance strategies.');
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
        id: 'anxiety-grounding',
        type: 'grounding',
        title: '5-4-3-2-1 Grounding Technique',
        description: 'A sensory technique to manage anxiety',
        steps: [
          'Name 5 things you can see',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        duration: '5-10 minutes',
        priority: 'high',
        reasoning: 'This grounding technique helps when feeling anxious or overwhelmed.'
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
    return `Thank you for sharing your thoughts with me. I've noticed some patterns that might be helpful to explore together. ${insights.join(' ')} Would you like me to suggest some techniques that might help with what you're experiencing?`;
  }

  private static async identifyRelevantTechniques(
    userMessage: string,
    context: TherapyContext
  ): Promise<string[]> {
    const message = userMessage.toLowerCase();
    const techniques: string[] = [];

    // Match user concerns with therapeutic approaches
    if (message.includes('anxious') || message.includes('worry')) {
      if (context.therapeuticApproaches.includes('CBT')) {
        techniques.push('cognitive restructuring');
      }
      if (context.therapeuticApproaches.includes('mindfulness')) {
        techniques.push('mindfulness meditation');
      }
    }

    if (message.includes('sad') || message.includes('down')) {
      techniques.push('behavioral activation');
      techniques.push('self-compassion exercises');
    }

    return techniques;
  }

  private static async generateHomeworkReminders(
    userMessage: string,
    context: TherapyContext
  ): Promise<string[]> {
    const reminders: string[] = [];

    // Check if user message relates to assigned homework
    if (context.assignedHomework.includes('mood tracking')) {
      reminders.push('Remember to log your mood today - it helps track your progress!');
    }

    if (context.assignedHomework.includes('breathing exercises')) {
      reminders.push('Have you tried your breathing exercises today? They can be especially helpful right now.');
    }

    return reminders;
  }

  private static async generateTherapyInformedResponse(
    userMessage: string,
    context: TherapyContext,
    techniques: string[],
    homework: string[]
  ): Promise<string> {
    let response = "I'm here to support you. ";

    if (techniques.length > 0) {
      response += `Based on our previous work together, ${techniques[0]} might be helpful in this situation. `;
    }

    if (homework.length > 0) {
      response += homework[0] + " ";
    }

    if (context.currentGoals.length > 0) {
      response += `This also relates to your goal of ${context.currentGoals[0]}. `;
    }

    response += "How would you like to approach this together?";

    return response;
  }

  private static async analyzeUserPatterns(userId?: string): Promise<any> {
    // Analyze patterns from mood, journal, and activity data
    return {
      moodTrend: 'declining',
      lastActivity: '2 days ago',
      upcomingSession: '3 days',
      completedHomework: false
    };
  }

  private static determineCheckinType(
    patterns: any
  ): 'mood-pattern' | 'session-prep' | 'goal-progress' | 'general-support' {
    if (patterns.moodTrend === 'declining') {
      return 'mood-pattern';
    }
    if (patterns.upcomingSession && patterns.upcomingSession <= '3 days') {
      return 'session-prep';
    }
    if (!patterns.completedHomework) {
      return 'goal-progress';
    }
    return 'general-support';
  }

  private static async generateCheckinSuggestions(
    checkinType: string,
    patterns: any
  ): Promise<CopingSuggestion[]> {
    const suggestions: CopingSuggestion[] = [];

    if (checkinType === 'mood-pattern') {
      suggestions.push({
        id: 'mood-support',
        type: 'mindfulness',
        title: 'Daily Mood Reset',
        description: 'A brief practice to help stabilize your mood',
        steps: [
          'Take 3 deep breaths',
          'Notice how you\'re feeling without judgment',
          'Name one thing you\'re grateful for today',
          'Set a small, achievable goal for the rest of the day'
        ],
        duration: '5 minutes',
        priority: 'medium',
        reasoning: 'I noticed your mood has been lower lately. This practice can help reset your emotional state.'
      });
    }

    return suggestions;
  }

  private static async generateProactiveMessage(
    checkinType: string,
    patterns: any,
    suggestions: CopingSuggestion[]
  ): Promise<string> {
    switch (checkinType) {
      case 'mood-pattern':
        return "I've noticed you might be going through a challenging time lately. I wanted to check in and see how you're feeling today. Remember, I'm here to support you through this.";
      
      case 'session-prep':
        return "Your next therapy session is coming up soon. How are you feeling about it? Is there anything specific you'd like to discuss or prepare for?";
      
      case 'goal-progress':
        return "I wanted to check in on how your therapy goals are going. Sometimes it helps to review our progress and adjust our approach if needed.";
      
      default:
        return "Hi there! I wanted to reach out and see how you're doing today. Is there anything on your mind you'd like to talk about?";
    }
  }

  private static extractTherapeuticApproaches(sessions: any[]): string[] {
    // Extract common therapeutic approaches from session notes
    const approaches = new Set<string>();
    
    sessions.forEach(session => {
      if (session.techniques) {
        session.techniques.forEach((technique: string) => {
          if (technique.toLowerCase().includes('cbt') || technique.toLowerCase().includes('cognitive')) {
            approaches.add('CBT');
          }
          if (technique.toLowerCase().includes('mindfulness')) {
            approaches.add('mindfulness');
          }
          if (technique.toLowerCase().includes('dbt')) {
            approaches.add('DBT');
          }
        });
      }
    });

    return Array.from(approaches);
  }

  private static extractCurrentGoals(sessions: any[]): string[] {
    // Extract current goals from recent sessions
    const allGoals = sessions.flatMap(session => session.goals || []);
    return [...new Set(allGoals)].slice(0, 3); // Return unique goals, max 3
  }

  private static extractAssignedHomework(sessions: any[]): string[] {
    // Extract assigned homework from recent sessions
    const allHomework = sessions.flatMap(session => session.homework || []);
    return [...new Set(allHomework)].slice(0, 3); // Return unique homework, max 3
  }
} 