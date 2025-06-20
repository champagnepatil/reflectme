import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Star, 
  Trophy, 
  Heart, 
  Share2, 
  Download, 
  Twitter, 
  Facebook, 
  Copy,
  X,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    type: 'exercise_complete' | 'streak' | 'milestone' | 'mood_improvement' | 'goal_reached';
    title: string;
    description: string;
    points?: number;
    streak?: number;
    level?: number;
  };
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, achievement }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getAchievementIcon = () => {
    switch (achievement.type) {
      case 'exercise_complete': return Target;
      case 'streak': return Star;
      case 'milestone': return Trophy;
      case 'mood_improvement': return Heart;
      case 'goal_reached': return Award;
      default: return Star;
    }
  };

  const getAchievementColor = () => {
    switch (achievement.type) {
      case 'exercise_complete': return 'from-blue-400 to-blue-600';
      case 'streak': return 'from-yellow-400 to-orange-500';
      case 'milestone': return 'from-purple-400 to-pink-500';
      case 'mood_improvement': return 'from-green-400 to-emerald-500';
      case 'goal_reached': return 'from-indigo-400 to-purple-600';
      default: return 'from-blue-400 to-purple-600';
    }
  };

  const shareText = `🎉 I just ${achievement.title.toLowerCase()} on ReflectMe! ${achievement.description} #MentalHealthJourney #ReflectMe`;

  const handleShare = async (platform: 'twitter' | 'facebook' | 'copy') => {
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText} ${url}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
    }
  };

  const generateCertificate = () => {
    // In a real app, this would generate a PDF certificate
    console.log('Generating certificate for:', achievement.title);
  };

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
    delay: Math.random() * 1000,
    duration: 3000 + Math.random() * 2000,
    x: Math.random() * 100,
    rotation: Math.random() * 360,
  }));

  const Icon = getAchievementIcon();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Confetti */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {confettiPieces.map((piece) => (
                  <motion.div
                    key={piece.id}
                    initial={{ 
                      y: -10, 
                      x: piece.x + '%', 
                      rotate: 0,
                      opacity: 1 
                    }}
                    animate={{ 
                      y: '100vh', 
                      rotate: piece.rotation,
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: piece.duration / 1000,
                      delay: piece.delay / 1000,
                      ease: 'easeOut'
                    }}
                    className="absolute w-3 h-3 rounded"
                    style={{ backgroundColor: piece.color }}
                  />
                ))}
              </div>
            )}

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300 
              }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Achievement Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: 'spring',
                  damping: 20,
                  stiffness: 300
                }}
                className={`w-24 h-24 bg-gradient-to-r ${getAchievementColor()} rounded-full flex items-center justify-center mx-auto mb-6 relative`}
              >
                <Icon className="w-12 h-12 text-white" />
                
                {/* Sparkle effects */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-400" />
                  <Sparkles className="absolute top-1/2 -left-3 w-5 h-5 text-blue-400" />
                </motion.div>
              </motion.div>

              {/* Achievement Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Congratulations!
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {achievement.description}
                </p>

                {/* Achievement Stats */}
                <div className="flex justify-center space-x-6 mt-4">
                  {achievement.points && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">+{achievement.points}</div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                  )}
                  {achievement.streak && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{achievement.streak}</div>
                      <div className="text-xs text-gray-500">Day Streak</div>
                    </div>
                  )}
                  {achievement.level && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">Level {achievement.level}</div>
                      <div className="text-xs text-gray-500">Unlocked</div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                {/* Share Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    Share Your Achievement
                  </h4>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm text-green-600 mt-2"
                    >
                      Copied to clipboard!
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={generateCertificate}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Get Certificate
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>

              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <p className="text-sm text-gray-600 italic">
                  "Every step forward, no matter how small, is progress worth celebrating."
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;