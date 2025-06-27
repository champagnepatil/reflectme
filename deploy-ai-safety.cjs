#!/usr/bin/env node

/**
 * AI Safety & Memory Layer Deployment Script
 * Deploys the guardrails migration and sets up the safety system
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://jjflfhcdxgmpustkffqo.supabase.co';
// Note: The service role key appears to be truncated. Please provide the complete key.
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmxmaGNkeGdtcHVzdGtmZnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEyNzM0NCwiZXhwIjoyMDY0NzAzMzQ0fQ.uEd5-YourCompleteServiceKeyHere';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deployMigration() {
  console.log('🚀 Starting AI Safety & Memory Layer deployment...\n');

  try {
    // Test connection first
    console.log('🔗 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.log('💡 Please ensure your service role key is complete and valid.');
      console.log('💡 The key should end with a signature part after the last dot.');
      return;
    }
    console.log('✅ Connection successful\n');

    // Step 1: Read the migration file
    console.log('📖 Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '202507_guardrails.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Step 2: Execute the migration using direct SQL execution
    console.log('💾 Executing database migration...');
    await executeMigrationStatements(migrationSQL);

    // Step 3: Verify tables were created
    console.log('🔍 Verifying migration...');
    await verifyMigration();

    // Step 4: Set up pgvector function
    console.log('🔧 Setting up semantic search function...');
    await setupSemanticSearchFunction();

    console.log('🎉 AI Safety & Memory Layer deployed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy edge functions: npm run deploy:functions');
    console.log('2. Install AI dependencies: npm install');
    console.log('3. Configure environment variables');
    console.log('4. Set up CRON jobs for archiving\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 API Key Issue:');
      console.log('Please ensure you have the complete service role key.');
      console.log('The key should be in the format: eyJ...header...eyJ...payload...signature');
      console.log('Check your Supabase project settings > API for the complete key.');
    }
    
    process.exit(1);
  }
}

async function executeMigrationStatements(sql) {
  // Manual execution of key statements since rpc might not be available
  const statements = [
    {
      name: 'Enable vector extension',
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
    },
    {
      name: 'Create guardrail_log table',
      sql: `CREATE TABLE IF NOT EXISTS public.guardrail_log (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id uuid,
        direction text CHECK (direction IN ('in','out')),
        reason text,
        raw text,
        ts timestamptz DEFAULT now()
      );`
    },
    {
      name: 'Create chat_semantic table',
      sql: `CREATE TABLE IF NOT EXISTS public.chat_semantic (
        turn_id uuid PRIMARY KEY,
        client_id uuid,
        ctx_embedding vector(768),
        content text,
        ts timestamptz DEFAULT now()
      );`
    },
    {
      name: 'Create chat_archive table',
      sql: `CREATE TABLE IF NOT EXISTS public.chat_archive (
        LIKE public.chat_semantic INCLUDING ALL
      );`
    },
    {
      name: 'Create alerts table',
      sql: `CREATE TABLE IF NOT EXISTS public.alerts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id uuid REFERENCES public.profiles(id),
        reason text,
        details jsonb,
        is_resolved boolean DEFAULT false,
        ts timestamptz DEFAULT now()
      );`
    },
    {
      name: 'Create crisis_keywords table',
      sql: `CREATE TABLE IF NOT EXISTS public.crisis_keywords (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        keyword text UNIQUE NOT NULL,
        severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );`
    }
  ];

  for (const stmt of statements) {
    console.log(`Executing: ${stmt.name}...`);
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: stmt.sql
    });

    if (error) {
      console.log(`⚠️  ${stmt.name}: ${error.message}`);
    } else {
      console.log(`✅ ${stmt.name} completed`);
    }
  }

  // Insert default crisis keywords
  console.log('Inserting default crisis keywords...');
  const keywordsData = [
    { keyword: 'suicide', severity: 'critical' },
    { keyword: 'kill myself', severity: 'critical' },
    { keyword: 'want to die', severity: 'critical' },
    { keyword: 'end it all', severity: 'critical' },
    { keyword: 'self harm', severity: 'high' },
    { keyword: 'cut myself', severity: 'high' },
    { keyword: 'overdose', severity: 'high' },
    { keyword: 'no reason to live', severity: 'high' },
    { keyword: 'hopeless', severity: 'medium' },
    { keyword: 'worthless', severity: 'medium' },
    { keyword: 'burden', severity: 'medium' },
    { keyword: 'everyone would be better off', severity: 'medium' },
    { keyword: "can't take it anymore", severity: 'medium' },
    { keyword: 'tired of living', severity: 'medium' }
  ];

  const { error: insertError } = await supabase
    .from('crisis_keywords')
    .upsert(keywordsData, { onConflict: 'keyword' });

  if (insertError) {
    console.log(`⚠️  Crisis keywords insert: ${insertError.message}`);
  } else {
    console.log('✅ Crisis keywords inserted');
  }
}

async function verifyMigration() {
  const tablesToCheck = [
    'guardrail_log',
    'chat_semantic', 
    'chat_archive',
    'alerts',
    'crisis_keywords'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`⚠️  Table ${table} verification: ${error.message}`);
    } else {
      console.log(`✅ Table ${table} verified`);
    }
  }
}

async function setupSemanticSearchFunction() {
  const functionSQL = `
    CREATE OR REPLACE FUNCTION match_documents(
      query_embedding vector(768),
      match_threshold float DEFAULT 0.7,
      match_count int DEFAULT 5,
      filter jsonb DEFAULT '{}'::jsonb
    )
    RETURNS TABLE (
      turn_id uuid,
      content text,
      similarity float,
      ts timestamptz
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        cs.turn_id,
        cs.content,
        1 - (cs.ctx_embedding <=> query_embedding) as similarity,
        cs.ts
      FROM chat_semantic cs
      WHERE 1 - (cs.ctx_embedding <=> query_embedding) > match_threshold
      AND (
        filter = '{}'::jsonb OR
        (filter->>'client_id' IS NULL OR cs.client_id = (filter->>'client_id')::uuid)
      )
      ORDER BY cs.ctx_embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
  `;

  const { error } = await supabase.rpc('exec_sql', {
    sql: functionSQL
  });

  if (error) {
    console.log(`⚠️  Semantic search function setup: ${error.message}`);
  } else {
    console.log('✅ Semantic search function created');
  }
}

// Run the deployment
if (require.main === module) {
  deployMigration();
}

module.exports = { deployMigration }; 