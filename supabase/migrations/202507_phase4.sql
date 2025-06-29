-- =============================================================================
-- PHASE 4: Tags + Goals System Migration
-- =============================================================================
-- Aggiunge supporto per tagging automatico delle conversazioni,
-- gestione task/homework e knowledge graph per suggerimenti intelligenti

-- 1.1 Conversation Tags
-- Memorizza tag estratti automaticamente dalle conversazioni chat
CREATE TABLE IF NOT EXISTS public.chat_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id   UUID, -- Riferimento flessibile ai messaggi chat
  client_id TEXT NOT NULL, -- Riferimento flessibile per demo
  tag       TEXT NOT NULL,
  score     NUMERIC CHECK (score >= 0 AND score <= 1) DEFAULT 0.5,
  ts        TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadati aggiuntivi
  extracted_by TEXT DEFAULT 'gemini-ai', -- 'gemini-ai', 'manual', 'rule-based'
  tag_category TEXT, -- 'emotion', 'topic', 'symptom', 'coping-strategy'
  confidence   NUMERIC DEFAULT 0.8
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_chat_tags_client_tag_ts ON public.chat_tags (client_id, tag, ts);
CREATE INDEX IF NOT EXISTS idx_chat_tags_turn_id ON public.chat_tags (turn_id);
CREATE INDEX IF NOT EXISTS idx_chat_tags_score ON public.chat_tags (score DESC);

-- RLS Policy
ALTER TABLE public.chat_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_tags_rls ON public.chat_tags FOR ALL USING (true); -- Permissivo per demo

-- 1.2 Tasks & Progress
-- Sistema di gestione task/homework per clienti
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  due_at      TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Metadati task
  task_type   TEXT DEFAULT 'homework', -- 'homework', 'exercise', 'reflection', 'practice'
  priority    TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  category    TEXT, -- 'mindfulness', 'cbt', 'behavioral', 'emotional-regulation'
  created_by  TEXT, -- ID del terapista che ha creato il task
  
  -- Configurazione completamento
  completion_criteria TEXT, -- Criteri specifici per considerare il task completato
  max_completions INTEGER DEFAULT 1, -- Numero massimo di completamenti (per task ricorrenti)
  
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT valid_task_type CHECK (task_type IN ('homework', 'exercise', 'reflection', 'practice', 'assessment'))
);

-- Progress tracking per i task
CREATE TABLE IF NOT EXISTS public.homework_progress (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id   UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  pct       NUMERIC CHECK (pct >= 0 AND pct <= 100) DEFAULT 0,
  ts        TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dettagli del progresso
  notes     TEXT, -- Note del cliente sul progresso
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10), -- Umore dopo il completamento
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5), -- Difficoltà percepita
  completion_time_minutes INTEGER, -- Tempo impiegato in minuti
  
  -- Metadati
  completed_via TEXT DEFAULT 'manual', -- 'manual', 'auto', 'chat'
  session_context TEXT -- Contesto/ambiente in cui è stato completato
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks (due_at) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_homework_progress_task_client ON public.homework_progress (task_id, client_id, ts DESC);

-- RLS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_rls ON public.tasks FOR ALL USING (true); -- Permissivo per demo
CREATE POLICY homework_progress_rls ON public.homework_progress FOR ALL USING (true); -- Permissivo per demo

-- 1.3 Knowledge Graph Edges
-- Mappa le relazioni tra tag e risorse suggerite
CREATE TABLE IF NOT EXISTS public.kg_edges (
  src_tag      TEXT NOT NULL,
  dst_resource TEXT NOT NULL,
  weight       NUMERIC DEFAULT 1.0 CHECK (weight > 0),
  
  -- Metadati edge
  edge_type    TEXT DEFAULT 'suggests', -- 'suggests', 'triggers', 'helps-with', 'contraindicated'
  confidence   NUMERIC DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sorgente della relazione
  source       TEXT DEFAULT 'expert-knowledge', -- 'expert-knowledge', 'data-driven', 'client-feedback'
  evidence_count INTEGER DEFAULT 1, -- Numero di evidenze che supportano questa relazione
  
  PRIMARY KEY (src_tag, dst_resource, edge_type)
);

-- Indici per lookup rapidi
CREATE INDEX IF NOT EXISTS idx_kg_edges_src_tag ON public.kg_edges (src_tag, weight DESC);
CREATE INDEX IF NOT EXISTS idx_kg_edges_dst_resource ON public.kg_edges (dst_resource);
CREATE INDEX IF NOT EXISTS idx_kg_edges_weight ON public.kg_edges (weight DESC);

-- 1.4 Views per Analytics e Reporting
-- View per top tags settimanali per cliente
CREATE OR REPLACE VIEW public.top_tags_weekly AS
SELECT 
  client_id,
  tag,
  COUNT(*) as frequency,
  AVG(score) as avg_score,
  MAX(ts) as last_seen,
  tag_category
FROM public.chat_tags
WHERE ts >= NOW() - INTERVAL '7 days'
GROUP BY client_id, tag, tag_category
ORDER BY client_id, frequency DESC, avg_score DESC;

-- View per statistiche task completion
CREATE OR REPLACE VIEW public.task_completion_stats AS
SELECT 
  t.client_id,
  t.id as task_id,
  t.title,
  t.task_type,
  t.category,
  COUNT(hp.id) as total_progress_entries,
  COUNT(CASE WHEN hp.pct = 100 THEN 1 END) as completions,
  AVG(hp.pct) as avg_progress,
  MAX(hp.ts) as last_activity,
  CASE 
    WHEN COUNT(CASE WHEN hp.pct = 100 THEN 1 END) >= t.max_completions THEN 'completed'
    WHEN MAX(hp.ts) < NOW() - INTERVAL '7 days' THEN 'stale'
    WHEN t.due_at < NOW() AND COUNT(CASE WHEN hp.pct = 100 THEN 1 END) = 0 THEN 'overdue'
    ELSE 'active'
  END as status
FROM public.tasks t
LEFT JOIN public.homework_progress hp ON t.id = hp.task_id
WHERE NOT t.is_archived
GROUP BY t.client_id, t.id, t.title, t.task_type, t.category, t.max_completions, t.due_at;

-- View per mood trend analysis
CREATE OR REPLACE VIEW public.mood_trend_weekly AS
SELECT 
  client_id,
  DATE_TRUNC('day', ts) as day,
  AVG(mood_after) as avg_mood,
  COUNT(*) as entries_count,
  STDDEV(mood_after) as mood_variability
FROM public.homework_progress
WHERE mood_after IS NOT NULL 
  AND ts >= NOW() - INTERVAL '7 days'
GROUP BY client_id, DATE_TRUNC('day', ts)
ORDER BY client_id, day;

-- 1.5 Populate Initial Knowledge Graph Data
-- Insert base relationships between tags and therapeutic resources
INSERT INTO public.kg_edges (src_tag, dst_resource, weight, edge_type, confidence, source) VALUES
-- Anxiety → Coping techniques
('anxiety', '4-7-8 breathing', 0.9, 'suggests', 0.95, 'expert-knowledge'),
('anxiety', '5-4-3-2-1 grounding', 0.8, 'suggests', 0.90, 'expert-knowledge'),
('anxiety', 'Mindfulness body scan', 0.7, 'suggests', 0.85, 'expert-knowledge'),
('anxiety', 'Progressive muscle relaxation', 0.6, 'suggests', 0.80, 'expert-knowledge'),

-- Depression → Behavioral activities
('depression', 'Behavioral activation', 0.9, 'suggests', 0.95, 'expert-knowledge'),
('depression', 'Gratitude journal', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('depression', 'Light exercise', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('depression', 'Gradual socialization', 0.6, 'suggests', 0.75, 'expert-knowledge'),

-- Stress → Management and relaxation
('stress', 'Time management', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('stress', 'Guided meditation', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('stress', 'STOP technique', 0.6, 'suggests', 0.75, 'expert-knowledge'),

-- Insomnia → Sleep hygiene
('insomnia', 'Sleep hygiene checklist', 0.9, 'suggests', 0.90, 'expert-knowledge'),
('insomnia', 'Progressive relaxation', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('insomnia', 'Sleep diary', 0.7, 'suggests', 0.80, 'expert-knowledge'),

-- Anger → Emotional regulation
('anger', 'Time-out technique', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('anger', 'Cognitive restructuring', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('anger', 'Assertive communication', 0.6, 'suggests', 0.75, 'expert-knowledge'),

-- Relationships → Social skills
('relationships', 'Active listening', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('relationships', 'Healthy boundaries', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('relationships', 'Conflict resolution', 0.6, 'suggests', 0.75, 'expert-knowledge'),

-- Self-esteem → Personal development
('self-esteem', 'Daily success journal', 0.8, 'suggests', 0.85, 'expert-knowledge'),
('self-esteem', 'Self-compassion', 0.7, 'suggests', 0.80, 'expert-knowledge'),
('self-esteem', 'Positive affirmations', 0.6, 'suggests', 0.75, 'expert-knowledge')

ON CONFLICT (src_tag, dst_resource, edge_type) DO UPDATE SET
  weight = EXCLUDED.weight,
  confidence = EXCLUDED.confidence,
  updated_at = NOW();

-- 1.6 Demo Data per Testing
-- Insert some example tasks for demo clients
INSERT INTO public.tasks (client_id, title, description, due_at, task_type, priority, category, completion_criteria) VALUES
('demo-client-1', 'Daily breathing practice', 'Practice the 4-7-8 breathing technique for 5 minutes every morning', NOW() + INTERVAL '7 days', 'practice', 'high', 'mindfulness', 'Complete for 5 consecutive days'),
('demo-client-1', 'Mood diary', 'Record mood 3 times a day with notes on triggers', NOW() + INTERVAL '3 days', 'homework', 'medium', 'emotional-regulation', 'At least 15 diary entries'),
('demo-client-1', 'Grounding exercise', 'Use the 5-4-3-2-1 technique when feeling anxious', NOW() + INTERVAL '5 days', 'exercise', 'high', 'cbt', 'Apply the technique at least 3 times'),

  ('demo-client-2', 'Behavioral activation', 'Plan and engage in one pleasant activity every day', NOW() + INTERVAL '7 days', 'practice', 'medium', 'behavioral', '7 activities completed'),
('demo-client-2', 'Negative thought restructuring', 'Identify and challenge 3 automatic negative thoughts', NOW() + INTERVAL '4 days', 'homework', 'high', 'cbt', 'Analyze at least 9 thoughts'),

('demo-client-3', 'Sleep hygiene', 'Follow sleep hygiene routine for one week', NOW() + INTERVAL '7 days', 'practice', 'high', 'behavioral', 'Follow routine for 6/7 nights')

ON CONFLICT (id) DO NOTHING;

-- Insert some example progress records
INSERT INTO public.homework_progress (task_id, client_id, pct, notes, mood_after, difficulty_rating, completion_time_minutes) 
SELECT 
  t.id,
  t.client_id,
  CASE 
    WHEN random() < 0.3 THEN 100
    WHEN random() < 0.7 THEN FLOOR(random() * 80 + 20)
    ELSE FLOOR(random() * 50)
  END,
  CASE 
    WHEN random() < 0.5 THEN 'Completed without problems'
    ELSE 'A bit difficult but I managed it'
  END,
  FLOOR(random() * 4 + 6), -- Mood between 6-9
  FLOOR(random() * 3 + 2), -- Difficulty between 2-4
  FLOOR(random() * 20 + 10) -- Time between 10-30 minutes
FROM public.tasks t
WHERE random() < 0.6; -- 60% of tasks have progress

-- 1.7 Functions for automation
-- Function to calculate task completion score
CREATE OR REPLACE FUNCTION calculate_task_completion_score(task_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  completion_score NUMERIC;
  max_compl INTEGER;
BEGIN
  SELECT 
    COALESCE(
      (COUNT(CASE WHEN hp.pct = 100 THEN 1 END)::NUMERIC / NULLIF(t.max_completions, 0)) * 100,
      (AVG(hp.pct))
    ),
    t.max_completions
  INTO completion_score, max_compl
  FROM public.tasks t
  LEFT JOIN public.homework_progress hp ON t.id = hp.task_id
  WHERE t.id = task_uuid
  GROUP BY t.max_completions;
  
  RETURN COALESCE(completion_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get suggestions based on most frequent tags
CREATE OR REPLACE FUNCTION get_smart_suggestions(client_uuid TEXT, limit_count INTEGER DEFAULT 3)
RETURNS TABLE(
  tag TEXT,
  suggested_resource TEXT,
  confidence NUMERIC,
  tag_frequency BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.tag,
    kg.dst_resource,
    kg.confidence,
    COUNT(ct.id) as tag_frequency
  FROM public.chat_tags ct
  JOIN public.kg_edges kg ON ct.tag = kg.src_tag
  WHERE ct.client_id = client_uuid
    AND ct.ts >= NOW() - INTERVAL '7 days'
    AND kg.edge_type = 'suggests'
  GROUP BY ct.tag, kg.dst_resource, kg.confidence
  HAVING COUNT(ct.id) >= 2 -- Tag must appear at least 2 times
  ORDER BY COUNT(ct.id) DESC, kg.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kg_edges_updated_at 
  BEFORE UPDATE ON public.kg_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commit e log
DO $$
BEGIN
  RAISE NOTICE 'PHASE 4 Migration completed successfully!';
  RAISE NOTICE 'Created tables: chat_tags, tasks, homework_progress, kg_edges';
  RAISE NOTICE 'Created views: top_tags_weekly, task_completion_stats, mood_trend_weekly';
  RAISE NOTICE 'Populated initial knowledge graph with % rows', (SELECT COUNT(*) FROM public.kg_edges);
  RAISE NOTICE 'Created demo tasks for testing';
END $$; 