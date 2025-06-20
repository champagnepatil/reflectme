-- Create therapist_client_relations table
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_therapist ON public.therapist_client_relations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_client ON public.therapist_client_relations(client_id);
CREATE INDEX IF NOT EXISTS idx_therapist_client_relations_status ON public.therapist_client_relations(status);

-- Add RLS policies
ALTER TABLE public.therapist_client_relations ENABLE ROW LEVEL SECURITY;

-- Therapists can see their own clients
CREATE POLICY "Therapists can view their clients" ON public.therapist_client_relations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.therapist t
            WHERE t.id = therapist_id AND t.id = auth.uid()
        )
    );

-- Clients can see their own therapists
CREATE POLICY "Clients can view their therapists" ON public.therapist_client_relations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clients c
            WHERE c.id = client_id AND c.id = auth.uid()
        )
    );

-- Insert demo relations
INSERT INTO public.therapist_client_relations 
(therapist_id, client_id, status, session_frequency, notes)
VALUES
    -- Michael Smith (therapist1) -> Emily Taylor (client2)
    ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-b000-000000000002', 'active', 'weekly', 
    '{"treatment_focus": ["Depression management", "Cognitive restructuring"], "preferred_time": "morning"}'::jsonb),

    -- William Johnson (therapist2) -> James Wilson (client1)
    ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-b000-000000000001', 'active', 'biweekly',
    '{"treatment_focus": ["Work-life balance", "Stress management"], "preferred_time": "evening"}'::jsonb),

    -- Emma Brown (therapist3) -> Daniel Anderson (client3)
    ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-b000-000000000003', 'active', 'weekly',
    '{"treatment_focus": ["Social anxiety", "Exposure therapy"], "preferred_time": "afternoon"}'::jsonb),

    -- Sarah Davis (therapist4) -> Olivia Thomas (client4)
    ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-b000-000000000004', 'active', 'weekly',
    '{"treatment_focus": ["PTSD treatment", "Anxiety management"], "preferred_time": "morning"}'::jsonb);

-- Create a view for easier querying of the relationships
CREATE OR REPLACE VIEW public.therapist_client_view AS
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

-- Grant access to authenticated users
GRANT SELECT ON public.therapist_client_view TO authenticated; 