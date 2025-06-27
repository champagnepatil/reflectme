import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://238ed7e0b8c33a786e0a19b534bda162@o4508130833793024.ingest.us.sentry.io/4509481458204672",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration(),
    // Session replay for debugging user sessions
    Sentry.replayIntegration(),
    // Console logging integration for automatic log capture
    Sentry.consoleLoggingIntegration({ 
      levels: ["log", "error", "warn", "info"] 
    }),
    // User feedback integration for mental health platform
    Sentry.feedbackIntegration({
      colorScheme: "system",
      // Customize for mental health context
      formTitle: "Help Improve Zentia",
      submitButtonLabel: "Send Feedback",
      messageLabel: "Describe what happened",
      nameLabel: "Your name (optional)",
      emailLabel: "Your email (optional)",
    }),
  ],
  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: [
    /^\//, 
    /^https:\/\/yourserver\.io\/api\//, 
    /^http:\/\/localhost/,
    /^https:\/\/.*\.supabase\.co/
  ],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment and release configuration
  environment: import.meta.env.MODE || 'development',
  release: '1.0.0', // Update with your app version
  
  // Additional configuration for mental health platform
  beforeSend(event) {
    // Filter out sensitive mental health data
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value) {
        // Remove potential PHI/sensitive content from error messages
        error.value = error.value.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
        error.value = error.value.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
      }
    }
    
    // Filter out sensitive URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/\/client\/\d+/g, '/client/[ID]');
      event.request.url = event.request.url.replace(/\/therapist\/\d+/g, '/therapist/[ID]');
    }
    
    return event;
  },
  
  // Set user context for better error tracking
  initialScope: {
    tags: {
      component: "zentia-mental-health",
      platform: "web"
    }
  }
}); 