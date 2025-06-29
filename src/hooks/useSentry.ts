import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { setUser, setTag, setContext, addBreadcrumb } from '@/lib/sentry';

/**
 * Custom hook to integrate Sentry with user authentication and app context
 */
export function useSentry() {
  const { user } = useAuth();

  // Set user context when authentication state changes
  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        email: user.email,
      });
      
      setTag('authenticated', 'true');
      
      addBreadcrumb({
        message: 'User authenticated',
        category: 'auth',
        level: 'info',
        data: {
          userId: user.id,
          email: user.email,
        },
      });
    } else {
      setUser(null);
      setTag('authenticated', 'false');
      
      addBreadcrumb({
        message: 'User logged out',
        category: 'auth',
        level: 'info',
      });
    }
  }, [user]);

  // Set application context
  useEffect(() => {
    setContext('app', {
      name: 'Legalish',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
    });
  }, []);

  return {
    // Re-export Sentry functions for convenience
    setUser,
    setTag,
    setContext,
    addBreadcrumb,
  };
}