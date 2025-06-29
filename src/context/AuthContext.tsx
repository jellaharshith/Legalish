import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { captureException, addBreadcrumb } from '@/lib/sentry';

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
        captureException(error, {
          tags: { component: 'auth', action: 'getSession' },
        });
        await supabase.auth.signOut();
        setUser(null);
      } else if (!session) {
        // If there's no session, clear the invalid state
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session.user);
        addBreadcrumb({
          message: 'Session restored',
          category: 'auth',
          level: 'info',
          data: { userId: session.user.id },
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      addBreadcrumb({
        message: `Auth state changed: ${event}`,
        category: 'auth',
        level: 'info',
        data: { event, hasSession: !!session },
      });

      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      addBreadcrumb({
        message: 'User signed in with email',
        category: 'auth',
        level: 'info',
      });
    } catch (error) {
      captureException(error, {
        tags: { component: 'auth', action: 'signIn' },
        extra: { email },
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      
      addBreadcrumb({
        message: 'User signed up with email',
        category: 'auth',
        level: 'info',
      });
    } catch (error) {
      captureException(error, {
        tags: { component: 'auth', action: 'signUp' },
        extra: { email },
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/summary`,
        },
      });
      if (error) throw error;
      
      addBreadcrumb({
        message: 'User signed in with Google',
        category: 'auth',
        level: 'info',
      });
    } catch (error) {
      captureException(error, {
        tags: { component: 'auth', action: 'signInWithGoogle' },
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      addBreadcrumb({
        message: 'User signed out',
        category: 'auth',
        level: 'info',
      });
    } catch (error) {
      captureException(error, {
        tags: { component: 'auth', action: 'signOut' },
      });
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