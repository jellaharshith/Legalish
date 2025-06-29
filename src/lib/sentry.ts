import * as Sentry from '@sentry/react';
import { reactRouterV6Instrumentation } from '@sentry/react-router-v6';
import React, { useEffect } from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration({
        // Set up automatic route change tracking for React Router
        routingInstrumentation: reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Filter out common noise
    beforeSend(event) {
      // Filter out network errors that are not actionable
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ChunkLoadError' || 
            error?.value?.includes('Loading chunk') ||
            error?.value?.includes('Loading CSS chunk')) {
          return null;
        }
      }
      
      // Filter out cancelled requests
      if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
        return null;
      }
      
      return event;
    },
    
    // Set user context
    initialScope: {
      tags: {
        component: 'legalish-app',
      },
    },
  });
};

// Helper function to capture user context
export const setSentryUser = (user: { id: string; email?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

// Helper function to clear user context on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Helper function to add breadcrumbs for important actions
export const addSentryBreadcrumb = (message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
};

// Helper function to capture exceptions with context
export const captureSentryException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};