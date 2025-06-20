import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AssessmentFormProps, AssessmentResult } from '@/types/assessment';
import { getScaleDefinition, getSeverityColor } from '@/utils/scales';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  instrument,
  assessmentId,
  onComplete,
  onCancel
}) => {
  const scale = getScaleDefinition(instrument);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = scale.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === scale.questions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined;
  const allQuestionsAnswered = scale.questions.every(q => answers[q.id] !== undefined);

  const handleAnswerSelect = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion && allQuestionsAnswered) {
      handleSubmit();
    } else if (canProceed) {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, scale.questions.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return;

    setIsSubmitting(true);
    
    try {
      // Calculate score using the scale's scoring function
      const scoringResult = scale.scoring(answers);
      
      // Create assessment result
      const result: AssessmentResult = {
        id: `result_${Date.now()}`, // In real app, this would come from API
        assessmentId,
        score: scoringResult.score,
        rawJson: answers,
        completedAt: new Date().toISOString(),
        interpretation: scoringResult.interpretation,
        severityLevel: scoringResult.severityLevel
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowResults(true);
      
      // Call completion handler after showing results
      setTimeout(() => {
        onComplete(result);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    const scoringResult = scale.scoring(answers);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-100 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-success-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Assessment completed!
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                {scale.name}
              </h3>
              <div className="text-3xl font-bold text-neutral-900 mb-2">
                {scoringResult.score}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(scoringResult.severityLevel)}`}>
                {scoringResult.severityLevel.charAt(0).toUpperCase() + scoringResult.severityLevel.slice(1)}
              </div>
            </div>
            
            <div className="text-left p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Interpretazione:</strong> {scoringResult.interpretation}
              </p>
            </div>
          </div>
          
          <p className="text-neutral-600 text-sm mt-6">
            The results have been saved to your profile. You will be redirected in a few seconds...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-neutral-900">{scale.name}</h2>
          <span className="text-sm text-neutral-600">
            {currentQuestionIndex + 1} di {scale.questions.length}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / scale.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="bg-primary-600 h-2 rounded-full"
          />
        </div>
        <p className="text-sm text-neutral-600 mt-2">{scale.description}</p>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="card p-8 mb-6"
      >
        <h3 className="text-lg font-medium text-neutral-900 mb-6">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswerSelect(option.value)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                answers[currentQuestion.id] === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-neutral-300'
                }`}>
                  {answers[currentQuestion.id] === option.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Special alert for suicidal ideation question (PHQ-9 question 9) */}
        {instrument === 'PHQ-9' && currentQuestion.id === 'phq9_9' && answers[currentQuestion.id] && answers[currentQuestion.id] > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-error-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-error-800 mb-1">Immediate support available</h4>
                <p className="text-error-700 text-sm mb-2">
                  If you are having thoughts of self-harm, contact immediately:
                </p>
                <ul className="text-error-700 text-sm space-y-1">
                  <li>• Telefono Amico: 199 284 284</li>
                  <li>• Samaritans Onlus: 800 86 00 22</li>
                  <li>• Emergenza: 112</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={currentQuestionIndex > 0 ? handlePrevious : onCancel}
          className="btn btn-outline flex items-center"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentQuestionIndex > 0 ? 'Precedente' : 'Annulla'}
        </button>

        <div className="flex items-center space-x-2">
          {scale.questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentQuestionIndex
                  ? answers[scale.questions[index].id] !== undefined
                    ? 'bg-success-500'
                    : 'bg-primary-500'
                  : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className={`btn ${isLastQuestion && allQuestionsAnswered ? 'btn-primary' : 'btn-outline'} flex items-center`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Invio...
            </>
          ) : isLastQuestion && allQuestionsAnswered ? (
            <>
              Completa Assessment
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Successivo
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 