export interface Assessment {
  id: string;
  clientId: string;
  instrument: 'PHQ-9' | 'GAD-7' | 'WHODAS-2.0' | 'DSM-5-CC';
  schedule: 'biweekly' | 'monthly' | 'once';
  nextDueAt: string;
  createdAt: string;
  results: AssessmentResult[];
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  score: number;
  rawJson: Record<string, number>;
  completedAt: string;
  interpretation?: string;
  severityLevel?: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export interface ScaleDefinition {
  name: string;
  description: string;
  questions: AssessmentQuestion[];
  scoring: (answers: Record<string, number>) => {
    score: number;
    interpretation: string;
    severityLevel: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  };
  clinicalCutoffs: {
    minimal: [number, number];
    mild: [number, number];
    moderate: [number, number];
    moderatelyServere?: [number, number];
    severe: [number, number];
  };
}

export interface AssessmentFormProps {
  instrument: 'PHQ-9' | 'GAD-7' | 'WHODAS-2.0' | 'DSM-5-CC';
  assessmentId: string;
  onComplete: (result: AssessmentResult) => void;
  onCancel?: () => void;
}

export interface SymptomTrendData {
  date: string;
  score: number;
  instrument: string;
  severityLevel: string;
} 