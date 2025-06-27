-- AI Safety & Memory Layer (Phase-Guard) Migration
-- Input & output flags
create table if not exists public.guardrail_log (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid,
  direction text check (direction in ('in','out')),
  reason text,
  raw text,
  ts timestamptz default now()
);

-- Short-term vector store
create extension if not exists vector;
create table if not exists public.chat_semantic (
  turn_id uuid primary key,
  client_id uuid,
  ctx_embedding vector(768),
  content text,
  ts timestamptz default now()
);
create index if not exists chat_semantic_idx on public.chat_semantic using ivfflat (ctx_embedding vector_cosine_ops);

-- Long-term archive
create table if not exists public.chat_archive (like public.chat_semantic including all);

-- Alerts
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id),
  reason text,
  details jsonb,
  is_resolved boolean default false,
  ts timestamptz default now()
);

-- Row Level Security for alerts
alter table public.alerts enable row level security;
create policy alerts_rls on public.alerts
  for select using (
    exists (
      select 1 from public.therapist_client_matrix tcm 
      where tcm.therapist_id = auth.uid() 
      and tcm.client_id = alerts.client_id
    )
  );

-- RLS for guardrail_log (therapists can see their clients' logs)
alter table public.guardrail_log enable row level security;
create policy guardrail_log_rls on public.guardrail_log
  for select using (
    exists (
      select 1 from public.therapist_client_matrix tcm 
      where tcm.therapist_id = auth.uid() 
      and tcm.client_id = guardrail_log.client_id
    )
  );

-- RLS for chat_semantic (therapists can see their clients' semantic data)
alter table public.chat_semantic enable row level security;
create policy chat_semantic_rls on public.chat_semantic
  for select using (
    exists (
      select 1 from public.therapist_client_matrix tcm 
      where tcm.therapist_id = auth.uid() 
      and tcm.client_id = chat_semantic.client_id
    )
  );

-- Crisis keywords table for alerting
create table if not exists public.crisis_keywords (
  id uuid primary key default uuid_generate_v4(),
  keyword text unique not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Insert default crisis keywords
insert into public.crisis_keywords (keyword, severity) values
  ('suicide', 'critical'),
  ('kill myself', 'critical'),
  ('want to die', 'critical'),
  ('end it all', 'critical'),
  ('self harm', 'high'),
  ('cut myself', 'high'),
  ('overdose', 'high'),
  ('no reason to live', 'high'),
  ('hopeless', 'medium'),
  ('worthless', 'medium'),
  ('burden', 'medium'),
  ('everyone would be better off', 'medium'),
  ('can''t take it anymore', 'medium'),
  ('tired of living', 'medium')
on conflict (keyword) do nothing; 