import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Star, 
  Trophy, 
  Target, 
  Users, 
  Brain, 
  FileText, 
  TrendingUp,
  Award,
  Zap,
  Clock,
  Calendar,
  BarChart3
} from 'lucide-react';

interface GoldenPathMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  completedAt?: string;
  points: number;
  category: 'setup' | 'content' | 'engagement' | 'outcomes';
}

interface GoldenPathProgressProps {
  userId: string;
  userRole: 'therapist' | 'client';
  onMilestoneCompleted?: (milestone: GoldenPathMilestone) => void;
}

const GoldenPathProgress: React.FC<GoldenPathProgressProps> = ({ 
  userId, 
  userRole, 
  onMilestoneCompleted 
}) => {
  const [milestones, setMilestones] = useState<GoldenPathMilestone[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<GoldenPathMilestone | null>(null);

  // Define milestones based on user role
  const therapistMilestones: GoldenPathMilestone[] = [
    {
      id: 'first-client',
      title: 'First Client Added',
      description: 'Successfully add your first client to the platform',
      icon: <Users className="w-5 h-5" />,
      completed: false,
      points: 100,
      category: 'setup'
    },
    {
      id: 'ai-treatment-plan',
      title: 'AI Treatment Plan Generated',
      description: 'Create your first AI-powered treatment plan',
      icon: <Brain className="w-5 h-5" />,
      completed: false,
      points: 150,
      category: 'content'
    },
    {
      id: 'first-tasks',
      title: 'Therapeutic Tasks Assigned',
      description: 'Assign initial therapeutic tasks to a client',
      icon: <FileText className="w-5 h-5" />,
      completed: false,
      points: 75,
      category: 'content'
    },
    {
      id: 'client-progress',
      title: 'Progress Tracking Setup',
      description: 'Monitor client progress for the first time',
      icon: <TrendingUp className="w-5 h-5" />,
      completed: false,
      points: 100,
      category: 'engagement'
    },
    {
      id: 'ai-insights',
      title: 'AI Insights Reviewed',
      description: 'Review and act on AI-generated insights',
      icon: <Zap className="w-5 h-5" />,
      completed: false,
      points: 125,
      category: 'outcomes'
    },
    {
      id: 'session-notes',
      title: 'Session Notes Completed',
      description: 'Complete your first AI-enhanced session notes',
      icon: <FileText className="w-5 h-5" />,
      completed: false,
      points: 100,
      category: 'content'
    },
    {
      id: 'week-one',
      title: 'First Week Complete',
      description: 'Successfully complete your first week on the platform',
      icon: <Calendar className="w-5 h-5" />,
      completed: false,
      points: 200,
      category: 'engagement'
    },
    {
      id: 'analytics-review',
      title: 'Analytics Dashboard Used',
      description: 'Explore the analytics dashboard and review client patterns',
      icon: <BarChart3 className="w-5 h-5" />,
      completed: false,
      points: 150,
      category: 'outcomes'
    }
  ];

  const clientMilestones: GoldenPathMilestone[] = [
    {
      id: 'profile-setup',
      title: 'Profile Completed',
      description: 'Complete your profile and preferences setup',
      icon: <Users className="w-5 h-5" />,
      completed: false,
      points: 50,
      category: 'setup'
    },
    {
      id: 'first-mood-entry',
      title: 'First Mood Entry',
      description: 'Log your first mood entry with the AI companion',
      icon: <Brain className="w-5 h-5" />,
      completed: false,
      points: 75,
      category: 'engagement'
    },
    {
      id: 'journal-entry',
      title: 'Smart Journal Used',
      description: 'Write your first entry in the AI-enhanced journal',
      icon: <FileText className="w-5 h-5" />,
      completed: false,
      points: 100,
      category: 'content'
    },
    {
      id: 'first-task',
      title: 'First Task Completed',
      description: 'Complete your first therapeutic task or homework',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: false,
      points: 125,
      category: 'engagement'
    },
    {
      id: 'ai-insights-viewed',
      title: 'AI Insights Explored',
      description: 'Review your personalized AI insights and recommendations',
      icon: <Zap className="w-5 h-5" />,
      completed: false,
      points: 100,
      category: 'outcomes'
    },
    {
      id: 'progress-milestone',
      title: 'Progress Milestone Reached',
      description: 'Achieve your first measurable progress milestone',
      icon: <Target className="w-5 h-5" />,
      completed: false,
      points: 200,
      category: 'outcomes'
    },
    {
      id: 'consistency-streak',
      title: '7-Day Streak',
      description: 'Maintain consistent platform engagement for 7 days',
      icon: <Trophy className="w-5 h-5" />,
      completed: false,
      points: 250,
      category: 'engagement'
    }
  ];

  useEffect(() => {
    const initialMilestones = userRole === 'therapist' ? therapistMilestones : clientMilestones;
    setMilestones(initialMilestones);
  }, [userRole]);

  useEffect(() => {
    const completedPoints = milestones
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.points, 0);
    setTotalPoints(completedPoints);
    
    // Calculate level based on points (every 500 points = 1 level)
    const newLevel = Math.floor(completedPoints / 500) + 1;
    setCurrentLevel(newLevel);
  }, [milestones]);

  const completeMilestone = (milestoneId: string) => {
    setMilestones(prev => {
      const updated = prev.map(m => 
        m.id === milestoneId 
          ? { ...m, completed: true, completedAt: new Date().toISOString() }
          : m
      );
      
      const completedMilestone = updated.find(m => m.id === milestoneId);
      if (completedMilestone && !prev.find(m => m.id === milestoneId)?.completed) {
        setRecentAchievement(completedMilestone);
        setShowCelebration(true);
        onMilestoneCompleted?.(completedMilestone);
        
        // Auto-hide celebration after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      }
      
      return updated;
    });
  };

  const getCategoryProgress = (category: string) => {
    const categoryMilestones = milestones.filter(m => m.category === category);
    const completed = categoryMilestones.filter(m => m.completed).length;
    return { completed, total: categoryMilestones.length };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'setup': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'content': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'engagement': return 'bg-green-100 text-green-700 border-green-300';
      case 'outcomes': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Simulate milestone completion for demo purposes
  const handleDemoComplete = (milestoneId: string) => {
    if (!milestones.find(m => m.id === milestoneId)?.completed) {
      completeMilestone(milestoneId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            Golden Path Progress
          </h3>
          <p className="text-gray-600 text-sm">
            {userRole === 'therapist' ? 'Master your AI-enhanced practice' : 'Your journey to better mental health'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{totalPoints}</div>
          <div className="text-sm text-gray-500">points</div>
          <div className="text-xs text-gray-400">Level {currentLevel}</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress ({completedCount}/{totalCount})
          </span>
          <span className="text-sm font-bold text-primary-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {['setup', 'content', 'engagement', 'outcomes'].map(category => {
          const progress = getCategoryProgress(category);
          return (
            <div
              key={category}
              className={`p-3 rounded-lg border ${getCategoryColor(category)}`}
            >
              <div className="text-xs font-medium capitalize mb-1">{category}</div>
              <div className="text-lg font-bold">
                {progress.completed}/{progress.total}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              milestone.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                milestone.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {milestone.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  milestone.icon
                )}
              </div>
              <div>
                <h5 className={`font-medium ${
                  milestone.completed ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {milestone.title}
                </h5>
                <p className={`text-sm ${
                  milestone.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {milestone.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-bold ${
                milestone.completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                +{milestone.points}pts
              </span>
              {!milestone.completed && (
                <button
                  onClick={() => handleDemoComplete(milestone.id)}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors"
                >
                  Demo Complete
                </button>
              )}
              {milestone.completed && milestone.completedAt && (
                <span className="text-xs text-green-600">
                  {new Date(milestone.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && recentAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Milestone Achieved!
              </h3>
              <h4 className="text-lg font-semibold text-primary-600 mb-3">
                {recentAchievement.title}
              </h4>
              <p className="text-gray-600 mb-6">
                {recentAchievement.description}
              </p>
              
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-primary-600">
                  +{recentAchievement.points}
                </div>
                <div className="text-sm text-primary-700">Points Earned</div>
              </div>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="btn btn-primary w-full"
              >
                Continue Your Journey
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoldenPathProgress;