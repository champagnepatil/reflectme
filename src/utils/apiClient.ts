import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  logError, 
  withRetry 
} from './errorHandling';

// API client configuration
interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Request configuration
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

// Response type
interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Default configuration
const defaultConfig: APIClientConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  }
};

class APIClient {
  private config: APIClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: APIClientConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Create request with timeout and abort signal
  private createRequest(url: string, config: RequestConfig): [Request, AbortController] {
    const abortController = new AbortController();
    const requestId = `${config.method || 'GET'}-${url}-${Date.now()}`;
    
    // Store abort controller for potential cancellation
    this.abortControllers.set(requestId, abortController);
    
    // Set up timeout
    const timeout = config.timeout || this.config.timeout || 30000;
    const timeoutId = setTimeout(() => {
      abortController.abort();
      this.abortControllers.delete(requestId);
    }, timeout);

    // Clean up timeout when request completes
    abortController.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);
    });

    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers: {
        ...this.config.headers,
        ...config.headers
      },
      signal: abortController.signal
    };

    // Add body for non-GET requests
    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method || '')) {
      if (typeof config.body === 'object') {
        requestConfig.body = JSON.stringify(config.body);
      } else {
        requestConfig.body = config.body;
      }
    }

    const fullURL = url.startsWith('http') ? url : `${this.config.baseURL || ''}${url}`;
    const request = new Request(fullURL, requestConfig);

    return [request, abortController];
  }

  // Main request method with comprehensive error handling
  private async makeRequest<T>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const requestContext = {
      url,
      method: config.method || 'GET',
      timestamp: new Date().toISOString()
    };

    return withRetry(
      async () => {
        const [request, abortController] = this.createRequest(url, config);
        
        try {
          const response = await fetch(request);
          
          // Validate response status
          const validateStatus = config.validateStatus || ((status) => status >= 200 && status < 300);
          
          if (!validateStatus(response.status)) {
            // Handle different types of HTTP errors
            let errorType = ErrorType.API;
            let severity = ErrorSeverity.MEDIUM;
            
            if (response.status >= 500) {
              errorType = ErrorType.API;
              severity = ErrorSeverity.HIGH;
            } else if (response.status === 401) {
              errorType = ErrorType.AUTHENTICATION;
              severity = ErrorSeverity.MEDIUM;
            } else if (response.status === 403) {
              errorType = ErrorType.PERMISSION;
              severity = ErrorSeverity.MEDIUM;
            } else if (response.status === 404) {
              errorType = ErrorType.API;
              severity = ErrorSeverity.LOW;
            }

            throw new AppError(
              `HTTP ${response.status}: ${response.statusText}`,
              errorType,
              severity,
              { 
                ...requestContext,
                status: response.status,
                statusText: response.statusText
              },
              this.getHTTPErrorMessage(response.status)
            );
          }

          // Parse response
          let data: T;
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('application/json')) {
            try {
              data = await response.json();
            } catch (parseError) {
              throw new AppError(
                'Failed to parse JSON response',
                ErrorType.API,
                ErrorSeverity.MEDIUM,
                { ...requestContext, parseError: parseError instanceof Error ? parseError.message : 'Unknown' },
                'Received invalid response from server.'
              );
            }
          } else if (contentType?.includes('text/')) {
            data = (await response.text()) as unknown as T;
          } else {
            data = (await response.blob()) as unknown as T;
          }

          return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          };

        } catch (error) {
          // Handle different types of fetch errors
          if (error instanceof AppError) {
            throw error;
          }

          if (error instanceof DOMException && error.name === 'AbortError') {
            throw new AppError(
              'Request timeout',
              ErrorType.NETWORK,
              ErrorSeverity.MEDIUM,
              { ...requestContext, timeout: config.timeout || this.config.timeout },
              'Request took too long to complete. Please try again.'
            );
          }

          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new AppError(
              'Network connection failed',
              ErrorType.NETWORK,
              ErrorSeverity.HIGH,
              { ...requestContext, originalError: error.message },
              'Unable to connect to server. Please check your internet connection.'
            );
          }

          throw new AppError(
            error instanceof Error ? error.message : 'Unknown request error',
            ErrorType.NETWORK,
            ErrorSeverity.MEDIUM,
            { ...requestContext, originalError: error instanceof Error ? error.message : 'Unknown' },
            'Request failed. Please try again.'
          );
        } finally {
          // Cleanup
          abortController.abort();
        }
      },
      {
        maxAttempts: config.retries || this.config.retries || 3,
        shouldRetry: (error) => {
          if (error instanceof AppError) {
            // Retry on network errors and 5xx server errors
            return error.type === ErrorType.NETWORK || 
                   (error.type === ErrorType.API && error.context.status >= 500);
          }
          return false;
        }
      }
    );
  }

  // HTTP error message mapping
  private getHTTPErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Authentication required. Please log in and try again.',
      403: 'You don\'t have permission to access this resource.',
      404: 'The requested resource was not found.',
      408: 'Request timeout. Please try again.',
      409: 'Conflict with current state. Please refresh and try again.',
      422: 'Invalid data provided. Please check your input.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Request timeout. Please try again later.'
    };

    return messages[status] || 'An unexpected error occurred. Please try again.';
  }

  // Convenience methods
  async get<T>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body: data });
  }

  async put<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body: data });
  }

  async patch<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body: data });
  }

  async delete<T>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  // Cancel specific request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }
}

// Create default API client instance
export const apiClient = new APIClient();

// Create API client with custom configuration
export const createAPIClient = (config: APIClientConfig) => new APIClient(config);

// Utility function for safe API calls with error handling
export async function safeAPICall<T>(
  apiCall: () => Promise<APIResponse<T>>,
  context: { action: string; component?: string; additionalData?: any } = { action: 'api_call' },
  fallbackValue?: T
): Promise<{ data?: T; error?: AppError; response?: APIResponse<T> }> {
  try {
    const response = await apiCall();
    return { data: response.data, response };
  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError(
      error instanceof Error ? error.message : 'Unknown API error',
      ErrorType.API,
      ErrorSeverity.MEDIUM,
      context.additionalData || {}
    );

    logError(appError, {
      action: context.action,
      component: context.component,
      additionalData: context.additionalData
    });

    return { 
      error: appError, 
      data: fallbackValue 
    };
  }
}

export default APIClient;
