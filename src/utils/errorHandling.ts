import * as Sentry from '@sentry/react';
import { captureMentalHealthError } from './sentryUtils';

// Error types for different categories of errors
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  FILE_OPERATION = 'FILE_OPERATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom error class with additional context
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: Record<string, any>;
  public readonly userMessage: string;
  public readonly timestamp: Date;
  public readonly userId?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Record<string, any> = {},
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
    this.timestamp = new Date();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages = {
      [ErrorType.NETWORK]: 'Connection issue. Please check your internet connection and try again.',
      [ErrorType.API]: 'Service temporarily unavailable. Please try again in a moment.',
      [ErrorType.DATABASE]: 'Data access issue. Your information is safe, please try again.',
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in again.',
      [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorType.FILE_OPERATION]: 'File operation failed. Please try again.',
      [ErrorType.EXTERNAL_SERVICE]: 'External service unavailable. Please try again later.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };
    return messages[type];
  }
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  action: string;
  component?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

// Error logging function with context
export function logError(
  error: Error | AppError,
  context: Partial<ErrorContext> = {}
): void {
  const errorContext: ErrorContext = {
    action: context.action || 'unknown',
    component: context.component,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date(),
    userId: context.userId,
    sessionId: context.sessionId,
    additionalData: context.additionalData
  };

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${error.name}: ${error.message}`);
    console.error('Error:', error);
    console.error('Context:', errorContext);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }

  // Sentry logging for production
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setTag('errorType', error instanceof AppError ? error.type : ErrorType.UNKNOWN);
      scope.setLevel(error instanceof AppError ? 
        error.severity.toLowerCase() as any : 'error');
      scope.setContext('errorContext', errorContext);
      
      if (errorContext.userId) {
        Sentry.setUser({ id: errorContext.userId });
      }
      
      Sentry.captureException(error);
    });
  }

  // Log to console in production for debugging (without sensitive data)
  console.error(`[${errorContext.timestamp.toISOString()}] ${error.name}: ${error.message}`, {
    action: errorContext.action,
    component: errorContext.component,
    type: error instanceof AppError ? error.type : ErrorType.UNKNOWN
  });
}

// Retry logic with exponential backoff
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      // Retry on network errors and 5xx server errors
      if (error instanceof AppError) {
        return error.type === ErrorType.NETWORK || error.type === ErrorType.API;
      }
      return error.message.includes('fetch') || error.message.includes('network');
    }
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt or if we shouldn't retry
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );
      
      logError(lastError, {
        action: 'retry_attempt',
        additionalData: { attempt, nextDelay: delay }
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Network error detector
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'fetch',
    'network',
    'connection',
    'timeout',
    'offline',
    'dns',
    'refused'
  ];
  
  return networkErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg)
  );
}

// API error detector
export function isAPIError(error: Error): boolean {
  return error.message.includes('API') || 
         error.message.includes('HTTP') ||
         error.message.includes('response');
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext> = {},
  fallbackValue?: T
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          isNetworkError(error as Error) ? ErrorType.NETWORK : 
          isAPIError(error as Error) ? ErrorType.API : ErrorType.UNKNOWN,
          ErrorSeverity.MEDIUM,
          context
        );
    
    logError(appError, context);
    
    return { 
      error: appError,
      data: fallbackValue 
    };
  }
}

// User-friendly error messages
export function getUserErrorMessage(error: Error | AppError): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  // Map common error patterns to user-friendly messages
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Connection issue. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return 'Please log in again to continue.';
  }
  
  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return 'You don\'t have permission to perform this action.';
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'The requested information could not be found.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'The operation took too long. Please try again.';
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'Please check your input and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Error boundary helper - logs error and returns user message
export function handleErrorBoundary(componentName: string, error: Error): string {
  logError(error, { 
    component: componentName,
    action: 'error_boundary_triggered'
  });
  
  return getUserErrorMessage(error);
}

// Form validation error handler
export function handleValidationErrors(
  error: any,
  setFieldError?: (field: string, message: string) => void
): void {
  if (error.details) {
    // Handle Joi-style validation errors
    error.details.forEach((detail: any) => {
      const field = detail.path.join('.');
      const message = detail.message;
      setFieldError?.(field, message);
    });
  } else if (error.errors) {
    // Handle other validation error formats
    Object.keys(error.errors).forEach(field => {
      const message = Array.isArray(error.errors[field]) 
        ? error.errors[field][0] 
        : error.errors[field];
      setFieldError?.(field, message);
    });
  }
}

// API response error handler
export function handleAPIResponse(response: Response): void {
  if (!response.ok) {
    const errorType = response.status >= 500 
      ? ErrorType.API 
      : response.status === 401 
        ? ErrorType.AUTHENTICATION
        : response.status === 403
          ? ErrorType.PERMISSION
          : ErrorType.API;
    
    throw new AppError(
      `API Error: ${response.status} ${response.statusText}`,
      errorType,
      response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url 
      }
    );
  }
}

export default {
  AppError,
  ErrorType,
  ErrorSeverity,
  logError,
  withRetry,
  safeAsync,
  getUserErrorMessage,
  handleErrorBoundary,
  handleValidationErrors,
  handleAPIResponse,
  isNetworkError,
  isAPIError
}; 