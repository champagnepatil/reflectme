-- Translation Migration: Convert all Italian content to English
-- This migration updates existing data to use English instead of Italian

-- Update existing chat tags from Italian to English
UPDATE chat_tags SET tag = 'anxiety' WHERE tag = 'ansia';
UPDATE chat_tags SET tag = 'sadness' WHERE tag = 'tristezza';
UPDATE chat_tags SET tag = 'anger' WHERE tag = 'rabbia';
UPDATE chat_tags SET tag = 'work' WHERE tag = 'lavoro';
UPDATE chat_tags SET tag = 'relationships' WHERE tag = 'relazioni';
UPDATE chat_tags SET tag = 'stress' WHERE tag = 'stress'; -- Already English
UPDATE chat_tags SET tag = 'depression' WHERE tag = 'depressione';
UPDATE chat_tags SET tag = 'low-energy' WHERE tag = 'energia-bassa';
UPDATE chat_tags SET tag = 'conflict' WHERE tag = 'conflitto';
UPDATE chat_tags SET tag = 'worry' WHERE tag = 'preoccupazione';
UPDATE chat_tags SET tag = 'demanding-boss' WHERE tag = 'capo-esigente';

-- Update task titles and descriptions
UPDATE tasks SET 
  title = 'Daily breathing practice',
  description = 'Practice the 4-7-8 breathing technique for 5 minutes every morning',
  completion_criteria = 'Complete for 5 consecutive days'
WHERE title = 'Pratica respirazione quotidiana';

UPDATE tasks SET 
  title = 'Mood diary',
  description = 'Record mood 3 times a day with notes on triggers',
  completion_criteria = 'At least 15 diary entries'
WHERE title = 'Diario degli stati d''animo';

UPDATE tasks SET 
  title = 'Grounding exercise',
  description = 'Use the 5-4-3-2-1 technique when feeling anxious',
  completion_criteria = 'Apply the technique at least 3 times'
WHERE title = 'Esercizio di grounding';

UPDATE tasks SET 
  title = 'Behavioral activation',
  description = 'Plan and engage in one pleasant activity every day',
  completion_criteria = '7 activities completed'
WHERE title = 'Attivazione comportamentale';

UPDATE tasks SET 
  title = 'Personalized task',
  description = 'Custom therapeutic task based on individual needs',
  completion_criteria = 'Meet specific goals as defined by therapist'
WHERE title = 'Task Personalizzato';

-- Update therapy technique recommendations
UPDATE therapy_recommendations SET 
  technique = 'Behavioral activation' 
WHERE technique = 'Attivazione comportamentale';

UPDATE therapy_recommendations SET 
  technique = 'Cognitive restructuring' 
WHERE technique = 'Ristrutturazione cognitiva';

UPDATE therapy_recommendations SET 
  technique = 'Time-out technique' 
WHERE technique = 'Tecnica time-out';

UPDATE therapy_recommendations SET 
  technique = 'Assertive communication' 
WHERE technique = 'Comunicazione assertiva';

UPDATE therapy_recommendations SET 
  technique = 'Breathing exercises' 
WHERE technique = 'Esercizi di respirazione';

UPDATE therapy_recommendations SET 
  technique = 'Progressive muscle relaxation' 
WHERE technique = 'Rilassamento muscolare progressivo';

UPDATE therapy_recommendations SET 
  technique = 'Mindfulness meditation' 
WHERE technique = 'Meditazione mindfulness';

-- Update trigger conditions from Italian to English
UPDATE therapy_recommendations SET trigger_condition = 'depression' WHERE trigger_condition = 'depressione';
UPDATE therapy_recommendations SET trigger_condition = 'anxiety' WHERE trigger_condition = 'ansia';
UPDATE therapy_recommendations SET trigger_condition = 'anger' WHERE trigger_condition = 'rabbia';
UPDATE therapy_recommendations SET trigger_condition = 'stress' WHERE trigger_condition = 'stress'; -- Already English
UPDATE therapy_recommendations SET trigger_condition = 'sadness' WHERE trigger_condition = 'tristezza';

-- Add some additional English tag mappings for comprehensive coverage
INSERT INTO therapy_recommendations (trigger_condition, technique, confidence, recommendation_type, effectiveness_score, knowledge_source) VALUES
('anxiety', 'Deep breathing exercises', 0.9, 'suggests', 0.95, 'expert-knowledge'),
('anxiety', 'Progressive muscle relaxation', 0.8, 'suggests', 0.90, 'expert-knowledge'),
('anxiety', 'Cognitive restructuring', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('anxiety', 'Grounding techniques', 0.9, 'suggests', 0.92, 'expert-knowledge'),

('depression', 'Behavioral activation', 0.9, 'suggests', 0.95, 'expert-knowledge'),
('depression', 'Activity scheduling', 0.8, 'suggests', 0.88, 'expert-knowledge'),
('depression', 'Social connection', 0.7, 'suggests', 0.82, 'expert-knowledge'),

('anger', 'Time-out technique', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('anger', 'Cognitive restructuring', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('anger', 'Assertive communication', 0.6, 'suggests', 0.75, 'expert-knowledge'),

('stress', 'Stress management techniques', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('stress', 'Time management', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('stress', 'Relaxation techniques', 0.8, 'suggests', 0.88, 'expert-knowledge')

ON CONFLICT (trigger_condition, technique) DO NOTHING;

-- Update any remaining Italian phrases in client notes or other text fields
UPDATE client_profiles SET notes = REPLACE(notes, 'ansia', 'anxiety') WHERE notes LIKE '%ansia%';
UPDATE client_profiles SET notes = REPLACE(notes, 'depressione', 'depression') WHERE notes LIKE '%depressione%';
UPDATE client_profiles SET notes = REPLACE(notes, 'stress', 'stress') WHERE notes LIKE '%stress%';
UPDATE client_profiles SET notes = REPLACE(notes, 'rabbia', 'anger') WHERE notes LIKE '%rabbia%';

-- Clean up any duplicate recommendations that might have been created
DELETE FROM therapy_recommendations a USING therapy_recommendations b 
WHERE a.id > b.id 
AND a.trigger_condition = b.trigger_condition 
AND a.technique = b.technique; 