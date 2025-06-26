import { toast } from 'sonner';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type SystemStatus = 'online' | 'offline' | 'syncing' | 'error' | 'maintenance';

export interface FeedbackOptions {
  duration?: number;
  dismissible?: boolean;
  priority?: FeedbackPriority;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  }>;
  metadata?: Record<string, any>;
}

export interface ProgressInfo {
  current: number;
  total: number;
  label: string;
  estimatedTime?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

export interface SystemStatusInfo {
  status: SystemStatus;
  message: string;
  details?: string;
  lastUpdate: Date;
  autoRecover?: boolean;
}

// ============================================================================
// CORE FEEDBACK FUNCTIONS
// ============================================================================

/**
 * Show a success feedback message
 */
export const showSuccess = (title: string, message?: string, options?: FeedbackOptions) => {
  const toastOptions = {
    duration: options?.duration || 5000,
    action: options?.actions?.[0] ? {
      label: options.actions[0].label,
      onClick: options.actions[0].onClick
    } : undefined
  };

  toast.success(title, toastOptions);
  
  // Log for analytics
  logFeedback('success', title, message, options);
  
  return `success-${Date.now()}`;
};

/**
 * Show an error feedback message
 */
export const showError = (title: string, message?: string, options?: FeedbackOptions) => {
  const toastOptions = {
    duration: options?.duration || 8000, // Longer duration for errors
    action: options?.actions?.[0] ? {
      label: options.actions[0].label,
      onClick: options.actions[0].onClick
    } : undefined
  };

  toast.error(title, toastOptions);
  
  // Log for analytics
  logFeedback('error', title, message, options);
  
  return `error-${Date.now()}`;
};

/**
 * Show a warning feedback message
 */
export const showWarning = (title: string, message?: string, options?: FeedbackOptions) => {
  const toastOptions = {
    duration: options?.duration || 6000,
    action: options?.actions?.[0] ? {
      label: options.actions[0].label,
      onClick: options.actions[0].onClick
    } : undefined
  };

  toast.warning(title, toastOptions);
  
  // Log for analytics
  logFeedback('warning', title, message, options);
  
  return `warning-${Date.now()}`;
};

/**
 * Show an info feedback message
 */
export const showInfo = (title: string, message?: string, options?: FeedbackOptions) => {
  const toastOptions = {
    duration: options?.duration || 4000,
    action: options?.actions?.[0] ? {
      label: options.actions[0].label,
      onClick: options.actions[0].onClick
    } : undefined
  };

  toast.info(title, toastOptions);
  
  // Log for analytics
  logFeedback('info', title, message, options);
  
  return `info-${Date.now()}`;
};

/**
 * Show a loading feedback message
 */
export const showLoading = (title: string, message?: string, options?: FeedbackOptions) => {
  const toastOptions = {
    duration: options?.duration || 0, // Don't auto-dismiss loading
    action: options?.actions?.[0] ? {
      label: options.actions[0].label,
      onClick: options.actions[0].onClick
    } : undefined
  };

  const toastId = toast.loading(title, toastOptions);
  
  // Log for analytics
  logFeedback('loading', title, message, options);
  
  return toastId;
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

// ============================================================================
// ACTION FEEDBACK HELPERS
// ============================================================================

/**
 * Wrap an async function with loading and success/error feedback
 */
export const withFeedback = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    loadingTitle?: string;
    successTitle?: string;
    errorTitle?: string;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  return async (...args: T): Promise<R> => {
    const loadingId = showLoading(
      options.loadingTitle || 'Processing...',
      'Please wait while we complete this action'
    );

    try {
      const result = await fn(...args);
      
      // Dismiss loading and show success
      dismissToast(loadingId);
      showSuccess(
        options.successTitle || 'Success!',
        options.successMessage || 'Operation completed successfully'
      );
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      // Dismiss loading and show error
      dismissToast(loadingId);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      showError(
        options.errorTitle || 'Error',
        options.errorMessage || errorMessage,
        {
          actions: [
            {
              label: 'Try Again',
              onClick: () => withFeedback(fn, options)(...args),
              variant: 'primary'
            }
          ]
        }
      );
      
      options.onError?.(error as Error);
      throw error;
    }
  };
};

/**
 * Show feedback for form submission
 */
export const showFormFeedback = {
  submitting: () => showLoading('Saving...', 'Please wait while we save your changes'),
  success: (message?: string) => {
    dismissAllToasts();
    showSuccess('Saved!', message || 'Your changes have been saved successfully');
  },
  error: (message?: string) => {
    dismissAllToasts();
    showError('Save Failed', message || 'There was an error saving your changes. Please try again.');
  },
  validationError: (field?: string) => {
    showWarning(
      'Validation Error',
      field ? `Please check the ${field} field` : 'Please check your input and try again'
    );
  }
};

/**
 * Show feedback for data operations
 */
export const showDataFeedback = {
  loading: (operation: string) => showLoading(`${operation}...`, 'Please wait'),
  success: (operation: string, count?: number) => {
    const message = count ? `${operation} ${count} items successfully` : `${operation} completed successfully`;
    showSuccess('Success!', message);
  },
  error: (operation: string, error?: string) => {
    showError(`${operation} Failed`, error || `There was an error ${operation.toLowerCase()}. Please try again.`);
  },
  noData: (type: string) => {
    showInfo('No Data', `No ${type} found. Create your first ${type.toLowerCase()} to get started.`);
  }
};

// ============================================================================
// SYSTEM STATUS HELPERS
// ============================================================================

let systemStatus: SystemStatusInfo = {
  status: 'online',
  message: 'All systems operational',
  lastUpdate: new Date()
};

/**
 * Update system status and show appropriate feedback
 */
export const updateSystemStatus = (newStatus: SystemStatusInfo) => {
  const previousStatus = systemStatus.status;
  systemStatus = { ...newStatus, lastUpdate: new Date() };

  // Show status change notifications
  if (newStatus.status === 'offline' && previousStatus !== 'offline') {
    showWarning(
      'Connection Lost',
      'You\'re currently offline. Some features may be unavailable.',
      { dismissible: false }
    );
  } else if (newStatus.status === 'online' && previousStatus === 'offline') {
    showSuccess('Connection Restored', 'You\'re back online!');
  } else if (newStatus.status === 'maintenance') {
    showInfo('System Maintenance', 'We\'re performing scheduled maintenance. Some features may be temporarily unavailable.');
  }

  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('systemStatusChange', { detail: systemStatus }));
};

/**
 * Get current system status
 */
export const getSystemStatus = (): SystemStatusInfo => systemStatus;

/**
 * Monitor network connectivity
 */
export const startNetworkMonitoring = () => {
  const handleOnline = () => {
    updateSystemStatus({
      status: 'online',
      message: 'Connection restored',
      lastUpdate: new Date()
    });
  };

  const handleOffline = () => {
    updateSystemStatus({
      status: 'offline',
      message: 'No internet connection',
      details: 'Some features may be unavailable',
      lastUpdate: new Date()
    });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

const activeProgress = new Map<string, ProgressInfo>();

/**
 * Show a progress indicator
 */
export const showProgress = (progress: ProgressInfo): string => {
  const id = `progress-${Date.now()}-${Math.random()}`;
  activeProgress.set(id, progress);
  
  // Dispatch event for UI components to listen to
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: { id, progress, type: 'show' } 
  }));
  
  return id;
};

/**
 * Update progress
 */
export const updateProgress = (id: string, updates: Partial<ProgressInfo>) => {
  const current = activeProgress.get(id);
  if (current) {
    const updated = { ...current, ...updates };
    activeProgress.set(id, updated);
    
    window.dispatchEvent(new CustomEvent('progressUpdate', { 
      detail: { id, progress: updated, type: 'update' } 
    }));
  }
};

/**
 * Hide progress indicator
 */
export const hideProgress = (id: string) => {
  activeProgress.delete(id);
  
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: { id, type: 'hide' } 
  }));
};

/**
 * Get all active progress indicators
 */
export const getActiveProgress = (): Map<string, ProgressInfo> => new Map(activeProgress);

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Show user-friendly error message based on error type
 */
export const showUserFriendlyError = (error: unknown, context?: string) => {
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';
  let actions = [];

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      title = 'Connection Error';
      message = 'Unable to connect to the server. Please check your internet connection and try again.';
      actions = [
        {
          label: 'Retry',
          onClick: () => window.location.reload(),
          variant: 'primary' as const
        }
      ];
    }
    // Authentication errors
    else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      title = 'Authentication Required';
      message = 'Please log in to continue.';
      actions = [
        {
          label: 'Login',
          onClick: () => window.location.href = '/login',
          variant: 'primary' as const
        }
      ];
    }
    // Permission errors
    else if (error.message.includes('permission') || error.message.includes('forbidden')) {
      title = 'Access Denied';
      message = 'You don\'t have permission to perform this action.';
    }
    // Validation errors
    else if (error.message.includes('validation') || error.message.includes('invalid')) {
      title = 'Invalid Input';
      message = 'Please check your input and try again.';
    }
    // Use the actual error message if it's user-friendly
    else if (error.message.length < 100 && !error.message.includes('Error:')) {
      message = error.message;
    }
  }

  showError(title, message, { actions });
};

/**
 * Handle async operations with automatic error handling
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    showUserFriendlyError(error, context);
    return null;
  }
};

// ============================================================================
// SUCCESS AND ACHIEVEMENT FEEDBACK
// ============================================================================

/**
 * Show achievement celebration
 */
export const showAchievement = (title: string, description: string, type: 'milestone' | 'streak' | 'goal' | 'first') => {
  const emojis = {
    milestone: '🎯',
    streak: '🔥',
    goal: '🏆',
    first: '⭐'
  };

  showSuccess(
    `${emojis[type]} ${title}`,
    description,
    {
      duration: 8000,
      actions: [
        {
          label: 'Share',
          onClick: () => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: `${title} - Zentia`,
                text: description
              });
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(`${title}: ${description}`);
              showInfo('Copied!', 'Achievement copied to clipboard');
            }
          },
          variant: 'secondary'
        }
      ]
    }
  );
};

/**
 * Show progress milestone
 */
export const showProgressMilestone = (current: number, target: number, label: string) => {
  const percentage = Math.round((current / target) * 100);
  
  if (percentage >= 100) {
    showAchievement('Goal Achieved!', `You've completed your ${label} goal!`, 'goal');
  } else if (percentage >= 75) {
    showInfo('Almost There!', `You're ${percentage}% of the way to your ${label} goal. Keep going!`);
  } else if (percentage >= 50) {
    showInfo('Halfway There!', `Great progress! You're halfway to your ${label} goal.`);
  }
};

// ============================================================================
// CONTEXTUAL HELP HELPERS
// ============================================================================

/**
 * Show contextual help tooltip
 */
export const showHelp = (title: string, content: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
  // This would typically be implemented as a component
  // For now, we'll show it as an info toast
  showInfo(title, content, { duration: 10000 });
};

/**
 * Show feature discovery notification
 */
export const showFeatureDiscovery = (feature: string, description: string, action?: () => void) => {
  showInfo(
    `New Feature: ${feature}`,
    description,
    action ? {
      actions: [
        {
          label: 'Try It',
          onClick: action,
          variant: 'primary'
        }
      ]
    } : undefined
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Log feedback for analytics
 */
const logFeedback = (type: FeedbackType, title: string, message?: string, options?: FeedbackOptions) => {
  // In a real app, this would send to analytics service
  console.log('Feedback:', { type, title, message, options, timestamp: new Date() });
};

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Fallback: create a simple beep
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

/**
 * Vibrate device (if supported)
 */
export const vibrateDevice = (pattern: number | number[] = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Check if device supports haptic feedback
 */
export const supportsHapticFeedback = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Check if device supports audio feedback
 */
export const supportsAudioFeedback = (): boolean => {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
};

// ============================================================================
// FEEDBACK PREFERENCES
// ============================================================================

export interface FeedbackPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoDismiss: boolean;
  dismissDelay: number;
  quietMode: boolean;
  quietModeUntil?: Date;
}

const defaultPreferences: FeedbackPreferences = {
  soundEnabled: true,
  vibrationEnabled: true,
  autoDismiss: true,
  dismissDelay: 5000,
  quietMode: false
};

/**
 * Get user feedback preferences
 */
export const getFeedbackPreferences = (): FeedbackPreferences => {
  try {
    const stored = localStorage.getItem('feedback-preferences');
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
};

/**
 * Update feedback preferences
 */
export const updateFeedbackPreferences = (preferences: Partial<FeedbackPreferences>) => {
  try {
    const current = getFeedbackPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem('feedback-preferences', JSON.stringify(updated));
    
    // Dispatch event for components to listen to
    window.dispatchEvent(new CustomEvent('feedbackPreferencesChange', { detail: updated }));
  } catch (error) {
    console.warn('Could not save feedback preferences:', error);
  }
};

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Core feedback
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissToast,
  dismissAllToasts,
  
  // Action feedback
  withFeedback,
  showFormFeedback,
  showDataFeedback,
  
  // System status
  updateSystemStatus,
  getSystemStatus,
  startNetworkMonitoring,
  
  // Progress tracking
  showProgress,
  updateProgress,
  hideProgress,
  getActiveProgress,
  
  // Error handling
  showUserFriendlyError,
  safeAsync,
  
  // Success and achievements
  showAchievement,
  showProgressMilestone,
  
  // Contextual help
  showHelp,
  showFeatureDiscovery,
  
  // Utilities
  playNotificationSound,
  vibrateDevice,
  supportsHapticFeedback,
  supportsAudioFeedback,
  
  // Preferences
  getFeedbackPreferences,
  updateFeedbackPreferences
}; 