import { Button } from '@/components/ui/button';
import { captureException, captureMessage, addBreadcrumb } from '@/lib/sentry';

export default function SentryTestButton() {
  const testSentryError = () => {
    addBreadcrumb({
      message: 'User clicked test error button',
      category: 'debug',
      level: 'info',
    });
    
    try {
      throw new Error('This is a test error for Sentry integration');
    } catch (error) {
      captureException(error, {
        tags: { 
          component: 'debug',
          test: 'true'
        },
        extra: {
          userAction: 'test-button-click',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const testSentryMessage = () => {
    captureMessage('Test message from Legalish app', 'info');
  };

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 space-y-2 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={testSentryError}
        className="bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20"
      >
        Test Sentry Error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={testSentryMessage}
        className="bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20"
      >
        Test Sentry Message
      </Button>
    </div>
  );
}