-- Drop existing table if exists
DROP TABLE IF EXISTS public.therapist CASCADE;

-- Create therapist table
CREATE TABLE public.therapist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    email text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    phone text,
    status text DEFAULT 'active'::text,
    hourly_rate decimal(10,2) NOT NULL DEFAULT 0.00,
    currency text NOT NULL DEFAULT 'EUR',
    payment_info jsonb DEFAULT '{}',
    billing_address text,
    vat_number text,
    fiscal_code text,
    bank_account_info jsonb DEFAULT '{}',
    invoice_prefix text,
    last_invoice_number integer DEFAULT 0
);

-- Indexes to improve payment queries performance
CREATE INDEX IF NOT EXISTS idx_therapist_hourly_rate ON public.therapist(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_therapist_vat_number ON public.therapist(vat_number);
CREATE INDEX IF NOT EXISTS idx_therapist_email ON public.therapist(email);
CREATE INDEX IF NOT EXISTS idx_therapist_status ON public.therapist(status);

-- Field documentation
COMMENT ON TABLE public.therapist IS 'Therapists information including payment details';
COMMENT ON COLUMN public.therapist.id IS 'Unique identifier for the therapist';
COMMENT ON COLUMN public.therapist.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.therapist.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN public.therapist.email IS 'Therapist email address (unique)';
COMMENT ON COLUMN public.therapist.first_name IS 'Therapist first name';
COMMENT ON COLUMN public.therapist.last_name IS 'Therapist last name';
COMMENT ON COLUMN public.therapist.phone IS 'Therapist phone number';
COMMENT ON COLUMN public.therapist.status IS 'Therapist status (active, inactive, etc.)';
COMMENT ON COLUMN public.therapist.hourly_rate IS 'Therapist hourly rate';
COMMENT ON COLUMN public.therapist.currency IS 'Currency used for payments';
COMMENT ON COLUMN public.therapist.payment_info IS 'Additional payment information in JSON format';
COMMENT ON COLUMN public.therapist.billing_address IS 'Billing address';
COMMENT ON COLUMN public.therapist.vat_number IS 'VAT number';
COMMENT ON COLUMN public.therapist.fiscal_code IS 'Fiscal code / Tax ID';
COMMENT ON COLUMN public.therapist.bank_account_info IS 'Bank account information in JSON format';
COMMENT ON COLUMN public.therapist.invoice_prefix IS 'Prefix for invoice numbering';
COMMENT ON COLUMN public.therapist.last_invoice_number IS 'Last invoice number used';

-- Enable Row Level Security (RLS)
ALTER TABLE public.therapist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.therapist
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.therapist
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for therapist's own record" ON public.therapist
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 