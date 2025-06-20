// 🔄 OAuth Callback Handler
// Handles the OAuth callback from Google Fit and exchanges code for tokens

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    handleOAuthCallback();
  }, []);
  
  const handleOAuthCallback = async () => {
    try {
      // Extract parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code) {
        throw new Error('Authorization code not received');
      }
      
      // Verify state parameter
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Get PKCE parameters
      const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
      const provider = sessionStorage.getItem('oauth_provider');
      
      if (!codeVerifier || !provider) {
        throw new Error('OAuth session data not found');
      }
      
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, codeVerifier);
      
      // Store tokens in database
      await storeOAuthTokens(provider, tokens);
      
      // Clean up session storage
      sessionStorage.removeItem('oauth_code_verifier');
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_provider');
      
      toast.success('🎉 Health data connected successfully!');
      navigate('/client');
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error(`Connection failed: ${error.message}`);
      navigate('/connect-health');
    } finally {
      setProcessing(false);
    }
  };
  
  const exchangeCodeForTokens = async (code: string, codeVerifier: string) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET!,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: `${window.location.origin}/oauth/callback`,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }
    
    return await response.json();
  };
  
  const storeOAuthTokens = async (provider: string, tokens: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;
    
    const { error } = await supabase
      .from('health_oauth_tokens')
      .upsert({
        client_id: user.id,
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Failed to store tokens: ${error.message}`);
    }
    
    // Log successful connection
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'oauth_connect',
      object_type: 'health_oauth_tokens',
      metadata: { provider, scope: tokens.scope }
    });
  };
  
  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🔗 Connecting Your Health Data</h2>
          <p className="text-gray-600">Please wait while we securely connect your account...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
        <p className="text-gray-600 mb-4">There was an issue connecting your health data.</p>
        <button 
          onClick={() => navigate('/connect-health')}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default OAuthCallbackPage; 