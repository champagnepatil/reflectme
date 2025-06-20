-- Create demo users in auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES 
  -- Demo Therapist 1 (also a client)
  ('00000000-0000-4000-a000-000000000001', 'therapist1@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Therapist 2
  ('00000000-0000-4000-a000-000000000002', 'therapist2@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Therapist 3
  ('00000000-0000-4000-a000-000000000003', 'therapist3@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Therapist 4
  ('00000000-0000-4000-a000-000000000004', 'therapist4@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Client 1 (also a therapist)
  ('00000000-0000-4000-b000-000000000001', 'client1@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Client 2
  ('00000000-0000-4000-b000-000000000002', 'client2@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Client 3
  ('00000000-0000-4000-b000-000000000003', 'client3@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  -- Demo Client 4
  ('00000000-0000-4000-b000-000000000004', 'client4@mindtwin.demo', '$2a$10$Q7GXLI5CWDigE8xzR5FX5.Q5OzaE6T5KH2N.cqZW4BTgHHg8ZGPXS', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    first_name text,
    last_name text,
    email text UNIQUE,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for user's own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create profiles for all users
INSERT INTO public.profiles (id, first_name, last_name, email, phone, created_at, updated_at)
VALUES
  -- Therapist profiles
  ('00000000-0000-4000-a000-000000000001', 'Mario', 'Rossi', 'therapist1@mindtwin.demo', '+39123456789', now(), now()),
  ('00000000-0000-4000-a000-000000000002', 'Luigi', 'Verdi', 'therapist2@mindtwin.demo', '+39123456790', now(), now()),
  ('00000000-0000-4000-a000-000000000003', 'Anna', 'Bianchi', 'therapist3@mindtwin.demo', '+39123456791', now(), now()),
  ('00000000-0000-4000-a000-000000000004', 'Laura', 'Neri', 'therapist4@mindtwin.demo', '+39123456792', now(), now()),
  -- Client profiles
  ('00000000-0000-4000-b000-000000000001', 'Marco', 'Ferrari', 'client1@mindtwin.demo', '+39123456793', now(), now()),
  ('00000000-0000-4000-b000-000000000002', 'Sofia', 'Romano', 'client2@mindtwin.demo', '+39123456794', now(), now()),
  ('00000000-0000-4000-b000-000000000003', 'Luca', 'Marino', 'client3@mindtwin.demo', '+39123456795', now(), now()),
  ('00000000-0000-4000-b000-000000000004', 'Giulia', 'Costa', 'client4@mindtwin.demo', '+39123456796', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create therapist records
INSERT INTO public.therapist (id, email, first_name, last_name, phone, status, hourly_rate, currency, payment_info, billing_address, vat_number, fiscal_code, bank_account_info, invoice_prefix, last_invoice_number)
VALUES
  -- Therapist 1 (also a client)
  ('00000000-0000-4000-a000-000000000001', 'therapist1@mindtwin.demo', 'Mario', 'Rossi', '+39123456789', 'active', 80.00, 'EUR', 
   '{"payment_methods": ["bank_transfer", "credit_card"]}',
   'Via Roma 1, 20121 Milano', 'IT12345678901', 'RSSMRA80A01F205X',
   '{"iban": "IT60X0542811101000000123456", "bank_name": "Banca Example"}',
   'INV-2025-MR', 0),
  
  -- Therapist 2
  ('00000000-0000-4000-a000-000000000002', 'therapist2@mindtwin.demo', 'Luigi', 'Verdi', '+39123456790', 'active', 75.00, 'EUR',
   '{"payment_methods": ["bank_transfer"]}',
   'Via Dante 2, 20121 Milano', 'IT12345678902', 'VRDLGU75A01F205Y',
   '{"iban": "IT60X0542811101000000123457", "bank_name": "Banca Example"}',
   'INV-2025-LV', 0),
  
  -- Therapist 3
  ('00000000-0000-4000-a000-000000000003', 'therapist3@mindtwin.demo', 'Anna', 'Bianchi', '+39123456791', 'active', 90.00, 'EUR',
   '{"payment_methods": ["bank_transfer", "paypal"]}',
   'Via Montenapoleone 3, 20121 Milano', 'IT12345678903', 'BNCNNA85A41F205Z',
   '{"iban": "IT60X0542811101000000123458", "bank_name": "Banca Example"}',
   'INV-2025-AB', 0),
  
  -- Therapist 4
  ('00000000-0000-4000-a000-000000000004', 'therapist4@mindtwin.demo', 'Laura', 'Neri', '+39123456792', 'active', 85.00, 'EUR',
   '{"payment_methods": ["bank_transfer", "credit_card", "paypal"]}',
   'Via Vittorio Emanuele 4, 20121 Milano', 'IT12345678904', 'NRELRA82A41F205W',
   '{"iban": "IT60X0542811101000000123459", "bank_name": "Banca Example"}',
   'INV-2025-LN', 0)
ON CONFLICT (id) DO NOTHING;

-- Create clients table if not exists
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    email text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    phone text,
    status text DEFAULT 'active'::text,
    preferred_therapist_id uuid REFERENCES public.therapist(id),
    emergency_contact jsonb DEFAULT '{}'::jsonb,
    medical_info jsonb DEFAULT '{}'::jsonb
);

-- Add indexes for clients table
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_preferred_therapist ON public.clients(preferred_therapist_id);

-- Add RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.clients
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.clients
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for client's own record" ON public.clients
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Insert demo clients
INSERT INTO public.clients (id, email, first_name, last_name, phone, status, preferred_therapist_id, emergency_contact, medical_info)
VALUES
  -- Client 1 (also a therapist)
  ('00000000-0000-4000-b000-000000000001', 'client1@mindtwin.demo', 'Marco', 'Ferrari', '+39123456793', 'active', '00000000-0000-4000-a000-000000000002',
   '{"name": "Maria Ferrari", "relationship": "Wife", "phone": "+39123456797"}',
   '{"allergies": ["None"], "medications": ["None"], "conditions": ["Anxiety", "Stress"]}'),
  
  -- Client 2
  ('00000000-0000-4000-b000-000000000002', 'client2@mindtwin.demo', 'Sofia', 'Romano', '+39123456794', 'active', '00000000-0000-4000-a000-000000000001',
   '{"name": "Paolo Romano", "relationship": "Husband", "phone": "+39123456798"}',
   '{"allergies": ["Penicillin"], "medications": ["Antidepressants"], "conditions": ["Depression"]}'),
  
  -- Client 3
  ('00000000-0000-4000-b000-000000000003', 'client3@mindtwin.demo', 'Luca', 'Marino', '+39123456795', 'active', '00000000-0000-4000-a000-000000000003',
   '{"name": "Giuseppe Marino", "relationship": "Father", "phone": "+39123456799"}',
   '{"allergies": ["None"], "medications": ["None"], "conditions": ["Social Anxiety"]}'),
  
  -- Client 4
  ('00000000-0000-4000-b000-000000000004', 'client4@mindtwin.demo', 'Giulia', 'Costa', '+39123456796', 'active', '00000000-0000-4000-a000-000000000004',
   '{"name": "Anna Costa", "relationship": "Mother", "phone": "+39123456800"}',
   '{"allergies": ["None"], "medications": ["Anxiolytics"], "conditions": ["PTSD", "Anxiety"]}')
ON CONFLICT (id) DO NOTHING; 