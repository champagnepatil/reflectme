export interface CaseHistory {
  id: string;
  therapist_id: string;
  patient_name: string;
  father_mother_guardian_name?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  language_of_communication: string;
  referred_by?: string;
  informants?: string;
  primary_concerns?: string;
  history_of_concerns: {
    onset?: string;
    duration?: string;
    stressful_factors?: string;
    progression?: string;
  };
  medical_history?: string;
  diagnosis_by_doctor?: string;
  management_plan?: string;
  behavioral_observation?: string;
  strengths?: string;
  areas_of_interest?: string;
  created_at: string;
  updated_at: string;
}

export interface MentalStatusExamination {
  id: string;
  case_history_id: string;
  general_appearance: {
    physical_appearance?: string;
    self_care?: string;
    body_language?: string;
    attitude_towards_examiner?: string;
    psychomotor_activity?: string;
    rapport?: string;
    eye_contact?: string;
    odd_eccentric_behavior?: string;
    other_observations?: string;
  };
  speech_assessment?: string;
  mood_and_affect?: string;
  emotional_response?: string;
  thought_content?: string;
  thought_flow?: string;
  suicidal_ideation: boolean;
  risk_assessment?: string;
  perception_data: {
    hallucinations?: {
      auditory?: boolean;
      visual?: boolean;
      tactile?: boolean;
      gustatory?: boolean;
    };
    illusions?: {
      auditory?: boolean;
      visual?: boolean;
    };
  };
  cognition_data: {
    consciousness?: string;
    orientation?: {
      time?: boolean;
      place?: boolean;
      person?: boolean;
    };
    attention_concentration?: string;
    memory?: {
      immediate?: string;
      recent?: string;
      remote?: string;
    };
  };
  insight_level?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyHistory {
  id: string;
  case_history_id: string;
  family_tree?: string;
  losses?: string;
  conflicts?: string;
  differences?: string;
  disorders?: string;
  family_atmosphere?: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentalHistory {
  id: string;
  case_history_id: string;
  pregnancy_and_birth?: string;
  motor_activity?: string;
  speech_language?: string;
  toilet_training?: string;
  schooling?: string;
  neurodevelopment_functioning: {
    attention?: string;
    activity_energy_level?: string;
    impulsivity?: string;
    time_management?: string;
    organization_skills?: string;
    emotional_regulation?: string;
    language_communication?: {
      receptive?: boolean;
      expressive?: boolean;
    };
  };
  academic_history?: string;
  social_development: {
    awareness_of_boundaries?: string;
    interaction_with_adults?: string;
    social_appropriateness?: string;
    peer_relationships?: string;
  };
  play_behavior: {
    types_of_plays?: string;
    imitation?: string;
    creative_imaginative?: string;
    solitary_group?: string;
    understanding_following_instruction?: string;
    repetitive_stereotypical?: string;
  };
  puberty_milestones?: string;
  created_at: string;
  updated_at: string;
}

export interface CompleteCaseHistory extends CaseHistory {
  mental_status_examination?: MentalStatusExamination;
  family_history?: FamilyHistory;
  developmental_history?: DevelopmentalHistory;
}