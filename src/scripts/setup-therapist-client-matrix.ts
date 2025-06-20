import { Client } from 'pg';

async function setupTherapistClientMatrix() {
  const client = new Client({
    host: 'db.jjflfhcdxgmpustkffqo.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Annarella91!',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database');

    // 1. Crea la tabella delle relazioni
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.therapist_client_relations (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        therapist_id uuid REFERENCES public.therapist(id) NOT NULL,
        client_id uuid REFERENCES public.clients(id) NOT NULL,
        status text DEFAULT 'active'::text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        start_date date DEFAULT CURRENT_DATE,
        end_date date,
        session_frequency text DEFAULT 'weekly',
        notes jsonb DEFAULT '{}'::jsonb,
        UNIQUE(therapist_id, client_id)
      );

      -- Indici
      CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_therapist ON public.therapist_client_relations(therapist_id);
      CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_client ON public.therapist_client_relations(client_id);
      CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_status ON public.therapist_client_relations(status);

      -- Abilita RLS
      ALTER TABLE public.therapist_client_relations ENABLE ROW LEVEL SECURITY;

      -- Policy: i terapeuti vedono i propri clienti
      DROP POLICY IF EXISTS "Therapists can view their clients" ON public.therapist_client_relations;
      CREATE POLICY "Therapists can view their clients" ON public.therapist_client_relations
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.therapist t
            WHERE t.id = therapist_id AND t.id = auth.uid()
          )
        );

      -- Policy: i clienti vedono i propri terapeuti
      DROP POLICY IF EXISTS "Clients can view their therapists" ON public.therapist_client_relations;
      CREATE POLICY "Clients can view their therapists" ON public.therapist_client_relations
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = client_id AND c.id = auth.uid()
          )
        );

      -- Vista per la matrice
      DROP VIEW IF EXISTS public.therapist_client_view;
      CREATE VIEW public.therapist_client_view AS
      SELECT 
        tcr.id as relation_id,
        t.id as therapist_id,
        t.first_name as therapist_first_name,
        t.last_name as therapist_last_name,
        t.email as therapist_email,
        c.id as client_id,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email,
        tcr.status,
        tcr.session_frequency,
        tcr.start_date,
        tcr.end_date,
        tcr.notes
      FROM 
        public.therapist_client_relations tcr
        JOIN public.therapist t ON t.id = tcr.therapist_id
        JOIN public.clients c ON c.id = tcr.client_id
      WHERE 
        tcr.status = 'active';

      ALTER VIEW public.therapist_client_view SECURITY INVOKER;
      GRANT SELECT ON public.therapist_client_view TO authenticated;
      
      DROP POLICY IF EXISTS "Users can view their own relationships" ON public.therapist_client_view;
      CREATE POLICY "Users can view their own relationships" ON public.therapist_client_view
        FOR SELECT TO authenticated
        USING (
          auth.uid() IN (therapist_id, client_id)
        );
    `);

    console.log('✅ Tabella e vista create con successo');

    // 2. Inserisci dati demo
    await client.query(`
      INSERT INTO public.therapist_client_relations 
      (therapist_id, client_id, status, session_frequency, notes)
      VALUES
        ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-b000-000000000002', 'active', 'weekly', 
        '{"treatment_focus": ["Depression management", "Cognitive restructuring"], "preferred_time": "morning"}'::jsonb),
        
        ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-b000-000000000001', 'active', 'biweekly',
        '{"treatment_focus": ["Work-life balance", "Stress management"], "preferred_time": "evening"}'::jsonb),
        
        ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-b000-000000000003', 'active', 'weekly',
        '{"treatment_focus": ["Social anxiety", "Exposure therapy"], "preferred_time": "afternoon"}'::jsonb),
        
        ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-b000-000000000004', 'active', 'weekly',
        '{"treatment_focus": ["PTSD treatment", "Anxiety management"], "preferred_time": "morning"}'::jsonb)
      ON CONFLICT (therapist_id, client_id) DO NOTHING;
    `);

    console.log('✅ Dati demo inseriti con successo');

  } catch (error) {
    console.error('❌ Errore durante il setup:', error);
  } finally {
    await client.end();
    console.log('✅ Connessione chiusa');
  }
}

setupTherapistClientMatrix(); 