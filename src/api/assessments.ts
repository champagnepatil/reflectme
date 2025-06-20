import { supabase } from '@/lib/supabase';
import { Assessment, AssessmentResult } from '@/types/assessment';
import { SCALES } from '@/utils/scales';

// Get assessment by ID
export const getAssessment = async (id: string): Promise<Assessment | null> => {
  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_results (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }

    // Transform database format to our types
    return {
      id: assessment.id,
      clientId: assessment.client_id,
      instrument: assessment.instrument,
      schedule: assessment.schedule,
      nextDueAt: assessment.next_due_at,
      createdAt: assessment.created_at,
      results: assessment.assessment_results?.map((result: any) => ({
        id: result.id,
        assessmentId: result.assessment_id,
        score: result.score,
        rawJson: result.raw_json,
        completedAt: result.completed_at,
        interpretation: result.interpretation,
        severityLevel: result.severity_level
      })) || []
    };
  } catch (error) {
    console.error('Error in getAssessment:', error);
    return null;
  }
};

// Get assessments for a client
export const getAssessmentsForClient = async (clientId: string): Promise<Assessment[]> => {
  try {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_results (*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }

    return assessments.map((assessment: any) => ({
      id: assessment.id,
      clientId: assessment.client_id,
      instrument: assessment.instrument,
      schedule: assessment.schedule,
      nextDueAt: assessment.next_due_at,
      createdAt: assessment.created_at,
      results: assessment.assessment_results?.map((result: any) => ({
        id: result.id,
        assessmentId: result.assessment_id,
        score: result.score,
        rawJson: result.raw_json,
        completedAt: result.completed_at,
        interpretation: result.interpretation,
        severityLevel: result.severity_level
      })) || []
    }));
  } catch (error) {
    console.error('Error in getAssessmentsForClient:', error);
    return [];
  }
};

// Create new assessment
export const createAssessment = async (assessment: Omit<Assessment, 'id' | 'createdAt' | 'results'>): Promise<Assessment | null> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        client_id: assessment.clientId,
        instrument: assessment.instrument,
        schedule: assessment.schedule,
        next_due_at: assessment.nextDueAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      instrument: data.instrument,
      schedule: data.schedule,
      nextDueAt: data.next_due_at,
      createdAt: data.created_at,
      results: []
    };
  } catch (error) {
    console.error('Error in createAssessment:', error);
    return null;
  }
};

// Submit assessment result
export const submitAssessmentResult = async (
  assessmentId: string, 
  answers: Record<string, number>
): Promise<AssessmentResult | null> => {
  try {
    // Get assessment to determine instrument
    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Calculate score server-side for security
    const scale = SCALES[assessment.instrument];
    const scoringResult = scale.scoring(answers);

    // Insert assessment result
    const { data: result, error: resultError } = await supabase
      .from('assessment_results')
      .insert({
        assessment_id: assessmentId,
        score: scoringResult.score,
        raw_json: answers,
        interpretation: scoringResult.interpretation,
        severity_level: scoringResult.severityLevel
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error inserting assessment result:', resultError);
      return null;
    }

    // Update assessment nextDueAt based on schedule
    let nextDueDate: Date;
    const now = new Date();
    
    switch (assessment.schedule) {
      case 'biweekly':
        nextDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case 'once':
        // Don't reschedule one-time assessments
        nextDueDate = new Date(assessment.nextDueAt);
        break;
      default:
        nextDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    // Update assessment
    if (assessment.schedule !== 'once') {
      await supabase
        .from('assessments')
        .update({ next_due_at: nextDueDate.toISOString() })
        .eq('id', assessmentId);
    }

    // Publish realtime event for live updates
    const channel = supabase.channel('assessment-updates');
    channel.send({
      type: 'broadcast',
      event: 'assessment_completed',
      payload: {
        assessment_id: assessmentId,
        client_id: assessment.clientId,
        instrument: assessment.instrument,
        score: scoringResult.score,
        severity_level: scoringResult.severityLevel
      }
    });

    // Check for crisis scores and trigger alerts
    if (assessment.instrument === 'PHQ-9' && 
        answers['phq9_9'] && 
        answers['phq9_9'] > 0) {
      // Suicidal ideation detected - trigger crisis protocol
      console.warn('🚨 Suicidal ideation detected in PHQ-9 response');
      
      // In production, this would trigger:
      // 1. Immediate notification to therapist
      // 2. Crisis intervention protocol
      // 3. Emergency contact system
    }

    return {
      id: result.id,
      assessmentId: result.assessment_id,
      score: result.score,
      rawJson: result.raw_json,
      completedAt: result.completed_at,
      interpretation: result.interpretation,
      severityLevel: result.severity_level
    };

  } catch (error) {
    console.error('Error in submitAssessmentResult:', error);
    return null;
  }
};

// Get due assessments (for reminder system)
export const getDueAssessments = async (): Promise<Assessment[]> => {
  try {
    const now = new Date().toISOString();
    
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_results (*)
      `)
      .lte('next_due_at', now)
      .order('next_due_at', { ascending: true });

    if (error) {
      console.error('Error fetching due assessments:', error);
      return [];
    }

    return assessments.map((assessment: any) => ({
      id: assessment.id,
      clientId: assessment.client_id,
      instrument: assessment.instrument,
      schedule: assessment.schedule,
      nextDueAt: assessment.next_due_at,
      createdAt: assessment.created_at,
      results: assessment.assessment_results?.map((result: any) => ({
        id: result.id,
        assessmentId: result.assessment_id,
        score: result.score,
        rawJson: result.raw_json,
        completedAt: result.completed_at,
        interpretation: result.interpretation,
        severityLevel: result.severity_level
      })) || []
    }));
  } catch (error) {
    console.error('Error in getDueAssessments:', error);
    return [];
  }
};

// Get symptom trend data for charts
export const getSymptomTrendData = async (clientId: string, instrument?: string) => {
  try {
    let query = supabase
      .from('assessment_results')
      .select(`
        score,
        completed_at,
        severity_level,
        assessments!inner(instrument, client_id)
      `)
      .eq('assessments.client_id', clientId)
      .order('completed_at', { ascending: true });

    if (instrument) {
      query = query.eq('assessments.instrument', instrument);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error('Error fetching symptom trend data:', error);
      return [];
    }

    return results.map((result: any) => ({
      date: result.completed_at,
      score: result.score,
      instrument: result.assessments.instrument,
      severityLevel: result.severity_level || 'minimal'
    }));

  } catch (error) {
    console.error('Error in getSymptomTrendData:', error);
    return [];
  }
}; 