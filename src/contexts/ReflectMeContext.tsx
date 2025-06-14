import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from './AuthContext';
import { useTherapy } from './TherapyContext';

// Types
export interface ChatMessage {
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
    responseElements?: {
      validation?: string;
      therapyReference?: string;
      microInsight?: string;
      actionSuggestion?: string;
      choice?: string;
      progressCallout?: string;
      patternNoticing?: string;
      followUp?: string;
    };
  };
}

export interface CopingTool {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'grounding' | 'cognitive' | 'physical';
  duration: string;
  steps: string[];
  isRecommended: boolean;
  therapistApproved: boolean;
}

export interface SessionRecap {
  id: string;
  date: string;
  title: string;
  keyTakeaways: string[];
  therapistSuggestions: string[];
  actionItems: string[];
  moodBefore?: number;
  moodAfter?: number;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  trigger?: string;
  notes?: string;
  context: 'chat' | 'manual' | 'session';
}

interface ReflectMeContextType {
  // Chat
  chatHistory: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id'>) => ChatMessage;
  isGeneratingResponse: boolean;
  
  // Coping Tools
  copingTools: CopingTool[];
  getRecommendedTools: () => CopingTool[];
  
  // Session Recaps
  sessionRecaps: SessionRecap[];
  
  // Mood & Triggers
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  
  // Progress
  getProgressData: () => { date: string; mood: number }[];
}

const ReflectMeContext = createContext<ReflectMeContextType | undefined>(undefined);

export const useReflectMe = () => {
  const context = useContext(ReflectMeContext);
  if (!context) {
    throw new Error('useReflectMe must be used within a ReflectMeProvider');
  }
  return context;
};

// Initialize Google Gemini with better error handling
const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('🔍 Gemini API Key Check:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    startsWithAI: apiKey?.startsWith('AIza') || false,
    isPlaceholder: apiKey === 'your_gemini_api_key_here'
  });
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️ Gemini API key not configured. Using fallback responses.');
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('✅ Gemini 2.0 Flash model initialized successfully');
    return model;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error);
    return null;
  }
};

// Mock data
const mockCopingTools: CopingTool[] = [
  {
    id: '1',
    title: '4-7-8 Breathing',
    description: 'A calming breathing technique to reduce anxiety and promote relaxation',
    category: 'breathing',
    duration: '2-3 minutes',
    steps: [
      'Sit comfortably with your back straight',
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat 3-4 times'
    ],
    isRecommended: true,
    therapistApproved: true,
  },
  {
    id: '2',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present moment',
    category: 'grounding',
    duration: '3-5 minutes',
    steps: [
      'Notice 5 things you can see',
      'Notice 4 things you can touch',
      'Notice 3 things you can hear',
      'Notice 2 things you can smell',
      'Notice 1 thing you can taste'
    ],
    isRecommended: true,
    therapistApproved: true,
  },
  {
    id: '3',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax muscle groups to reduce physical tension',
    category: 'physical',
    duration: '10-15 minutes',
    steps: [
      'Find a comfortable position',
      'Start with your toes - tense for 5 seconds, then relax',
      'Move up to your calves, thighs, abdomen',
      'Continue with arms, shoulders, neck, and face',
      'Notice the contrast between tension and relaxation',
      'End with deep breathing'
    ],
    isRecommended: false,
    therapistApproved: true,
  },
  {
    id: '4',
    title: 'Thought Challenging',
    description: 'Examine and reframe negative thought patterns',
    category: 'cognitive',
    duration: '5-10 minutes',
    steps: [
      'Identify the negative thought',
      'Ask: Is this thought realistic?',
      'What evidence supports or contradicts it?',
      'What would you tell a friend in this situation?',
      'Create a more balanced, realistic thought',
      'Practice the new thought'
    ],
    isRecommended: true,
    therapistApproved: true,
  },
  {
    id: '5',
    title: 'Mindful Body Scan',
    description: 'Bring awareness to different parts of your body',
    category: 'mindfulness',
    duration: '8-12 minutes',
    steps: [
      'Lie down or sit comfortably',
      'Close your eyes and take deep breaths',
      'Start at the top of your head',
      'Slowly move attention down through your body',
      'Notice any sensations without judgment',
      'End by noticing your whole body'
    ],
    isRecommended: false,
    therapistApproved: true,
  },
];

const mockSessionRecaps: SessionRecap[] = [
  {
    id: '1',
    date: '2024-01-15',
    title: 'Anxiety Management Strategies',
    keyTakeaways: [
      'Identified work presentations as a major anxiety trigger',
      'Learned about the connection between thoughts and physical sensations',
      'Practiced breathing techniques during the session'
    ],
    therapistSuggestions: [
      'Practice 4-7-8 breathing daily, especially before presentations',
      'Keep a thought journal to track anxiety patterns',
      'Use grounding techniques when feeling overwhelmed'
    ],
    actionItems: [
      'Practice breathing exercises twice daily',
      'Complete thought record worksheet',
      'Try one grounding technique this week'
    ],
    moodBefore: 3,
    moodAfter: 6,
  },
  {
    id: '2',
    date: '2024-01-08',
    title: 'Understanding Triggers',
    keyTakeaways: [
      'Explored childhood experiences that may contribute to current anxiety',
      'Discussed the fight-or-flight response',
      'Identified physical symptoms of anxiety'
    ],
    therapistSuggestions: [
      'Notice early warning signs of anxiety',
      'Practice self-compassion when experiencing difficult emotions',
      'Use the ReflectMe app to track mood patterns'
    ],
    actionItems: [
      'Complete anxiety symptom tracker',
      'Practice mindfulness meditation 10 minutes daily',
      'Read recommended article on anxiety'
    ],
    moodBefore: 4,
    moodAfter: 5,
  },
  {
    id: '3',
    date: '2024-01-01',
    title: 'Initial Assessment',
    keyTakeaways: [
      'Established therapeutic goals and expectations',
      'Discussed current life stressors and support systems',
      'Introduced cognitive-behavioral therapy approach'
    ],
    therapistSuggestions: [
      'Begin keeping a daily mood log',
      'Start with basic breathing exercises',
      'Focus on sleep hygiene and routine'
    ],
    actionItems: [
      'Download and set up ReflectMe app',
      'Establish consistent sleep schedule',
      'Begin daily check-ins with mood tracking'
    ],
    moodBefore: 3,
    moodAfter: 4,
  },
];

const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    content: 'Welcome to ReflectMe! I\'m here to support you between therapy sessions. How are you feeling today?',
    timestamp: new Date().toISOString(),
  },
];

export const ReflectMeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { clients } = useTherapy();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);
  const [copingTools] = useState<CopingTool[]>(mockCopingTools);
  const [sessionRecaps] = useState<SessionRecap[]>(mockSessionRecaps);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [geminiModel] = useState(() => initializeGemini());

  // Get therapist notes for the current user (assuming one therapist-patient relationship)
  const getTherapistNotes = () => {
    if (!user || user.role !== 'patient') return [];
    
    // For demo purposes, we'll use the first client's notes from the therapy context
    // In a real app, this would be based on the actual therapist-patient relationship
    const patientData = clients.find(client => client.email === user.email) || clients[0];
    return patientData?.notes || [];
  };

  const addMessage = (message: Omit<ChatMessage, 'id'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 11),
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    
    // If it's a user message, generate AI response
    if (message.sender === 'user') {
      generateAIResponse(message.content);
    }
    
    return newMessage;
  };

  const analyzeEmotionalContext = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detect emotional patterns and triggers
    const emotionalIndicators = {
      anxiety: ['worried', 'nervous', 'scared', 'panic', 'overwhelmed', 'stressed', 'can\'t stop thinking', 'anxious', 'anxiety'],
      depression: ['sad', 'down', 'hopeless', 'empty', 'worthless', 'tired', 'no point', 'depressed'],
      selfCriticism: ['mess up', 'stupid', 'failure', 'wrong', 'shouldn\'t have', 'always do this', 'not good enough'],
      socialAnxiety: ['embarrassed', 'judging', 'what they think', 'awkward', 'said something wrong'],
      rumination: ['keep thinking', 'can\'t stop', 'over and over', 'replaying', 'what if'],
      perfectionism: ['not good enough', 'should be better', 'disappointed', 'failed', 'standards'],
      frustration: ['annoying', 'frustrated', 'irritated', 'angry', 'fed up'],
      loneliness: ['alone', 'lonely', 'isolated', 'no one understands', 'by myself']
    };
    
    const detectedEmotions = [];
    const detectedTriggers = [];
    
    for (const [emotion, keywords] of Object.entries(emotionalIndicators)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedEmotions.push(emotion);
      }
    }
    
    // Detect specific triggers
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      detectedTriggers.push('work stress');
    }
    if (lowerMessage.includes('presentation') || lowerMessage.includes('meeting') || lowerMessage.includes('speak')) {
      detectedTriggers.push('public speaking');
    }
    if (lowerMessage.includes('relationship') || lowerMessage.includes('friend') || lowerMessage.includes('partner')) {
      detectedTriggers.push('relationships');
    }
    if (lowerMessage.includes('family') || lowerMessage.includes('parent') || lowerMessage.includes('mom') || lowerMessage.includes('dad')) {
      detectedTriggers.push('family');
    }
    
    return {
      emotions: detectedEmotions,
      triggers: detectedTriggers,
      intensity: lowerMessage.includes('really') || lowerMessage.includes('very') || lowerMessage.includes('extremely') ? 'high' : 'moderate'
    };
  };

  const findRelevantTherapistNotes = (emotionalContext: any, userMessage: string) => {
    const therapistNotes = getTherapistNotes();
    const relevantNotes = [];
    
    for (const note of therapistNotes) {
      const noteContent = note.content.toLowerCase();
      const noteTitle = note.title.toLowerCase();
      
      // Check if note is relevant to detected emotions or triggers
      const isRelevant = 
        emotionalContext.emotions.some((emotion: string) => 
          noteContent.includes(emotion) || noteTitle.includes(emotion)
        ) ||
        emotionalContext.triggers.some((trigger: string) => 
          noteContent.includes(trigger) || noteTitle.includes(trigger)
        ) ||
        note.tags.some(tag => 
          emotionalContext.emotions.includes(tag) || 
          emotionalContext.triggers.includes(tag)
        );
      
      if (isRelevant) {
        relevantNotes.push({
          title: note.title,
          content: note.content.substring(0, 300) + (note.content.length > 300 ? '...' : ''),
          tags: note.tags,
          date: note.date
        });
      }
    }
    
    return relevantNotes.slice(0, 3); // Limit to top 3 most relevant notes
  };

  const generateAIResponse = async (userMessage: string) => {
    console.log('🚀 Starting AI response generation for:', userMessage);
    setIsGeneratingResponse(true);
    
    try {
      // Analyze emotional context
      const emotionalContext = analyzeEmotionalContext(userMessage);
      console.log('🧠 Emotional context analyzed:', emotionalContext);
      
      // Find relevant therapist notes
      const relevantNotes = findRelevantTherapistNotes(emotionalContext, userMessage);
      console.log('📝 Relevant therapist notes found:', relevantNotes.length);
      
      let response = '';
      let metadata: ChatMessage['metadata'] = {
        emotionalContext: emotionalContext.emotions.join(', '),
        triggerDetected: emotionalContext.triggers.join(', '),
        therapistNotesUsed: relevantNotes.map(note => note.title)
      };
      
      if (geminiModel) {
        console.log('🤖 Using Gemini 2.0 Flash for response generation...');
        
        // Construct detailed structured prompt for Gemini
        const prompt = `
You are ReflectMe, a compassionate AI therapy companion. You provide support between therapy sessions by understanding emotional context and referencing past therapeutic work.

USER MESSAGE: "${userMessage}"

EMOTIONAL CONTEXT DETECTED:
- Emotions: ${emotionalContext.emotions.join(', ') || 'neutral'}
- Triggers: ${emotionalContext.triggers.join(', ') || 'none detected'}
- Intensity: ${emotionalContext.intensity}

RELEVANT THERAPIST NOTES:
${relevantNotes.map(note => `
- Session: ${note.title} (${note.date})
- Content: ${note.content}
- Tags: ${note.tags.join(', ')}
`).join('\n') || 'No specific notes found for this context.'}

RESPONSE STRUCTURE REQUIREMENTS:
Your response should include these elements (not all must be present every time, but use when appropriate):

1. VALIDATION: Acknowledge and name the user's feeling or situation
2. THERAPY REFERENCE: If relevant, link back to past discussions, therapist suggestions, or patterns
3. MICRO-INSIGHT: Share a small psychoeducational insight or perspective
4. ACTION SUGGESTION: Propose a simple, specific next step (journaling prompt, reflection, coping exercise, or thought reframing)
5. CHOICE/COLLABORATION: Give the user agency—offer options
6. PROGRESS CALLOUT: If present, celebrate any small positive changes
7. PATTERN NOTICING: If the issue is recurring, gently point it out
8. GENTLE FOLLOW-UP: End with a question or open the door for more reflection

INSTRUCTIONS:
- Keep responses warm, supportive, and actionable (3-4 sentences max)
- Reference specific therapy techniques when relevant notes exist
- Suggest specific coping strategies that align with their therapeutic work
- Never diagnose or provide medical advice
- If the user seems in distress, gently guide toward grounding techniques
- Use a conversational, empathetic tone

Respond as their supportive therapy companion:`;

        try {
          console.log('📤 Sending request to Gemini 2.0 Flash...');
          const result = await geminiModel.generateContent(prompt);
          const generatedResponse = result.response;
          response = generatedResponse.text();
          console.log('✅ Gemini 2.0 Flash response received:', response.substring(0, 100) + '...');
          
          // Suggest coping tools based on emotional context
          if (emotionalContext.emotions.includes('anxiety')) {
            metadata.copingToolSuggested = '4-7-8 Breathing';
          } else if (emotionalContext.emotions.includes('rumination')) {
            metadata.copingToolSuggested = '5-4-3-2-1 Grounding';
          } else if (emotionalContext.emotions.includes('selfCriticism')) {
            metadata.copingToolSuggested = 'Thought Challenging';
          }
          
        } catch (geminiError) {
          console.error('❌ Gemini API error:', geminiError);
          console.log('🔄 Falling back to structured response...');
          response = generateStructuredFallbackResponse(emotionalContext, relevantNotes, userMessage);
        }
      } else {
        console.log('⚠️ No Gemini model available, using fallback response...');
        response = generateStructuredFallbackResponse(emotionalContext, relevantNotes, userMessage);
      }
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata
      };
      
      console.log('💬 Adding AI message to chat:', aiMessage.content.substring(0, 50) + '...');
      setChatHistory(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('💥 Error generating AI response:', error);
      
      // Fallback error response
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: "I'm here to listen and support you. While I'm having trouble accessing my full capabilities right now, I want you to know that your feelings are valid. Would you like to try one of your coping techniques, or would you prefer to talk more about what's on your mind?",
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      console.log('🏁 AI response generation completed');
      setIsGeneratingResponse(false);
    }
  };

  const generateStructuredFallbackResponse = (emotionalContext: any, relevantNotes: any[], userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Self-criticism pattern
    if (emotionalContext.emotions.includes('selfCriticism')) {
      const validation = "I can hear that inner critic being really harsh with you right now.";
      const therapyRef = relevantNotes.length > 0 
        ? "Remember the thought challenging techniques we've discussed in your sessions—" 
        : "";
      const microInsight = "That critical voice often gets louder when we're stressed or tired.";
      const action = "What would you say to a close friend who was being this hard on themselves?";
      const choice = "Want to try reframing that thought together, or just talk more about what's behind it?";
      
      return `${validation} ${therapyRef}${microInsight} ${action} ${choice}`;
    }
    
    // Anxiety pattern
    if (emotionalContext.emotions.includes('anxiety')) {
      const validation = "That sounds really overwhelming—I can see why you'd feel anxious about this.";
      const therapyRef = relevantNotes.length > 0 
        ? "Your therapist mentioned that breathing exercises have been helpful for you before. " 
        : "";
      const microInsight = "Anxiety often shows up when our mind is trying to solve problems that haven't happened yet.";
      const action = "Let's try grounding yourself in this moment—can you name 3 things you can see right now?";
      const followUp = "How does that feel?";
      
      return `${validation} ${therapyRef}${microInsight} ${action} ${followUp}`;
    }
    
    // Rumination pattern
    if (emotionalContext.emotions.includes('rumination') || lowerMessage.includes('keep thinking') || lowerMessage.includes('over and over')) {
      const validation = "It sounds like your mind is stuck on repeat with this—that's exhausting.";
      const patternNoticing = "I'm noticing this kind of thinking loop has come up before. ";
      const microInsight = "Sometimes our brain thinks if we just think about it enough, we can control the outcome.";
      const action = "What if we tried the 5-4-3-2-1 grounding technique to interrupt this cycle?";
      const choice = "Want to try that now, or would it help to talk through what's driving the worry?";
      
      return `${validation} ${patternNoticing}${microInsight} ${action} ${choice}`;
    }
    
    // Work/presentation stress
    if (emotionalContext.triggers.includes('work stress') || emotionalContext.triggers.includes('public speaking')) {
      const validation = "Work situations can definitely trigger that fight-or-flight response.";
      const therapyRef = relevantNotes.length > 0 
        ? "Remember, you've handled challenging presentations before, and your therapist noted your progress with anxiety management. " 
        : "";
      const microInsight = "It's normal for perfectionism to show up at work, especially under stress.";
      const action = "What's one thing that's actually within your control right now?";
      const followUp = "How does focusing on that feel?";
      
      return `${validation} ${therapyRef}${microInsight} ${action} ${followUp}`;
    }
    
    // Depression/low mood
    if (emotionalContext.emotions.includes('depression')) {
      const validation = "I hear that you're really struggling right now, and I want you to know these feelings are completely valid.";
      const microInsight = "Depression can make everything feel heavier, even small tasks.";
      const action = "Is there one tiny thing that might bring you a moment of comfort today—maybe a warm drink or a few minutes outside?";
      const choice = "Want to brainstorm some gentle options together, or just talk more about what you're experiencing?";
      
      return `${validation} ${microInsight} ${action} ${choice}`;
    }
    
    // General supportive response
    const validation = "Thank you for sharing what's on your mind—I can sense this is important to you.";
    const action = "What feels most pressing for you right now?";
    const choice = "Would it help to talk through it more, or would you like to try a coping technique together?";
    const followUp = "I'm here either way.";
    
    return `${validation} ${action} ${choice} ${followUp}`;
  };

  const getRecommendedTools = (): CopingTool[] => {
    return copingTools.filter(tool => tool.isRecommended);
  };

  const addMoodEntry = (entry: Omit<MoodEntry, 'id'>): void => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 11),
    };
    setMoodEntries(prev => [...prev, newEntry]);
  };

  const getProgressData = () => {
    // Generate mock progress data for the last 30 days
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        mood: Math.floor(Math.random() * 5) + 1 + (i < 15 ? 1 : 0), // Show improvement over time
      });
    }
    
    return data;
  };

  const value = {
    chatHistory,
    addMessage,
    isGeneratingResponse,
    copingTools,
    getRecommendedTools,
    sessionRecaps,
    moodEntries,
    addMoodEntry,
    getProgressData,
  };

  return (
    <ReflectMeContext.Provider value={value}>
      {children}
    </ReflectMeContext.Provider>
  );
};