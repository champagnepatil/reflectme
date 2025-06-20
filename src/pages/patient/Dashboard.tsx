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
  Link as LinkIcon,
  Brain,
  Sparkles
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

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return '😢';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };

  const getMoodLabel = (mood: number) => {
    switch (mood) {
      case 1: return 'Need extra support';
      case 2: return 'Having a tough time';
      case 3: return 'Feeling okay';
      case 4: return 'Doing well';
      case 5: return 'Feeling great';
      default: return 'How are you?';
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to check in with yourself today?
        </p>
      </motion.div>

      {/* PRIMARY ACTION: Chat with AI Companion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Companion</h2>
                <p className="text-blue-100">Your therapeutic support is here 24/7</p>
              </div>
            </div>
            <p className="text-white/90 mb-6 text-lg">
              Share what's on your mind, practice coping strategies, or just check in. 
              Your AI companion understands your therapy goals and is ready to support you.
            </p>
            <Link 
              to="/client/chat"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <Heart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Start Conversation
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Brain className="w-16 h-16 text-white/70" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* PROMINENT MOOD TRACKER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">How are you feeling right now?</h2>
          </div>
          
          {showMoodSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">Thank you for checking in!</h3>
              <p className="text-gray-600">Your mood has been logged. Every check-in helps track your progress.</p>
              <div className="mt-6 p-4 bg-green-50 rounded-2xl">
                <p className="text-green-700 font-medium">
                  {getMoodLabel(selectedMood || 0)}
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 max-w-lg mx-auto mb-6">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <motion.button
                    key={mood}
                    onClick={() => handleMoodSelection(mood)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-3xl transition-all duration-200 flex flex-col items-center justify-center text-center p-4 ${
                      selectedMood === mood
                        ? 'bg-blue-500 text-white scale-110 shadow-lg'
                        : 'bg-gray-100 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl mb-2">{getMoodEmoji(mood)}</span>
                    <span className="text-xs font-medium">
                      {mood === 1 && 'Low'}
                      {mood === 2 && 'Down'}
                      {mood === 3 && 'Okay'}
                      {mood === 4 && 'Good'}
                      {mood === 5 && 'Great'}
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                Tap any mood to log how you're feeling. This helps track patterns over time.
              </p>
              <div className="text-sm text-gray-500">
                💡 Tip: Regular mood tracking helps you and your therapist understand what works best for you
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Today's Plan */}
        <Link 
          to="/client/plan"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Plan</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                View your personalized exercises, goals, and therapy homework for today.
              </p>
              <div className="text-purple-600 font-medium text-sm group-hover:text-purple-700">
                View plan →
              </div>
            </div>
          </div>
        </Link>

        {/* Progress Insights */}
        <Link 
          to="/client/insights"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Progress Insights</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                See your wellness trends, achievements, and areas of growth over time.
              </p>
              <div className="text-green-600 font-medium text-sm group-hover:text-green-700">
                View insights →
              </div>
            </div>
          </div>
        </Link>
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