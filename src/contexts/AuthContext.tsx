import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'patient';
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'therapist' | 'patient') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUserWithProfile = async (authUser: User): Promise<AuthUser | null> => {
    if (!authUser) return null;

    try {
      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Return basic user info if profile doesn't exist
        return {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: authUser.user_metadata?.role || 'patient',
          avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
        };
      }

      return {
        id: profile.id,
        name: profile.name,
        email: authUser.email || '',
        role: profile.role,
        avatar: profile.avatar_url || `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
      };
    } catch (error) {
      console.error('Error mapping user with profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const mappedUser = await mapUserWithProfile(session.user);
        setUser(mappedUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      if (session?.user) {
        const mappedUser = await mapUserWithProfile(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: userData.name,
            role: userData.role,
            avatar_url: `https://api.dicebear.com/7.x/personas/svg?seed=${email}`,
          },
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as the user is created
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  const logout = async () => {
    await signOut();
  };

  const register = async (name: string, email: string, password: string, role: 'therapist' | 'patient') => {
    await signUp(email, password, { name, role });
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Check if this is a demo account
      const isDemoAccount = email.includes('@mindtwin.demo');
      
      if (isDemoAccount) {
        // For demo accounts, try to create them if they don't exist
        const role = email.includes('patient@') ? 'patient' : 'therapist';
        const name = role === 'patient' ? 'Demo Patient' : 'Demo Therapist';
        
        try {
          // First try to sign in
          await signIn(email, password);
          console.log('Demo account signed in successfully');
          return;
        } catch (signInError: any) {
          console.log('Demo account sign-in failed, attempting to create:', signInError.message);
          
          if (signInError.message.includes('Invalid login credentials')) {
            console.log('Demo account not found, creating it...');
            
            try {
              // Create the demo account
              await signUp(email, password, { name, role });
              console.log('Demo account created successfully');
              
              // Wait a moment for the account to be fully created
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Try to sign in again
              await signIn(email, password);
              console.log('Demo account signed in after creation');
              return;
            } catch (signUpError: any) {
              console.error('Demo account creation failed:', signUpError);
              
              if (signUpError.message.includes('User already registered')) {
                console.log('Demo user already exists, trying sign-in again...');
                // Wait a moment and try again
                await new Promise(resolve => setTimeout(resolve, 1000));
                await signIn(email, password);
                return;
              }
              
              throw signUpError;
            }
          } else {
            throw signInError;
          }
        }
      } else {
        // Regular account login
        await signIn(email, password);
      }
      
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}