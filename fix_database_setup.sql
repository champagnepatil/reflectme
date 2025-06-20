-- Script correttivo per completare il setup del database ReflectMe
-- Gestisce i casi "already exists" in modo sicuro

-- ============================================================================
-- 1. CREAZIONE TABELLE (con IF NOT EXISTS implicito tramite controllo errori)
-- ============================================================================

-- Funzione helper per eseguire comandi solo se necessario
DO $$
BEGIN
    -- Tabella assessments
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assessments' AND table_schema = 'public') THEN
        CREATE TABLE public.assessments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL,
          instrument TEXT NOT NULL CHECK (instrument IN ('PHQ-9', 'GAD-7', 'WHODAS-2.0', 'DSM-5-CC')),
          schedule TEXT NOT NULL CHECK (schedule IN ('biweekly', 'monthly', 'once')),
          next_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        RAISE NOTICE 'Tabella assessments creata';
    ELSE
        RAISE NOTICE 'Tabella assessments già esistente';
    END IF;

    -- Tabella assessment_results
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assessment_results' AND table_schema = 'public') THEN
        CREATE TABLE public.assessment_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
          score DECIMAL NOT NULL,
          raw_json JSONB NOT NULL,
          interpretation TEXT,
          severity_level TEXT CHECK (severity_level IN ('minimal', 'mild', 'moderate', 'moderately-severe', 'severe')),
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        RAISE NOTICE 'Tabella assessment_results creata';
    ELSE
        RAISE NOTICE 'Tabella assessment_results già esistente';
    END IF;

    -- Tabella assessment_reminders
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assessment_reminders' AND table_schema = 'public') THEN
        CREATE TABLE public.assessment_reminders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
          client_id UUID NOT NULL,
          email TEXT NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          magic_link TEXT
        );
        RAISE NOTICE 'Tabella assessment_reminders creata';
    ELSE
        RAISE NOTICE 'Tabella assessment_reminders già esistente';
    END IF;

    -- Tabella notifications
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          data JSONB,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        RAISE NOTICE 'Tabella notifications creata';
    ELSE
        RAISE NOTICE 'Tabella notifications già esistente';
    END IF;
END
$$;

-- ============================================================================
-- 2. CREAZIONE INDICI (solo se non esistono)
-- ============================================================================

DO $$
BEGIN
    -- Indice assessments client/instrument
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assessments_client_instrument') THEN
        CREATE INDEX idx_assessments_client_instrument ON public.assessments(client_id, instrument);
        RAISE NOTICE 'Indice idx_assessments_client_instrument creato';
    ELSE
        RAISE NOTICE 'Indice idx_assessments_client_instrument già esistente';
    END IF;

    -- Indice assessments next_due
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assessments_next_due') THEN
        CREATE INDEX idx_assessments_next_due ON public.assessments(next_due_at);
        RAISE NOTICE 'Indice idx_assessments_next_due creato';
    ELSE
        RAISE NOTICE 'Indice idx_assessments_next_due già esistente';
    END IF;

    -- Indice assessment_results completed
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assessment_results_completed') THEN
        CREATE INDEX idx_assessment_results_completed ON public.assessment_results(completed_at);
        RAISE NOTICE 'Indice idx_assessment_results_completed creato';
    ELSE
        RAISE NOTICE 'Indice idx_assessment_results_completed già esistente';
    END IF;

    -- Indice assessment_results assessment
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_assessment_results_assessment') THEN
        CREATE INDEX idx_assessment_results_assessment ON public.assessment_results(assessment_id);
        RAISE NOTICE 'Indice idx_assessment_results_assessment creato';
    ELSE
        RAISE NOTICE 'Indice idx_assessment_results_assessment già esistente';
    END IF;
END
$$;

-- ============================================================================
-- 3. AGGIUNTA COLONNA LINKED_ASSESSMENT (solo se non esiste)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'linked_assessment_result_id') THEN
        ALTER TABLE public.notes ADD COLUMN linked_assessment_result_id UUID REFERENCES public.assessment_results(id);
        RAISE NOTICE 'Colonna linked_assessment_result_id aggiunta alla tabella notes';
    ELSE
        RAISE NOTICE 'Colonna linked_assessment_result_id già esistente nella tabella notes';
    END IF;
END
$$;

-- ============================================================================
-- 4. ABILITAZIONE RLS (solo se non già abilitato)
-- ============================================================================

DO $$
BEGIN
    -- Abilita RLS per assessments
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessments' AND rowsecurity = true) THEN
        ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS abilitato per assessments';
    ELSE
        RAISE NOTICE 'RLS già abilitato per assessments';
    END IF;

    -- Abilita RLS per assessment_results
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessment_results' AND rowsecurity = true) THEN
        ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS abilitato per assessment_results';
    ELSE
        RAISE NOTICE 'RLS già abilitato per assessment_results';
    END IF;

    -- Abilita RLS per assessment_reminders
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'assessment_reminders' AND rowsecurity = true) THEN
        ALTER TABLE public.assessment_reminders ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS abilitato per assessment_reminders';
    ELSE
        RAISE NOTICE 'RLS già abilitato per assessment_reminders';
    END IF;

    -- Abilita RLS per notifications
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications' AND rowsecurity = true) THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS abilitato per notifications';
    ELSE
        RAISE NOTICE 'RLS già abilitato per notifications';
    END IF;
END
$$;

-- ============================================================================
-- 5. CREAZIONE POLICIES RLS (DROP + CREATE per aggiornare se esistenti)
-- ============================================================================

-- Policy assessments
DROP POLICY IF EXISTS "Users can manage their assessments" ON public.assessments;
CREATE POLICY "Users can manage their assessments" ON public.assessments
  FOR ALL USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
  );

-- Policy assessment_results  
DROP POLICY IF EXISTS "Users can manage their results" ON public.assessment_results;
CREATE POLICY "Users can manage their results" ON public.assessment_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE id = assessment_id AND (
        client_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
      )
    )
  );

-- Policy assessment_reminders
DROP POLICY IF EXISTS "Users can manage their reminders" ON public.assessment_reminders;
CREATE POLICY "Users can manage their reminders" ON public.assessment_reminders
  FOR ALL USING (
    client_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
  );

-- Policy notifications
DROP POLICY IF EXISTS "Users can manage their notifications" ON public.notifications;
CREATE POLICY "Users can manage their notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

RAISE NOTICE 'Tutte le policies RLS sono state create/aggiornate';

-- ============================================================================
-- 6. STORAGE BUCKET (solo se non esiste)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'reports') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);
        RAISE NOTICE 'Storage bucket reports creato';
    ELSE
        RAISE NOTICE 'Storage bucket reports già esistente';
    END IF;
END
$$;

-- Policy storage (DROP + CREATE)
DROP POLICY IF EXISTS "Users can manage their reports" ON storage.objects;
CREATE POLICY "Users can manage their reports" ON storage.objects
  FOR ALL USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

RAISE NOTICE 'Setup database completato con successo! 🎉'; 