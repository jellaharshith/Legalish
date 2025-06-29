import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { setSentryUser, clearSentryUser, addSentryBreadcrumb } from '@/lib/sentry';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        // Check for specific refresh token errors
        if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
          // Clear all Supabase auth tokens from localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb:') && key.includes('-auth-token')) {
              localStorage.removeItem(key);
            }
          });
          
          // Sign out to ensure server-side invalidation
          await supabase.auth.signOut();
          
          // Force reload to re-initialize with clean state
          window.location.reload();
          return;
        }
        
        // For other errors, just sign out normally
        await supabase.auth.signOut();
        setUser(null);
        clearSentryUser();
      } else if (!session) {
        // No session, clear state
        setUser(null);
        clearSentryUser();
      } else {
        setUser(session.user);
        setSentryUser({ id: session.user.id, email: session.user.email });
        addSentryBreadcrumb('User session restored', 'auth');
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        setSentryUser({ id: session.user.id, email: session.user.email });
        addSentryBreadcrumb(`User ${event}`, 'auth');
      } else {
        setUser(null);
        clearSentryUser();
        if (event === 'SIGNED_OUT') {
          addSentryBreadcrumb('User signed out', 'auth');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    addSentryBreadcrumb('Sign in attempt', 'auth');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      addSentryBreadcrumb('Sign in failed', 'auth', 'error');
      throw error;
    }
    addSentryBreadcrumb('Sign in successful', 'auth');
  };

  const signUp = async (email: string, password: string) => {
    addSentryBreadcrumb('Sign up attempt', 'auth');
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      addSentryBreadcrumb('Sign up failed', 'auth', 'error');
      throw error;
    }
    addSentryBreadcrumb('Sign up successful', 'auth');
  };

  const signInWithGoogle = async () => {
    addSentryBreadcrumb('Google sign in attempt', 'auth');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/summary`,
      },
    });
    if (error) {
      addSentryBreadcrumb('Google sign in failed', 'auth', 'error');
      throw error;
    }
  };

  const signOut = async () => {
    addSentryBreadcrumb('Sign out attempt', 'auth');
    const { error } = await supabase.auth.signOut();
    if (error) {
      addSentryBreadcrumb('Sign out failed', 'auth', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}