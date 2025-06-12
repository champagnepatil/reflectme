// Utility functions for generating therapy notes and SOAP documentation

export function generateSOAPNote(transcription: string): {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
} {
  // Enhanced SOAP note generation logic
  const lines = transcription.split(/[.!?]+/).filter(line => line.trim());
  
  // Extract subjective information (patient reports, feelings, symptoms)
  const subjectiveKeywords = ['patient', 'client', 'feels', 'reports', 'states', 'describes', 'complains', 'experiencing'];
  const subjective = lines
    .filter(line => 
      subjectiveKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.toLowerCase().includes('anxious') ||
      line.toLowerCase().includes('depressed') ||
      line.toLowerCase().includes('worried')
    )
    .join('. ') || 'Patient reported concerns and symptoms during the session.';

  // Extract objective information (observations, behaviors, clinical findings)
  const objectiveKeywords = ['observed', 'appeared', 'demonstrated', 'showed', 'exhibited', 'presented'];
  const objective = lines
    .filter(line => 
      objectiveKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.toLowerCase().includes('calm') ||
      line.toLowerCase().includes('cooperative') ||
      line.toLowerCase().includes('engaged')
    )
    .join('. ') || 'Patient appeared engaged and cooperative during the session. Good eye contact maintained throughout.';

  // Extract assessment information (clinical impressions, progress, diagnosis)
  const assessmentKeywords = ['diagnosis', 'symptoms', 'progress', 'improvement', 'worsening', 'stable'];
  const assessment = lines
    .filter(line => 
      assessmentKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.toLowerCase().includes('anxiety') ||
      line.toLowerCase().includes('depression') ||
      line.toLowerCase().includes('mood')
    )
    .join('. ') || 'Patient shows continued engagement in therapy. Symptoms appear stable with some improvement noted.';

  // Extract plan information (interventions, homework, follow-up)
  const planKeywords = ['plan', 'homework', 'practice', 'continue', 'next', 'follow-up', 'technique', 'strategy'];
  const plan = lines
    .filter(line => 
      planKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.toLowerCase().includes('breathing') ||
      line.toLowerCase().includes('exercise') ||
      line.toLowerCase().includes('session')
    )
    .join('. ') || 'Continue current therapeutic approach. Practice breathing techniques daily. Schedule follow-up session in one week.';

  return {
    subjective: subjective || 'Patient reported ongoing concerns and discussed current symptoms.',
    objective: objective || 'Patient appeared alert, oriented, and cooperative during session.',
    assessment: assessment || 'Patient demonstrates good therapeutic engagement with stable presentation.',
    plan: plan || 'Continue current treatment plan and therapeutic interventions. Schedule next session.',
  };
}