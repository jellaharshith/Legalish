import * as Sentry from '@sentry/react';

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: "https://f3b05d4f6b032cf7c1815ac5db86b993@o4509583690891264.ingest.us.sentry.io/4509583814033408",
    environment: import.meta.env.MODE || 'development',
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Send default PII data (as you specified)
    sendDefaultPii: true,
    
    // Additional configuration
    beforeSend(event, hint) {
      // Filter out development errors in production
      if (import.meta.env.MODE === 'development') {
        console.log('Sentry Event:', event);
      }
      
      return event;
    },
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration(),
    ],
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // User context
    initialScope: {
      tags: {
        component: 'legalish-app',
      },
    },
  });
};

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Utility functions for manual error reporting
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;

// Performance monitoring
export const startTransaction = Sentry.startTransaction;
export const getCurrentHub = Sentry.getCurrentHub;

// Custom error boundary fallback component
export const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        We've been notified about this error and are working to fix it.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={resetError}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md transition-colors"
        >
          Go Home
        </button>
      </div>
      
      {import.meta.env.MODE === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);