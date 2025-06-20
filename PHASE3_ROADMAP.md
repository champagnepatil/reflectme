# 🚀 ReflectMe Phase 3: Advanced Analytics & Biomarkers

**Biomarkers ▸ AI Insights ▸ Micro-Wins ▸ Operations Excellence**

## 🎯 **Vision Overview**

Phase 3 trasforma ReflectMe da sistema di assessment a **piattaforma clinica intelligente** con:
- 📊 **Biomarkers passivi** (steps, sleep, heart rate)
- 🤖 **AI Narrative Summaries** per progress tracking
- 🎉 **Micro-wins detection** per motivation boosts  
- 🔒 **Advanced security** e audit trails

---

## 📊 **1. Database Schema Extension**

### **Supabase SQL Migration: Phase 3 Tables**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 3 DATABASE SCHEMA - Biomarkers, Insights & Micro-Wins
-- ═══════════════════════════════════════════════════════════════════════════

-- 📈 Biometrics hourly data from wearables/phones
CREATE TABLE public.biometrics_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('steps', 'sleep_minutes', 'heart_rate', 'calories')),
  value DECIMAL NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT DEFAULT 'google_fit' CHECK (source IN ('google_fit', 'apple_health', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicates for same hour
  UNIQUE(client_id, metric, date_trunc('hour', recorded_at))
);

-- Indexes for performance
CREATE INDEX idx_biometrics_client_metric_time ON public.biometrics_hourly(client_id, metric, recorded_at DESC);
CREATE INDEX idx_biometrics_source ON public.biometrics_hourly(source, created_at);

-- 🧠 AI-generated progress summaries cache
CREATE TABLE public.summary_cache (
  client_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  generated_by TEXT DEFAULT 'gemini-pro',
  refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 🎉 Micro-wins detection and tracking
CREATE TABLE public.micro_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  win_text TEXT NOT NULL,
  detected_from TEXT, -- 'journal', 'chat', 'assessment_note'
  confidence_score DECIMAL DEFAULT 0.8,
  celebrated BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Full-text search on win content
  win_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', win_text)) STORED
);

CREATE INDEX idx_micro_wins_client_date ON public.micro_wins(client_id, detected_at DESC);
CREATE INDEX idx_micro_wins_search ON public.micro_wins USING GIN(win_vector);

-- 🔒 Comprehensive audit logging
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID, -- Can be NULL for system actions
  actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'api')),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'sync', 'login'
  object_type TEXT NOT NULL, -- 'assessment', 'biometrics', 'summary'
  object_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id, occurred_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, object_type, occurred_at);

-- 🔗 OAuth tokens for health integrations
CREATE TABLE public.health_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_fit', 'apple_health', 'fitbit')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, provider)
);

-- 📊 Materialized view for monthly patterns
CREATE MATERIALIZED VIEW public.patterns_monthly AS
SELECT 
  client_id,
  'assessment' as pattern_type,
  instrument as pattern_value,
  COUNT(*) as frequency,
  AVG(score) as avg_score,
  date_trunc('month', completed_at) as month_period
FROM public.assessment_results ar
JOIN public.assessments a ON ar.assessment_id = a.id
GROUP BY client_id, instrument, date_trunc('month', completed_at)

UNION ALL

SELECT 
  client_id,
  'biometric' as pattern_type,
  metric as pattern_value,
  COUNT(*) as frequency,
  AVG(value) as avg_score,
  date_trunc('month', recorded_at) as month_period
FROM public.biometrics_hourly
GROUP BY client_id, metric, date_trunc('month', recorded_at);

-- Refresh daily
CREATE UNIQUE INDEX idx_patterns_monthly_unique ON public.patterns_monthly(client_id, pattern_type, pattern_value, month_period);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.biometrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summary_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Biometrics policies
CREATE POLICY "Users can manage their biometrics" ON public.biometrics_hourly
  FOR ALL USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
  );

-- Summary cache policies  
CREATE POLICY "Users can view their summaries" ON public.summary_cache
  FOR SELECT USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
  );

-- System can update summaries
CREATE POLICY "System can manage summaries" ON public.summary_cache
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Micro-wins policies
CREATE POLICY "Users can manage their wins" ON public.micro_wins
  FOR ALL USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'therapist')
  );

-- Audit logs (read-only for users, full access for admins)
CREATE POLICY "Users can view their audit logs" ON public.audit_logs
  FOR SELECT USING (
    actor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('therapist', 'admin'))
  );

-- OAuth tokens (private to user)
CREATE POLICY "Users can manage their tokens" ON public.health_oauth_tokens
  FOR ALL USING (client_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- STORED PROCEDURES FOR BUSINESS LOGIC  
-- ═══════════════════════════════════════════════════════════════════════════

-- Get clients with valid OAuth tokens
CREATE OR REPLACE FUNCTION get_clients_with_oauth(provider_name TEXT DEFAULT 'google_fit')
RETURNS TABLE(client_id UUID, access_token TEXT, refresh_token TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT hot.client_id, hot.access_token, hot.refresh_token
  FROM public.health_oauth_tokens hot
  WHERE hot.provider = provider_name
    AND (hot.expires_at IS NULL OR hot.expires_at > now() + INTERVAL '10 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh patterns view
CREATE OR REPLACE FUNCTION refresh_patterns_monthly()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.patterns_monthly;
  
  -- Log the refresh
  INSERT INTO public.audit_logs (actor_type, action, object_type, metadata)
  VALUES ('system', 'refresh', 'patterns_monthly', '{"automated": true}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Detect micro-wins from text
CREATE OR REPLACE FUNCTION detect_micro_win(
  p_client_id UUID,
  p_text TEXT,
  p_source TEXT DEFAULT 'journal'
)
RETURNS UUID AS $$
DECLARE
  win_id UUID;
  confidence DECIMAL := 0.6;
BEGIN
  -- Simple regex-based detection (can be enhanced with ML later)
  IF p_text ~* '(managed|was able|successfully|proud|achieved|completed|overcome|better than)' THEN
    confidence := 0.8;
    
    INSERT INTO public.micro_wins (client_id, win_text, detected_from, confidence_score)
    VALUES (p_client_id, p_text, p_source, confidence)
    RETURNING id INTO win_id;
    
    -- Log the detection
    INSERT INTO public.audit_logs (actor_id, action, object_type, object_id, metadata)
    VALUES (p_client_id, 'detect', 'micro_win', win_id::text, 
            json_build_object('source', p_source, 'confidence', confidence)::jsonb);
    
    RETURN win_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 **2. Netlify Scheduled Functions**

### **Biometrics Sync Worker**

```typescript
// netlify/functions/biometrics-sync.ts
// Scheduled every 2 hours: "0 */2 * * *"

import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Google Fit API types
interface GoogleFitDataPoint {
  value: { doubleVal: number };
  startTimeNanos: string;
  endTimeNanos: string;
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event, context) => {
  console.log('🔄 Starting biometrics sync job...');
  
  try {
    // 1. Get clients with valid OAuth tokens
    const { data: clients, error } = await supabase
      .rpc('get_clients_with_oauth', { provider_name: 'google_fit' });
    
    if (error) throw error;
    
    console.log(`📊 Found ${clients?.length || 0} clients with Google Fit access`);
    
    let totalSynced = 0;
    
    // 2. Sync each client's data
    for (const client of clients || []) {
      try {
        const syncCount = await syncClientBiometrics(client);
        totalSynced += syncCount;
        
        // Log successful sync
        await supabase.from('audit_logs').insert({
          actor_id: client.client_id,
          actor_type: 'system',
          action: 'biometrics_sync',
          object_type: 'biometrics_hourly',
          metadata: { synced_points: syncCount, provider: 'google_fit' }
        });
        
      } catch (clientError) {
        console.error(`❌ Error syncing client ${client.client_id}:`, clientError);
        
        // Log failed sync
        await supabase.from('audit_logs').insert({
          actor_id: client.client_id,
          actor_type: 'system', 
          action: 'biometrics_sync_failed',
          object_type: 'biometrics_hourly',
          metadata: { error: clientError.message, provider: 'google_fit' }
        });
      }
    }
    
    // 3. Publish realtime update
    if (totalSynced > 0) {
      await supabase.channel('biometrics').send({
        type: 'broadcast',
        event: 'biometrics:new',
        payload: { total_synced: totalSynced, timestamp: new Date().toISOString() }
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        clients_processed: clients?.length || 0,
        total_synced: totalSynced,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Biometrics sync job failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function syncClientBiometrics(client: any): Promise<number> {
  const { client_id, access_token } = client;
  
  // Calculate time range (last 24 hours)
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
  
  let syncedCount = 0;
  
  // Sync steps data
  const stepsData = await fetchGoogleFitData(
    access_token,
    'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
    startTime,
    endTime
  );
  
  syncedCount += await upsertBiometricsData(client_id, 'steps', stepsData);
  
  // Sync sleep data
  const sleepData = await fetchGoogleFitData(
    access_token,
    'derived:com.google.sleep.segment:com.google.android.gms:merged',
    startTime,
    endTime
  );
  
  syncedCount += await upsertBiometricsData(client_id, 'sleep_minutes', sleepData);
  
  return syncedCount;
}

async function fetchGoogleFitData(
  accessToken: string,
  dataSourceId: string,
  startTime: Date,
  endTime: Date
): Promise<GoogleFitDataPoint[]> {
  
  const response = await fetch(
    `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${startTime.getTime()}000000-${endTime.getTime()}000000`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Google Fit API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.point || [];
}

async function upsertBiometricsData(
  clientId: string,
  metric: string,
  dataPoints: GoogleFitDataPoint[]
): Promise<number> {
  
  if (!dataPoints.length) return 0;
  
  const biometricsData = dataPoints.map(point => ({
    client_id: clientId,
    metric,
    value: point.value.doubleVal,
    recorded_at: new Date(parseInt(point.startTimeNanos) / 1000000).toISOString(),
    source: 'google_fit'
  }));
  
  // Upsert with conflict resolution
  const { error } = await supabase
    .from('biometrics_hourly')
    .upsert(biometricsData, {
      onConflict: 'client_id,metric,recorded_at',
      ignoreDuplicates: true
    });
  
  if (error) throw error;
  
  return biometricsData.length;
}
```

---

## 🔗 **3. OAuth Health Connect Page**

```tsx
// src/pages/ConnectHealth.tsx
// OAuth integration for Google Fit / Apple Health

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// OAuth configuration
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.sleep.read'
].join(' ');

const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;

export const ConnectHealthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const connectGoogleFit = async () => {
    if (!user) return;
    
    setConnecting('google_fit');
    
    try {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);
      
      // Store PKCE params in session storage
      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_provider', 'google_fit');
      
      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
        redirect_uri: `${window.location.origin}/oauth/callback`,
        response_type: 'code',
        scope: GOOGLE_FIT_SCOPES,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      // Redirect to Google OAuth
      window.location.href = `${GOOGLE_OAUTH_URL}?${params.toString()}`;
      
    } catch (error) {
      console.error('Error initiating Google Fit connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Google Fit. Please try again.",
        variant: "destructive"
      });
      setConnecting(null);
    }
  };
  
  const connectAppleHealth = async () => {
    toast({
      title: "Coming Soon",
      description: "Apple Health integration will be available in the mobile app.",
      variant: "default"
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔗 Connect Your Health Data
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Integrate your fitness and sleep data to get deeper insights into how physical activity affects your mental health.
          </p>
        </div>
        
        {/* Connection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Google Fit Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  🏃‍♂️
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Google Fit</h3>
                  <p className="text-sm text-gray-600">Steps, sleep, and activity data</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <p><strong>What we'll access:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Daily step counts</li>
                    <li>Sleep duration and quality</li>
                    <li>Active minutes and calories</li>
                  </ul>
                </div>
                
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p><strong>Privacy:</strong> Your data is encrypted and only accessible by your therapist.</p>
                </div>
                
                <Button 
                  onClick={connectGoogleFit}
                  disabled={connecting === 'google_fit'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {connecting === 'google_fit' ? (
                    <>🔄 Connecting...</>
                  ) : (
                    <>🔗 Connect Google Fit</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Apple Health Card */}
          <Card className="hover:shadow-lg transition-shadow opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  ❤️
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Apple Health</h3>
                  <p className="text-sm text-gray-600">iPhone health and fitness data</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <p><strong>What we'll access:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Step counts and walking distance</li>
                    <li>Sleep analysis</li>
                    <li>Heart rate variability</li>
                  </ul>
                </div>
                
                <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                  <p><strong>Coming Soon:</strong> Available in our upcoming mobile app for iOS.</p>
                </div>
                
                <Button 
                  onClick={connectAppleHealth}
                  disabled={true}
                  className="w-full bg-gray-400"
                >
                  📱 Mobile App Required
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">
              🎯 Why Connect Health Data?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">📊</div>
                <h4 className="font-semibold mb-2">Holistic Insights</h4>
                <p className="text-sm text-gray-600">
                  See how sleep and activity correlate with your mood and mental health scores.
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">🎯</div>
                <h4 className="font-semibold mb-2">Personalized Care</h4>
                <p className="text-sm text-gray-600">
                  Help your therapist create more targeted interventions based on your lifestyle patterns.
                </p>
              </div>
              <div>
                <div className="text-4xl mb-2">📈</div>
                <h4 className="font-semibold mb-2">Progress Tracking</h4>
                <p className="text-sm text-gray-600">
                  Monitor improvements in both mental and physical health metrics over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            ← Back to Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  );
};

// OAuth utility functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

---

## 🤖 **4. AI Narrative Summary System**

```typescript
// src/services/aiSummaryService.ts
// Gemini-powered progress summaries

import { supabase } from '@/lib/supabaseClient';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

interface ProgressData {
  assessmentResults: any[];
  biometricsData: any[];
  microWins: any[];
  timeframe: string;
}

export class AISummaryService {
  
  /**
   * Generate narrative summary for a client's progress
   */
  static async generateNarrativeSummary(clientId: string): Promise<string> {
    try {
      console.log(`🤖 Generating AI summary for client ${clientId}`);
      
      // 1. Gather progress data from last 30 days
      const progressData = await this.collectProgressData(clientId);
      
      // 2. Generate AI summary
      const summary = await this.callGeminiAPI(progressData);
      
      // 3. Cache the summary
      await this.cacheSummary(clientId, summary);
      
      console.log(`✅ AI summary generated and cached`);
      return summary;
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Fallback to rule-based summary
      return this.generateFallbackSummary(clientId);
    }
  }
  
  /**
   * Get cached summary or generate new one if stale
   */
  static async getCachedSummary(clientId: string): Promise<string> {
    const { data: cached } = await supabase
      .from('summary_cache')
      .select('summary, refreshed_at')
      .eq('client_id', clientId)
      .single();
    
    // If cache is fresh (< 24 hours), return it
    if (cached && this.isCacheFresh(cached.refreshed_at)) {
      return cached.summary;
    }
    
    // Otherwise, generate new summary
    return this.generateNarrativeSummary(clientId);
  }
  
  private static async collectProgressData(clientId: string): Promise<ProgressData> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Fetch assessment results
    const { data: assessments } = await supabase
      .from('assessment_results')
      .select(`
        score,
        severity_level,
        interpretation,
        completed_at,
        assessments!inner(instrument)
      `)
      .eq('assessments.client_id', clientId)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(10);
    
    // Fetch biometrics data
    const { data: biometrics } = await supabase
      .from('biometrics_hourly')
      .select('metric, value, recorded_at')
      .eq('client_id', clientId)
      .gte('recorded_at', thirtyDaysAgo.toISOString())
      .in('metric', ['steps', 'sleep_minutes'])
      .order('recorded_at', { ascending: false });
    
    // Fetch micro-wins
    const { data: wins } = await supabase
      .from('micro_wins')
      .select('win_text, detected_at, confidence_score')
      .eq('client_id', clientId)
      .gte('detected_at', thirtyDaysAgo.toISOString())
      .order('detected_at', { ascending: false })
      .limit(5);
    
    return {
      assessmentResults: assessments || [],
      biometricsData: biometrics || [],
      microWins: wins || [],
      timeframe: '30 days'
    };
  }
  
  private static async callGeminiAPI(data: ProgressData): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    
    const prompt = this.buildProgressPrompt(data);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';
  }
  
  private static buildProgressPrompt(data: ProgressData): string {
    const { assessmentResults, biometricsData, microWins } = data;
    
    // Calculate trends
    const assessmentTrend = this.calculateAssessmentTrend(assessmentResults);
    const activitySummary = this.summarizeBiometrics(biometricsData);
    const winsText = microWins.map(w => w.win_text).join('; ');
    
    return `
As a clinical AI assistant, analyze this patient's 30-day progress and write a concise narrative summary in exactly 3 sentences. Use plain, encouraging language suitable for both patient and therapist.

ASSESSMENT DATA:
${assessmentTrend}

ACTIVITY & SLEEP:
${activitySummary}

MICRO-WINS DETECTED:
${winsText || 'No specific achievements detected'}

Write a 3-sentence summary covering:
1. Overall trend in mental health scores
2. Physical activity/sleep patterns and correlation 
3. Notable achievements or areas for focus

Example format:
"Patient shows steady improvement in depression scores over the past month, with PHQ-9 declining from 14 to 9. Sleep patterns have stabilized at 7-8 hours nightly, and daily steps average 8,500, both correlating with better mood ratings. Notable achievements include successfully completing work presentations and establishing a consistent morning routine."

Response (3 sentences max):
    `.trim();
  }
  
  private static calculateAssessmentTrend(results: any[]): string {
    if (!results.length) return 'No recent assessment data available';
    
    const byInstrument = results.reduce((acc, r) => {
      const instrument = r.assessments.instrument;
      if (!acc[instrument]) acc[instrument] = [];
      acc[instrument].push({ score: r.score, date: r.completed_at });
      return acc;
    }, {});
    
    const trends = Object.entries(byInstrument).map(([instrument, scores]: [string, any[]]) => {
      if (scores.length < 2) return `${instrument}: ${scores[0]?.score || 'N/A'}`;
      
      const latest = scores[0].score;
      const earliest = scores[scores.length - 1].score;
      const change = latest - earliest;
      const direction = change < 0 ? 'improved' : change > 0 ? 'increased' : 'stable';
      
      return `${instrument}: ${earliest} → ${latest} (${direction})`;
    });
    
    return trends.join('; ');
  }
  
  private static summarizeBiometrics(biometrics: any[]): string {
    if (!biometrics.length) return 'No biometric data available';
    
    const stepData = biometrics.filter(b => b.metric === 'steps');
    const sleepData = biometrics.filter(b => b.metric === 'sleep_minutes');
    
    const avgSteps = stepData.length > 0 
      ? Math.round(stepData.reduce((sum, d) => sum + d.value, 0) / stepData.length)
      : 0;
      
    const avgSleep = sleepData.length > 0
      ? Math.round(sleepData.reduce((sum, d) => sum + d.value, 0) / sleepData.length / 60 * 10) / 10
      : 0;
    
    return `Average ${avgSteps} daily steps, ${avgSleep} hours sleep`;
  }
  
  private static async cacheSummary(clientId: string, summary: string): Promise<void> {
    await supabase
      .from('summary_cache')
      .upsert({
        client_id: clientId,
        summary,
        generated_by: 'gemini-pro',
        refreshed_at: new Date().toISOString()
      });
  }
  
  private static async generateFallbackSummary(clientId: string): Promise<string> {
    // Simple rule-based fallback
    const { data: recent } = await supabase
      .from('assessment_results')
      .select('score, assessments!inner(instrument)')
      .eq('assessments.client_id', clientId)
      .order('completed_at', { ascending: false })
      .limit(1);
    
    if (recent?.[0]) {
      const { score, assessments } = recent[0];
      return `Recent ${assessments.instrument} score: ${score}. Continue monitoring progress and maintaining consistent therapy engagement.`;
    }
    
    return 'Patient is actively engaged with assessment tracking. Encourage continued participation for better insights.';
  }
  
  private static isCacheFresh(refreshedAt: string): boolean {
    const cacheAge = Date.now() - new Date(refreshedAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }
}
```

Continuo con gli altri componenti del roadmap Phase 3...

Vuoi che prosegua con l'implementazione completa di tutti i 10 punti del master plan? 🚀 