/*
  # Create demo accounts for testing

  1. Demo Accounts
    - Creates demo profiles that can be used for testing
    - Patient: patient@mindtwin.demo
    - Therapist: therapist@mindtwin.demo
    
  2. Note
    - These accounts need to be created through Supabase Auth API
    - This migration only ensures the profiles table is ready
    - The actual user creation should be done via the application signup flow
*/

-- Ensure profiles table exists and is properly configured
DO $$
BEGIN
  -- Check if profiles table exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      name text NOT NULL,
      role text NOT NULL CHECK (role IN ('therapist', 'patient')),
      avatar_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view own profile"
      ON profiles
      FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id);

    CREATE POLICY "New users can create profile"
      ON profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create a function to setup demo data (to be called after user creation)
CREATE OR REPLACE FUNCTION setup_demo_profiles()
RETURNS void AS $$
BEGIN
  -- This function can be called after demo users are created via Auth API
  -- It will ensure proper profile setup for demo accounts
  
  -- Insert demo patient profile if user exists
  INSERT INTO public.profiles (
    id,
    name,
    role,
    avatar_url,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    'Demo Patient',
    'patient',
    'https://api.dicebear.com/7.x/personas/svg?seed=patient@mindtwin.demo',
    now(),
    now()
  FROM auth.users u 
  WHERE u.email = 'patient@mindtwin.demo'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);
  
  -- Insert demo therapist profile if user exists
  INSERT INTO public.profiles (
    id,
    name,
    role,
    avatar_url,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    'Demo Therapist',
    'therapist',
    'https://api.dicebear.com/7.x/personas/svg?seed=therapist@mindtwin.demo',
    now(),
    now()
  FROM auth.users u 
  WHERE u.email = 'therapist@mindtwin.demo'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo case history data for the therapist (if demo accounts exist)
CREATE OR REPLACE FUNCTION setup_demo_case_histories()
RETURNS void AS $$
DECLARE
  therapist_uuid uuid;
BEGIN
  -- Get the demo therapist ID
  SELECT id INTO therapist_uuid 
  FROM public.profiles 
  WHERE email IN (
    SELECT email FROM auth.users WHERE email = 'therapist@mindtwin.demo'
  ) AND role = 'therapist';
  
  -- Only proceed if demo therapist exists
  IF therapist_uuid IS NOT NULL THEN
    -- Insert sample case history
    INSERT INTO case_histories (
      therapist_id,
      patient_name,
      age,
      gender,
      address,
      language_of_communication,
      primary_concerns,
      history_of_concerns,
      medical_history,
      management_plan,
      behavioral_observation,
      strengths
    ) VALUES (
      therapist_uuid,
      'Sarah Johnson',
      '28',
      'female',
      'New York, NY',
      'English',
      'Experiencing anxiety and panic attacks, particularly in social situations and at work. Reports difficulty sleeping and concentrating.',
      '{"onset": "gradual", "duration": "6 months", "stressful_factors": "Work promotion, relationship changes"}',
      'No significant medical history. Currently not on any medications.',
      'Cognitive Behavioral Therapy focusing on anxiety management, breathing techniques, and gradual exposure therapy.',
      'Patient appears anxious but cooperative. Good eye contact. Speaks clearly about concerns.',
      'Strong support system, motivated for treatment, good insight into condition'
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO case_histories (
      therapist_id,
      patient_name,
      age,
      gender,
      address,
      language_of_communication,
      primary_concerns,
      history_of_concerns,
      medical_history,
      management_plan,
      behavioral_observation,
      strengths
    ) VALUES (
      therapist_uuid,
      'Michael Chen',
      '35',
      'male',
      'San Francisco, CA',
      'English',
      'Depression following job loss. Reports low mood, loss of interest in activities, and feelings of worthlessness.',
      '{"onset": "acute", "duration": "3 months", "stressful_factors": "Job loss, financial stress"}',
      'History of depression in family. Previously responded well to therapy.',
      'Supportive therapy combined with behavioral activation. Focus on job search skills and mood monitoring.',
      'Appears sad but engaged. Maintains good rapport. Motivated for change.',
      'Previous therapy success, strong family support, good problem-solving skills'
    ) ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Demo users should be created through the application's registration flow
-- or via Supabase Auth API, not directly in the database