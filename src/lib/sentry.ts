import * as Sentry from '@sentry/react';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

// Initialize Sentry
export const initSentry = () => {
  // Only initialize Sentry if a valid DSN is provided
  if (sentryDsn && sentryDsn !== 'your_sentry_dsn' && sentryDsn.startsWith('https://')) {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } else {
    console.log('Sentry not initialized: Invalid or missing DSN');
  }
};

// Set user context in Sentry
export const setSentryUser = (user: { id: string; email?: string; [key: string]: any }) => {
  if (sentryDsn && sentryDsn !== 'your_sentry_dsn' && sentryDsn.startsWith('https://')) {
    Sentry.setUser(user);
  }
};

// Clear user context in Sentry
export const clearSentryUser = () => {
  if (sentryDsn && sentryDsn !== 'your_sentry_dsn' && sentryDsn.startsWith('https://')) {
    Sentry.setUser(null);
  }
};

// Add breadcrumb to Sentry
export const addSentryBreadcrumb = (breadcrumb: { message: string; category?: string; level?: string; data?: any }) => {
  if (sentryDsn && sentryDsn !== 'your_sentry_dsn' && sentryDsn.startsWith('https://')) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

// Initialize Sentry on module load
initSentry();

export { Sentry };