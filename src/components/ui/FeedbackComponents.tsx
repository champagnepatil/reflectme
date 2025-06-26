import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { 
  getSystemStatus, 
  updateSystemStatus, 
  getActiveProgress, 
  getFeedbackPreferences,
  updateFeedbackPreferences,
  playNotificationSound,
  vibrateDevice,
  supportsHapticFeedback,
  supportsAudioFeedback
} from '../../utils/feedbackUtils';

// ============================================================================
// SYSTEM STATUS BANNER
// ============================================================================

interface SystemStatusBannerProps {
  className?: string;
}

export const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({ className = '' }) => {
  const [status, setStatus] = useState(getSystemStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleStatusChange = (event: CustomEvent) => {
      setStatus(event.detail);
      setIsVisible(event.detail.status !== 'online');
    };

    window.addEventListener('systemStatusChange', handleStatusChange as EventListener);
    
    // Check initial status
    const currentStatus = getSystemStatus();
    setIsVisible(currentStatus.status !== 'online');

    return () => {
      window.removeEventListener('systemStatusChange', handleStatusChange as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'offline':
        return {
          icon: <WifiOff className="w-5 h-5" />,
          color: 'bg-red-500 text-white',
          message: 'No internet connection',
          action: 'Check your connection and try again'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-5 h-5 animate-spin" />,
          color: 'bg-blue-500 text-white',
          message: 'Syncing data...',
          action: 'This may take a few moments'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'bg-orange-500 text-white',
          message: 'System error detected',
          action: 'We\'re working to resolve this issue'
        };
      case 'maintenance':
        return {
          icon: <Settings className="w-5 h-5" />,
          color: 'bg-yellow-500 text-white',
          message: 'System maintenance in progress',
          action: 'Some features may be temporarily unavailable'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'bg-gray-500 text-white',
          message: 'System status update',
          action: 'Please check back later'
        };
    }
  };

  const config = getStatusConfig(status.status);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className={`fixed top-0 left-0 right-0 z-50 ${config.color} ${className}`}
    >
      <div className="flex items-center justify-between p-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          {config.icon}
          <div>
            <span className="font-medium">{config.message}</span>
            {status.details && (
              <span className="text-sm opacity-90 ml-2">- {status.details}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm opacity-90">{config.action}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// PROGRESS INDICATORS
// ============================================================================

interface ProgressIndicatorProps {
  id: string;
  info: {
    current: number;
    total: number;
    label: string;
    estimatedTime?: number;
    canCancel?: boolean;
    onCancel?: () => void;
  };
  onDismiss: (id: string) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ id, info, onDismiss }) => {
  const percentage = Math.round((info.current / info.total) * 100);

  const handleCancel = () => {
    if (info.onCancel) {
      info.onCancel();
    }
    onDismiss(id);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="font-medium text-gray-900">{info.label}</span>
        </div>
        {info.canCancel && (
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <motion.div
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{info.current} of {info.total}</span>
        <span>{percentage}%</span>
      </div>
      
      {info.estimatedTime && (
        <div className="text-xs text-gray-500 mt-2">
          Estimated time remaining: {Math.ceil(info.estimatedTime / 1000)}s
        </div>
      )}
    </motion.div>
  );
};

export const ProgressIndicators: React.FC = () => {
  const [activeProgress, setActiveProgress] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { id, progress, type } = event.detail;
      
      if (type === 'show') {
        setActiveProgress(prev => new Map(prev).set(id, progress));
      } else if (type === 'update') {
        setActiveProgress(prev => new Map(prev).set(id, progress));
      } else if (type === 'hide') {
        setActiveProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }
    };

    window.addEventListener('progressUpdate', handleProgressUpdate as EventListener);
    
    // Get initial progress
    setActiveProgress(getActiveProgress());

    return () => {
      window.removeEventListener('progressUpdate', handleProgressUpdate as EventListener);
    };
  }, []);

  const progressItems = Array.from(activeProgress.entries());

  if (progressItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      <AnimatePresence>
        {progressItems.map(([id, info]) => (
          <ProgressIndicator 
            key={id} 
            id={id} 
            info={info} 
            onDismiss={(id) => {
              setActiveProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
              });
            }} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  timestamp: Date;
  read?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  }>;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismiss,
  onMarkAsRead,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'loading':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-20 left-4 z-40 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          {notification.message && (
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {notification.actions.map((action, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick();
                                  }}
                                  className={`px-2 py-1 text-xs rounded ${
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(notification.id);
                          }}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// CONTEXTUAL HELP COMPONENTS
// ============================================================================

interface ContextualHelpProps {
  title: string;
  content: React.ReactNode;
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  title, 
  content, 
  trigger = 'hover', 
  position = 'top',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={trigger === 'hover' ? () => setIsOpen(true) : undefined}
        onMouseLeave={trigger === 'hover' ? () => setIsOpen(false) : undefined}
        onClick={trigger === 'click' ? () => setIsOpen(!isOpen) : undefined}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        aria-label="Help"
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

// ============================================================================
// FEEDBACK PREFERENCES PANEL
// ============================================================================

interface FeedbackPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackPreferencesPanel: React.FC<FeedbackPreferencesPanelProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [preferences, setPreferences] = useState(getFeedbackPreferences());

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updateFeedbackPreferences(newPreferences);
  };

  const testSound = () => {
    playNotificationSound();
  };

  const testVibration = () => {
    vibrateDevice();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Feedback Preferences</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sound Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Sound & Vibration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sound notifications</label>
                      <p className="text-xs text-gray-500">Play sounds for important notifications</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={testSound}
                        disabled={!supportsAudioFeedback()}
                        className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                      >
                        Test
                      </button>
                      <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Vibration</label>
                      <p className="text-xs text-gray-500">Vibrate device for critical alerts</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={testVibration}
                        disabled={!supportsHapticFeedback()}
                        className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                      >
                        Test
                      </button>
                      <input
                        type="checkbox"
                        checked={preferences.vibrationEnabled}
                        onChange={(e) => handlePreferenceChange('vibrationEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-dismiss Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Auto-dismiss</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-dismiss notifications</label>
                    <input
                      type="checkbox"
                      checked={preferences.autoDismiss}
                      onChange={(e) => handlePreferenceChange('autoDismiss', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dismiss delay: {preferences.dismissDelay / 1000}s
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={preferences.dismissDelay / 1000}
                      onChange={(e) => handlePreferenceChange('dismissDelay', parseInt(e.target.value) * 1000)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Mode */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quiet Mode</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable quiet mode</label>
                    <p className="text-xs text-gray-500">Reduce notification frequency</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.quietMode}
                    onChange={(e) => handlePreferenceChange('quietMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// LOADING STATES
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded mb-2 last:mb-0"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// SUCCESS CELEBRATION
// ============================================================================

interface SuccessCelebrationProps {
  title: string;
  message: string;
  type: 'milestone' | 'streak' | 'goal' | 'first';
  onClose: () => void;
  onShare?: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  title,
  message,
  type,
  onClose,
  onShare
}) => {
  const emojis = {
    milestone: '🎯',
    streak: '🔥',
    goal: '🏆',
    first: '⭐'
  };

  const colors = {
    milestone: 'bg-blue-500',
    streak: 'bg-orange-500',
    goal: 'bg-purple-500',
    first: 'bg-yellow-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        className={`${colors[type]} rounded-2xl p-8 text-white text-center max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">{emojis[type]}</div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-lg opacity-90 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors"
            >
              Share
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 transition-colors"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export default {
  SystemStatusBanner,
  ProgressIndicators,
  ProgressIndicator,
  NotificationCenter,
  ContextualHelp,
  FeedbackPreferencesPanel,
  LoadingSpinner,
  Skeleton,
  SuccessCelebration
}; 