import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award, 
  BarChart3, 
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Star,
  Zap,
  Brain,
  Calendar,
  Activity
} from 'lucide-react';

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: number;
  description: string;
}

interface GoldenPathMetricsProps {
  userRole: 'therapist' | 'client' | 'admin';
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: string) => void;
}

const GoldenPathMetrics: React.FC<GoldenPathMetricsProps> = ({
  userRole,
  timeRange,
  onTimeRangeChange
}) => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data generation based on user role and time range
  const generateMetrics = (role: string, range: string) => {
    const baseMetrics = {
      therapist: [
        {
          id: 'completion-rate',
          title: 'Golden Path Completion',
          value: 87,
          unit: '%',
          icon: <Target className="w-5 h-5" />,
          color: 'text-green-600',
          trend: 'up' as const,
          trendValue: 12,
          description: 'Therapists completing the full Golden Path workflow'
        },
        {
          id: 'time-to-value',
          title: 'Average Time to First Value',
          value: 4.2,
          unit: 'min',
          icon: <Clock className="w-5 h-5" />,
          color: 'text-blue-600',
          trend: 'down' as const,
          trendValue: 8,
          description: 'Time from start to first successful client addition'
        },
        {
          id: 'client-additions',
          title: 'Clients Added via Golden Path',
          value: 156,
          icon: <Users className="w-5 h-5" />,
          color: 'text-purple-600',
          trend: 'up' as const,
          trendValue: 23,
          description: 'New clients added through the guided workflow'
        },
        {
          id: 'ai-plans-generated',
          title: 'AI Treatment Plans Generated',
          value: 142,
          icon: <Brain className="w-5 h-5" />,
          color: 'text-orange-600',
          trend: 'up' as const,
          trendValue: 35,
          description: 'Treatment plans created using AI assistance'
        },
        {
          id: 'task-assignments',
          title: 'Tasks Assigned',
          value: 324,
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-indigo-600',
          trend: 'up' as const,
          trendValue: 18,
          description: 'Therapeutic tasks assigned to clients'
        },
        {
          id: 'engagement-score',
          title: 'Platform Engagement',
          value: 8.4,
          unit: '/10',
          icon: <Activity className="w-5 h-5" />,
          color: 'text-teal-600',
          trend: 'up' as const,
          trendValue: 5,
          description: 'Average user engagement score'
        }
      ],
      client: [
        {
          id: 'onboarding-completion',
          title: 'Onboarding Completion',
          value: 92,
          unit: '%',
          icon: <Target className="w-5 h-5" />,
          color: 'text-green-600',
          trend: 'up' as const,
          trendValue: 8,
          description: 'Clients completing the full onboarding process'
        },
        {
          id: 'first-week-retention',
          title: 'First Week Retention',
          value: 78,
          unit: '%',
          icon: <Calendar className="w-5 h-5" />,
          color: 'text-blue-600',
          trend: 'up' as const,
          trendValue: 15,
          description: 'Clients active after their first week'
        },
        {
          id: 'feature-adoption',
          title: 'Feature Adoption Rate',
          value: 65,
          unit: '%',
          icon: <Star className="w-5 h-5" />,
          color: 'text-purple-600',
          trend: 'up' as const,
          trendValue: 12,
          description: 'Average adoption of core platform features'
        },
        {
          id: 'ai-interactions',
          title: 'AI Companion Interactions',
          value: 89,
          icon: <Brain className="w-5 h-5" />,
          color: 'text-orange-600',
          trend: 'up' as const,
          trendValue: 28,
          description: 'Daily interactions with AI companion'
        }
      ],
      admin: [
        {
          id: 'total-golden-paths',
          title: 'Total Golden Path Completions',
          value: 1247,
          icon: <Award className="w-5 h-5" />,
          color: 'text-yellow-600',
          trend: 'up' as const,
          trendValue: 22,
          description: 'Total users who completed the Golden Path'
        },
        {
          id: 'conversion-rate',
          title: 'Trial to Paid Conversion',
          value: 34,
          unit: '%',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-green-600',
          trend: 'up' as const,
          trendValue: 7,
          description: 'Users converting from trial to paid plans'
        },
        {
          id: 'support-tickets',
          title: 'Support Ticket Reduction',
          value: 43,
          unit: '%',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-blue-600',
          trend: 'down' as const,
          trendValue: 15,
          description: 'Reduction in support tickets for new users'
        },
        {
          id: 'nps-score',
          title: 'Net Promoter Score',
          value: 67,
          icon: <Star className="w-5 h-5" />,
          color: 'text-purple-600',
          trend: 'up' as const,
          trendValue: 9,
          description: 'User satisfaction and recommendation score'
        }
      ]
    };

    return baseMetrics[role as keyof typeof baseMetrics] || baseMetrics.therapist;
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newMetrics = generateMetrics(userRole, timeRange);
      setMetrics(newMetrics);
      setLoading(false);
    }, 1000);
  }, [userRole, timeRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 text-primary-600 mr-2" />
            Golden Path Success Metrics
          </h3>
          <p className="text-gray-600 text-sm">
            Track the impact and success of your Golden Path implementation
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                {metric.icon}
              </div>
              {metric.trendValue && (
                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm font-medium">
                    {metric.trendValue}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">
                {metric.title}
              </h4>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-lg text-gray-500 mb-1">
                    {metric.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {metric.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Success Stories */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
        <h4 className="text-lg font-bold text-primary-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          Golden Path Impact
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">5 min</div>
            <div className="text-sm text-primary-700">Average completion time</div>
            <div className="text-xs text-primary-600 mt-1">Target: &lt;5 minutes ✓</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">94%</div>
            <div className="text-sm text-primary-700">User satisfaction</div>
            <div className="text-xs text-primary-600 mt-1">"This is exactly what I needed"</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">3x</div>
            <div className="text-sm text-primary-700">Faster onboarding</div>
            <div className="text-xs text-primary-600 mt-1">vs. traditional setup</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
          Key Insights
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">High Completion Rate</p>
              <p className="text-xs text-gray-600">
                87% of users complete the entire Golden Path, indicating strong value perception
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Rapid Value Discovery</p>
              <p className="text-xs text-gray-600">
                Users experience platform value within 4.2 minutes on average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI Adoption Success</p>
              <p className="text-xs text-gray-600">
                95% of Golden Path users actively use AI features within their first week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* A/B Testing Results */}
      {userRole === 'admin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
            A/B Test Results
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Golden Path (Variant A)</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Completion Rate</span>
                  <span className="font-medium text-green-900">87%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Time to Value</span>
                  <span className="font-medium text-green-900">4.2 min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">User Satisfaction</span>
                  <span className="font-medium text-green-900">9.1/10</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Traditional Setup (Control)</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Completion Rate</span>
                  <span className="font-medium text-gray-900">52%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Time to Value</span>
                  <span className="font-medium text-gray-900">12.8 min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">User Satisfaction</span>
                  <span className="font-medium text-gray-900">6.7/10</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Result:</strong> Golden Path shows 67% improvement in completion rate, 
              204% faster time to value, and 36% higher user satisfaction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoldenPathMetrics;