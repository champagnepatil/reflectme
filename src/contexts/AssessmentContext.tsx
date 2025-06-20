import React, { createContext, useContext, useState, useEffect } from 'react';
import { Assessment, AssessmentResult, SymptomTrendData } from '@/types/assessment';
import { useAuth } from './AuthContext';
import { format, addDays, addMonths } from 'date-fns';

interface AssessmentContextType {
  assessments: Assessment[];
  assessmentResults: AssessmentResult[];
  symptomTrendData: SymptomTrendData[];
  createAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt'>) => Assessment;
  submitAssessmentResult: (result: Omit<AssessmentResult, 'id' | 'completedAt'>) => AssessmentResult;
  getAssessmentsForClient: (clientId: string) => Assessment[];
  getResultsForAssessment: (assessmentId: string) => AssessmentResult[];
  getSymptomTrendForClient: (clientId: string, instrument?: string) => SymptomTrendData[];
  getDueAssessments: (clientId: string) => Assessment[];
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};

// Demo data for assessments
const createDemoAssessments = (clientId: string): Assessment[] => [
  {
    id: `assessment_${clientId}_phq9`,
    clientId,
    instrument: 'PHQ-9',
    schedule: 'biweekly',
    nextDueAt: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    createdAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    results: []
  },
  {
    id: `assessment_${clientId}_gad7`,
    clientId,
    instrument: 'GAD-7',
    schedule: 'biweekly',
    nextDueAt: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    createdAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    results: []
  },
  {
    id: `assessment_${clientId}_whodas`,
    clientId,
    instrument: 'WHODAS-2.0',
    schedule: 'monthly',
    nextDueAt: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    createdAt: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    results: []
  }
];

// Demo results for symptom trends
const createDemoResults = (clientId: string): AssessmentResult[] => {
  const now = new Date();
  const results: AssessmentResult[] = [];
  
  // PHQ-9 results over time (showing improvement)
  const phq9Scores = [15, 13, 11, 9, 7]; // Moderate to mild improvement
  phq9Scores.forEach((score, index) => {
    results.push({
      id: `result_${clientId}_phq9_${index}`,
      assessmentId: `assessment_${clientId}_phq9`,
      score,
      rawJson: { total: score },
      completedAt: format(new Date(now.getTime() - (4 - index) * 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      interpretation: score <= 4 ? 'Minimal depression' : score <= 9 ? 'Mild depression' : score <= 14 ? 'Moderate depression' : 'Moderately severe depression',
      severityLevel: score <= 4 ? 'minimal' : score <= 9 ? 'mild' : score <= 14 ? 'moderate' : 'moderately-severe'
    });
  });
  
  // GAD-7 results over time (showing stability)
  const gad7Scores = [8, 7, 8, 6, 7]; // Mild anxiety, stable
  gad7Scores.forEach((score, index) => {
    results.push({
      id: `result_${clientId}_gad7_${index}`,
      assessmentId: `assessment_${clientId}_gad7`,
      score,
      rawJson: { total: score },
      completedAt: format(new Date(now.getTime() - (4 - index) * 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      interpretation: score <= 4 ? 'Minimal anxiety' : score <= 9 ? 'Mild anxiety' : score <= 14 ? 'Moderate anxiety' : 'Severe anxiety',
      severityLevel: score <= 4 ? 'minimal' : score <= 9 ? 'mild' : score <= 14 ? 'moderate' : 'severe'
    });
  });
  
  return results;
};

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);

  // Initialize demo data for demo users
  useEffect(() => {
    if (!user) return;

    if (user.isDemo) {
      console.log('🎭 Loading demo assessment data');
      
      // For demo clients, create their assessments
      if (user.role === 'client') {
        const clientAssessments = createDemoAssessments(user.id);
        const clientResults = createDemoResults(user.id);
        
        setAssessments(clientAssessments);
        setAssessmentResults(clientResults);
      }
      
      // For demo therapists, create assessments for all demo clients
      if (user.role === 'therapist') {
        const demoClientIds = ['demo-client-1', 'demo-client-2', 'demo-client-3'];
        const allAssessments: Assessment[] = [];
        const allResults: AssessmentResult[] = [];
        
        demoClientIds.forEach(clientId => {
          allAssessments.push(...createDemoAssessments(clientId));
          allResults.push(...createDemoResults(clientId));
        });
        
        setAssessments(allAssessments);
        setAssessmentResults(allResults);
      }
    } else {
      // For real users, load from database (to be implemented)
      setAssessments([]);
      setAssessmentResults([]);
    }
  }, [user]);

  const createAssessment = (assessment: Omit<Assessment, 'id' | 'createdAt'>): Assessment => {
    const newAssessment: Assessment = {
      ...assessment,
      id: `assessment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      results: []
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    return newAssessment;
  };

  const submitAssessmentResult = (result: Omit<AssessmentResult, 'id' | 'completedAt'>): AssessmentResult => {
    const newResult: AssessmentResult = {
      ...result,
      id: `result_${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    
    setAssessmentResults(prev => [...prev, newResult]);
    
    // Update the assessment's nextDueAt based on schedule
    setAssessments(prev => prev.map(assessment => {
      if (assessment.id === result.assessmentId) {
        let nextDue: Date;
        switch (assessment.schedule) {
          case 'biweekly':
            nextDue = addDays(new Date(), 14);
            break;
          case 'monthly':
            nextDue = addMonths(new Date(), 1);
            break;
          case 'once':
            return assessment; // Don't reschedule one-time assessments
          default:
            nextDue = addDays(new Date(), 14);
        }
        
        return {
          ...assessment,
          nextDueAt: format(nextDue, 'yyyy-MM-dd'),
          results: [...assessment.results, newResult]
        };
      }
      return assessment;
    }));
    
    return newResult;
  };

  const getAssessmentsForClient = (clientId: string): Assessment[] => {
    return assessments.filter(assessment => assessment.clientId === clientId);
  };

  const getResultsForAssessment = (assessmentId: string): AssessmentResult[] => {
    return assessmentResults.filter(result => result.assessmentId === assessmentId);
  };

  const getSymptomTrendForClient = (clientId: string, instrument?: string): SymptomTrendData[] => {
    const clientAssessments = getAssessmentsForClient(clientId);
    const trendData: SymptomTrendData[] = [];
    
    clientAssessments.forEach(assessment => {
      if (instrument && assessment.instrument !== instrument) return;
      
      const results = getResultsForAssessment(assessment.id);
      results.forEach(result => {
        trendData.push({
          date: result.completedAt,
          score: result.score,
          instrument: assessment.instrument,
          severityLevel: result.severityLevel || 'minimal'
        });
      });
    });
    
    return trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDueAssessments = (clientId: string): Assessment[] => {
    const today = new Date();
    return assessments.filter(assessment => 
      assessment.clientId === clientId && 
      new Date(assessment.nextDueAt) <= today
    );
  };

  // Convert assessment results to symptom trend data
  const symptomTrendData: SymptomTrendData[] = assessmentResults.map(result => {
    const assessment = assessments.find(a => a.id === result.assessmentId);
    return {
      date: result.completedAt,
      score: result.score,
      instrument: assessment?.instrument || 'PHQ-9',
      severityLevel: result.severityLevel || 'minimal'
    };
  });

  return (
    <AssessmentContext.Provider value={{
      assessments,
      assessmentResults,
      symptomTrendData,
      createAssessment,
      submitAssessmentResult,
      getAssessmentsForClient,
      getResultsForAssessment,
      getSymptomTrendForClient,
      getDueAssessments
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}; 