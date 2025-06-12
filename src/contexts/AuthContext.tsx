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
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError && signInError.message.includes('Invalid login credentials')) {
            console.log('Demo account not found, creating it...');
            
            // Create the demo account
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name,
                  role,
                },
                emailRedirectTo: undefined, // Disable email confirmation for demo
              },
            });

            // Handle the case where user already exists
            if (signUpError && signUpError.message.includes('User already registered')) {
              console.log('Demo user already exists, attempting sign-in...');
              
              // Try to sign in again since the user exists
              const { error: retrySignInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (retrySignInError) {
                console.error('Retry sign-in failed:', retrySignInError);
                throw retrySignInError;
              }
              
              console.log('Successfully signed in existing demo user');
              return;
            } else if (signUpError) {
              console.error('Demo account creation failed:', signUpError);
              throw signUpError;
            }

            if (signUpData.user) {
              console.log('Demo user created:', signUpData.user.id);
              
              // Create profile for the demo user
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: signUpData.user.id,
                    name,
                    role,
                    avatar_url: `https://api.dicebear.com/7.x/personas/svg?seed=${email}`,
                  },
                ], { onConflict: 'id' });

              if (profileError) {
                console.error('Profile creation error:', profileError);
              }

              // If user was created but not automatically signed in, try to sign in
              if (!signUpData.session) {
                console.log('Attempting sign-in after demo account creation...');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a moment
                
                const { error: secondSignInError } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });

                if (secondSignInError) {
                  console.error('Second sign-in attempt failed:', secondSignInError);
                  throw new Error('Demo account created but sign-in failed. Please try logging in again.');
                }
              }
            }
          } else if (signInError) {
            throw signInError;
          }
        } catch (demoError) {
          console.error('Demo account handling error:', demoError);
          throw demoError;
        }
      } else {
        // Regular account login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
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