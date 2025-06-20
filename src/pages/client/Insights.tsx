import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Target, 
  Star, 
  Calendar,
  Award,
  Sparkles,
  Share2,
  Download,
  Trophy,
  Zap,
  MessageCircle,
  BarChart3,
  Timer,
  CheckCircle,
  Loader2,
  Copy,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useReflectMe } from '../../contexts/ReflectMeContext';
import { GeminiAIService } from '../../services/geminiAIService';

interface InsightData {
  moodTrend: number;
  wellnessScore: number;
  goalsProgress: number;
  streakDays: number;
  totalSessions: number;
  improvementAreas: string[];
  strengths: string[];
  nextMilestone: string;
  aiInsights: string;
  celebrationTrigger?: string;
}

const Insights: React.FC = () => {
  const { user } = useAuth();
  const { getProgressData, sessionRecaps, moodEntries } = useReflectMe();
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState('');

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Get basic data
      const progressData = getProgressData();
      const recentMood = progressData.slice(-7).reduce((sum, entry) => sum + entry.mood, 0) / 7;
      const previousMood = progressData.slice(-14, -7).reduce((sum, entry) => sum + entry.mood, 0) / 7;
      const moodTrend = ((recentMood - previousMood) / previousMood) * 100;

      // Calculate metrics
      const wellnessScore = Math.min(100, (recentMood / 5) * 100);
      const streakDays = calculateStreak();
      const goalsProgress = calculateGoalsProgress();

      const basicInsights: InsightData = {
        moodTrend: Math.round(moodTrend),
        wellnessScore: Math.round(wellnessScore),
        goalsProgress,
        streakDays,
        totalSessions: sessionRecaps.length,
        improvementAreas: ['Anxiety Management', 'Sleep Quality', 'Social Connections'],
        strengths: ['Self-Awareness', 'Consistency', 'Goal Setting'],
        nextMilestone: `${10 - (streakDays % 10)} days to ${Math.floor(streakDays / 10) + 1}0-day milestone`,
        aiInsights: 'Generating personalized insights...',
        celebrationTrigger: streakDays > 0 && streakDays % 7 === 0 ? `${streakDays}-day streak` : undefined
      };

      setInsightData(basicInsights);

      // Generate AI insights
      await generateAIInsights(basicInsights);

      // Show celebration if milestone reached
      if (basicInsights.celebrationTrigger) {
        setTimeout(() => setShowCelebration(true), 1000);
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (data: InsightData) => {
    setAiInsightsLoading(true);
    try {
      const progressSummary = `
User has been tracking their mental health for ${data.totalSessions} sessions.
Current wellness score: ${data.wellnessScore}/100
Mood trend: ${data.moodTrend > 0 ? 'improving' : 'declining'} by ${Math.abs(data.moodTrend)}%
Streak: ${data.streakDays} consecutive days
Key strengths: ${data.strengths.join(', ')}
Areas for improvement: ${data.improvementAreas.join(', ')}
      `;

      const response = await GeminiAIService.generaRispostaChat(
        `Generate personalized mental health insights and encouragement based on this progress: ${progressSummary}. Provide 2-3 sentences with specific achievements and actionable next steps.`,
        user?.id || 'demo-client-1',
        true
      );

      setInsightData(prev => prev ? {
        ...prev,
        aiInsights: response.contenuto
      } : null);

    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsightData(prev => prev ? {
        ...prev,
        aiInsights: 'Your journey shows consistent progress and dedication to your mental wellness. Keep building on your strengths and celebrating small wins!'
      } : null);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const calculateStreak = (): number => {
    // Simple streak calculation based on mood entries
    return Math.max(1, moodEntries.length % 30);
  };

  const calculateGoalsProgress = (): number => {
    // Mock calculation - in real app would be based on actual goals
    return Math.round(Math.random() * 40 + 60); // 60-100%
  };

  const handleShare = (platform: string) => {
    const content = `🌟 I've been taking care of my mental health for ${insightData?.streakDays} days! 💪\n\nWellness Score: ${insightData?.wellnessScore}/100\nFeeling grateful for this progress! ✨\n\n#MentalHealthMatters #SelfCare #Progress`;
    
    setShareContent(content);

    const encodedContent = encodeURIComponent(content);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      instagram: '' // Instagram doesn't support direct sharing via URL
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(content);
      alert('Content copied to clipboard!');
    } else if (platform === 'instagram') {
      alert('Content copied! Paste it into your Instagram post.');
      navigator.clipboard.writeText(content);
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
  };

  const downloadProgress = () => {
    const progressData = getProgressData();
    const csv = 'Date,Mood\n' + progressData.map(entry => `${entry.date},${entry.mood}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mental-health-progress.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading || !insightData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-neutral-800 mb-2">Congratulations! 🎉</h2>
              <p className="text-xl text-primary-600 font-semibold mb-4">
                {insightData.celebrationTrigger} Achievement!
              </p>
              <p className="text-neutral-600 mb-6">
                You're building amazing mental health habits. Keep up the incredible work!
              </p>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="btn btn-primary mr-3"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </button>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="btn btn-outline"
              >
                Continue
              </button>
              
              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: Math.random() * 300 - 150,
                    y: Math.random() * 300 - 150,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: -200,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-neutral-800">Share Your Progress</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-neutral-600 mb-6">
                Inspire others with your mental health journey!
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Twitter className="w-5 h-5 mr-2" />
                  Twitter
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center p-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn
                </button>
                
                <button
                  onClick={() => handleShare('instagram')}
                  className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Instagram
                </button>
              </div>
              
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center justify-center p-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy to Clipboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4"
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Your Mental Health Insights</h1>
        <p className="text-lg text-neutral-600">AI-powered analysis of your wellness journey</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800">{insightData.wellnessScore}/100</h3>
          <p className="text-neutral-600">Wellness Score</p>
          <div className="mt-2">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${insightData.wellnessScore}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 text-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800">{insightData.streakDays}</h3>
          <p className="text-neutral-600">Day Streak</p>
          {insightData.streakDays >= 7 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center mt-2 text-yellow-600"
            >
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Hot Streak!</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800">{insightData.goalsProgress}%</h3>
          <p className="text-neutral-600">Goals Progress</p>
          <div className="mt-2">
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${insightData.goalsProgress}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800">{insightData.totalSessions}</h3>
          <p className="text-neutral-600">Total Sessions</p>
          <p className="text-sm text-purple-600 mt-1 font-medium">
            {insightData.moodTrend > 0 ? '↗️ Improving' : '→ Stable'} 
            {Math.abs(insightData.moodTrend)}%
          </p>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">AI-Powered Insights</h2>
            <p className="text-neutral-600">Personalized analysis of your progress</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          {aiInsightsLoading ? (
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-neutral-600">Analyzing your journey...</span>
            </div>
          ) : (
            <p className="text-lg text-neutral-700 leading-relaxed">{insightData.aiInsights}</p>
          )}
        </div>
      </motion.div>

      {/* Strengths & Areas for Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">Your Strengths</h3>
          </div>
          <div className="space-y-3">
            {insightData.strengths.map((strength, index) => (
              <motion.div
                key={strength}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-neutral-700">{strength}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800">Growth Areas</h3>
          </div>
          <div className="space-y-3">
            {insightData.improvementAreas.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-neutral-700">{area}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800">Next Milestone</h3>
              <p className="text-neutral-600">{insightData.nextMilestone}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{10 - (insightData.streakDays % 10)}</div>
            <div className="text-sm text-neutral-600">days to go</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button
          onClick={() => setShowShareModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Progress
        </button>
        
        <button
          onClick={downloadProgress}
          className="btn btn-outline flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Data
        </button>
        
        <button
          onClick={generateInsights}
          disabled={aiInsightsLoading}
          className="btn btn-outline flex items-center"
        >
          {aiInsightsLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          Refresh Insights
        </button>
      </motion.div>
    </div>
  );
};

export default Insights; 