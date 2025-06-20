import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Sun, Moon, Zap, CheckCircle, X } from 'lucide-react';

interface DailyCheckInIntegrationProps {
  onSubmit: (responses: DailyCheckInData) => void;
  onDismiss: () => void;
  isVisible: boolean;
}

interface DailyCheckInData {
  mood: number;
  energy: number;
  sleep: number;
  stress: number;
  gratitude: string;
  goals: string;
  support_needed: boolean;
  timestamp: string;
}

const DailyCheckInIntegration: React.FC<DailyCheckInIntegrationProps> = ({ 
  onSubmit, 
  onDismiss, 
  isVisible 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<DailyCheckInData>>({});
  const [isComplete, setIsComplete] = useState(false);

  const checkInQuestions = [
    {
      id: 'mood',
      type: 'scale',
      question: "How's your mood feeling right now?",
      subtitle: "On a scale of 1-5, where would you place yourself?",
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      options: [
        { value: 1, label: 'Low', emoji: '😔' },
        { value: 2, label: 'Below average', emoji: '😕' },
        { value: 3, label: 'Okay', emoji: '😐' },
        { value: 4, label: 'Good', emoji: '🙂' },
        { value: 5, label: 'Great', emoji: '😊' }
      ]
    },
    {
      id: 'energy',
      type: 'scale',
      question: "What's your energy level like?",
      subtitle: "This helps track patterns in your daily rhythm",
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      options: [
        { value: 1, label: 'Drained', emoji: '🔋' },
        { value: 2, label: 'Low', emoji: '🪫' },
        { value: 3, label: 'Moderate', emoji: '🔋' },
        { value: 4, label: 'Energized', emoji: '⚡' },
        { value: 5, label: 'High energy', emoji: '🚀' }
      ]
    },
    {
      id: 'sleep',
      type: 'scale',
      question: "How was your sleep last night?",
      subtitle: "Sleep quality affects mood and energy significantly",
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      options: [
        { value: 1, label: 'Very poor', emoji: '😴' },
        { value: 2, label: 'Poor', emoji: '😪' },
        { value: 3, label: 'Okay', emoji: '😐' },
        { value: 4, label: 'Good', emoji: '😌' },
        { value: 5, label: 'Excellent', emoji: '😴' }
      ]
    },
    {
      id: 'stress',
      type: 'scale',
      question: "What's your stress level today?",
      subtitle: "Tracking stress helps identify patterns and triggers",
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      options: [
        { value: 1, label: 'Very low', emoji: '😌' },
        { value: 2, label: 'Low', emoji: '🙂' },
        { value: 3, label: 'Moderate', emoji: '😐' },
        { value: 4, label: 'High', emoji: '😰' },
        { value: 5, label: 'Very high', emoji: '😫' }
      ]
    },
    {
      id: 'gratitude',
      type: 'text',
      question: "What's one thing you're grateful for today?",
      subtitle: "Even small things count - gratitude builds resilience",
      icon: Sun,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      placeholder: "I'm grateful for..."
    },
    {
      id: 'support_needed',
      type: 'boolean',
      question: "Do you feel like you need extra support today?",
      subtitle: "It's okay to ask for help - that's why we're here",
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const currentQuestion = checkInQuestions[currentStep];

  const handleResponse = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (currentStep < checkInQuestions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    } else {
      // Complete the check-in
      const finalData: DailyCheckInData = {
        mood: responses.mood || 3,
        energy: responses.energy || 3,
        sleep: responses.sleep || 3,
        stress: responses.stress || 3,
        gratitude: responses.gratitude || '',
        goals: '',
        support_needed: value,
        timestamp: new Date().toISOString(),
        ...responses,
        [currentQuestion.id]: value
      };
      
      setIsComplete(true);
      setTimeout(() => {
        onSubmit(finalData);
      }, 1500);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / checkInQuestions.length) * 100;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-4 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Check-In</h2>
              <p className="text-sm text-gray-600">Let's see how you're doing today</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentStep + 1} of {checkInQuestions.length}</span>
            <span>{Math.round(getProgressPercentage())}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex items-center justify-center">
          {isComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Check-in Complete!</h3>
              <p className="text-gray-600">
                Thank you for sharing. This information helps track your progress and wellbeing.
              </p>
            </motion.div>
          ) : (
            <div className="w-full max-w-lg">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${currentQuestion.bgColor} ${currentQuestion.borderColor} border rounded-3xl p-8`}
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${currentQuestion.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <currentQuestion.icon className={`w-8 h-8 ${currentQuestion.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {currentQuestion.question}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {currentQuestion.subtitle}
                  </p>
                </div>

                {/* Response Options */}
                {currentQuestion.type === 'scale' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleResponse(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all flex items-center space-x-4"
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">Level {option.value}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      onChange={(e) => setResponses(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => handleResponse(responses[currentQuestion.id as keyof typeof responses] || '')}
                      className="w-full p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'boolean' && (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => handleResponse(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-green-300 transition-all text-center"
                    >
                      <div className="text-3xl mb-2">🙂</div>
                      <div className="font-medium text-gray-900">I'm doing okay</div>
                      <div className="text-sm text-gray-500">Feeling manageable</div>
                    </motion.button>
                    <motion.button
                      onClick={() => handleResponse(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 transition-all text-center"
                    >
                      <div className="text-3xl mb-2">🤗</div>
                      <div className="font-medium text-gray-900">I could use support</div>
                      <div className="text-sm text-gray-500">Extra help today</div>
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyCheckInIntegration; 