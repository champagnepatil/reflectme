import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  therapistEmail: string;
  lastSessionDate: string;
  nextSessionDate: string;
  mood: number; // Changed from 'good' | 'neutral' | 'bad' to number (1-5 scale)
  moodHistory: { date: string; value: number }[];
  notes: TherapyNote[];
  triggers: string[];
  copingStrategies: CopingStrategy[];
  medicalHistory: string;
  familyHistory: string;
  developmentalHistory: string;
  safetyNotes: string;
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

// Mock data - Expanded client list for demo therapist
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah',
    age: 28,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-15',
    nextSessionDate: '2024-01-22',
    mood: 3,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'No significant medical concerns reported. Generally healthy with occasional stress-related headaches.',
    familyHistory: 'Family background includes some pressure around achievement and high expectations. Parents are both professionals who emphasized academic and career success.',
    developmentalHistory: 'No significant developmental concerns reported. Met all major milestones appropriately. High achiever throughout school.',
    safetyNotes: 'If feeling overwhelmed or in crisis, follow the pre-identified coping protocol (grounding techniques, breathing exercises). Reach out to therapist or crisis helpline (988) if needed.',
    notes: [
      {
        id: '101',
        date: '2024-01-15',
        title: 'Perfectionism and Self-Criticism Patterns',
        content: 'Sarah continues to report challenges with perfectionism and negative self-judgment, particularly in work and social settings. She identifies outcome-focused thinking and heightened anxiety before/after key interactions.',
        tags: ['perfectionism', 'self-criticism', 'anxiety', 'cognitive-restructuring', 'breathing-exercises'],
      },
    ],
    triggers: ['Work presentations', 'Receiving feedback', 'Social gatherings', 'Making mistakes'],
    copingStrategies: [
      {
        id: '201',
        title: 'Box Breathing (4-4-4-4)',
        description: 'A controlled breathing exercise to reduce acute anxiety and perfectionist panic',
        steps: [
          'Find a quiet place to sit comfortably',
          'Inhale slowly through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly through your mouth for 4 counts',
          'Hold empty for 4 counts',
          'Repeat for at least 5 cycles',
        ],
        tags: ['anxiety', 'breathing', 'immediate-relief'],
        effectiveness: 4,
      },
    ],
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael',
    age: 35,
    gender: 'male',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-12',
    nextSessionDate: '2024-01-19',
    mood: 4,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'History of depression in family. Previously responded well to therapy. Currently not on medication.',
    familyHistory: 'Supportive family structure. Parents divorced when he was 12, but maintained good relationships with both.',
    developmentalHistory: 'Normal developmental milestones. Some academic struggles in middle school due to family changes.',
    safetyNotes: 'Has good support system. Previous therapy success indicates resilience. Monitor for isolation patterns.',
    notes: [
      {
        id: '201',
        date: '2024-01-12',
        title: 'Depression Follow-up and Behavioral Activation',
        content: 'Michael reports improved mood this week. He has been consistently engaging in behavioral activation homework. Successfully completed two social activities that he had been avoiding.',
        tags: ['depression', 'behavioral-activation', 'social-engagement'],
      },
    ],
    triggers: ['Social isolation', 'Work pressure', 'Negative news', 'Family conflict'],
    copingStrategies: [
      {
        id: '301',
        title: 'Behavioral Activation',
        description: 'Schedule and engage in positive activities to improve mood',
        steps: [
          'Create a list of enjoyable activities',
          'Schedule specific times for these activities',
          'Start with small, achievable goals',
          'Track your mood before and after each activity',
        ],
        tags: ['depression', 'behavioral', 'daily-practice'],
        effectiveness: 4,
      },
    ],
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Emily',
    age: 24,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-14',
    nextSessionDate: '2024-01-21',
    mood: 2,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'No significant medical history. Some sleep disturbances related to anxiety.',
    familyHistory: 'Close-knit family. Some history of anxiety disorders in maternal line.',
    developmentalHistory: 'Normal development. High achiever academically. Some social anxiety in teenage years.',
    safetyNotes: 'Monitor for panic attack frequency. Has emergency coping plan in place.',
    notes: [
      {
        id: '301',
        date: '2024-01-14',
        title: 'Panic Disorder Management',
        content: 'Emily experienced two panic attacks this week. Working on identifying early warning signs and implementing grounding techniques.',
        tags: ['panic-disorder', 'grounding', 'early-warning-signs'],
      },
    ],
    triggers: ['Crowded spaces', 'Unexpected changes', 'Physical sensations', 'Academic pressure'],
    copingStrategies: [],
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=David',
    age: 42,
    gender: 'male',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-13',
    nextSessionDate: '2024-01-20',
    mood: 3,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Hypertension, managed with medication. Some sleep apnea.',
    familyHistory: 'Recent divorce. Two children (ages 8 and 12). Strained relationship with ex-spouse.',
    developmentalHistory: 'Normal development. Successful career in finance. Recent major life changes.',
    safetyNotes: 'Monitor stress levels due to hypertension. Has good relationship with children.',
    notes: [
      {
        id: '401',
        date: '2024-01-13',
        title: 'Divorce Adjustment and Co-Parenting',
        content: 'David is adjusting to life post-divorce. Focus on developing healthy co-parenting strategies and managing stress.',
        tags: ['divorce', 'co-parenting', 'stress-management', 'life-transitions'],
      },
    ],
    triggers: ['Co-parenting conflicts', 'Financial stress', 'Loneliness', 'Work deadlines'],
    copingStrategies: [],
  },
  {
    id: '5',
    name: 'Jessica Park',
    email: 'jessica.park@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Jessica',
    age: 31,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-16',
    nextSessionDate: '2024-01-23',
    mood: 4,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Postpartum depression history. Currently stable. Regular check-ups with OB/GYN.',
    familyHistory: 'New mother (6-month-old baby). Supportive partner. Some family history of depression.',
    developmentalHistory: 'Normal development. Recent major life transition to motherhood.',
    safetyNotes: 'Monitor for postpartum depression recurrence. Strong support system in place.',
    notes: [
      {
        id: '501',
        date: '2024-01-16',
        title: 'Postpartum Adjustment and Identity',
        content: 'Jessica is navigating the transition to motherhood. Working on maintaining sense of self while embracing new role.',
        tags: ['postpartum', 'identity', 'motherhood', 'adjustment'],
      },
    ],
    triggers: ['Sleep deprivation', 'Baby crying', 'Isolation', 'Body image concerns'],
    copingStrategies: [],
  },
  {
    id: '6',
    name: 'Robert Kim',
    email: 'robert.kim@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Robert',
    age: 29,
    gender: 'male',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-11',
    nextSessionDate: '2024-01-18',
    mood: 3,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'ADHD diagnosis. Currently on medication. Some anxiety related to work performance.',
    familyHistory: 'Supportive family. Some understanding of neurodivergence from family members.',
    developmentalHistory: 'Late ADHD diagnosis at age 26. Explains many childhood and academic challenges.',
    safetyNotes: 'Monitor medication compliance. Watch for perfectionism related to ADHD masking.',
    notes: [
      {
        id: '601',
        date: '2024-01-11',
        title: 'ADHD Management and Work Performance',
        content: 'Robert is learning to work with his ADHD rather than against it. Developing strategies for focus and organization.',
        tags: ['ADHD', 'work-performance', 'organization', 'self-acceptance'],
      },
    ],
    triggers: ['Overwhelming tasks', 'Time pressure', 'Criticism', 'Disorganization'],
    copingStrategies: [],
  },
  {
    id: '7',
    name: 'Maria Santos',
    email: 'maria.santos@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Maria',
    age: 38,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-15',
    nextSessionDate: '2024-01-22',
    mood: 2,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Chronic pain condition (fibromyalgia). Some medication for pain management.',
    familyHistory: 'Caregiver for elderly mother. Three teenage children. Divorced.',
    developmentalHistory: 'Normal development. Successful career interrupted by health issues.',
    safetyNotes: 'Monitor for caregiver burnout. Pain management affects mood stability.',
    notes: [
      {
        id: '701',
        date: '2024-01-15',
        title: 'Chronic Pain and Mental Health',
        content: 'Maria is managing the intersection of chronic pain and depression. Focus on pain-informed mental health strategies.',
        tags: ['chronic-pain', 'depression', 'caregiver-stress', 'self-care'],
      },
    ],
    triggers: ['Pain flares', 'Caregiver stress', 'Financial worries', 'Medical appointments'],
    copingStrategies: [],
  },
  {
    id: '8',
    name: 'Alex Morgan',
    email: 'alex.morgan@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex',
    age: 26,
    gender: 'other',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-14',
    nextSessionDate: '2024-01-21',
    mood: 3,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Transgender, currently on hormone therapy. Regular endocrinologist visits.',
    familyHistory: 'Mixed family support. Some acceptance challenges with extended family.',
    developmentalHistory: 'Gender dysphoria recognized in early twenties. Currently in transition process.',
    safetyNotes: 'Monitor for discrimination-related stress. Strong chosen family support system.',
    notes: [
      {
        id: '801',
        date: '2024-01-14',
        title: 'Gender Transition Support',
        content: 'Alex is navigating social and medical transition. Working on building confidence and managing family dynamics.',
        tags: ['gender-transition', 'identity', 'family-dynamics', 'self-advocacy'],
      },
    ],
    triggers: ['Misgendering', 'Family conflict', 'Medical appointments', 'Discrimination'],
    copingStrategies: [],
  },
  {
    id: '9',
    name: 'James Wilson',
    email: 'james.wilson@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=James',
    age: 45,
    gender: 'male',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-12',
    nextSessionDate: '2024-01-19',
    mood: 4,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Recovering from alcohol use disorder. 18 months sober. Regular AA attendance.',
    familyHistory: 'Rebuilding relationships with family. Some trust issues to work through.',
    developmentalHistory: 'Successful career before addiction issues. Working on rebuilding professional life.',
    safetyNotes: 'Monitor for relapse triggers. Strong recovery support network in place.',
    notes: [
      {
        id: '901',
        date: '2024-01-12',
        title: 'Addiction Recovery and Relationship Repair',
        content: 'James continues to make progress in recovery. Focus on rebuilding trust and managing stress without substances.',
        tags: ['addiction-recovery', 'relationships', 'stress-management', 'sobriety'],
      },
    ],
    triggers: ['Work stress', 'Relationship conflicts', 'Social drinking situations', 'Boredom'],
    copingStrategies: [],
  },
  {
    id: '10',
    name: 'Lisa Chang',
    email: 'lisa.chang@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Lisa',
    age: 33,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-16',
    nextSessionDate: '2024-01-23',
    mood: 3,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Eating disorder history (bulimia). Currently in recovery. Regular nutritionist visits.',
    familyHistory: 'High-achieving family with emphasis on appearance and success.',
    developmentalHistory: 'Perfectionist tendencies from early age. Eating disorder onset in college.',
    safetyNotes: 'Monitor for eating disorder behaviors. Has meal plan and support team.',
    notes: [
      {
        id: '1001',
        date: '2024-01-16',
        title: 'Eating Disorder Recovery',
        content: 'Lisa is maintaining recovery from bulimia. Working on body image and perfectionism underlying the disorder.',
        tags: ['eating-disorder', 'body-image', 'perfectionism', 'recovery'],
      },
    ],
    triggers: ['Body image triggers', 'Stress eating', 'Social eating', 'Weight comments'],
    copingStrategies: [],
  },
  {
    id: '11',
    name: 'Thomas Anderson',
    email: 'thomas.anderson@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Thomas',
    age: 52,
    gender: 'male',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-13',
    nextSessionDate: '2024-01-20',
    mood: 2,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Recent heart attack (6 months ago). Cardiac rehabilitation completed.',
    familyHistory: 'Married 25 years. Two adult children. Wife is primary support.',
    developmentalHistory: 'Successful executive career. Recent health scare causing life reevaluation.',
    safetyNotes: 'Monitor for depression related to health anxiety. Cardiac health is stable.',
    notes: [
      {
        id: '1101',
        date: '2024-01-13',
        title: 'Health Anxiety and Life Transitions',
        content: 'Thomas is processing the psychological impact of his heart attack. Working on health anxiety and life priorities.',
        tags: ['health-anxiety', 'life-transitions', 'mortality', 'priorities'],
      },
    ],
    triggers: ['Health symptoms', 'Medical appointments', 'Physical exertion', 'Work stress'],
    copingStrategies: [],
  },
  {
    id: '12',
    name: 'Rachel Green',
    email: 'rachel.green@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Rachel',
    age: 27,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo',
    lastSessionDate: '2024-01-15',
    nextSessionDate: '2024-01-22',
    mood: 4,
    moodHistory: generateMoodHistory(),
    medicalHistory: 'Bipolar II disorder. Stable on medication. Regular psychiatrist visits.',
    familyHistory: 'Some family history of mood disorders. Generally supportive family.',
    developmentalHistory: 'Diagnosis made in early twenties after several depressive episodes.',
    safetyNotes: 'Monitor for mood cycling. Has good medication compliance and insight.',
    notes: [
      {
        id: '1201',
        date: '2024-01-15',
        title: 'Bipolar Disorder Maintenance',
        content: 'Rachel is maintaining mood stability. Focus on recognizing early warning signs and maintaining healthy routines.',
        tags: ['bipolar-disorder', 'mood-stability', 'medication-compliance', 'routine'],
      },
    ],
    triggers: ['Sleep disruption', 'Stress', 'Seasonal changes', 'Medication changes'],
    copingStrategies: [],
  },
];

// Mock journal entries
const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2024-01-16',
    mood: 3,
    content: 'Had that presentation at work today. I kept thinking everyone was judging my slides, but when I used the evidence chart technique, I realized most people seemed engaged and asked good questions.',
    tags: ['work', 'presentation', 'evidence-chart', 'anxiety'],
  },
  {
    id: '2',
    date: '2024-01-15',
    mood: 4,
    content: 'Therapy session today was helpful. Dr. Jones helped me see how I dismiss my small wins. I did complete that project on time last week.',
    tags: ['therapy', 'small-wins', 'self-compassion'],
  },
];

// Mock chat history
const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    content: 'Hi! I\'m your ReflectMe companion, here to support you between sessions. How are you feeling today?',
    timestamp: '2024-01-16T08:00:00Z',
  },
];

export const TherapyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [allClients] = useState<Client[]>(mockClients);
  const [clients, setClients] = useState<Client[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);

  // Filter clients based on user role and email
  useEffect(() => {
    if (!user) {
      setClients([]);
      return;
    }

    if (user.role === 'therapist') {
      // Therapist sees only their assigned clients
      const therapistClients = allClients.filter(client => client.therapistEmail === user.email);
      setClients(therapistClients);
    } else if (user.role === 'patient') {
      // Patient sees only their own data (as a client record)
      const patientClient = allClients.find(client => client.email === user.email);
      setClients(patientClient ? [patientClient] : []);
    }
  }, [user, allClients]);

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
    
    // If it's a user message, generate a bot response based on therapy context
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
      
      // Generate contextual response based on therapy notes and patterns
      const lowercaseMessage = message.content.toLowerCase();
      let botResponse: Omit<ChatMessage, 'id'>;
      
      // Perfectionism and self-criticism responses
      if (lowercaseMessage.includes('mess up') || lowercaseMessage.includes('stupid') || lowercaseMessage.includes('failure')) {
        botResponse = {
          sender: 'bot',
          content: "I can hear that inner critic being really harsh with you right now. Remember the evidence chart technique you've been practicing? What evidence do you actually have that supports this self-critical thought?",
          timestamp: new Date().toISOString(),
          tags: ['perfectionism', 'self-criticism', 'evidence-chart'],
        };
      }
      // Social anxiety responses
      else if (lowercaseMessage.includes('presentation') || lowercaseMessage.includes('meeting') || lowercaseMessage.includes('embarrassed')) {
        botResponse = {
          sender: 'bot',
          content: "Social situations can definitely trigger that perfectionist anxiety. The box breathing technique (4-4-4-4) has been helpful for you before presentations. Would you like to try that now?",
          timestamp: new Date().toISOString(),
          tags: ['social-anxiety', 'box-breathing', 'presentations'],
        };
      }
      // General supportive response
      else {
        botResponse = {
          sender: 'bot',
          content: "Thank you for sharing that with me. I'm here to support you using the strategies you've been developing in therapy. Would it be helpful to practice one of your coping techniques, or would you prefer to talk through what you're experiencing?",
          timestamp: new Date().toISOString(),
          tags: ['support', 'therapy-integration'],
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