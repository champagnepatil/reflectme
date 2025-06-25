import * as Sentry from "@sentry/react";

// User context utilities
export const setSentryUserContext = (user: {
  id: string;
  email?: string;
  role?: string;
  isTherapist?: boolean;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
    isTherapist: user.isTherapist
  });
  
  Sentry.setTag("user_role", user.role || "unknown");
  Sentry.setTag("is_therapist", user.isTherapist ? "true" : "false");
};

// Clear user context on logout
export const clearSentryUserContext = () => {
  Sentry.setUser(null);
  Sentry.setTag("user_role", null);
  Sentry.setTag("is_therapist", null);
};

// Mental health specific error tracking
export const captureMentalHealthError = (
  error: Error,
  context: {
    component: string;
    action: string;
    userRole?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }
) => {
  Sentry.withScope((scope) => {
    scope.setTag("error_category", "mental_health");
    scope.setTag("component", context.component);
    scope.setTag("action", context.action);
    scope.setLevel(context.severity === 'critical' ? 'fatal' : 
                   context.severity === 'high' ? 'error' :
                   context.severity === 'medium' ? 'warning' : 'info');
    
    if (context.userRole) {
      scope.setTag("user_role", context.userRole);
    }
    
    Sentry.captureException(error);
  });
};

// Performance monitoring for AI operations
export const trackAIPerformance = (
  operation: string,
  duration: number,
  success: boolean,
  metadata?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    category: 'ai_operation',
    message: `AI ${operation} ${success ? 'completed' : 'failed'}`,
    level: success ? 'info' : 'error',
    data: {
      operation,
      duration,
      success,
      ...metadata
    }
  });
}; 