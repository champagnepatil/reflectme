import { GeminiAIService } from './geminiAIService';
import * as Sentry from "@sentry/react";

// Types for Gen AI Functions
export interface PersonalizedNarrative {
  id: string;
  title: string;
  content: string;
  type: 'story' | 'meditation' | 'visualization' | 'allegory';
  themes: string[];
  duration: number; // minutes
  targetChallenges: string[];
  moodContext: string;
  personalizations: string[];
  created: string;
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aiPersona: {
    role: string;
    personality: string;
    initialResponse: string;
    adaptationRules: string[];
  };
  userGuidance: string[];
  successMetrics: string[];
  created: string;
}

export interface ClinicalNoteSummary {
  id: string;
  clientId: string;
  sessionIds: string[];
  keyThemes: string[];
  emotionalPatterns: string[];
  copingStrategies: string[];
  progressIndicators: string[];
  concernAreas: string[];
  suggestedTopics: string[];
  moodTrends: {
    pattern: string;
    analysis: string;
    recommendations: string[];
  };
  nextSessionFocus: string[];
  summary: string;
  synthesisDate: string;
}

export interface TherapeuticHomework {
  id: string;
  title: string;
  description: string;
  type: 'mindfulness' | 'cognitive' | 'behavioral' | 'journaling' | 'exposure' | 'creative';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // days
  dailyTasks: Array<{
    day: number;
    title: string;
    instructions: string;
    duration: number; // minutes
    materials?: string[];
    reflectionPrompts: string[];
  }>;
  objectives: string[];
  clientPersonalizations: string[];
  progressTracking: string[];
  created: string;
}

export interface TherapeuticContent {
  id: string;
  title: string;
  type: 'article' | 'exercise' | 'worksheet' | 'guide' | 'script';
  category: string;
  content: string;
  wordCount: number;
  targetAudience: string[];
  evidenceBased: boolean;
  techniques: string[];
  callToAction: string;
  tags: string[];
  tone: 'compassionate' | 'educational' | 'motivational' | 'clinical';
  created: string;
}

export interface ClientProfile {
  id: string;
  challenges: string[];
  mood: number;
  therapyGoals: string[];
  preferences: string[];
  journalEntries: Array<{
    date: string;
    content: string;
    mood: number;
    themes: string[];
  }>;
  copingStrategies: string[];
  triggers: string[];
  progressAreas: string[];
}

export interface TherapistProfile {
  id: string;
  specializations: string[];
  preferredTechniques: string[];
  clientProfiles: ClientProfile[];
  sessionHistory: Array<{
    clientId: string;
    date: string;
    notes: string;
    themes: string[];
    interventions: string[];
  }>;
}

class GenAIService {
  constructor() {
    // No need to instantiate GeminiAIService as we use static methods
  }

  // 1. PERSONALIZED NARRATIVE GENERATION (Client-side)
  async generatePersonalizedNarrative(
    clientProfile: ClientProfile,
    narrativeType: 'story' | 'meditation' | 'visualization' | 'allegory',
    specificChallenge?: string
  ): Promise<PersonalizedNarrative> {
    const { logger } = Sentry;
    
    return Sentry.startSpan(
      {
        op: "ai.generation",
        name: "Generate Personalized Narrative",
      },
      async (span) => {
        span.setAttribute("narrative_type", narrativeType);
        span.setAttribute("client_mood", clientProfile.mood);
        span.setAttribute("challenge_count", clientProfile.challenges.length);
        
        logger.info("Starting personalized narrative generation", {
          narrativeType,
          clientMood: clientProfile.mood,
          challengeCount: clientProfile.challenges.length,
          specificChallenge
        });
    const recentEntries = clientProfile.journalEntries
      .slice(-5)
      .map(entry => `Date: ${entry.date}, Mood: ${entry.mood}/5, Content: ${entry.content.substring(0, 200)}...`)
      .join('\n');

    const challenges = specificChallenge ? [specificChallenge] : clientProfile.challenges;
    const primaryChallenge = challenges[0] || 'general anxiety';

    const prompt = `
Generate a ${narrativeType} for therapeutic healing and personal growth.

CLIENT CONTEXT:
- Primary Challenge: ${primaryChallenge}
- Current Mood: ${clientProfile.mood}/5
- Therapy Goals: ${clientProfile.therapyGoals.join(', ')}
- Preferred Themes: ${clientProfile.preferences.join(', ')}
- Recent Journal Insights: ${recentEntries}

REQUIREMENTS:
- Create a ${narrativeType} specifically addressing ${primaryChallenge}
- Incorporate themes of resilience, growth, and hope
- Use metaphors and imagery that resonate with their personal journey
- Include subtle therapeutic insights without being preachy
- Duration: 5-8 minutes of reading/listening
- Tone: Warm, supportive, and empowering

${narrativeType === 'story' ? 'Create an allegorical story with characters that mirror their challenges and growth.' : ''}
${narrativeType === 'meditation' ? 'Create a guided meditation with progressive relaxation and positive visualization.' : ''}
${narrativeType === 'visualization' ? 'Create a detailed mental journey focusing on overcoming their specific challenge.' : ''}
${narrativeType === 'allegory' ? 'Create a symbolic narrative that provides insight into their situation through metaphor.' : ''}

Return a complete, personalized ${narrativeType} that feels custom-made for this individual.
`;

        try {
          const response = await GeminiAIService.generaRispostaChat(prompt);
          const content = response.contenuto;
          
          span.setAttribute("content_length", content.length);
          span.setAttribute("success", true);
          
          logger.info("Successfully generated personalized narrative", {
            contentLength: content.length,
            narrativeType,
            extractedThemes: this.extractThemes(content).length
          });
          
          return {
            id: Date.now().toString(),
            title: this.extractTitle(content, narrativeType),
            content: content,
            type: narrativeType,
            themes: this.extractThemes(content),
            duration: Math.ceil(content.length / 200), // Rough reading time
            targetChallenges: challenges,
            moodContext: `${clientProfile.mood}/5`,
            personalizations: this.extractPersonalizations(clientProfile, content),
            created: new Date().toISOString()
          };
        } catch (error) {
          span.setAttribute("success", false);
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error('Error generating personalized narrative', {
            narrativeType,
            error: error instanceof Error ? error.message : 'Unknown error',
            clientMood: clientProfile.mood
          });
          
          Sentry.captureException(error);
          throw new Error('Failed to generate personalized narrative');
        }
      }
    );
  }

  // 2. DYNAMIC ROLE-PLAYING SCENARIOS (Client-side)
  async generateRolePlayScenario(
    clientProfile: ClientProfile,
    scenarioType: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<RolePlayScenario> {
    const { logger } = Sentry;
    
    return Sentry.startSpan(
      {
        op: "ai.generation",
        name: "Generate Role Play Scenario",
      },
      async (span) => {
        span.setAttribute("scenario_type", scenarioType);
        span.setAttribute("difficulty", difficulty);
        span.setAttribute("client_mood", clientProfile.mood);
        
        logger.info("Starting role play scenario generation", {
          scenarioType,
          difficulty,
          clientMood: clientProfile.mood,
          challengeCount: clientProfile.challenges.length
        });
    const prompt = `
Create a dynamic role-playing scenario for therapeutic practice.

CLIENT CONTEXT:
- Challenges: ${clientProfile.challenges.join(', ')}
- Therapy Goals: ${clientProfile.therapyGoals.join(', ')}
- Current Progress Areas: ${clientProfile.progressAreas.join(', ')}

SCENARIO REQUIREMENTS:
- Type: ${scenarioType}
- Difficulty: ${difficulty}
- Focus: Practice real-world communication and boundary-setting skills
- The AI persona should be realistic but supportive of growth
- Include clear objectives and success metrics

Create a scenario where the client can practice ${scenarioType} in a safe environment.
The AI character should:
1. Start with realistic resistance or challenges
2. Gradually become more receptive if the user demonstrates good skills
3. Provide natural, human-like responses
4. Adapt based on the user's approach

Include:
- Scenario setup and context
- AI persona description and initial response
- User guidance and coaching tips
- Success metrics to track progress
- Adaptation rules for the AI's responses

Make it feel like a real conversation that helps build confidence.
`;

        try {
          const response = await GeminiAIService.generaRispostaChat(prompt);
          const content = response.contenuto;
          
          span.setAttribute("content_length", content.length);
          span.setAttribute("success", true);
          
          logger.info("Successfully generated role play scenario", {
            contentLength: content.length,
            scenarioType,
            difficulty
          });
          
          return {
            id: Date.now().toString(),
            title: `${scenarioType} Practice Session`,
            description: this.extractDescription(content),
            context: this.extractContext(content),
            objective: this.extractObjective(content),
            difficulty,
            aiPersona: {
              role: this.extractAIRole(content),
              personality: this.extractPersonality(content),
              initialResponse: this.extractInitialResponse(content),
              adaptationRules: this.extractAdaptationRules(content)
            },
            userGuidance: this.extractUserGuidance(content),
            successMetrics: this.extractSuccessMetrics(content),
            created: new Date().toISOString()
          };
        } catch (error) {
          span.setAttribute("success", false);
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error('Error generating role-play scenario', {
            scenarioType,
            difficulty,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          Sentry.captureException(error);
          throw new Error('Failed to generate role-play scenario');
        }
      }
    );
  }

  // 3. AUTOMATED CLINICAL NOTE SUMMARIZATION & SYNTHESIS (Therapist-side)
  async generateClinicalSummary(
    clientId: string,
    sessionNotes: Array<{
      id: string;
      date: string;
      content: string;
      themes: string[];
      interventions: string[];
      mood: number;
    }>,
    clientProfile: ClientProfile
  ): Promise<ClinicalNoteSummary> {
    const notesText = sessionNotes
      .map(note => `Session ${note.date}: ${note.content}`)
      .join('\n\n');

    const prompt = `
Analyze and synthesize clinical session notes for comprehensive client assessment.

CLIENT INFORMATION:
- Client ID: ${clientId}
- Number of Sessions: ${sessionNotes.length}
- Date Range: ${sessionNotes[0]?.date} to ${sessionNotes[sessionNotes.length - 1]?.date}

SESSION NOTES:
${notesText}

ANALYSIS REQUIREMENTS:
Provide a comprehensive clinical synthesis including:

1. KEY EMOTIONAL THEMES:
   - Identify recurring emotional patterns
   - Note emotional progress or concerns
   
2. COPING STRATEGIES:
   - Document effective coping mechanisms
   - Identify areas needing support
   
3. MOOD TREND ANALYSIS:
   - Analyze mood patterns over time
   - Identify triggers and positive influences
   
4. PROGRESS INDICATORS:
   - Highlight therapeutic gains
   - Note areas of improvement
   
5. CONCERN AREAS:
   - Identify potential risk factors
   - Flag areas requiring attention
   
6. NEXT SESSION RECOMMENDATIONS:
   - Suggest 3-5 specific discussion topics
   - Recommend therapeutic techniques to explore
   
7. CLINICAL SUMMARY:
   - Provide a cohesive 200-word summary
   - Include treatment recommendations

Format as a professional clinical synthesis suitable for therapeutic records.
Maintain objectivity while highlighting actionable insights.
`;

    try {
      const response = await GeminiAIService.generaRispostaChat(prompt);
      const content = response.contenuto;
      
      return {
        id: Date.now().toString(),
        clientId,
        sessionIds: sessionNotes.map(note => note.id),
        keyThemes: this.extractKeyThemes(content),
        emotionalPatterns: this.extractEmotionalPatterns(content),
        copingStrategies: this.extractCopingStrategies(content),
        progressIndicators: this.extractProgressIndicators(content),
        concernAreas: this.extractConcernAreas(content),
        suggestedTopics: this.extractSuggestedTopics(content),
        moodTrends: {
          pattern: this.extractMoodPattern(content),
          analysis: this.extractMoodAnalysis(content),
          recommendations: this.extractMoodRecommendations(content)
        },
        nextSessionFocus: this.extractNextSessionFocus(content),
        summary: this.extractClinicalSummary(content),
        synthesisDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating clinical summary:', error);
      throw new Error('Failed to generate clinical summary');
    }
  }

  // 4. PERSONALIZED HOMEWORK/EXERCISE GENERATION (Therapist-side)
  async generateTherapeuticHomework(
    clientProfile: ClientProfile,
    homeworkType: 'mindfulness' | 'cognitive' | 'behavioral' | 'journaling' | 'exposure' | 'creative',
    duration: number = 7,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<TherapeuticHomework> {
    const { logger } = Sentry;
    
    return Sentry.startSpan(
      {
        op: "ai.generation",
        name: "Generate Therapeutic Homework",
      },
      async (span) => {
        span.setAttribute("homework_type", homeworkType);
        span.setAttribute("duration_days", duration);
        span.setAttribute("difficulty", difficulty);
        span.setAttribute("client_mood", clientProfile.mood);
        
        logger.info("Starting therapeutic homework generation", {
          homeworkType,
          duration,
          difficulty,
          clientMood: clientProfile.mood,
          goalCount: clientProfile.therapyGoals.length
        });
    const prompt = `
Create a personalized ${duration}-day therapeutic homework plan.

CLIENT PROFILE:
- Challenges: ${clientProfile.challenges.join(', ')}
- Current Mood: ${clientProfile.mood}/5
- Therapy Goals: ${clientProfile.therapyGoals.join(', ')}
- Known Triggers: ${clientProfile.triggers.join(', ')}
- Effective Coping Strategies: ${clientProfile.copingStrategies.join(', ')}

HOMEWORK SPECIFICATIONS:
- Type: ${homeworkType}
- Duration: ${duration} days
- Difficulty Level: ${difficulty}
- Focus: Address primary challenges while building on existing strengths

REQUIREMENTS:
Create a structured plan with:
1. Daily tasks specifically tailored to their needs
2. Progressive difficulty building over the week
3. Clear instructions for each day
4. Reflection prompts to encourage insight
5. Time estimates for each activity
6. Materials needed (if any)
7. Progress tracking methods

For ${homeworkType} focus:
${homeworkType === 'mindfulness' ? '- Include guided meditations, breathing exercises, and present-moment awareness' : ''}
${homeworkType === 'cognitive' ? '- Include thought challenging, reframing exercises, and CBT techniques' : ''}
${homeworkType === 'behavioral' ? '- Include activity scheduling, behavioral experiments, and habit building' : ''}
${homeworkType === 'journaling' ? '- Include structured prompts, gratitude practice, and emotional processing' : ''}
${homeworkType === 'exposure' ? '- Include graduated exposure exercises with anxiety management techniques' : ''}
${homeworkType === 'creative' ? '- Include art therapy, creative writing, and expressive activities' : ''}

Make it feel doable yet challenging, with clear benefits for their specific situation.
`;

        try {
          const response = await GeminiAIService.generaRispostaChat(prompt);
          const content = response.contenuto;
          
          const dailyTasks = this.extractDailyTasks(content, duration);
          
          span.setAttribute("content_length", content.length);
          span.setAttribute("daily_tasks_count", dailyTasks.length);
          span.setAttribute("success", true);
          
          logger.info("Successfully generated therapeutic homework", {
            homeworkType,
            duration,
            dailyTasksCount: dailyTasks.length,
            contentLength: content.length
          });
          
          return {
            id: Date.now().toString(),
            title: this.extractHomeworkTitle(content, homeworkType),
            description: this.extractHomeworkDescription(content),
            type: homeworkType,
            difficulty,
            duration,
            dailyTasks,
            objectives: this.extractHomeworkObjectives(content),
            clientPersonalizations: this.extractClientPersonalizations(content),
            progressTracking: this.extractProgressTracking(content),
            created: new Date().toISOString()
          };
        } catch (error) {
          span.setAttribute("success", false);
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error('Error generating therapeutic homework', {
            homeworkType,
            duration,
            difficulty,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          Sentry.captureException(error);
          throw new Error('Failed to generate therapeutic homework');
        }
      }
    );
  }

  // 5. THERAPEUTIC CONTENT CREATION & EXPANSION (Platform-wide)
  async generateTherapeuticContent(
    contentType: 'article' | 'exercise' | 'worksheet' | 'guide' | 'script',
    topic: string,
    targetAudience: string[] = ['clients'],
    wordCount: number = 500,
    tone: 'compassionate' | 'educational' | 'motivational' | 'clinical' = 'compassionate'
  ): Promise<TherapeuticContent> {
    const prompt = `
Create high-quality therapeutic content for digital mental health platform.

CONTENT SPECIFICATIONS:
- Type: ${contentType}
- Topic: ${topic}
- Target Audience: ${targetAudience.join(', ')}
- Word Count: ~${wordCount} words
- Tone: ${tone}

REQUIREMENTS:
Create ${contentType} that is:
1. Evidence-based and therapeutically sound
2. Accessible and engaging for the target audience
3. Practical with actionable insights
4. Culturally sensitive and inclusive
5. Professional yet warm and supportive

${contentType === 'article' ? 'Structure with clear headings, practical tips, and a compelling call to action' : ''}
${contentType === 'exercise' ? 'Include step-by-step instructions, variations for different needs, and reflection questions' : ''}
${contentType === 'worksheet' ? 'Create interactive elements with clear instructions and space for personal reflection' : ''}
${contentType === 'guide' ? 'Provide comprehensive information with practical steps and resources' : ''}
${contentType === 'script' ? 'Write a natural, engaging script suitable for audio/video content' : ''}

CONTENT FOCUS:
- Topic: ${topic}
- Include evidence-based techniques
- Provide practical, implementable strategies
- Address common concerns and barriers
- Include professional support encouragement
- Maintain hope and empowerment throughout

Ensure the content feels fresh, unique, and valuable to users seeking mental health support.
`;

    try {
      const response = await GeminiAIService.generaRispostaChat(prompt);
      const content = response.contenuto;
      
      return {
        id: Date.now().toString(),
        title: this.extractContentTitle(content),
        type: contentType,
        category: this.categorizeContent(topic),
        content: content,
        wordCount: content.split(' ').length,
        targetAudience,
        evidenceBased: true,
        techniques: this.extractTechniques(content),
        callToAction: this.extractCallToAction(content),
        tags: this.generateContentTags(topic, content),
        tone,
        created: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating therapeutic content:', error);
      throw new Error('Failed to generate therapeutic content');
    }
  }

  // Helper methods for parsing AI responses
  private extractTitle(content: string, type: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('Title:') || line.includes('title:')) {
        return line.replace(/Title:\s*/i, '').trim();
      }
    }
    return `Personalized ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  private extractThemes(content: string): string[] {
    const themeKeywords = ['resilience', 'growth', 'hope', 'courage', 'peace', 'strength', 'healing', 'transformation'];
    return themeKeywords.filter(theme => 
      content.toLowerCase().includes(theme)
    );
  }

  private extractPersonalizations(profile: ClientProfile, content: string): string[] {
    const personalizations: string[] = [];
    
    profile.challenges.forEach(challenge => {
      if (content.toLowerCase().includes(challenge.toLowerCase())) {
        personalizations.push(`Addresses ${challenge}`);
      }
    });
    
    profile.preferences.forEach(preference => {
      if (content.toLowerCase().includes(preference.toLowerCase())) {
        personalizations.push(`Incorporates ${preference}`);
      }
    });
    
    return personalizations;
  }

  private extractDescription(content: string): string {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Description:') || lines[i].includes('description:')) {
        return lines[i].replace(/Description:\s*/i, '').trim();
      }
    }
    return content.substring(0, 200) + '...';
  }

  private extractContext(content: string): string {
    const contextMatch = content.match(/Context:[\s\S]*?(?=\n\n|\nObjective:|\nAI Persona:|$)/i);
    return contextMatch ? contextMatch[0].replace(/Context:\s*/i, '').trim() : 'Practice scenario context';
  }

  private extractObjective(content: string): string {
    const objectiveMatch = content.match(/Objective:[\s\S]*?(?=\n\n|\nAI Persona:|\nGuidance:|$)/i);
    return objectiveMatch ? objectiveMatch[0].replace(/Objective:\s*/i, '').trim() : 'Build communication skills';
  }

  private extractAIRole(content: string): string {
    const roleMatch = content.match(/Role:[\s\S]*?(?=\n|\nPersonality:|$)/i);
    return roleMatch ? roleMatch[0].replace(/Role:\s*/i, '').trim() : 'Colleague';
  }

  private extractPersonality(content: string): string {
    const personalityMatch = content.match(/Personality:[\s\S]*?(?=\n\n|\nInitial:|$)/i);
    return personalityMatch ? personalityMatch[0].replace(/Personality:\s*/i, '').trim() : 'Professional but demanding';
  }

  private extractInitialResponse(content: string): string {
    const responseMatch = content.match(/Initial Response:[\s\S]*?(?=\n\n|\nAdaptation:|$)/i);
    return responseMatch ? responseMatch[0].replace(/Initial Response:\s*/i, '').trim() : '"I need this done immediately."';
  }

  private extractAdaptationRules(content: string): string[] {
    const rulesMatch = content.match(/Adaptation Rules?:[\s\S]*?(?=\n\n|$)/i);
    if (rulesMatch) {
      return rulesMatch[0]
        .replace(/Adaptation Rules?:\s*/i, '')
        .split('\n')
        .filter(rule => rule.trim())
        .map(rule => rule.trim().replace(/^[-*]\s*/, ''));
    }
    return ['Becomes more understanding with clear communication', 'Responds positively to firm boundaries'];
  }

  private extractUserGuidance(content: string): string[] {
    const guidanceMatch = content.match(/User Guidance:[\s\S]*?(?=\n\n|\nSuccess:|$)/i);
    if (guidanceMatch) {
      return guidanceMatch[0]
        .replace(/User Guidance:\s*/i, '')
        .split('\n')
        .filter(guide => guide.trim())
        .map(guide => guide.trim().replace(/^[-*]\s*/, ''));
    }
    return ['Stay calm and clear', 'Use "I" statements', 'Be specific about your needs'];
  }

  private extractSuccessMetrics(content: string): string[] {
    const metricsMatch = content.match(/Success Metrics:[\s\S]*?(?=\n\n|$)/i);
    if (metricsMatch) {
      return metricsMatch[0]
        .replace(/Success Metrics:\s*/i, '')
        .split('\n')
        .filter(metric => metric.trim())
        .map(metric => metric.trim().replace(/^[-*]\s*/, ''));
    }
    return ['Clear communication', 'Maintained boundaries', 'Positive resolution'];
  }

  // Clinical analysis extraction methods
  private extractKeyThemes(content: string): string[] {
    const themesMatch = content.match(/KEY.*THEMES?:[\s\S]*?(?=\n\n|COPING|MOOD|$)/i);
    if (themesMatch) {
      return this.parseListItems(themesMatch[0]);
    }
    return ['Anxiety management', 'Stress coping', 'Communication skills'];
  }

  private extractEmotionalPatterns(content: string): string[] {
    const patternsMatch = content.match(/EMOTIONAL.*PATTERNS?:[\s\S]*?(?=\n\n|COPING|PROGRESS|$)/i);
    if (patternsMatch) {
      return this.parseListItems(patternsMatch[0]);
    }
    return ['Mood variability', 'Stress responses', 'Emotional regulation'];
  }

  private extractCopingStrategies(content: string): string[] {
    const copingMatch = content.match(/COPING.*STRATEGIES?:[\s\S]*?(?=\n\n|MOOD|PROGRESS|$)/i);
    if (copingMatch) {
      return this.parseListItems(copingMatch[0]);
    }
    return ['Deep breathing', 'Mindfulness practice', 'Social support'];
  }

  private extractProgressIndicators(content: string): string[] {
    const progressMatch = content.match(/PROGRESS.*INDICATORS?:[\s\S]*?(?=\n\n|CONCERN|NEXT|$)/i);
    if (progressMatch) {
      return this.parseListItems(progressMatch[0]);
    }
    return ['Improved mood stability', 'Better sleep patterns', 'Increased confidence'];
  }

  private extractConcernAreas(content: string): string[] {
    const concernMatch = content.match(/CONCERN.*AREAS?:[\s\S]*?(?=\n\n|NEXT|RECOMMENDATIONS|$)/i);
    if (concernMatch) {
      return this.parseListItems(concernMatch[0]);
    }
    return ['Sleep disturbances', 'Social anxiety', 'Work stress'];
  }

  private extractSuggestedTopics(content: string): string[] {
    const topicsMatch = content.match(/SUGGESTED.*TOPICS?:[\s\S]*?(?=\n\n|NEXT|RECOMMENDATIONS|$)/i);
    if (topicsMatch) {
      return this.parseListItems(topicsMatch[0]);
    }
    return ['Stress management techniques', 'Sleep hygiene', 'Communication skills'];
  }

  private extractMoodPattern(content: string): string {
    const patternMatch = content.match(/MOOD.*PATTERN:[\s\S]*?(?=\n\n|\nAnalysis:|$)/i);
    return patternMatch ? patternMatch[0].replace(/MOOD.*PATTERN:\s*/i, '').trim() : 'Variable with weekly cycles';
  }

  private extractMoodAnalysis(content: string): string {
    const analysisMatch = content.match(/Analysis:[\s\S]*?(?=\n\n|\nRecommendations:|$)/i);
    return analysisMatch ? analysisMatch[0].replace(/Analysis:\s*/i, '').trim() : 'Mood shows improvement with therapy engagement';
  }

  private extractMoodRecommendations(content: string): string[] {
    const recMatch = content.match(/Recommendations:[\s\S]*?(?=\n\n|NEXT|$)/i);
    if (recMatch) {
      return this.parseListItems(recMatch[0]);
    }
    return ['Continue current interventions', 'Monitor sleep patterns', 'Practice daily mindfulness'];
  }

  private extractNextSessionFocus(content: string): string[] {
    const focusMatch = content.match(/NEXT SESSION.*FOCUS:[\s\S]*?(?=\n\n|CLINICAL|$)/i);
    if (focusMatch) {
      return this.parseListItems(focusMatch[0]);
    }
    return ['Review homework progress', 'Explore new coping strategies', 'Address current stressors'];
  }

  private extractClinicalSummary(content: string): string {
    const summaryMatch = content.match(/CLINICAL.*SUMMARY:[\s\S]*?(?=\n\n|$)/i);
    return summaryMatch ? 
      summaryMatch[0].replace(/CLINICAL.*SUMMARY:\s*/i, '').trim() : 
      'Client showing steady progress with continued therapy engagement and skill development.';
  }

  // Homework extraction methods
  private extractHomeworkTitle(content: string, type: string): string {
    const titleMatch = content.match(/Title:[\s\S]*?(?=\n|Description:|$)/i);
    return titleMatch ? 
      titleMatch[0].replace(/Title:\s*/i, '').trim() : 
      `${type.charAt(0).toUpperCase() + type.slice(1)} Practice Plan`;
  }

  private extractHomeworkDescription(content: string): string {
    const descMatch = content.match(/Description:[\s\S]*?(?=\n\n|Daily Tasks:|$)/i);
    return descMatch ? 
      descMatch[0].replace(/Description:\s*/i, '').trim() : 
      'Personalized therapeutic homework to support your healing journey.';
  }

  private extractDailyTasks(content: string, duration: number): Array<{
    day: number;
    title: string;
    instructions: string;
    duration: number;
    materials?: string[];
    reflectionPrompts: string[];
  }> {
    const tasks = [];
    for (let day = 1; day <= duration; day++) {
      const dayMatch = content.match(new RegExp(`Day ${day}:[\s\S]*?(?=Day ${day + 1}:|$)`, 'i'));
      if (dayMatch) {
        const dayContent = dayMatch[0];
        tasks.push({
          day,
          title: this.extractDayTitle(dayContent),
          instructions: this.extractDayInstructions(dayContent),
          duration: this.extractDayDuration(dayContent),
          materials: this.extractDayMaterials(dayContent),
          reflectionPrompts: this.extractDayReflection(dayContent)
        });
      } else {
        // Generate default task if not found
        tasks.push({
          day,
          title: `Day ${day} Practice`,
          instructions: 'Continue with your personalized exercises for the day.',
          duration: 15,
          reflectionPrompts: ['How did this exercise make you feel?', 'What insights did you gain?']
        });
      }
    }
    return tasks;
  }

  private extractDayTitle(dayContent: string): string {
    const titleMatch = dayContent.match(/Title:[\s\S]*?(?=\n|Instructions:|$)/i);
    return titleMatch ? titleMatch[0].replace(/Title:\s*/i, '').trim() : 'Daily Practice';
  }

  private extractDayInstructions(dayContent: string): string {
    const instrMatch = dayContent.match(/Instructions?:[\s\S]*?(?=\nDuration:|\nMaterials:|\nReflection:|$)/i);
    return instrMatch ? instrMatch[0].replace(/Instructions?:\s*/i, '').trim() : 'Follow the guided exercise for today.';
  }

  private extractDayDuration(dayContent: string): number {
    const durationMatch = dayContent.match(/Duration:\s*(\d+)/i);
    return durationMatch ? parseInt(durationMatch[1]) : 15;
  }

  private extractDayMaterials(dayContent: string): string[] | undefined {
    const materialsMatch = dayContent.match(/Materials?:[\s\S]*?(?=\nReflection:|\n\n|$)/i);
    if (materialsMatch) {
      return this.parseListItems(materialsMatch[0]);
    }
    return undefined;
  }

  private extractDayReflection(dayContent: string): string[] {
    const reflectionMatch = dayContent.match(/Reflection.*Prompts?:[\s\S]*?(?=\n\n|$)/i);
    if (reflectionMatch) {
      return this.parseListItems(reflectionMatch[0]);
    }
    return ['How did this exercise make you feel?', 'What insights did you gain today?'];
  }

  private extractHomeworkObjectives(content: string): string[] {
    const objMatch = content.match(/Objectives?:[\s\S]*?(?=\n\n|Personalizations:|$)/i);
    if (objMatch) {
      return this.parseListItems(objMatch[0]);
    }
    return ['Build coping skills', 'Increase self-awareness', 'Practice daily mindfulness'];
  }

  private extractClientPersonalizations(content: string): string[] {
    const personalMatch = content.match(/Personalizations?:[\s\S]*?(?=\n\n|Progress:|$)/i);
    if (personalMatch) {
      return this.parseListItems(personalMatch[0]);
    }
    return ['Tailored to your specific challenges', 'Incorporates your preferences', 'Builds on your strengths'];
  }

  private extractProgressTracking(content: string): string[] {
    const trackingMatch = content.match(/Progress.*Tracking:[\s\S]*?(?=\n\n|$)/i);
    if (trackingMatch) {
      return this.parseListItems(trackingMatch[0]);
    }
    return ['Daily mood ratings', 'Exercise completion', 'Personal insights journal'];
  }

  // Content extraction methods
  private extractContentTitle(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.includes(':') && line.length < 100) {
        return line.trim();
      }
    }
    return 'Therapeutic Content';
  }

  private categorizeContent(topic: string): string {
    const categories = {
      'anxiety': 'Anxiety Management',
      'depression': 'Depression Support',
      'stress': 'Stress Management',
      'mindfulness': 'Mindfulness & Meditation',
      'relationships': 'Relationship Skills',
      'communication': 'Communication Skills',
      'sleep': 'Sleep & Wellness',
      'trauma': 'Trauma Recovery',
      'addiction': 'Addiction Recovery'
    };
    
    for (const [key, category] of Object.entries(categories)) {
      if (topic.toLowerCase().includes(key)) {
        return category;
      }
    }
    return 'General Wellness';
  }

  private extractTechniques(content: string): string[] {
    const techniques = [
      'Cognitive Behavioral Therapy', 'Mindfulness', 'Deep Breathing', 'Progressive Relaxation',
      'Grounding Techniques', 'Thought Challenging', 'Behavioral Activation', 'Exposure Therapy',
      'EMDR', 'Dialectical Behavior Therapy', 'Acceptance and Commitment Therapy'
    ];
    
    return techniques.filter(technique => 
      content.toLowerCase().includes(technique.toLowerCase())
    );
  }

  private extractCallToAction(content: string): string {
    const ctaMatch = content.match(/call to action:[\s\S]*?(?=\n\n|$)/i);
    if (ctaMatch) {
      return ctaMatch[0].replace(/call to action:\s*/i, '').trim();
    }
    
    // Look for common CTA patterns
    const ctaPatterns = [
      /remember.*support/i,
      /seek.*professional/i,
      /contact.*therapist/i,
      /reach.*out/i
    ];
    
    for (const pattern of ctaPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Remember, professional support is available when you need it.';
  }

  private generateContentTags(topic: string, content: string): string[] {
    const tags = new Set<string>();
    
    // Add topic-based tags
    const topicWords = topic.toLowerCase().split(' ');
    tags.add(...topicWords);
    
    // Add content-based tags
    const commonTags = [
      'mental health', 'therapy', 'wellness', 'coping', 'healing', 'growth',
      'mindfulness', 'anxiety', 'depression', 'stress', 'resilience'
    ];
    
    commonTags.forEach(tag => {
      if (content.toLowerCase().includes(tag)) {
        tags.add(tag);
      }
    });
    
    return Array.from(tags).slice(0, 8); // Limit to 8 tags
  }

  // Utility method for parsing list items
  private parseListItems(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    try {
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')))
        .map(line => line.replace(/^[-*•]\s*/, ''))
        .filter(line => line.length > 0);
    } catch (error) {
      console.error('Error parsing list items:', error);
      return [];
    }
  }

  // Additional utility methods
  private calculateDuration(content: string): number {
    // Estimate reading time: average 200 words per minute
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / 200);
  }

  private describeMoodContext(mood: number): string {
    if (mood <= 1) return 'Very low mood - needing immediate support and gentle encouragement';
    if (mood <= 2) return 'Low mood - requiring compassionate support and hope';
    if (mood <= 3) return 'Moderate mood - open to growth and positive messaging';
    if (mood <= 4) return 'Good mood - ready for challenges and empowerment';
    return 'Very positive mood - celebrating progress and building on strengths';
  }
}

export default GenAIService;