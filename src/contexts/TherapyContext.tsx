import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lastSessionDate: string;
  nextSessionDate: string;
  mood: 'good' | 'neutral' | 'bad';
  moodHistory: { date: string; value: number }[];
  notes: TherapyNote[];
  triggers: string[];
  copingStrategies: CopingStrategy[];
}

export interface TherapyNote {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  steps: string[];
  tags: string[];
  effectiveness: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  content: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  tags?: string[];
}

interface TherapyContextType {
  clients: Client[];
  journalEntries: JournalEntry[];
  chatHistory: ChatMessage[];
  addClient: (client: Omit<Client, 'id'>) => void;
  addNote: (clientId: string, note: Omit<TherapyNote, 'id'>) => void;
  addCopingStrategy: (clientId: string, strategy: Omit<CopingStrategy, 'id'>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => ChatMessage;
  getClient: (clientId: string) => Client | undefined;
}

const TherapyContext = createContext<TherapyContextType>({
  clients: [],
  journalEntries: [],
  chatHistory: [],
  addClient: () => {},
  addNote: () => {},
  addCopingStrategy: () => {},
  addJournalEntry: () => {},
  addChatMessage: () => ({ id: '', sender: 'user', content: '', timestamp: '' }),
  getClient: () => undefined,
});

export const useTherapy = () => useContext(TherapyContext);

// Generate 30 days of mock mood data
const generateMoodHistory = () => {
  const moodHistory = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    moodHistory.push({
      date: format(date, 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 5) + 1, // Random value between 1-5
    });
  }
  
  return moodHistory;
};

// Mock data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah',
    lastSessionDate: '2023-06-10',
    nextSessionDate: '2023-06-17',
    mood: 'neutral',
    moodHistory: generateMoodHistory(),
    notes: [
      {
        id: '101',
        date: '2023-06-10',
        title: 'Initial Assessment',
        content: 'Sarah reports experiencing anxiety in social situations, particularly at work meetings. She describes physical symptoms including increased heart rate, sweating, and difficulty concentrating. We discussed potential triggers and began exploring coping strategies.',
        tags: ['anxiety', 'social', 'work'],
      },
      {
        id: '102',
        date: '2023-06-03',
        title: 'CBT Session',
        content: 'Worked on identifying negative thought patterns. Sarah recognized catastrophizing when preparing for presentations. We practiced reframing techniques and breathing exercises to manage acute anxiety symptoms.',
        tags: ['CBT', 'thought patterns', 'breathing'],
      },
    ],
    triggers: ['public speaking', 'large meetings', 'unexpected questions', 'performance reviews'],
    copingStrategies: [
      {
        id: '201',
        title: 'Box Breathing',
        description: 'A controlled breathing exercise to reduce acute anxiety',
        steps: [
          'Find a quiet place to sit comfortably',
          'Inhale slowly through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly through your mouth for 4 counts',
          'Hold your breath for 4 counts',
          'Repeat for at least 5 cycles',
        ],
        tags: ['anxiety', 'immediate relief', 'physical'],
        effectiveness: 4,
      },
      {
        id: '202',
        title: 'Thought Challenging',
        description: 'Identify and challenge negative thought patterns',
        steps: [
          'Notice when you feel anxious',
          'Write down the automatic thought that occurred',
          'Identify the cognitive distortion (catastrophizing, mind reading, etc.)',
          'Challenge the thought with evidence',
          'Create a more balanced alternative thought',
        ],
        tags: ['CBT', 'cognitive', 'long-term'],
        effectiveness: 3,
      },
    ],
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael',
    lastSessionDate: '2023-06-12',
    nextSessionDate: '2023-06-19',
    mood: 'good',
    moodHistory: generateMoodHistory(),
    notes: [
      {
        id: '103',
        date: '2023-06-12',
        title: 'Depression Follow-up',
        content: 'Michael reports improved mood this week. He has been consistently taking his medication and completed the behavioral activation homework. Successfully engaged in two social activities that he had been avoiding. Sleep has improved slightly.',
        tags: ['depression', 'medication', 'behavioral activation'],
      },
    ],
    triggers: ['social isolation', 'work pressure', 'negative news', 'family conflict'],
    copingStrategies: [
      {
        id: '203',
        title: 'Behavioral Activation',
        description: 'Schedule and engage in positive activities to improve mood',
        steps: [
          'Create a list of enjoyable activities',
          'Schedule specific times for these activities',
          'Start with small, achievable goals',
          'Track your mood before and after each activity',
          'Gradually increase frequency of activities',
        ],
        tags: ['depression', 'behavioral', 'daily practice'],
        effectiveness: 4,
      },
    ],
  },
];

// Mock journal entries
const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2023-06-14',
    mood: 3,
    content: 'Had a difficult meeting at work today. I felt my anxiety rising when I was asked to present unexpectedly. I used the breathing technique my therapist taught me, which helped somewhat. Still felt shaky afterward.',
    tags: ['anxiety', 'work', 'coping strategy'],
  },
  {
    id: '2',
    date: '2023-06-13',
    mood: 4,
    content: 'Good day overall. Went for a walk in the morning which put me in a positive mindset. Completed all my tasks at work without feeling overwhelmed. Had dinner with a friend and enjoyed the social connection.',
    tags: ['exercise', 'accomplishment', 'social'],
  },
  {
    id: '3',
    date: '2023-06-12',
    mood: 2,
    content: 'Woke up feeling low energy and dreading the day. Struggled to get out of bed. Cancelled lunch plans because I didn\'t feel up to socializing. Need to discuss this pattern with my therapist.',
    tags: ['low mood', 'isolation', 'fatigue'],
  },
];

// Mock chat history
const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    content: 'Welcome to MindLink! I\'m your digital companion, here to support you between therapy sessions. How are you feeling today?',
    timestamp: '2023-06-14T08:00:00Z',
  },
  {
    id: '2',
    sender: 'user',
    content: 'I\'m feeling really anxious about my presentation tomorrow.',
    timestamp: '2023-06-14T08:01:23Z',
  },
  {
    id: '3',
    sender: 'bot',
    content: 'I understand that presentations can trigger your anxiety. Your therapist noted that box breathing has been helpful for you in these situations. Would you like to try that technique now?',
    timestamp: '2023-06-14T08:01:45Z',
    tags: ['anxiety', 'coping strategy', 'breathing'],
  },
  {
    id: '4',
    sender: 'user',
    content: 'Yes, that would be helpful.',
    timestamp: '2023-06-14T08:02:10Z',
  },
  {
    id: '5',
    sender: 'bot',
    content: 'Let\'s practice box breathing together:\n\n1. Find a comfortable position\n2. Inhale slowly through your nose for 4 counts\n3. Hold your breath for 4 counts\n4. Exhale slowly through your mouth for 4 counts\n5. Hold your breath for 4 counts\n\nLet\'s do this for 5 cycles. I\'ll guide you through each step.',
    timestamp: '2023-06-14T08:02:30Z',
    tags: ['guided exercise', 'breathing', 'anxiety relief'],
  },
  {
    id: '6',
    sender: 'user',
    content: 'That helped calm me down a bit. Thank you.',
    timestamp: '2023-06-14T08:05:45Z',
  },
  {
    id: '7',
    sender: 'bot',
    content: 'I\'m glad it helped. Remember, you\'ve successfully handled presentations before. Your therapist noted that you did well in your last quarterly review despite feeling anxious beforehand. Would you like to review some of the thought challenging exercises you\'ve been working on for situations like this?',
    timestamp: '2023-06-14T08:06:15Z',
    tags: ['positive reinforcement', 'CBT', 'anxiety'],
  },
];

export const TherapyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = {
      ...client,
      id: Math.random().toString(36).substring(2, 11),
    };
    setClients([...clients, newClient as Client]);
  };

  const addNote = (clientId: string, note: Omit<TherapyNote, 'id'>) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          notes: [
            ...client.notes,
            { ...note, id: Math.random().toString(36).substring(2, 11) }
          ]
        };
      }
      return client;
    }));
  };

  const addCopingStrategy = (clientId: string, strategy: Omit<CopingStrategy, 'id'>) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          copingStrategies: [
            ...client.copingStrategies,
            { ...strategy, id: Math.random().toString(36).substring(2, 11) }
          ]
        };
      }
      return client;
    }));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 11),
    };
    setJournalEntries([newEntry as JournalEntry, ...journalEntries]);
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 11),
    };
    setChatHistory([...chatHistory, newMessage as ChatMessage]);
    
    // If it's a user message, generate a bot response
    if (message.sender === 'user') {
      // Detect crisis keywords
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die'];
      const isCrisis = crisisKeywords.some(keyword => 
        message.content.toLowerCase().includes(keyword)
      );
      
      if (isCrisis) {
        const crisisResponse: Omit<ChatMessage, 'id'> = {
          sender: 'bot',
          content: "I'm concerned about what you're saying. This sounds serious, and I want to make sure you get the help you need right away. Please call the National Suicide Prevention Lifeline at 988 or text HOME to 741741 to reach the Crisis Text Line. Both are available 24/7. Would you like me to connect you with your therapist immediately?",
          timestamp: new Date().toISOString(),
          tags: ['crisis', 'urgent', 'escalation'],
        };
        
        const newCrisisMessage = {
          ...crisisResponse,
          id: Math.random().toString(36).substring(2, 11),
        };
        
        setChatHistory(prev => [...prev, newCrisisMessage as ChatMessage]);
        return newCrisisMessage as ChatMessage;
      }
      
      // Simple response logic - in a real app, this would call an LLM API
      const lowercaseMessage = message.content.toLowerCase();
      let botResponse: Omit<ChatMessage, 'id'>;
      
      if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('anxiety')) {
        botResponse = {
          sender: 'bot',
          content: "I notice you're feeling anxious. Your therapist has suggested box breathing as a helpful technique for you. Would you like to try that now? Or we could work through some thought challenging exercises that you've been practicing.",
          timestamp: new Date().toISOString(),
          tags: ['anxiety', 'coping strategy'],
        };
      } else if (lowercaseMessage.includes('sad') || lowercaseMessage.includes('depress')) {
        botResponse = {
          sender: 'bot',
          content: "I'm hearing that you're feeling down right now. Looking at your therapy notes, behavioral activation has been helpful for you in the past. What's one small activity that might bring you a little joy today? Even something as simple as a 10-minute walk or calling a friend can help shift your mood.",
          timestamp: new Date().toISOString(),
          tags: ['depression', 'behavioral activation'],
        };
      } else if (lowercaseMessage.includes('thank')) {
        botResponse = {
          sender: 'bot',
          content: "You're welcome. I'm here to support you between sessions with your therapist. Is there anything else you'd like to talk about or practice today?",
          timestamp: new Date().toISOString(),
        };
      } else {
        botResponse = {
          sender: 'bot',
          content: "Thank you for sharing that with me. Based on what you've told me and your therapy goals, would it be helpful to practice one of your coping strategies right now? Or would you prefer to journal about what you're experiencing?",
          timestamp: new Date().toISOString(),
        };
      }
      
      const newBotMessage = {
        ...botResponse,
        id: Math.random().toString(36).substring(2, 11),
      };
      
      setChatHistory(prev => [...prev, newBotMessage as ChatMessage]);
    }
    
    return newMessage as ChatMessage;
  };

  const getClient = (clientId: string) => {
    return clients.find(client => client.id === clientId);
  };

  return (
    <TherapyContext.Provider value={{
      clients,
      journalEntries,
      chatHistory,
      addClient,
      addNote,
      addCopingStrategy,
      addJournalEntry,
      addChatMessage,
      getClient,
    }}>
      {children}
    </TherapyContext.Provider>
  );
};