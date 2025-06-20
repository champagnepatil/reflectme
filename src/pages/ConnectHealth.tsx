// 🔗 OAuth Health Connect Page
// Connect Google Fit / Apple Health for biometric data integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// Badge component not available - using inline styles

// OAuth configuration
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read'
].join(' ');

const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;

interface HealthConnection {
  provider: string;
  connected: boolean;
  last_sync?: string;
  scope?: string;
}

export const ConnectHealthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connections, setConnections] = useState<HealthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check existing connections on load
  useEffect(() => {
    if (user) {
      loadExistingConnections();
    }
  }, [user]);
  
  const loadExistingConnections = async () => {
    try {
      const { data: tokens } = await supabase
        .from('health_oauth_tokens')
        .select('provider, created_at, scope')
        .eq('client_id', user?.id);
      
      const connectionStatus: HealthConnection[] = [
        {
          provider: 'google_fit',
          connected: tokens?.some(t => t.provider === 'google_fit') || false,
          last_sync: tokens?.find(t => t.provider === 'google_fit')?.created_at,
          scope: tokens?.find(t => t.provider === 'google_fit')?.scope
        },
        {
          provider: 'apple_health',
          connected: tokens?.some(t => t.provider === 'apple_health') || false,
          last_sync: tokens?.find(t => t.provider === 'apple_health')?.created_at,
          scope: tokens?.find(t => t.provider === 'apple_health')?.scope
        }
      ];
      
      setConnections(connectionStatus);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
      toast.error("Impossibile connettersi a Google Fit. Riprova.");
      setConnecting(null);
    }
  };
  
  const disconnectProvider = async (provider: string) => {
    try {
      const { error } = await supabase
        .from('health_oauth_tokens')
        .delete()
        .eq('client_id', user?.id)
        .eq('provider', provider);
      
      if (error) throw error;
      
      toast.success(`${provider} disconnected successfully.`);
      
      // Reload connections
      await loadExistingConnections();
      
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      toast.error("Unable to disconnect provider.");
    }
  };
  
  const connectAppleHealth = async () => {
    toast.info("Apple Health integration will be available in our mobile app.");
  };
  
  const googleFitConnection = connections.find(c => c.provider === 'google_fit');
  const appleHealthConnection = connections.find(c => c.provider === 'apple_health');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-xl">🔄 Loading connections...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔗 Connect Your Health Data
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Integrate your fitness and sleep data to gain deeper insights into how physical activity affects your mental health.
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
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Google Fit</h3>
                  <p className="text-sm text-gray-600">Steps, sleep, and activity data</p>
                  {googleFitConnection?.connected && (
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mt-1">
                      ✅ Connected
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <p><strong>What we access:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Daily step count</li>
                    <li>Sleep duration and quality</li>
                    <li>Active minutes and calories</li>
                    <li>Heart rate (if available)</li>
                  </ul>
                </div>
                
                {googleFitConnection?.connected && googleFitConnection.last_sync && (
                  <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                    <p><strong>Connected since:</strong> {new Date(googleFitConnection.last_sync).toLocaleDateString('en-US')}</p>
                    <p className="text-xs mt-1">Data is synced automatically every 2 hours.</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p><strong>Privacy:</strong> Your data is encrypted and only accessible by your therapist.</p>
                </div>
                
                {!googleFitConnection?.connected ? (
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
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      onClick={() => disconnectProvider('google_fit')}
                      className="w-full"
                    >
                      🔌 Disconnect Google Fit
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        // Trigger manual sync
                        toast.info("Manual sync initiated...");
                      }}
                      className="w-full text-sm"
                    >
                      🔄 Sync Now
                    </Button>
                  </div>
                )}
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
                  <p className="text-sm text-gray-600">Sanitary and fitness iPhone data</p>
                  <span className="inline-block border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs font-medium mt-1">
                    📱 Coming Soon
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  <p><strong>What we'll access:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Step count and distance traveled</li>
                    <li>Sleep analysis</li>
                    <li>Variability in heart rate</li>
                    <li>Fitness data from Apple Watch</li>
                  </ul>
                </div>
                
                <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                  <p><strong>Coming Soon:</strong> Available in our next mobile app for iOS.</p>
                </div>
                
                <Button 
                  onClick={connectAppleHealth}
                  disabled={true}
                  className="w-full bg-gray-400"
                >
                  📱 Request Mobile App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">
              🎯 Why Connect Your Health Data?
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
        
        {/* Sync Status Card (if connected) */}
        {connections.some(c => c.connected) && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                ✅ Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-700">
                <p className="mb-2">🔄 <strong>Automatic Sync:</strong> Every 2 hours</p>
                <p className="mb-2">📊 <strong>Data Tracked:</strong> Steps, sleep, heart rate, calories</p>
                <p>🔒 <strong>Privacy:</strong> All data is encrypted and protected under GDPR</p>
              </div>
            </CardContent>
          </Card>
        )}
        
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

export default ConnectHealthPage; 