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

// Sentry logger for structured logging
const { logger } = Sentry;

/**
 * AI Safety Monitoring - Track safety-critical operations
 */
export const trackAISafetyEvent = (
  eventType: 'input_guard' | 'output_guard' | 'crisis_detection' | 'alert_generated',
  details: {
    clientId: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    reason?: string;
    blocked?: boolean;
    keyword?: string;
  }
) => {
  Sentry.startSpan(
    {
      op: "ai.safety",
      name: `AI Safety Event: ${eventType}`,
    },
    (span) => {
      span.setAttribute("event_type", eventType);
      span.setAttribute("client_id", details.clientId);
      
      if (details.severity) span.setAttribute("severity", details.severity);
      if (details.reason) span.setAttribute("reason", details.reason);
      if (details.blocked !== undefined) span.setAttribute("blocked", details.blocked);
      if (details.keyword) span.setAttribute("keyword", details.keyword);

      logger.warn("AI Safety Event", {
        eventType,
        ...details
      });
    }
  );
};

/**
 * AI Generation Monitoring - Track AI content generation performance
 */
export const trackAIGeneration = async <T>(
  operationType: 'narrative' | 'roleplay' | 'clinical_summary' | 'homework' | 'content',
  generationFn: () => Promise<T>,
  metadata: {
    clientId?: string;
    contentType?: string;
    difficulty?: string;
    wordCount?: number;
  }
): Promise<T> => {
  return Sentry.startSpan(
    {
      op: "ai.generation",
      name: `AI Generation: ${operationType}`,
    },
    async (span) => {
      try {
        span.setAttribute("operation_type", operationType);
        if (metadata.clientId) span.setAttribute("client_id", metadata.clientId);
        if (metadata.contentType) span.setAttribute("content_type", metadata.contentType);
        if (metadata.difficulty) span.setAttribute("difficulty", metadata.difficulty);
        if (metadata.wordCount) span.setAttribute("word_count", metadata.wordCount);

        logger.info("Starting AI generation", {
          operationType,
          ...metadata
        });

        const startTime = Date.now();
        const result = await generationFn();
        const duration = Date.now() - startTime;

        span.setAttribute("success", true);
        span.setAttribute("duration_ms", duration);

        logger.info("AI generation completed", {
          operationType,
          duration,
          ...metadata
        });

        return result;
      } catch (error) {
        span.setAttribute("success", false);
        span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');

        logger.error("AI generation failed", {
          operationType,
          error: error instanceof Error ? error.message : 'Unknown error',
          ...metadata
        });

        Sentry.captureException(error);
        throw error;
      }
    }
  );
};

/**
 * Therapist Dashboard Monitoring - Track therapist interactions
 */
export const trackTherapistAction = (
  action: 'view_dashboard' | 'view_alerts' | 'resolve_alert' | 'view_guardrails' | 'client_access',
  details: {
    therapistId: string;
    clientId?: string;
    alertId?: string;
    alertCount?: number;
    criticalCount?: number;
  }
) => {
  Sentry.startSpan(
    {
      op: "ui.therapist_action",
      name: `Therapist Action: ${action}`,
    },
    (span) => {
      span.setAttribute("action", action);
      span.setAttribute("therapist_id", details.therapistId);
      
      if (details.clientId) span.setAttribute("client_id", details.clientId);
      if (details.alertId) span.setAttribute("alert_id", details.alertId);
      if (details.alertCount) span.setAttribute("alert_count", details.alertCount);
      if (details.criticalCount) span.setAttribute("critical_count", details.criticalCount);

      logger.info("Therapist action tracked", {
        action,
        ...details
      });
    }
  );
};

/**
 * Database Operation Monitoring - Track critical database operations
 */
export const trackDatabaseOperation = async <T>(
  operation: 'alert_fetch' | 'guardrail_log' | 'crisis_keyword_check' | 'chat_archive',
  dbFn: () => Promise<T>,
  metadata: {
    table?: string;
    clientId?: string;
    therapistId?: string;
    recordCount?: number;
  }
): Promise<T> => {
  return Sentry.startSpan(
    {
      op: "db.operation",
      name: `Database: ${operation}`,
    },
    async (span) => {
      try {
        span.setAttribute("operation", operation);
        if (metadata.table) span.setAttribute("table", metadata.table);
        if (metadata.clientId) span.setAttribute("client_id", metadata.clientId);
        if (metadata.therapistId) span.setAttribute("therapist_id", metadata.therapistId);
        if (metadata.recordCount) span.setAttribute("record_count", metadata.recordCount);

        logger.debug("Database operation starting", {
          operation,
          ...metadata
        });

        const startTime = Date.now();
        const result = await dbFn();
        const duration = Date.now() - startTime;

        span.setAttribute("success", true);
        span.setAttribute("duration_ms", duration);

        logger.debug("Database operation completed", {
          operation,
          duration,
          ...metadata
        });

        return result;
      } catch (error) {
        span.setAttribute("success", false);
        span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');

        logger.error("Database operation failed", {
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
          ...metadata
        });

        Sentry.captureException(error);
        throw error;
      }
    }
  );
};

/**
 * Chat API Monitoring - Track chat conversation flows
 */
export const trackChatFlow = (
  stage: 'input_guard' | 'context_gathering' | 'ai_generation' | 'output_guard' | 'semantic_storage',
  details: {
    clientId: string;
    turnId?: string;
    messageLength?: number;
    responseLength?: number;
    blocked?: boolean;
    reason?: string;
  }
) => {
  Sentry.startSpan(
    {
      op: "chat.flow",
      name: `Chat Flow: ${stage}`,
    },
    (span) => {
      span.setAttribute("stage", stage);
      span.setAttribute("client_id", details.clientId);
      
      if (details.turnId) span.setAttribute("turn_id", details.turnId);
      if (details.messageLength) span.setAttribute("message_length", details.messageLength);
      if (details.responseLength) span.setAttribute("response_length", details.responseLength);
      if (details.blocked !== undefined) span.setAttribute("blocked", details.blocked);
      if (details.reason) span.setAttribute("reason", details.reason);

      logger.info(`Chat flow stage: ${stage}`, {
        stage,
        ...details
      });
    }
  );
};

/**
 * Crisis Alert Monitoring - Track critical mental health alerts
 */
export const trackCrisisAlert = (
  alertType: 'keyword_detected' | 'therapist_notified' | 'alert_resolved' | 'escalation_required',
  details: {
    clientId: string;
    therapistId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    keyword?: string;
    alertId?: string;
    responseTime?: number;
  }
) => {
  Sentry.startSpan(
    {
      op: "crisis.alert",
      name: `Crisis Alert: ${alertType}`,
    },
    (span) => {
      span.setAttribute("alert_type", alertType);
      span.setAttribute("client_id", details.clientId);
      span.setAttribute("severity", details.severity);
      
      if (details.therapistId) span.setAttribute("therapist_id", details.therapistId);
      if (details.keyword) span.setAttribute("keyword", details.keyword);
      if (details.alertId) span.setAttribute("alert_id", details.alertId);
      if (details.responseTime) span.setAttribute("response_time_ms", details.responseTime);

      // Use appropriate log level based on severity
      const logLevel = details.severity === 'critical' ? 'fatal' : 
                      details.severity === 'high' ? 'error' :
                      details.severity === 'medium' ? 'warn' : 'info';

      logger[logLevel](`CRISIS ALERT: ${alertType}`, {
        alertType,
        ...details
      });
    }
  );
};

/**
 * Performance Monitoring - Track system performance metrics
 */
export const trackPerformanceMetric = (
  metric: 'api_response_time' | 'ai_generation_time' | 'db_query_time' | 'safety_check_time',
  value: number,
  metadata: {
    operation?: string;
    clientId?: string;
    threshold?: number;
  }
) => {
  Sentry.startSpan(
    {
      op: "performance.metric",
      name: `Performance: ${metric}`,
    },
    (span) => {
      span.setAttribute("metric", metric);
      span.setAttribute("value", value);
      
      if (metadata.operation) span.setAttribute("operation", metadata.operation);
      if (metadata.clientId) span.setAttribute("client_id", metadata.clientId);
      if (metadata.threshold) {
        span.setAttribute("threshold", metadata.threshold);
        span.setAttribute("exceeded_threshold", value > metadata.threshold);
      }

      const logLevel = metadata.threshold && value > metadata.threshold ? 'warn' : 'info';
      
      logger[logLevel]("Performance metric tracked", {
        metric,
        value,
        ...metadata
      });
    }
  );
};

/**
 * User Journey Monitoring - Track key user interactions
 */
export const trackUserJourney = (
  milestone: 'registration' | 'first_chat' | 'journal_entry' | 'assessment_complete' | 'crisis_support',
  details: {
    userId: string;
    userType: 'client' | 'therapist';
    sessionDuration?: number;
    interactionCount?: number;
  }
) => {
  Sentry.startSpan(
    {
      op: "user.journey",
      name: `User Journey: ${milestone}`,
    },
    (span) => {
      span.setAttribute("milestone", milestone);
      span.setAttribute("user_id", details.userId);
      span.setAttribute("user_type", details.userType);
      
      if (details.sessionDuration) span.setAttribute("session_duration", details.sessionDuration);
      if (details.interactionCount) span.setAttribute("interaction_count", details.interactionCount);

      logger.info("User journey milestone", {
        milestone,
        ...details
      });
    }
  );
};

/**
 * Error Context Helper - Add mental health context to errors
 */
export const captureContextualError = (
  error: Error,
  context: {
    operation: string;
    clientId?: string;
    therapistId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    additionalData?: Record<string, any>;
  }
) => {
  Sentry.withScope((scope) => {
    scope.setContext("mental_health_context", {
      operation: context.operation,
      client_id: context.clientId,
      therapist_id: context.therapistId,
      severity: context.severity,
      ...context.additionalData
    });

    scope.setLevel(
      context.severity === 'critical' ? 'fatal' :
      context.severity === 'high' ? 'error' :
      context.severity === 'medium' ? 'warning' : 'info'
    );

    Sentry.captureException(error);
  });

  logger.error("Contextual error captured", {
    error: error.message,
    ...context
  });
}; 