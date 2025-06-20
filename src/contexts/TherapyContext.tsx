import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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

export const useTherapy = () => {
  return useContext(TherapyContext);
};

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

// Generate random session dates
const generateSessionDates = () => {
  const today = new Date();
  const lastSession = new Date();
  lastSession.setDate(today.getDate() - Math.floor(Math.random() * 7) - 1); // 1-7 days ago
  
  const nextSession = new Date();
  nextSession.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days from now
  
  return {
    last: format(lastSession, 'yyyy-MM-dd'),
    next: format(nextSession, 'yyyy-MM-dd')
  };
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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
    ...(() => {
      const dates = generateSessionDates();
      return { lastSessionDate: dates.last, nextSessionDate: dates.next };
    })(),
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

// Generate comprehensive demo journal entries for AI clustering
const generateDemoJournalEntries = (): JournalEntry[] => {
  const today = new Date();
  const entries: JournalEntry[] = [];
  
  // 20 diverse demo entries over the last month for better AI clustering
  const demoEntries = [
    {
      daysAgo: 1,
      mood: 4,
      content: "Had a really good therapy session today. We worked on challenging my perfectionist thoughts and I felt like I made a breakthrough. Dr. Chen helped me see that making mistakes is part of learning, not a sign of failure. I'm grateful for this progress.",
      tags: ["therapy", "breakthrough", "perfectionism", "gratitude", "growth"]
    },
    {
      daysAgo: 2,
      mood: 3,
      content: "Work was stressful today. Had to present to the board and I was anxious all morning. Used the breathing exercises Dr. Chen taught me and they actually helped! Still felt nervous but managed to get through it without a panic attack.",
      tags: ["work", "anxiety", "breathing-exercises", "coping-strategies", "presentation"]
    },
    {
      daysAgo: 4,
      mood: 5,
      content: "Amazing day! Went hiking with friends and felt so connected to nature and the people I care about. These are the moments that remind me life can be beautiful. I should schedule more outdoor activities like this.",
      tags: ["hiking", "friends", "nature", "joy", "social-connection", "outdoors"]
    },
    {
      daysAgo: 5,
      mood: 2,
      content: "Feeling down today. Had an argument with my partner about household responsibilities. I know I tend to catastrophize when we fight, but it's hard to stop the negative thoughts once they start. Need to practice the thought-challenging techniques.",
      tags: ["relationships", "argument", "negative-thoughts", "catastrophizing", "conflict"]
    },
    {
      daysAgo: 7,
      mood: 4,
      content: "Started a new mindfulness practice this week. It's only 10 minutes a day but I can already notice small differences in how I react to stress. My mind still wanders a lot but I'm getting better at bringing attention back to my breath.",
      tags: ["mindfulness", "meditation", "stress-management", "progress", "breathing"]
    },
    {
      daysAgo: 9,
      mood: 1,
      content: "Really struggling today. Woke up feeling heavy and sad for no apparent reason. It's one of those days where everything feels overwhelming and pointless. Called my sister and that helped a little. Trying to be gentle with myself.",
      tags: ["depression", "overwhelming", "support", "family", "self-care", "sadness"]
    },
    {
      daysAgo: 11,
      mood: 3,
      content: "Bad day at work. Made a mistake on an important project and I can't stop beating myself up about it. I know rationally that everyone makes mistakes, but emotionally I feel like such a failure. Need to talk to my therapist about this.",
      tags: ["work", "mistake", "self-criticism", "perfectionism", "failure", "negative-self-talk"]
    },
    {
      daysAgo: 13,
      mood: 5,
      content: "Celebrated a work achievement today! Got positive feedback from my manager and the whole team appreciated my project. For once, I allowed myself to feel proud instead of immediately thinking about what I could have done better.",
      tags: ["achievement", "work", "positive-feedback", "pride", "self-acceptance", "success"]
    },
    {
      daysAgo: 15,
      mood: 4,
      content: "Practiced self-compassion exercises today. Instead of criticizing myself for procrastinating, I tried to speak to myself like I would a good friend. It felt weird at first but I think it actually helped me feel less stuck.",
      tags: ["self-compassion", "procrastination", "self-talk", "exercises", "kindness"]
    },
    {
      daysAgo: 17,
      mood: 3,
      content: "Had dinner with my family. It was nice but also triggering - they kept asking about my career progress and making comparisons to my siblings. I managed to stay calm and use some boundary-setting phrases I've been practicing.",
      tags: ["family", "boundaries", "triggers", "career", "comparison", "dinner"]
    },
    {
      daysAgo: 19,
      mood: 4,
      content: "Completed my first week of the new exercise routine. I was skeptical that physical activity would help with my mental health, but I actually do feel more energized and less anxious. Going to keep this up!",
      tags: ["exercise", "routine", "mental-health", "energy", "anxiety", "physical-activity"]
    },
    {
      daysAgo: 21,
      mood: 2,
      content: "Social anxiety flared up at a work networking event. I wanted to leave after 20 minutes but pushed myself to stay longer. Met one interesting person and had a good conversation, so it wasn't all bad. Small wins count.",
      tags: ["social-anxiety", "networking", "exposure", "small-wins", "growth", "courage"]
    },
    {
      daysAgo: 23,
      mood: 3,
      content: "Started reading a book about anxiety management. Some of the cognitive techniques are similar to what I'm learning in therapy. It's helpful to have multiple resources and perspectives on managing my mental health.",
      tags: ["reading", "anxiety", "cognitive-techniques", "learning", "resources", "education"]
    },
    {
      daysAgo: 25,
      mood: 4,
      content: "Had a deep conversation with my best friend about our mental health journeys. It felt so good to be vulnerable and realize I'm not alone in struggling. She shared some techniques that have worked for her too.",
      tags: ["friendship", "vulnerability", "mental-health", "support", "connection", "sharing"]
    },
    {
      daysAgo: 27,
      mood: 2,
      content: "Insomnia hit again last night. Kept replaying that work presentation and thinking about all the things I could have said differently. Need to practice the sleep hygiene techniques my therapist recommended.",
      tags: ["insomnia", "work", "rumination", "sleep", "perfectionism", "overthinking"]
    },
    {
      daysAgo: 29,
      mood: 5,
      content: "Spent the morning in my garden planting new flowers. There's something so therapeutic about working with soil and watching things grow. It reminds me that healing and growth take time and patience.",
      tags: ["gardening", "therapeutic", "growth", "patience", "nature", "healing"]
    },
    {
      daysAgo: 31,
      mood: 3,
      content: "First therapy session was today. Felt nervous but Dr. Chen made me feel comfortable. We talked about my anxiety and perfectionism. It's going to be hard work but I'm ready to start this journey.",
      tags: ["therapy", "first-session", "anxiety", "perfectionism", "journey", "nervous"]
    },
    {
      daysAgo: 33,
      mood: 4,
      content: "Starting this journal as part of my mental health journey. My therapist suggested it might help me track patterns and progress. Feeling hopeful about this new chapter and the work I'm doing on myself.",
      tags: ["journal", "mental-health", "therapy", "patterns", "hope", "self-improvement"]
    },
    {
      daysAgo: 35,
      mood: 3,
      content: "Tried cooking a new recipe today instead of ordering takeout. It was actually really relaxing and meditative. Plus I felt accomplished when it turned out well. Small acts of self-care matter.",
      tags: ["cooking", "self-care", "accomplishment", "meditation", "healthy-habits", "nurturing"]
    },
    {
      daysAgo: 37,
      mood: 2,
      content: "Feeling overwhelmed by all the self-help advice online. Sometimes it feels like I should be 'fixed' by now. Reminder to myself: healing isn't linear and I'm doing the best I can with where I am right now.",
      tags: ["overwhelmed", "self-help", "healing", "progress", "patience", "self-acceptance"]
    }
  ];

  demoEntries.forEach((demo, index) => {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - demo.daysAgo);
    
    entries.push({
      id: `demo-${index + 1}`,
      date: format(entryDate, 'yyyy-MM-dd'),
      mood: demo.mood,
      content: demo.content,
      tags: demo.tags
    });
  });

  return entries.reverse(); // Return in chronological order
};

// Mock journal entries
const mockJournalEntries: JournalEntry[] = generateDemoJournalEntries();

// Generate demo chat history
const generateDemoChatHistory = (): ChatMessage[] => {
  const now = new Date();
  const messages: ChatMessage[] = [];
  
  // Create a realistic conversation flow from today going back
  const demoMessages = [
    {
      minutesAgo: 5,
      sender: 'user' as const,
      content: 'I had a good day today! Used the breathing technique during my presentation and it really helped.',
      tags: ['breathing-exercises', 'success', 'presentation']
    },
    {
      minutesAgo: 4,
      sender: 'bot' as const,
      content: 'That\'s wonderful to hear! It sounds like you\'re really putting the techniques into practice. How did it feel to use the breathing exercise during your presentation?',
      tags: ['encouragement', 'technique-application']
    },
    {
      minutesAgo: 3,
      sender: 'user' as const,
      content: 'It felt empowering. Instead of spiraling into anxiety, I was able to stay grounded and focused.',
      tags: ['empowerment', 'anxiety-management', 'grounding']
    },
    {
      minutesAgo: 2,
      sender: 'bot' as const,
      content: 'That\'s a significant breakthrough! You\'re developing real resilience. Remember to celebrate these victories - they\'re proof of your growth and hard work.',
      tags: ['breakthrough', 'resilience', 'celebration']
    },
    {
      minutesAgo: 0,
      sender: 'system' as const,
      content: 'Hi! I\'m your Zentia companion, here to support you between sessions. How are you feeling today?',
      tags: ['welcome', 'check-in']
    }
  ];

  demoMessages.forEach((demo, index) => {
    const messageTime = new Date(now.getTime() - demo.minutesAgo * 60000);
    
    messages.push({
      id: `demo-chat-${index + 1}`,
      sender: demo.sender,
      content: demo.content,
      timestamp: messageTime.toISOString(),
      tags: demo.tags
    });
  });

  return messages.reverse(); // Return in chronological order
};

// Mock chat history
const mockChatHistory: ChatMessage[] = generateDemoChatHistory();

export const TherapyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(mockChatHistory);

  // Fetch real patients from Supabase or provide demo data
  useEffect(() => {
    const fetchClients = async () => {
      if (!user || user.role !== 'therapist') {
        setClients([]);
        return;
      }

      // If it's a demo therapist, provide demo clients
      if (user.isDemo) {
        console.log('🎭 Loading demo clients for therapist');
        const demoClients: Client[] = [
          {
            id: 'demo-client-1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah-johnson',
            age: 28,
            gender: 'female',
            therapistEmail: user.email,
            lastSessionDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 2 days ago
            nextSessionDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 5 days from now
            mood: 3,
            moodHistory: [
              { date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 2 },
              { date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 3 },
              { date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 4 },
              { date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 3 },
            ],
            notes: [
              {
                id: 'note-1',
                date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                title: 'Session Notes - Anxiety Management',
                content: 'Sarah showed significant progress with breathing techniques. Discussed workplace stress triggers and developed coping strategies for upcoming presentation.',
                tags: ['anxiety', 'workplace', 'breathing-techniques', 'presentation']
              },
              {
                id: 'note-2',
                date: format(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                title: 'Initial Assessment',
                content: 'Generalized anxiety disorder with perfectionist tendencies. Client reports high stress at work and difficulty sleeping.',
                tags: ['assessment', 'anxiety', 'perfectionism', 'sleep']
              }
            ],
            triggers: ['public speaking', 'deadline pressure', 'criticism', 'large groups'],
            copingStrategies: [
              {
                id: 'strategy-1',
                title: 'Box Breathing',
                description: '4-4-4-4 breathing technique for anxiety management',
                steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts', 'Repeat 5-10 times'],
                tags: ['breathing', 'anxiety', 'quick-relief'],
                effectiveness: 8
              },
              {
                id: 'strategy-2',
                title: 'Evidence Chart',
                description: 'Challenge negative thoughts with evidence',
                steps: ['Write down the negative thought', 'List evidence for the thought', 'List evidence against the thought', 'Write a balanced perspective'],
                tags: ['cognitive', 'perfectionism', 'thought-challenge'],
                effectiveness: 7
              }
            ],
            medicalHistory: 'No significant medical history. Occasional headaches related to stress.',
            familyHistory: 'Mother has history of anxiety. No other significant family mental health history.',
            developmentalHistory: 'High achiever throughout school. Perfectionist tendencies developed in adolescence.',
            safetyNotes: 'No current safety concerns. Low risk for self-harm.'
          },
          {
            id: 'demo-client-2',
            name: 'Michael Chen',
            email: 'michael.c@email.com',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=michael-chen',
            age: 35,
            gender: 'male',
            therapistEmail: user.email,
            lastSessionDate: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 5 days ago
            nextSessionDate: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 2 days from now
            mood: 4,
            moodHistory: [
              { date: format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 2 },
              { date: format(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 3 },
              { date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 4 },
              { date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 4 },
            ],
            notes: [
              {
                id: 'note-3',
                date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                title: 'Progress Review - Depression Management',
                content: 'Michael reports improved mood stability. Sleep schedule is more regular. Discussed relationship challenges and communication skills.',
                tags: ['depression', 'relationships', 'sleep', 'communication']
              }
            ],
            triggers: ['isolation', 'work-life imbalance', 'relationship conflicts'],
            copingStrategies: [
              {
                id: 'strategy-3',
                title: 'Daily Activity Scheduling',
                description: 'Structure daily routine with meaningful activities',
                steps: ['Plan 3 activities each day', 'Include 1 social activity', 'Include 1 physical activity', 'Include 1 enjoyable activity', 'Track completion and mood'],
                tags: ['behavioral-activation', 'depression', 'routine'],
                effectiveness: 8
              }
            ],
            medicalHistory: 'History of depression. Currently on SSRI medication.',
            familyHistory: 'Father has history of depression.',
            developmentalHistory: 'Shy child, became more withdrawn in teenage years.',
            safetyNotes: 'Previous history of depressive episodes. Monitor for early warning signs.'
          },
          {
            id: 'demo-client-3',
            name: 'Emma Rodriguez',
            email: 'emma.r@email.com',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=emma-rodriguez',
            age: 22,
            gender: 'female',
            therapistEmail: user.email,
            lastSessionDate: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 1 day ago
            nextSessionDate: format(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 6 days from now
            mood: 2,
            moodHistory: [
              { date: format(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 3 },
              { date: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 2 },
              { date: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 1 },
              { date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), value: 2 },
            ],
            notes: [
              {
                id: 'note-4',
                date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                title: 'Crisis Session - Academic Stress',
                content: 'Emma experiencing high stress due to upcoming exams. Discussed grounding techniques and academic pressure management. Schedule follow-up this week.',
                tags: ['crisis', 'academic-stress', 'grounding', 'follow-up-needed']
              }
            ],
            triggers: ['exam pressure', 'academic failure fears', 'family expectations'],
            copingStrategies: [
              {
                id: 'strategy-4',
                title: '5-4-3-2-1 Grounding',
                description: 'Sensory grounding technique for anxiety',
                steps: ['Name 5 things you can see', 'Name 4 things you can touch', 'Name 3 things you can hear', 'Name 2 things you can smell', 'Name 1 thing you can taste'],
                tags: ['grounding', 'anxiety', 'sensory', 'immediate-relief'],
                effectiveness: 9
              }
            ],
            medicalHistory: 'No significant medical history.',
            familyHistory: 'High-achieving family with academic expectations.',
            developmentalHistory: 'Academic overachiever, recent struggles with university transition.',
            safetyNotes: 'Monitor for academic burnout. Increase session frequency during exam periods.'
          }
        ];
        
        setClients(demoClients);
        return;
      }

      // For real therapists, load from database
      const { data, error } = await supabase.from('patients').select('*');
      if (error) {
        console.error('Error fetching patients from Supabase:', error);
        setClients([]);
        return;
      }
      
      const mappedClients: Client[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(p.name || p.email)}`,
        age: p.age || 0,
        gender: p.gender || 'other',
        therapistEmail: p.therapist_email || user.email,
        lastSessionDate: p.last_session_date || format(new Date(), 'yyyy-MM-dd'),
        nextSessionDate: p.next_session_date || format(new Date(), 'yyyy-MM-dd'),
        mood: 3,
        moodHistory: [],
        notes: [],
        triggers: [],
        copingStrategies: [],
        medicalHistory: '',
        familyHistory: '',
        developmentalHistory: '',
        safetyNotes: '',
      }));
      setClients(mappedClients);
    };
    fetchClients();
  }, [user]);

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