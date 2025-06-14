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

// Initialize Google Gemini
const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured. Using fallback responses.');
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-pro" });
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
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
      anxiety: ['worried', 'nervous', 'scared', 'panic', 'overwhelmed', 'stressed', 'can\'t stop thinking'],
      depression: ['sad', 'down', 'hopeless', 'empty', 'worthless', 'tired', 'no point'],
      selfCriticism: ['mess up', 'stupid', 'failure', 'wrong', 'shouldn\'t have', 'always do this'],
      socialAnxiety: ['embarrassed', 'judging', 'what they think', 'awkward', 'said something wrong'],
      rumination: ['keep thinking', 'can\'t stop', 'over and over', 'replaying', 'what if'],
      perfectionism: ['not good enough', 'should be better', 'disappointed', 'failed', 'standards']
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
    setIsGeneratingResponse(true);
    
    try {
      // Analyze emotional context
      const emotionalContext = analyzeEmotionalContext(userMessage);
      
      // Find relevant therapist notes
      const relevantNotes = findRelevantTherapistNotes(emotionalContext, userMessage);
      
      let response = '';
      let metadata: ChatMessage['metadata'] = {
        emotionalContext: emotionalContext.emotions.join(', '),
        triggerDetected: emotionalContext.triggers.join(', '),
        therapistNotesUsed: relevantNotes.map(note => note.title)
      };
      
      if (geminiModel) {
        // Construct detailed prompt for Gemini
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

INSTRUCTIONS:
1. Respond with empathy and understanding, acknowledging the user's emotional state
2. Reference relevant insights or techniques from the therapist notes when applicable
3. Suggest specific coping strategies that align with their therapeutic work
4. Keep responses warm, supportive, and actionable (2-3 sentences max)
5. If the user seems to be in distress, gently guide them toward grounding techniques
6. Never diagnose or provide medical advice
7. If no relevant notes exist, provide general supportive guidance

Respond as their supportive therapy companion:`;

        try {
          const result = await geminiModel.generateContent(prompt);
          const generatedResponse = result.response;
          response = generatedResponse.text();
          
          // Suggest coping tools based on emotional context
          if (emotionalContext.emotions.includes('anxiety')) {
            metadata.copingToolSuggested = '4-7-8 Breathing';
          } else if (emotionalContext.emotions.includes('rumination')) {
            metadata.copingToolSuggested = '5-4-3-2-1 Grounding';
          } else if (emotionalContext.emotions.includes('selfCriticism')) {
            metadata.copingToolSuggested = 'Thought Challenging';
          }
          
        } catch (geminiError) {
          console.error('Gemini API error:', geminiError);
          response = generateFallbackResponse(emotionalContext, relevantNotes);
        }
      } else {
        response = generateFallbackResponse(emotionalContext, relevantNotes);
      }
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback error response
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: "I'm here to listen and support you. While I'm having trouble accessing my full capabilities right now, I want you to know that your feelings are valid. Would you like to try one of your coping techniques, or would you prefer to talk more about what's on your mind?",
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const generateFallbackResponse = (emotionalContext: any, relevantNotes: any[]) => {
    // Generate contextual responses based on detected emotions and available notes
    if (emotionalContext.emotions.includes('anxiety')) {
      if (relevantNotes.length > 0) {
        return "I can sense you're feeling anxious right now. Remember what we've worked on in your sessions - breathing techniques can be really helpful in moments like this. Would you like to try the 4-7-8 breathing exercise we've practiced?";
      }
      return "I can hear that you're feeling anxious. That's completely understandable. Let's try to ground yourself in this moment. Can you take a slow, deep breath with me and notice 5 things you can see around you?";
    }
    
    if (emotionalContext.emotions.includes('selfCriticism')) {
      if (relevantNotes.length > 0) {
        return "I notice that inner critic is being harsh with you again. Remember the thought challenging techniques we've discussed - what would you say to a friend who was being this hard on themselves?";
      }
      return "It sounds like you're being really hard on yourself right now. That inner critic can be so loud sometimes. What would you tell a good friend if they were in your situation?";
    }
    
    if (emotionalContext.emotions.includes('depression')) {
      return "I hear that you're struggling right now, and I want you to know that these feelings are valid. Even small steps matter. Is there one tiny thing that might bring you a moment of comfort today?";
    }
    
    if (emotionalContext.triggers.includes('work stress')) {
      return "Work situations can definitely feel overwhelming. Remember that you've handled challenging situations before. What's one thing that's within your control right now?";
    }
    
    // Default empathetic response
    return "Thank you for sharing what's on your mind. I'm here to listen and support you. Your feelings are completely valid. Is there anything specific you'd like to talk through or work on together right now?";
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