import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'patient';
  avatar?: string;
  isDemo?: boolean;
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

    const isDemo = authUser.email?.endsWith('@mindtwin.demo') || false;
    const role = isDemo 
      ? authUser.email?.includes('therapist') ? 'therapist' : 'patient'
      : authUser.user_metadata?.role || 'patient';

    // For demo users, always return a valid user object (no database interactions needed)
    if (isDemo) {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || (role === 'patient' ? 'Demo Client' : 'Demo Therapist'),
        email: authUser.email || '',
        role: role as 'therapist' | 'patient',
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
        isDemo: true,
      };
    }

    // For regular users, try to get profile
    try {
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
          role: role as 'therapist' | 'patient',
          avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
          isDemo: false,
        };
      }

      return {
        id: profile.id,
        name: profile.name || (profile.first_name + ' ' + profile.last_name).trim(),
        email: authUser.email || '',
        role: profile.role || role as 'therapist' | 'patient',
        avatar: profile.avatar_url || `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
        isDemo: false,
      };
    } catch (error) {
      console.error('Error mapping user with profile:', error);
      // Always return a fallback user object instead of null
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: role as 'therapist' | 'patient',
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${authUser.email}`,
        isDemo: false,
      };
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔐 Initial session check:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email 
      });
      
      setSession(session);
      if (session?.user) {
        const mappedUser = await mapUserWithProfile(session.user);
        console.log('👤 Mapped user:', { 
          name: mappedUser?.name, 
          role: mappedUser?.role, 
          email: mappedUser?.email 
        });
        setUser(mappedUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { 
        event, 
        userEmail: session?.user?.email,
        hasSession: !!session 
      });
      
      setSession(session);
      if (session?.user) {
        const mappedUser = await mapUserWithProfile(session.user);
        console.log('👤 User mapped after auth change:', { 
          name: mappedUser?.name, 
          role: mappedUser?.role 
        });
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 Signing up user:', { email, role: userData.role });
    
    try {
      // Try to sign up first
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

      if (error) {
        // If user already exists, try to sign in
        if (error.message.includes('User already registered')) {
          console.log('👤 User already exists, attempting sign in');
          return await signIn(email, password);
        }
        throw error;
      }

      if (data.user) {
        // Split name into first_name and last_name
        const nameParts = (userData.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              role: userData.role,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here as the user is created
        }
      }
    } catch (error) {
      console.error('❌ Error during signup:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Signing in user:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    console.log('🚪 Signing out user');
    
    // Check if it's a demo user
    if (user?.isDemo) {
      console.log('🎭 Demo user logout - skipping Supabase signOut');
      setUser(null);
      setSession(null);
      return;
    }
    
    // Regular user logout
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
      console.log('🔐 Attempting login for:', email);
      
      // For demo accounts, create a mock session instead of real auth
      const isDemoAccount = email.endsWith('@mindtwin.demo');
      if (isDemoAccount) {
        console.log('🎭 Demo account detected - creating mock session');
        
        if (password !== 'demo123456') {
          throw new Error('Demo account password is incorrect. Use: demo123456');
        }
        
        let role: 'therapist' | 'patient' = 'patient';
        let name = 'Demo User';
        
        // Determine role and name based on email
        if (email.includes('therapist')) {
          role = 'therapist';
          name = 'Demo Therapist';
        } else if (email.includes('admin')) {
          role = 'therapist'; // Admin uses therapist role but has admin permissions via email
          name = 'Demo Admin';
        } else {
          role = 'patient';
          name = 'Demo Client';
        }
        
        // Create mock demo user
        const mockDemoUser: AuthUser = {
          id: `demo-${role}-${Date.now()}`,
          name,
          email,
          role,
          avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(email)}`,
          isDemo: true,
        };
        
        // Set the user immediately
        setUser(mockDemoUser);
        setLoading(false);
        
        console.log('✅ Demo user logged in successfully:', mockDemoUser);
        return;
      }
      
      // For regular accounts, use normal auth
      await signIn(email, password);
      console.log('✅ Regular login successful');
      
    } catch (error) {
      console.error('❌ Login error:', error);
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