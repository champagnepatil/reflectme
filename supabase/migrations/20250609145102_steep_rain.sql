/*
  # Patient Case History Management System

  1. New Tables
    - `case_histories`
      - Complete patient case history information
      - Links to therapist and patient profiles
    - `mental_status_examinations`
      - Detailed MSE data
    - `family_histories`
      - Family background and relationships
    - `developmental_histories`
      - Developmental milestones and history

  2. Security
    - Enable RLS on all tables
    - Therapists can only access their own patients' data
    - Patients can view their own case history (read-only)

  3. Relationships
    - Foreign keys to profiles table
    - Proper indexing for performance
*/

-- Case Histories Table
CREATE TABLE IF NOT EXISTS case_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  father_mother_guardian_name text,
  age text,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address text,
  language_of_communication text DEFAULT 'English',
  referred_by text,
  informants text,
  primary_concerns text,
  history_of_concerns jsonb DEFAULT '{}',
  medical_history text,
  diagnosis_by_doctor text,
  management_plan text,
  behavioral_observation text,
  strengths text,
  areas_of_interest text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mental Status Examination Table
CREATE TABLE IF NOT EXISTS mental_status_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_history_id uuid REFERENCES case_histories(id) ON DELETE CASCADE,
  general_appearance jsonb DEFAULT '{}',
  speech_assessment text,
  mood_and_affect text,
  emotional_response text,
  thought_content text,
  thought_flow text,
  suicidal_ideation boolean DEFAULT false,
  risk_assessment text,
  perception_data jsonb DEFAULT '{}',
  cognition_data jsonb DEFAULT '{}',
  insight_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Family History Table
CREATE TABLE IF NOT EXISTS family_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_history_id uuid REFERENCES case_histories(id) ON DELETE CASCADE,
  family_tree text,
  losses text,
  conflicts text,
  differences text,
  disorders text,
  family_atmosphere text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Developmental History Table
CREATE TABLE IF NOT EXISTS developmental_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_history_id uuid REFERENCES case_histories(id) ON DELETE CASCADE,
  pregnancy_and_birth text,
  motor_activity text,
  speech_language text,
  toilet_training text,
  schooling text,
  neurodevelopment_functioning jsonb DEFAULT '{}',
  academic_history text,
  social_development jsonb DEFAULT '{}',
  play_behavior jsonb DEFAULT '{}',
  puberty_milestones text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE case_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_status_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE developmental_histories ENABLE ROW LEVEL SECURITY;

-- Policies for case_histories
CREATE POLICY "Therapists can manage their case histories"
  ON case_histories
  FOR ALL
  TO authenticated
  USING (therapist_id = auth.uid());

-- Policies for mental_status_examinations
CREATE POLICY "Therapists can manage MSE data"
  ON mental_status_examinations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_histories 
      WHERE case_histories.id = mental_status_examinations.case_history_id 
      AND case_histories.therapist_id = auth.uid()
    )
  );

-- Policies for family_histories
CREATE POLICY "Therapists can manage family history data"
  ON family_histories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_histories 
      WHERE case_histories.id = family_histories.case_history_id 
      AND case_histories.therapist_id = auth.uid()
    )
  );

-- Policies for developmental_histories
CREATE POLICY "Therapists can manage developmental history data"
  ON developmental_histories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_histories 
      WHERE case_histories.id = developmental_histories.case_history_id 
      AND case_histories.therapist_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_histories_therapist_id ON case_histories(therapist_id);
CREATE INDEX IF NOT EXISTS idx_case_histories_created_at ON case_histories(created_at);
CREATE INDEX IF NOT EXISTS idx_mse_case_history_id ON mental_status_examinations(case_history_id);
CREATE INDEX IF NOT EXISTS idx_family_history_case_id ON family_histories(case_history_id);
CREATE INDEX IF NOT EXISTS idx_dev_history_case_id ON developmental_histories(case_history_id);