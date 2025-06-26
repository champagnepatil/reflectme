import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Target, 
  MessageSquare, 
  Brain,
  Calendar,
  Activity,
  ClipboardList,
  Heart,
  TrendingUp,
  Lightbulb,
  Play,
  ArrowRight,
  Star,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from './button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export interface EmptyStateFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface EmptyStateProps {
  type: 'clients' | 'tasks' | 'assessments' | 'notes' | 'journal' | 'chat' | 'analytics' | 'search' | 'filter' | 'import' | 'custom';
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryActions?: EmptyStateAction[];
  features?: EmptyStateFeature[];
  showSampleData?: boolean;
  sampleData?: {
    title: string;
    items: string[];
  };
  illustration?: React.ReactNode;
  userRole?: 'therapist' | 'client';
  onDismiss?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  primaryAction,
  secondaryActions = [],
  features = [],
  showSampleData = false,
  sampleData,
  illustration,
  userRole = 'therapist',
  onDismiss,
  className = ''
}) => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const getDefaultIllustration = () => {
    const iconClass = "w-16 h-16";
    const colorClass = "text-primary-600";
    
    switch (type) {
      case 'clients':
        return <Users className={`${iconClass} ${colorClass}`} />;
      case 'tasks':
        return <Target className={`${iconClass} ${colorClass}`} />;
      case 'assessments':
        return <ClipboardList className={`${iconClass} ${colorClass}`} />;
      case 'notes':
        return <FileText className={`${iconClass} ${colorClass}`} />;
      case 'journal':
        return <BookOpen className={`${iconClass} ${colorClass}`} />;
      case 'chat':
        return <MessageSquare className={`${iconClass} ${colorClass}`} />;
      case 'analytics':
        return <BarChart3 className={`${iconClass} ${colorClass}`} />;
      case 'search':
        return <Search className={`${iconClass} ${colorClass}`} />;
      case 'filter':
        return <Filter className={`${iconClass} ${colorClass}`} />;
      case 'import':
        return <Upload className={`${iconClass} ${colorClass}`} />;
      default:
        return <Star className={`${iconClass} ${colorClass}`} />;
    }
  };

  const getDefaultFeatures = (): EmptyStateFeature[] => {
    const isTherapist = userRole === 'therapist';
    
    switch (type) {
      case 'clients':
        return isTherapist ? [
          {
            title: 'AI-Powered Insights',
            description: 'Get intelligent recommendations for client care',
            icon: <Brain className="w-5 h-5" />,
            color: 'text-purple-600'
          },
          {
            title: 'Progress Tracking',
            description: 'Monitor client outcomes with visual analytics',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-green-600'
          },
          {
            title: 'Risk Assessment',
            description: 'Early warning alerts for crisis intervention',
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-600'
          }
        ] : [
          {
            title: 'Personalized Care',
            description: 'Tailored treatment plans just for you',
            icon: <Heart className="w-5 h-5" />,
            color: 'text-pink-600'
          },
          {
            title: '24/7 Support',
            description: 'AI companion available whenever you need',
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'text-blue-600'
          },
          {
            title: 'Progress Tracking',
            description: 'See your wellness journey unfold',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-green-600'
          }
        ];

      case 'tasks':
        return [
          {
            title: 'Smart Task Creation',
            description: 'AI generates personalized homework assignments',
            icon: <Sparkles className="w-5 h-5" />,
            color: 'text-purple-600'
          },
          {
            title: 'Progress Monitoring',
            description: 'Track completion rates and client engagement',
            icon: <Activity className="w-5 h-5" />,
            color: 'text-blue-600'
          },
          {
            title: 'Automated Reminders',
            description: 'Never miss important follow-ups',
            icon: <Calendar className="w-5 h-5" />,
            color: 'text-green-600'
          }
        ];

      case 'assessments':
        return [
          {
            title: 'Multiple Instruments',
            description: 'PHQ-9, GAD-7, WHODAS-2.0 and more',
            icon: <ClipboardList className="w-5 h-5" />,
            color: 'text-blue-600'
          },
          {
            title: 'Automated Scoring',
            description: 'Instant results and interpretation',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'text-green-600'
          },
          {
            title: 'Trend Analysis',
            description: 'Track progress over time with AI insights',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-purple-600'
          }
        ];

      case 'analytics':
        return [
          {
            title: 'Predictive Insights',
            description: 'AI forecasts treatment outcomes',
            icon: <Brain className="w-5 h-5" />,
            color: 'text-purple-600'
          },
          {
            title: 'Real-time Monitoring',
            description: 'Live updates on client progress',
            icon: <Activity className="w-5 h-5" />,
            color: 'text-blue-600'
          },
          {
            title: 'Custom Reports',
            description: 'Generate detailed analytics reports',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'text-green-600'
          }
        ];

      default:
        return [];
    }
  };

  const defaultFeatures = features.length > 0 ? features : getDefaultFeatures();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl border border-neutral-200 p-8 ${className}`}
    >
      <div className="text-center max-w-2xl mx-auto">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"
        >
          {illustration || getDefaultIllustration()}
        </motion.div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          {title}
        </h2>
        
        <p className="text-neutral-600 leading-relaxed mb-8 text-lg">
          {description}
        </p>

        {/* Primary Action */}
        {primaryAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'default'}
              size="lg"
              className="inline-flex items-center"
            >
              {primaryAction.icon || <Plus className="w-5 h-5 mr-2" />}
              {primaryAction.label}
            </Button>
          </motion.div>
        )}

        {/* Secondary Actions */}
        {secondaryActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'outline'}
                size="sm"
                className="inline-flex items-center"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Features Section */}
        {defaultFeatures.length > 0 && (
          <div className="border-t border-neutral-200 pt-6 mb-6">
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="flex items-center text-neutral-600 hover:text-neutral-900 mx-auto transition-colors mb-4"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showFeatures ? 'Hide' : 'Show'} Features
              <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showFeatures ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showFeatures && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {defaultFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-4 text-left shadow-sm border border-neutral-100"
                    >
                      <div className={`w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mb-3 ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-neutral-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Sample Data Section */}
        {sampleData && (
          <div className="border-t border-neutral-200 pt-6">
            <button
              onClick={() => setShowSample(!showSample)}
              className="flex items-center text-neutral-600 hover:text-neutral-900 mx-auto transition-colors mb-4"
            >
              <Play className="w-4 h-4 mr-2" />
              {showSample ? 'Hide' : 'Show'} {sampleData.title}
              <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showSample ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showSample && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg p-4 text-left shadow-sm border border-neutral-100"
                >
                  <ul className="space-y-2">
                    {sampleData.items.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start text-sm text-neutral-700"
                      >
                        <span className="mr-2">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dismiss Button */}
        {onDismiss && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onDismiss}
            className="mt-6 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Dismiss
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState; 