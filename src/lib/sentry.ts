import * as Sentry from '@sentry/react';

const sentryDsn = 'https://f3b05d4f6b032cf7c1815ac5db86b993@o4509583690891264.ingest.us.sentry.io/4509583814033408';

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
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
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
};

// Set user context in Sentry
export const setSentryUser = (user: { id: string; email?: string; [key: string]: any }) => {
  Sentry.setUser(user);
};

// Clear user context in Sentry
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Add breadcrumb to Sentry
export const addSentryBreadcrumb = (message: string, category?: string, level?: 'info' | 'warning' | 'error', data?: any) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });
};

// Capture exception in Sentry
export const captureSentryException = (error: Error, context?: { [key: string]: any }) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

// Initialize Sentry on module load
initSentry();

export { Sentry };