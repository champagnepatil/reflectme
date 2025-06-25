-- Mood Entries Table
create table if not exists public.mood_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  mood_score int not null,
  trigger text,
  notes text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_mood_entries_user_id on public.mood_entries(user_id);
create index if not exists idx_mood_entries_created_at on public.mood_entries(created_at);

-- Journal Entries Table
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  mood_score int,
  tags text[],
  created_at timestamp with time zone default now()
);
create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);
create index if not exists idx_journal_entries_created_at on public.journal_entries(created_at);

-- AI Suggestions Log Table
create table if not exists public.ai_suggestions_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  suggestion_id text not null,
  context text,
  accepted boolean,
  feedback text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_ai_suggestions_log_user_id on public.ai_suggestions_log(user_id);
create index if not exists idx_ai_suggestions_log_created_at on public.ai_suggestions_log(created_at); 