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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);
  const [copingTools] = useState<CopingTool[]>(mockCopingTools);
  const [sessionRecaps] = useState<SessionRecap[]>(mockSessionRecaps);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // Removed unused getTherapistNotes function - now handled in GeminiAIService

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

  // Removed unused analyzeEmotionalContext function - now handled in GeminiAIService

  // Removed unused findRelevantTherapistNotes function - now handled in GeminiAIService

  const generateAIResponse = async (userMessage: string) => {
    console.log('🚀 Starting AI response generation for:', userMessage);
    setIsGeneratingResponse(true);
    
    try {
      // FOR DEMO USERS: Always use a consistent ID to enable API calls
      // while preserving the demo context.
      const clientIdForAIService = user?.isDemo ? 'demo-client-1' : user?.id;

      // Use the new Gemini AI service
      const chatResponse = await GeminiAIService.generaRispostaChat(
        userMessage,
        clientIdForAIService, // clientId if it's a patient
        user?.role === 'patient' // therapeutic contact only for patients
      );
      
      // Create the AI message with metadata
      const aiMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: chatResponse.contenuto,
        timestamp: new Date().toISOString(),
        metadata: {
          emotionalContext: chatResponse.metadata.emozioniRilevate.join(', '),
          triggerDetected: chatResponse.metadata.triggerIndividuati.join(', '),
          copingToolSuggested: chatResponse.metadata.strategieSuggerite[0] || '',
          therapistNotesUsed: chatResponse.metadata.riferimentiTerapeutici,
          responseElements: {
            validation: 'Supporto e validazione',
            therapyReference: chatResponse.metadata.riferimentiTerapeutici.join(', '),
            actionSuggestion: chatResponse.metadata.strategieSuggerite.join(', ')
          }
        }
      };
      
      console.log('💬 Adding AI message to chat:', aiMessage.content.substring(0, 50) + '...');
      setChatHistory(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('💥 Error generating AI response:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'assistant',
        content: "I'm sorry, I'm having some technical difficulties at the moment. I'm still here to listen and support you. Your feelings are valid and important. Would you like to try one of the coping techniques we've discussed together?",
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      console.log('🏁 AI response generation completed');
      setIsGeneratingResponse(false);
    }
  };

  // Removed unused generateStructuredFallbackResponse function - now handled in GeminiAIService

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