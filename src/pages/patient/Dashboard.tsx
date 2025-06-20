import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  MessageSquare,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  Heart,
  Zap,
  Star,
  Smartphone,
  Link as LinkIcon
} from 'lucide-react';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

interface UpcomingItem {
  id: string;
  type: 'session' | 'exercise' | 'assessment';
  title: string;
  time: string;
  urgent?: boolean;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showMoodSuccess, setShowMoodSuccess] = useState(false);

  useEffect(() => {
    // Set personalized greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Quick stats - enhanced with more realistic demo data
    setQuickStats([
      {
        label: 'Mood Average',
        value: '3.8',
        change: '+0.3 this week',
        trend: 'up',
        color: 'bg-green-500'
      },
      {
        label: 'Journal Entries',
        value: '20',
        change: '5 this week',
        trend: 'up',
        color: 'bg-blue-500'
      },
      {
        label: 'Current Streak',
        value: '12',
        change: 'days logging',
        trend: 'stable',
        color: 'bg-purple-500'
      }
    ]);

    // Upcoming items - today's priorities only
    setUpcomingItems([
      {
        id: '1',
        type: 'session',
        title: 'Therapy Session with Dr. Chen',
        time: 'Tomorrow 2:30 PM',
        urgent: false
      },
      {
        id: '2',
        type: 'exercise',
        title: 'Evening Reflection Journal',
        time: 'Due today',
        urgent: true
      },
      {
        id: '3',
        type: 'assessment',
        title: 'Weekly Mood Assessment',
        time: 'Due in 2 days',
        urgent: false
      }
    ]);
  };

  const handleMoodSelection = (mood: number) => {
    setSelectedMood(mood);
    setShowMoodSuccess(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowMoodSuccess(false);
    }, 2000);
    
    // Here you would typically save to your backend/context
    console.log(`Mood logged: ${mood}`);
  };

  const getItemIcon = (type: UpcomingItem['type']) => {
    switch (type) {
      case 'session': return Calendar;
      case 'exercise': return Activity;
      case 'assessment': return CheckCircle;
      default: return Clock;
    }
  };

  const getItemColor = (type: UpcomingItem['type']) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-700';
      case 'exercise': return 'bg-green-100 text-green-700';
      case 'assessment': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const quickActions = [
    {
      title: 'Start Chat',
      subtitle: 'Talk with AI companion',
      href: '/client/chat',
      icon: MessageSquare,
      color: 'bg-blue-500',
      description: 'Get instant support'
    },
    {
      title: 'Today\'s Plan',
      subtitle: 'View exercises & goals',
      href: '/client/plan',
      icon: Target,
      color: 'bg-purple-500',
      description: 'Stay on track'
    },
    {
      title: 'Progress',
      subtitle: 'Check your insights',
      href: '/client/insights',
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'See improvements'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Personal Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 text-lg">
          How are you feeling today?
        </p>
      </motion.div>

      {/* Quick Mood Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Quick Mood Check
        </h2>
        {showMoodSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">Mood logged successfully!</p>
            <p className="text-sm text-gray-500">Thank you for checking in</p>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelection(mood)}
                  className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center text-xl ${
                    selectedMood === mood
                      ? 'bg-blue-500 text-white scale-110'
                      : 'bg-gray-100 hover:bg-blue-100'
                  }`}
                >
                  {mood === 1 && '😢'}
                  {mood === 2 && '😕'}
                  {mood === 3 && '😐'}
                  {mood === 4 && '🙂'}
                  {mood === 5 && '😊'}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-3">
              Tap to log your current mood
            </p>
          </>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center"
          >
            <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
            {stat.change && (
              <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Google Fit Integration CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Google Fit
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Sync your physical activity data to get a complete picture of your wellness journey. 
              Track steps, workouts, and see how exercise impacts your mood.
            </p>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Now
              </button>
              <span className="text-xs text-gray-500">
                Secure & private connection
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Smartphone className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
        
        {/* Benefits */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Activity className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Activity Sync</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Mood Insights</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Heart className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Wellness Track</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">{action.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Today's Priorities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Priorities</h2>
          <Link 
            to="/client/plan"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingItems.slice(0, 3).map((item, index) => {
            const Icon = getItemIcon(item.type);
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  item.urgent 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getItemColor(item.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                
                {item.urgent && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center"
      >
        <Star className="w-8 h-8 mx-auto mb-3 opacity-80" />
        <p className="text-lg font-medium mb-2">
          "Progress, not perfection."
        </p>
        <p className="text-sm opacity-80">
          Every small step forward counts in your journey.
        </p>
      </motion.div>
    </div>
  );
};

export default PatientDashboard;