import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Clock, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Save,
  Download,
  Upload,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Heart,
  Brain,
  Users,
  FileText,
  Calendar,
  Activity,
  Loader2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Mail,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackChannel = 'toast' | 'inline' | 'banner' | 'modal' | 'notification';
export type SystemStatus = 'online' | 'offline' | 'syncing' | 'error' | 'maintenance';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  priority: FeedbackPriority;
  channel: FeedbackChannel;
  duration?: number;
  actions?: FeedbackAction[];
  metadata?: Record<string, any>;
  timestamp: Date;
  read?: boolean;
  dismissible?: boolean;
}

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
}

export interface SystemStatusInfo {
  status: SystemStatus;
  message: string;
  details?: string;
  lastUpdate: Date;
  autoRecover?: boolean;
}

export interface ProgressInfo {
  current: number;
  total: number;
  label: string;
  estimatedTime?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

export interface FeedbackPreferences {
  channels: FeedbackChannel[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoDismiss: boolean;
  dismissDelay: number;
  priorityFilter: FeedbackPriority[];
  quietMode: boolean;
  quietModeUntil?: Date;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface FeedbackContextType {
  // Core feedback methods
  showFeedback: (message: Omit<FeedbackMessage, 'id' | 'timestamp'>) => string;
  dismissFeedback: (id: string) => void;
  clearAllFeedback: () => void;
  
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<FeedbackMessage>) => string;
  error: (title: string, message?: string, options?: Partial<FeedbackMessage>) => string;
  warning: (title: string, message?: string, options?: Partial<FeedbackMessage>) => string;
  info: (title: string, message?: string, options?: Partial<FeedbackMessage>) => string;
  loading: (title: string, message?: string, options?: Partial<FeedbackMessage>) => string;
  
  // System status
  systemStatus: SystemStatusInfo;
  updateSystemStatus: (status: SystemStatusInfo) => void;
  
  // Progress tracking
  showProgress: (progress: ProgressInfo) => string;
  updateProgress: (id: string, progress: Partial<ProgressInfo>) => void;
  hideProgress: (id: string) => void;
  
  // Preferences
  preferences: FeedbackPreferences;
  updatePreferences: (prefs: Partial<FeedbackPreferences>) => void;
  
  // State
  messages: FeedbackMessage[];
  activeProgress: Record<string, ProgressInfo>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface FeedbackProviderProps {
  children: ReactNode;
  defaultPreferences?: Partial<FeedbackPreferences>;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ 
  children, 
  defaultPreferences = {} 
}) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [activeProgress, setActiveProgress] = useState<Record<string, ProgressInfo>>({});
  const [systemStatus, setSystemStatus] = useState<SystemStatusInfo>({
    status: 'online',
    message: 'All systems operational',
    lastUpdate: new Date()
  });
  
  const [preferences, setPreferences] = useState<FeedbackPreferences>({
    channels: ['toast', 'inline'],
    soundEnabled: true,
    vibrationEnabled: true,
    autoDismiss: true,
    dismissDelay: 5000,
    priorityFilter: ['low', 'medium', 'high', 'critical'],
    quietMode: false,
    ...defaultPreferences
  });

  // Auto-dismiss messages
  useEffect(() => {
    if (!preferences.autoDismiss) return;

    const timers = messages
      .filter(msg => msg.dismissible !== false && msg.duration !== 0)
      .map(msg => {
        const duration = msg.duration || preferences.dismissDelay;
        return setTimeout(() => {
          dismissFeedback(msg.id);
        }, duration);
      });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [messages, preferences]);

  // Network status monitoring
  useEffect(() => {
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showFeedback = (message: Omit<FeedbackMessage, 'id' | 'timestamp'>): string => {
    const id = `feedback-${Date.now()}-${Math.random()}`;
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      timestamp: new Date()
    };

    setMessages(prev => [newMessage, ...prev]);

    // Play sound if enabled
    if (preferences.soundEnabled && message.priority === 'critical') {
      playNotificationSound();
    }

    // Vibrate if enabled
    if (preferences.vibrationEnabled && message.priority === 'critical') {
      vibrateDevice();
    }

    // Show toast for immediate feedback
    if (message.channel === 'toast' || message.channel === 'notification') {
      showToast(newMessage);
    }

    return id;
  };

  const dismissFeedback = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAllFeedback = () => {
    setMessages([]);
  };

  const success = (title: string, message?: string, options?: Partial<FeedbackMessage>) => {
    return showFeedback({
      type: 'success',
      title,
      message: message || 'Operation completed successfully',
      priority: 'low',
      channel: 'toast',
      ...options
    });
  };

  const error = (title: string, message?: string, options?: Partial<FeedbackMessage>) => {
    return showFeedback({
      type: 'error',
      title,
      message: message || 'An error occurred',
      priority: 'high',
      channel: 'toast',
      dismissible: false,
      ...options
    });
  };

  const warning = (title: string, message?: string, options?: Partial<FeedbackMessage>) => {
    return showFeedback({
      type: 'warning',
      title,
      message: message || 'Please review the information',
      priority: 'medium',
      channel: 'toast',
      ...options
    });
  };

  const info = (title: string, message?: string, options?: Partial<FeedbackMessage>) => {
    return showFeedback({
      type: 'info',
      title,
      message: message || 'Here\'s some information for you',
      priority: 'low',
      channel: 'toast',
      ...options
    });
  };

  const loading = (title: string, message?: string, options?: Partial<FeedbackMessage>) => {
    return showFeedback({
      type: 'loading',
      title,
      message: message || 'Processing your request...',
      priority: 'medium',
      channel: 'inline',
      duration: 0, // Don't auto-dismiss
      ...options
    });
  };

  const updateSystemStatus = (status: SystemStatusInfo) => {
    setSystemStatus(status);
    
    // Show notification for status changes
    if (status.status === 'offline') {
      showFeedback({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You\'re currently offline. Some features may be unavailable.',
        priority: 'high',
        channel: 'banner',
        dismissible: false
      });
    } else if (status.status === 'online' && systemStatus.status === 'offline') {
      showFeedback({
        type: 'success',
        title: 'Connection Restored',
        message: 'You\'re back online!',
        priority: 'medium',
        channel: 'toast'
      });
    }
  };

  const showProgress = (progress: ProgressInfo): string => {
    const id = `progress-${Date.now()}-${Math.random()}`;
    setActiveProgress(prev => ({ ...prev, [id]: progress }));
    return id;
  };

  const updateProgress = (id: string, progress: Partial<ProgressInfo>) => {
    setActiveProgress(prev => ({
      ...prev,
      [id]: { ...prev[id], ...progress }
    }));
  };

  const hideProgress = (id: string) => {
    setActiveProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const updatePreferences = (prefs: Partial<FeedbackPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const showToast = (message: FeedbackMessage) => {
    const toastOptions = {
      duration: message.duration || preferences.dismissDelay,
      action: message.actions?.[0] ? {
        label: message.actions[0].label,
        onClick: message.actions[0].onClick
      } : undefined
    };

    switch (message.type) {
      case 'success':
        toast.success(message.title, toastOptions);
        break;
      case 'error':
        toast.error(message.title, toastOptions);
        break;
      case 'warning':
        toast.warning(message.title, toastOptions);
        break;
      case 'info':
        toast.info(message.title, toastOptions);
        break;
      case 'loading':
        toast.loading(message.title, toastOptions);
        break;
    }
  };

  const playNotificationSound = () => {
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

  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const value: FeedbackContextType = {
    showFeedback,
    dismissFeedback,
    clearAllFeedback,
    success,
    error,
    warning,
    info,
    loading,
    systemStatus,
    updateSystemStatus,
    showProgress,
    updateProgress,
    hideProgress,
    preferences,
    updatePreferences,
    messages,
    activeProgress
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackUI />
    </FeedbackContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const FeedbackUI: React.FC = () => {
  const { messages, systemStatus, activeProgress, preferences, dismissFeedback } = useFeedback();

  return (
    <>
      {/* System Status Banner */}
      <SystemStatusBanner status={systemStatus} />
      
      {/* Progress Indicators */}
      <ProgressIndicators progress={activeProgress} />
      
      {/* Inline Messages */}
      <InlineMessages messages={messages} onDismiss={dismissFeedback} />
      
      {/* Notification Center */}
      <NotificationCenter messages={messages} onDismiss={dismissFeedback} />
    </>
  );
};

const SystemStatusBanner: React.FC<{ status: SystemStatusInfo }> = ({ status }) => {
  if (status.status === 'online') return null;

  const getStatusConfig = (status: SystemStatus) => {
    switch (status) {
      case 'offline':
        return {
          icon: <WifiOff className="w-5 h-5" />,
          color: 'bg-red-500 text-white',
          message: 'No internet connection'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-5 h-5 animate-spin" />,
          color: 'bg-blue-500 text-white',
          message: 'Syncing data...'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'bg-orange-500 text-white',
          message: 'System error detected'
        };
      case 'maintenance':
        return {
          icon: <Settings className="w-5 h-5" />,
          color: 'bg-yellow-500 text-white',
          message: 'System maintenance in progress'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'bg-gray-500 text-white',
          message: 'System status update'
        };
    }
  };

  const config = getStatusConfig(status.status);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={`fixed top-0 left-0 right-0 z-50 ${config.color} p-3 text-center`}
    >
      <div className="flex items-center justify-center space-x-2">
        {config.icon}
        <span className="font-medium">{config.message}</span>
        {status.details && (
          <span className="text-sm opacity-90">- {status.details}</span>
        )}
      </div>
    </motion.div>
  );
};

const ProgressIndicators: React.FC<{ progress: Record<string, ProgressInfo> }> = ({ progress }) => {
  const progressItems = Object.entries(progress);

  if (progressItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {progressItems.map(([id, info]) => (
        <ProgressIndicator key={id} id={id} info={info} />
      ))}
    </div>
  );
};

const ProgressIndicator: React.FC<{ id: string; info: ProgressInfo }> = ({ id, info }) => {
  const { hideProgress, updateProgress } = useFeedback();
  const percentage = Math.round((info.current / info.total) * 100);

  const handleCancel = () => {
    if (info.onCancel) {
      info.onCancel();
    }
    hideProgress(id);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="font-medium text-gray-900">{info.label}</span>
        </div>
        {info.canCancel && (
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{info.current} of {info.total}</span>
        <span>{percentage}%</span>
      </div>
      
      {info.estimatedTime && (
        <div className="text-xs text-gray-500 mt-1">
          Estimated time remaining: {Math.ceil(info.estimatedTime / 1000)}s
        </div>
      )}
    </motion.div>
  );
};

const InlineMessages: React.FC<{ 
  messages: FeedbackMessage[]; 
  onDismiss: (id: string) => void;
}> = ({ messages, onDismiss }) => {
  const inlineMessages = messages.filter(msg => msg.channel === 'inline');

  if (inlineMessages.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 space-y-2">
      <AnimatePresence>
        {inlineMessages.map((message) => (
          <InlineMessage key={message.id} message={message} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const InlineMessage: React.FC<{ 
  message: FeedbackMessage; 
  onDismiss: (id: string) => void;
}> = ({ message, onDismiss }) => {
  const getMessageConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'loading':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getMessageConfig(message.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 max-w-md ${config.color}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{message.title}</h4>
          {message.message && (
            <p className="text-sm mt-1">{message.message}</p>
          )}
          {message.actions && message.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-3 py-1 text-xs rounded ${
                    action.variant === 'primary' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {message.dismissible !== false && (
          <button
            onClick={() => onDismiss(message.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const NotificationCenter: React.FC<{ 
  messages: FeedbackMessage[]; 
  onDismiss: (id: string) => void;
}> = ({ messages, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <NotificationPanel messages={messages} onDismiss={onDismiss} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

const NotificationPanel: React.FC<{
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
  onClose: () => void;
}> = ({ messages, onDismiss, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-20 left-4 z-40 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        {messages.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <NotificationItem key={message.id} message={message} onDismiss={onDismiss} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const NotificationItem: React.FC<{
  message: FeedbackMessage;
  onDismiss: (id: string) => void;
}> = ({ message, onDismiss }) => {
  const getMessageConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' };
      case 'error':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600' };
      case 'warning':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-600' };
      case 'info':
        return { icon: <Info className="w-4 h-4" />, color: 'text-blue-600' };
      case 'loading':
        return { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-gray-600' };
    }
  };

  const config = getMessageConfig(message.type);

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{message.title}</h4>
          {message.message && (
            <p className="text-sm text-gray-600 mt-1">{message.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => onDismiss(message.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export const FeedbackPreferences: React.FC = () => {
  const { preferences, updatePreferences } = useFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable sound notifications</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable vibration</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.autoDismiss}
                onChange={(e) => updatePreferences({ autoDismiss: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-dismiss notifications</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dismiss delay (seconds)
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={preferences.dismissDelay / 1000}
              onChange={(e) => updatePreferences({ dismissDelay: parseInt(e.target.value) * 1000 })}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{preferences.dismissDelay / 1000}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContextualHelp: React.FC<{
  title: string;
  content: ReactNode;
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ title, content, trigger = 'hover', position = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={trigger === 'hover' ? () => setIsOpen(true) : undefined}
        onMouseLeave={trigger === 'hover' ? () => setIsOpen(false) : undefined}
        onClick={trigger === 'click' ? () => setIsOpen(!isOpen) : undefined}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <HelpCircle className="w-3 h-3" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm ${
              position === 'top' ? 'bottom-full mb-2' :
              position === 'bottom' ? 'top-full mt-2' :
              position === 'left' ? 'right-full mr-2' :
              'left-full ml-2'
            }`}
          >
            <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
            <div className="text-gray-600">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackSystem; 