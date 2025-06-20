-- Script per verificare lo stato attuale del database ReflectMe
-- Eseguire nel Supabase SQL Editor

-- 1. Verifica esistenza tabelle
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('assessments', 'assessment_results', 'assessment_reminders', 'notifications')
ORDER BY table_name;

-- 2. Verifica colonne tabelle esistenti
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('assessments', 'assessment_results', 'assessment_reminders', 'notifications')
ORDER BY table_name, ordinal_position;

-- 3. Verifica indici esistenti
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_results', 'assessment_reminders', 'notifications')
ORDER BY tablename, indexname;

-- 4. Verifica RLS abilitato
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_results', 'assessment_reminders', 'notifications');

-- 5. Verifica policies RLS esistenti
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_results', 'assessment_reminders', 'notifications')
ORDER BY tablename, policyname;

-- 6. Verifica storage buckets
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'reports';

-- 7. Verifica storage policies
SELECT 
  *
FROM storage.policies 
WHERE bucket_id = 'reports'; 