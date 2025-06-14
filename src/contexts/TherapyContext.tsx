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

// Mock data - Sarah Johnson with detailed therapy information
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@mindtwin.demo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah',
    age: 28,
    gender: 'female',
    therapistEmail: 'therapist@mindtwin.demo', // Links to Dr. Abigail Jones
    lastSessionDate: '2024-01-15',
    nextSessionDate: '2024-01-22',
    mood: 3, // Current mood on 1-5 scale
    moodHistory: generateMoodHistory(),
    medicalHistory: 'No significant medical concerns reported. Generally healthy with occasional stress-related headaches.',
    familyHistory: 'Family background includes some pressure around achievement and high expectations. Parents are both professionals who emphasized academic and career success.',
    developmentalHistory: 'No significant developmental concerns reported. Met all major milestones appropriately. High achiever throughout school.',
    safetyNotes: 'If feeling overwhelmed or in crisis, follow the pre-identified coping protocol (grounding techniques, breathing exercises). Reach out to therapist or crisis helpline (988) if needed. Regularly review boundaries to ensure safety in therapy and daily life.',
    notes: [
      {
        id: '101',
        date: '2024-01-15',
        title: 'Perfectionism and Self-Criticism Patterns',
        content: `Sarah continues to report challenges with perfectionism and negative self-judgment, particularly in work and social settings. She identifies outcome-focused thinking and heightened anxiety before/after key interactions.

BEHAVIORAL OBSERVATIONS:
Alert, engaged, but shows signs of self-doubt when discussing setbacks. Occasionally dismisses small wins, focuses on perceived failures. Good eye contact maintained throughout session.

PRIMARY PATTERNS/TRIGGERS IDENTIFIED:
- Rigid standards ("must/should" thinking)
- Outcome obsession - focuses heavily on results rather than process
- Tendency to interpret others' opinions as absolute fact
- Social-interaction anxiety, especially in professional settings
- Negative self-talk and harsh self-criticism

COPING TOOLS/EXERCISES ASSIGNED:
- Evidence chart for negative thoughts (cognitive restructuring)
- Box breathing (4-4-4-4 method) for anxiety management
- Small-goal planning (breaking big tasks into daily actions)
- Fact vs. opinion separation exercises

PROGRESS SINCE LAST SESSION:
Partial progress in recognizing self-critical thoughts. Practiced box breathing technique and successfully set two small daily goals last week. Still struggling with "all-or-nothing" thinking patterns.

THERAPY GOALS:
1. Build flexible thinking patterns
2. Practice confident, assertive communication
3. Reduce outcome-obsession by valuing process and effort
4. Embrace vulnerability in social contexts
5. Develop self-compassion practices

HOMEWORK/PLAN:
- Continue daily evidence-charting for any harsh self-talk
- Acknowledge one small win per day in journal
- Attempt one "vulnerability experiment" (e.g., share a worry with a trusted friend)
- Practice box breathing before stressful situations`,
        tags: ['perfectionism', 'self-criticism', 'anxiety', 'cognitive-restructuring', 'breathing-exercises'],
      },
      {
        id: '102',
        date: '2024-01-08',
        title: 'Social Anxiety and Vulnerability Challenges',
        content: `Explored Sarah's difficulty with social interactions and fear of judgment. She reports significant anxiety around being perceived negatively by others, particularly in work contexts.

KEY INSIGHTS:
- Fear of vulnerability stems from early experiences of criticism
- Tends to over-prepare for social interactions to avoid "mistakes"
- Physical symptoms include rapid heartbeat, sweating before meetings
- Avoids speaking up in group settings due to fear of saying "wrong" thing

INTERVENTIONS USED:
- Discussed connection between thoughts, feelings, and behaviors
- Introduced concept of "good enough" vs. perfect
- Practiced grounding techniques during session
- Explored past positive social experiences

COPING STRATEGIES DEVELOPED:
- 5-4-3-2-1 grounding technique for social anxiety
- Pre-meeting self-talk scripts
- "Fact vs. story" questioning for social situations

PROGRESS NOTES:
Sarah showed good insight into her patterns. Willing to try homework assignments. Expressed relief at normalizing her experiences.`,
        tags: ['social-anxiety', 'vulnerability', 'grounding', 'self-talk', 'insight'],
      },
      {
        id: '103',
        date: '2024-01-01',
        title: 'Initial Assessment and Goal Setting',
        content: `Initial comprehensive assessment session. Sarah presents with perfectionism, social anxiety, and rigid self-standards that are impacting her work performance and relationships.

PRESENTING CONCERNS:
- Perfectionism with rigid self-standards
- Negative self-talk and self-criticism
- Social-interaction anxiety
- Outcome obsession
- Difficulty embracing vulnerability

STRENGTHS IDENTIFIED:
- High level of self-awareness
- Strong motivation for change
- Good support system (close friends, family)
- Professional success despite internal struggles
- Excellent insight into her patterns

TREATMENT APPROACH:
Cognitive Behavioral Therapy (CBT) with focus on:
- Thought challenging and cognitive restructuring
- Exposure therapy for social situations
- Mindfulness and grounding techniques
- Self-compassion practices

INITIAL GOALS ESTABLISHED:
1. Reduce self-critical thoughts by 50%
2. Increase comfort with "imperfect" social interactions
3. Develop daily self-compassion practices
4. Learn to value process over outcomes`,
        tags: ['initial-assessment', 'CBT', 'goals', 'perfectionism', 'social-anxiety'],
      },
    ],
    triggers: [
      'Work presentations and public speaking',
      'Receiving feedback or criticism',
      'Social gatherings with new people',
      'Making mistakes or "imperfect" performance',
      'Being the center of attention',
      'Uncertainty about others\' opinions'
    ],
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
          'Repeat for at least 5 cycles, especially before stressful situations',
        ],
        tags: ['anxiety', 'breathing', 'immediate-relief'],
        effectiveness: 4,
      },
      {
        id: '202',
        title: 'Evidence Chart for Negative Thoughts',
        description: 'Cognitive restructuring technique to challenge perfectionist and self-critical thoughts',
        steps: [
          'Notice when you feel anxious or self-critical',
          'Write down the automatic negative thought',
          'Ask: "What evidence supports this thought?"',
          'Ask: "What evidence contradicts this thought?"',
          'Consider: "What would I tell a friend in this situation?"',
          'Create a more balanced, realistic alternative thought',
          'Practice the new thought and notice how it feels',
        ],
        tags: ['CBT', 'cognitive-restructuring', 'self-criticism'],
        effectiveness: 5,
      },
      {
        id: '203',
        title: '5-4-3-2-1 Grounding for Social Anxiety',
        description: 'Sensory grounding technique to manage social anxiety and perfectionist overwhelm',
        steps: [
          'Notice 5 things you can see in your environment',
          'Notice 4 things you can touch (chair, table, clothing)',
          'Notice 3 things you can hear (background noise, voices)',
          'Notice 2 things you can smell',
          'Notice 1 thing you can taste',
          'Take three deep breaths and remind yourself: "I am safe and present"',
        ],
        tags: ['grounding', 'social-anxiety', 'mindfulness'],
        effectiveness: 4,
      },
    ],
  },
];

// Mock journal entries
const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2024-01-16',
    mood: 3,
    content: 'Had that presentation at work today. I kept thinking everyone was judging my slides, but when I used the evidence chart technique, I realized most people seemed engaged and asked good questions. Still felt that familiar knot in my stomach beforehand though.',
    tags: ['work', 'presentation', 'evidence-chart', 'anxiety'],
  },
  {
    id: '2',
    date: '2024-01-15',
    mood: 4,
    content: 'Therapy session today was helpful. Dr. Jones helped me see how I dismiss my small wins. I did complete that project on time last week, and my manager said it was thorough. Maybe I can acknowledge that instead of focusing on the one typo I found.',
    tags: ['therapy', 'small-wins', 'self-compassion'],
  },
  {
    id: '3',
    date: '2024-01-14',
    mood: 2,
    content: 'Ugh, said something awkward at the team meeting and now I can\'t stop replaying it. Used the box breathing technique but still feeling like everyone thinks I\'m weird. Why do I always do this to myself?',
    tags: ['social-anxiety', 'rumination', 'self-criticism', 'box-breathing'],
  },
];

// Mock chat history
const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    content: 'Hi Sarah! I\'m your ReflectMe companion, here to support you between sessions with Dr. Jones. I understand you\'ve been working on perfectionism and social anxiety. How are you feeling today?',
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
    
    // If it's a user message, generate a bot response based on Sarah's therapy context
    if (message.sender === 'user') {
      // Detect crisis keywords
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die'];
      const isCrisis = crisisKeywords.some(keyword => 
        message.content.toLowerCase().includes(keyword)
      );
      
      if (isCrisis) {
        const crisisResponse: Omit<ChatMessage, 'id'> = {
          sender: 'bot',
          content: "I'm concerned about what you're saying. This sounds serious, and I want to make sure you get the help you need right away. Please call the National Suicide Prevention Lifeline at 988 or text HOME to 741741 to reach the Crisis Text Line. Both are available 24/7. Would you like me to connect you with Dr. Jones immediately?",
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
      
      // Generate contextual response based on Sarah's therapy notes and patterns
      const lowercaseMessage = message.content.toLowerCase();
      let botResponse: Omit<ChatMessage, 'id'>;
      
      // Perfectionism and self-criticism responses
      if (lowercaseMessage.includes('mess up') || lowercaseMessage.includes('stupid') || lowercaseMessage.includes('failure') || lowercaseMessage.includes('wrong')) {
        botResponse = {
          sender: 'bot',
          content: "I can hear that inner critic being really harsh with you right now. Remember the evidence chart technique you've been practicing with Dr. Jones? What evidence do you actually have that supports this self-critical thought? And what would you say to a close friend who was being this hard on themselves?",
          timestamp: new Date().toISOString(),
          tags: ['perfectionism', 'self-criticism', 'evidence-chart'],
        };
      }
      // Social anxiety responses
      else if (lowercaseMessage.includes('presentation') || lowercaseMessage.includes('meeting') || lowercaseMessage.includes('embarrassed') || lowercaseMessage.includes('judging')) {
        botResponse = {
          sender: 'bot',
          content: "Social situations can definitely trigger that perfectionist anxiety. Dr. Jones mentioned that the box breathing technique (4-4-4-4) has been helpful for you before presentations. Would you like to try that now? Remember, most people are focused on their own concerns, not judging your every word.",
          timestamp: new Date().toISOString(),
          tags: ['social-anxiety', 'box-breathing', 'presentations'],
        };
      }
      // Rumination and overthinking
      else if (lowercaseMessage.includes('keep thinking') || lowercaseMessage.includes('over and over') || lowercaseMessage.includes('replaying')) {
        botResponse = {
          sender: 'bot',
          content: "It sounds like your mind is stuck on repeat with this situation. That's exhausting. Let's try the 5-4-3-2-1 grounding technique to interrupt this cycle: Can you name 5 things you can see right now? This can help bring you back to the present moment instead of replaying the past.",
          timestamp: new Date().toISOString(),
          tags: ['rumination', 'grounding', '5-4-3-2-1'],
        };
      }
      // Work stress and outcome obsession
      else if (lowercaseMessage.includes('work') || lowercaseMessage.includes('project') || lowercaseMessage.includes('deadline')) {
        botResponse = {
          sender: 'bot',
          content: "Work stress can really activate that outcome-focused thinking you've been working on with Dr. Jones. Remember, you've successfully handled challenging projects before. What's one small step you can take today, focusing on the process rather than the perfect outcome?",
          timestamp: new Date().toISOString(),
          tags: ['work-stress', 'outcome-obsession', 'process-focus'],
        };
      }
      // Anxiety responses
      else if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('worried') || lowercaseMessage.includes('nervous')) {
        botResponse = {
          sender: 'bot',
          content: "I can sense you're feeling anxious right now. Your therapy work with Dr. Jones has shown that breathing exercises and grounding techniques work well for you. Would you like to try the box breathing (4-4-4-4) technique, or would the 5-4-3-2-1 grounding exercise feel more helpful right now?",
          timestamp: new Date().toISOString(),
          tags: ['anxiety', 'coping-strategies', 'breathing'],
        };
      }
      // Positive progress acknowledgment
      else if (lowercaseMessage.includes('better') || lowercaseMessage.includes('good') || lowercaseMessage.includes('accomplished')) {
        botResponse = {
          sender: 'bot',
          content: "I'm so glad to hear you're feeling better! This is exactly the kind of small win that Dr. Jones encourages you to acknowledge. Your perfectionist mind might want to dismiss this, but recognizing positive moments is an important part of your healing. What do you think contributed to feeling better today?",
          timestamp: new Date().toISOString(),
          tags: ['progress', 'small-wins', 'self-compassion'],
        };
      }
      // General supportive response with therapy context
      else {
        botResponse = {
          sender: 'bot',
          content: "Thank you for sharing that with me, Sarah. I'm here to support you using the strategies you've been developing with Dr. Jones. Based on your recent work together, would it be helpful to practice one of your coping techniques, or would you prefer to talk through what you're experiencing right now?",
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