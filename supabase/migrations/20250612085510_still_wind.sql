/*
  # Patient Monitoring System

  1. New Tables
    - `monitoring_entries`
      - Stores daily wellness check-in data from patients
      - Links to user profiles for security
      - Includes all wellness metrics and notes

  2. Security
    - Enable RLS on monitoring_entries table
    - Patients can only access their own data
    - Therapists can access their clients' data (when client relationships are implemented)

  3. Indexes
    - Optimize queries by client_id and entry_date
    - Support efficient date range queries
*/

-- Create monitoring_entries table
CREATE TABLE IF NOT EXISTS monitoring_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  water_intake integer NOT NULL CHECK (water_intake >= 0 AND water_intake <= 10),
  sunlight_exposure integer NOT NULL CHECK (sunlight_exposure >= 0 AND sunlight_exposure <= 10),
  healthy_meals integer NOT NULL CHECK (healthy_meals >= 0 AND healthy_meals <= 10),
  exercise_duration text NOT NULL CHECK (exercise_duration IN ('none', 'under15', 'under30', 'above30')),
  sleep_hours integer NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 10),
  social_interactions integer NOT NULL CHECK (social_interactions >= 0 AND social_interactions <= 10),
  task_notes text DEFAULT '',
  task_remarks text DEFAULT '',
  entry_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE monitoring_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own monitoring entries"
  ON monitoring_entries
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monitoring_entries_client_id ON monitoring_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_entries_entry_date ON monitoring_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_monitoring_entries_client_date ON monitoring_entries(client_id, entry_date);

-- Create unique constraint to prevent duplicate entries for the same date
CREATE UNIQUE INDEX IF NOT EXISTS idx_monitoring_entries_client_date_unique 
  ON monitoring_entries(client_id, entry_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monitoring_entries_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_monitoring_entries_updated_at
  BEFORE UPDATE ON monitoring_entries
  FOR EACH ROW EXECUTE FUNCTION update_monitoring_entries_updated_at();