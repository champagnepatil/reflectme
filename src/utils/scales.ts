import { ScaleDefinition } from '@/types/assessment';

// PHQ-9 (Patient Health Questionnaire-9) - Depression Screening
const PHQ9_QUESTIONS = [
  {
    id: 'phq9_1',
    text: 'Little interest or pleasure in doing things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_2',
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_4',
    text: 'Feeling tired or having little energy',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_5',
    text: 'Poor appetite or overeating',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_6',
    text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_8',
    text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9_9',
    text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  }
];

// GAD-7 (Generalized Anxiety Disorder 7-item) - Anxiety Screening
const GAD7_QUESTIONS = [
  {
    id: 'gad7_1',
    text: 'Feeling nervous, anxious, or on edge',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_2',
    text: 'Not being able to stop or control worrying',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_3',
    text: 'Worrying too much about different things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_4',
    text: 'Trouble relaxing',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_5',
    text: 'Being so restless that it is hard to sit still',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_6',
    text: 'Becoming easily annoyed or irritable',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7_7',
    text: 'Feeling afraid, as if something awful might happen',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ]
  }
];

// WHODAS 2.0 (12-item) - Functional Disability Assessment
const WHODAS_QUESTIONS = [
  {
    id: 'whodas_1',
    text: 'Standing for long periods such as 30 minutes?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_2',
    text: 'Taking care of your household responsibilities?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_3',
    text: 'Learning a new task, for example, learning how to get to a new place?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_4',
    text: 'How much of a problem did you have joining in community activities (for example, festivities, religious or other activities) in the same way as anyone else can?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_5',
    text: 'How much have you been emotionally affected by your health problems?',
    options: [
      { value: 1, label: 'Not at all' },
      { value: 2, label: 'Mildly' },
      { value: 3, label: 'Moderately' },
      { value: 4, label: 'Severely' },
      { value: 5, label: 'Extremely' }
    ]
  },
  {
    id: 'whodas_6',
    text: 'Concentrating on doing something for ten minutes?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_7',
    text: 'Walking a long distance such as a kilometre [or equivalent]?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_8',
    text: 'Washing your whole body?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_9',
    text: 'Getting dressed?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_10',
    text: 'Dealing with people you do not know?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_11',
    text: 'Maintaining a friendship?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  },
  {
    id: 'whodas_12',
    text: 'Your day-to-day work?',
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Mild' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Severe' },
      { value: 5, label: 'Extreme or cannot do' }
    ]
  }
];

export const SCALES: Record<string, ScaleDefinition> = {
  'PHQ-9': {
    name: 'Patient Health Questionnaire-9',
    description: 'Screening tool for depression severity over the past 2 weeks',
    questions: PHQ9_QUESTIONS,
    scoring: (answers: Record<string, number>) => {
      const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
      
      let interpretation: string;
      let severityLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
      
      if (score <= 4) {
        severityLevel = 'minimal';
        interpretation = 'Minimal depression symptoms. Monitor and consider support as needed.';
      } else if (score <= 9) {
        severityLevel = 'mild';
        interpretation = 'Mild depression. Consider counseling, follow-up monitoring.';
      } else if (score <= 14) {
        severityLevel = 'moderate';
        interpretation = 'Moderate depression. Treatment with counseling and/or medication is recommended.';
      } else if (score <= 19) {
        severityLevel = 'moderately-severe';
        interpretation = 'Moderately severe depression. Active treatment with medication and/or psychotherapy is recommended.';
      } else {
        severityLevel = 'severe';
        interpretation = 'Severe depression. Immediate treatment with medication and psychotherapy is strongly recommended.';
      }
      
      return { score, interpretation, severityLevel };
    },
    clinicalCutoffs: {
      minimal: [0, 4],
      mild: [5, 9],
      moderate: [10, 14],
      moderatelyServere: [15, 19],
      severe: [20, 27]
    }
  },
  
  'GAD-7': {
    name: 'Generalized Anxiety Disorder 7-item',
    description: 'Screening tool for anxiety symptoms over the past 2 weeks',
    questions: GAD7_QUESTIONS,
    scoring: (answers: Record<string, number>) => {
      const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
      
      let interpretation: string;
      let severityLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
      
      if (score <= 4) {
        severityLevel = 'minimal';
        interpretation = 'Minimal anxiety symptoms. No specific treatment indicated.';
      } else if (score <= 9) {
        severityLevel = 'mild';
        interpretation = 'Mild anxiety. Consider monitoring, stress management techniques.';
      } else if (score <= 14) {
        severityLevel = 'moderate';
        interpretation = 'Moderate anxiety. Consider counseling or treatment.';
      } else {
        severityLevel = 'severe';
        interpretation = 'Severe anxiety. Active treatment is recommended.';
      }
      
      return { score, interpretation, severityLevel };
    },
    clinicalCutoffs: {
      minimal: [0, 4],
      mild: [5, 9],
      moderate: [10, 14],
      severe: [15, 21]
    }
  },
  
  'WHODAS-2.0': {
    name: 'WHO Disability Assessment Schedule 2.0',
    description: 'Assessment of functioning and disability over the past 30 days',
    questions: WHODAS_QUESTIONS,
    scoring: (answers: Record<string, number>) => {
      const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
      // WHODAS scoring: convert raw score to percentage
      const percentageScore = Math.round(((score - 12) / (60 - 12)) * 100);
      
      let interpretation: string;
      let severityLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
      
      if (percentageScore <= 10) {
        severityLevel = 'minimal';
        interpretation = 'No significant disability. Normal functioning.';
      } else if (percentageScore <= 25) {
        severityLevel = 'mild';
        interpretation = 'Mild disability. Some difficulty with daily activities.';
      } else if (percentageScore <= 50) {
        severityLevel = 'moderate';
        interpretation = 'Moderate disability. Significant limitations in functioning.';
      } else if (percentageScore <= 75) {
        severityLevel = 'moderately-severe';
        interpretation = 'Severe disability. Major limitations in most areas of functioning.';
      } else {
        severityLevel = 'severe';
        interpretation = 'Extreme disability. Unable to carry out most activities.';
      }
      
      return { score: percentageScore, interpretation, severityLevel };
    },
    clinicalCutoffs: {
      minimal: [0, 10],
      mild: [11, 25],
      moderate: [26, 50],
      moderatelyServere: [51, 75],
      severe: [76, 100]
    }
  },
  
  'DSM-5-CC': {
    name: 'DSM-5 Cross-Cutting Symptom Measure',
    description: 'Brief assessment of mental health symptoms across multiple domains',
    questions: [
      {
        id: 'dsm5_1',
        text: 'Depression (feeling sad, empty, hopeless, or worthless)',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Slight' },
          { value: 2, label: 'Mild' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Severe' }
        ]
      },
      {
        id: 'dsm5_2',
        text: 'Anxiety (feeling nervous, anxious, fearful, or panicky)',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Slight' },
          { value: 2, label: 'Mild' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Severe' }
        ]
      },
      {
        id: 'dsm5_3',
        text: 'Repetitive thoughts and behaviors (having repeated thoughts, urges, or behaviors that interfere with your life)',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Slight' },
          { value: 2, label: 'Mild' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Severe' }
        ]
      },
      {
        id: 'dsm5_4',
        text: 'Substance use (drinking alcohol or using drugs more than you meant to, or interference with your life)',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Slight' },
          { value: 2, label: 'Mild' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Severe' }
        ]
      },
      {
        id: 'dsm5_5',
        text: 'Sleep problems (trouble falling asleep, staying asleep, sleeping too much, or nightmares)',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Slight' },
          { value: 2, label: 'Mild' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Severe' }
        ]
      }
    ],
    scoring: (answers: Record<string, number>) => {
      const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
      
      let interpretation: string;
      let severityLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
      
      if (score <= 2) {
        severityLevel = 'minimal';
        interpretation = 'Minimal symptoms across domains. Continue monitoring.';
      } else if (score <= 5) {
        severityLevel = 'mild';
        interpretation = 'Mild symptoms present. Consider targeted interventions.';
      } else if (score <= 10) {
        severityLevel = 'moderate';
        interpretation = 'Moderate symptoms. Treatment recommendations indicated.';
      } else if (score <= 15) {
        severityLevel = 'moderately-severe';
        interpretation = 'Moderately severe symptoms. Active treatment strongly recommended.';
      } else {
        severityLevel = 'severe';
        interpretation = 'Severe symptoms across multiple domains. Immediate comprehensive treatment needed.';
      }
      
      return { score, interpretation, severityLevel };
    },
    clinicalCutoffs: {
      minimal: [0, 2],
      mild: [3, 5],
      moderate: [6, 10],
      moderatelyServere: [11, 15],
      severe: [16, 20]
    }
  }
};

// Utility functions
export const getScaleDefinition = (instrument: keyof typeof SCALES): ScaleDefinition => {
  return SCALES[instrument];
};

export const calculateClinicallySignificantChange = (
  instrument: keyof typeof SCALES,
  previousScore: number,
  currentScore: number
): { isSignificant: boolean; direction: 'improvement' | 'deterioration' | 'stable'; magnitude: number } => {
  const change = previousScore - currentScore;
  const magnitude = Math.abs(change);
  
  // Reliable Change Index thresholds (simplified)
  const thresholds = {
    'PHQ-9': 5,
    'GAD-7': 4,
    'WHODAS-2.0': 10,
    'DSM-5-CC': 3
  };
  
  const threshold = thresholds[instrument];
  const isSignificant = magnitude >= threshold;
  
  let direction: 'improvement' | 'deterioration' | 'stable';
  if (change > 0) {
    direction = 'improvement';
  } else if (change < 0) {
    direction = 'deterioration';
  } else {
    direction = 'stable';
  }
  
  return { isSignificant, direction, magnitude };
};

export const getSeverityColor = (severityLevel: string): string => {
  switch (severityLevel) {
    case 'minimal':
      return 'bg-success-100 text-success-800';
    case 'mild':
      return 'bg-warning-100 text-warning-800';
    case 'moderate':
      return 'bg-warning-200 text-warning-900';
    case 'moderately-severe':
      return 'bg-error-100 text-error-800';
    case 'severe':
      return 'bg-error-200 text-error-900';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}; 