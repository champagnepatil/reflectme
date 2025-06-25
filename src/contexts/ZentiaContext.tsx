import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { GeminiAIService } from '../services/geminiAIService';

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

interface ZentiaContextType {
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

const ZentiaContext = createContext<ZentiaContextType | undefined>(undefined);

export const useZentia = () => {
  const context = useContext(ZentiaContext);
  if (!context) {
    throw new Error('useZentia must be used within a ZentiaProvider');
  }
  return context;
};

// Removed unused initializeGemini function - now handled in GeminiAIService

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
    moodAfter: 6
  },
  {
    id: '2',
    date: '2024-01-10',
    title: 'Sleep Hygiene and Routine',
    keyTakeaways: [
      'Poor sleep is affecting mood and anxiety levels',
      'Screen time before bed disrupts sleep quality',
      'Established connection between sleep and daily functioning'
    ],
    therapistSuggestions: [
      'Create a consistent bedtime routine',
      'Avoid screens 1 hour before sleep',
      'Try progressive muscle relaxation for better sleep'
    ],
    actionItems: [
      'Set phone to "Do Not Disturb" mode at 9 PM',
      'Practice bedtime routine for one week',
      'Track sleep quality in journal'
    ],
    moodBefore: 4,
    moodAfter: 5
  },
  {
    id: '3',
    date: '2024-01-05',
    title: 'Relationship Communication',
    keyTakeaways: [
      'Difficulty expressing needs in close relationships',
      'Tendency to avoid conflict leads to resentment',
      'Learned "I" statements for better communication'
    ],
    therapistSuggestions: [
      'Practice "I" statements daily',
      'Schedule regular check-ins with partner',
      'Use grounding when feeling defensive'
    ],
    actionItems: [
      'Have one important conversation using "I" statements',
      'Notice when avoiding difficult topics',
      'Practice active listening techniques'
    ],
    moodBefore: 5,
    moodAfter: 7
  }
];

const mockMoodEntries: MoodEntry[] = [
  { id: '1', date: '2024-01-20', mood: 7, context: 'chat', notes: 'Feeling better after talking through anxiety' },
  { id: '2', date: '2024-01-19', mood: 4, trigger: 'Work stress', context: 'manual' },
  { id: '3', date: '2024-01-18', mood: 6, context: 'manual' },
  { id: '4', date: '2024-01-17', mood: 5, trigger: 'Relationship conflict', context: 'chat' },
  { id: '5', date: '2024-01-16', mood: 8, context: 'session', notes: 'Great session today' },
  { id: '6', date: '2024-01-15', mood: 6, context: 'session' },
  { id: '7', date: '2024-01-14', mood: 3, trigger: 'Financial worries', context: 'manual' },
];

export const ZentiaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      content: "Hello! I'm your Zentia companion. I'm here to support you between therapy sessions. How are you feeling today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(mockMoodEntries);

  const addMessage = (message: Omit<ChatMessage, 'id'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
    };
    
    setChatHistory(prev => [...prev, newMessage]);

    // If it's a user message, generate AI response
    if (message.sender === 'user') {
      generateAIResponse(message.content);
    }

    return newMessage;
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsGeneratingResponse(true);
    
    try {
      // Create therapy context from session recaps and mood entries
      const therapyContext = {
        recentSessions: mockSessionRecaps.slice(0, 2),
        recentMoods: moodEntries.slice(-7),
        copingTools: mockCopingTools.filter(tool => tool.therapistApproved)
      };

      const response = await GeminiAIService.generaRispostaChat(
        userMessage,
        user?.id
      );
      console.log('Gemini response:', response);

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: response.contenuto,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      };

      setChatHistory(prev => [...prev, aiMessage]);

      // If mood was detected, add it to mood entries
      if (response.metadata?.moodDetected) {
        const moodEntry: MoodEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          mood: response.metadata.moodDetected,
          context: 'chat',
          notes: `Detected during conversation: "${userMessage.substring(0, 50)}..."`
        };
        setMoodEntries(prev => [...prev, moodEntry]);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'system',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or if this persists, you can always reach out to your therapist directly.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const getRecommendedTools = (): CopingTool[] => {
    return mockCopingTools.filter(tool => tool.isRecommended);
  };

  const addMoodEntry = (entry: Omit<MoodEntry, 'id'>): void => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setMoodEntries(prev => [...prev, newEntry]);
  };

  const getProgressData = () => {
    return moodEntries
      .slice(-30) // Last 30 entries
      .map(entry => ({
        date: entry.date,
        mood: entry.mood
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const value: ZentiaContextType = {
    chatHistory,
    addMessage,
    isGeneratingResponse,
    copingTools: mockCopingTools,
    getRecommendedTools,
    sessionRecaps: mockSessionRecaps,
    moodEntries,
    addMoodEntry,
    getProgressData,
  };

  return (
    <ZentiaContext.Provider value={value}>
      {children}
    </ZentiaContext.Provider>
  );
}; 