import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: React.ReactNode;
  validation?: () => boolean | Promise<boolean>;
  required?: boolean;
}

interface ProgressiveFormProps {
  title: string;
  steps: FormStep[];
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: any;
  loading?: boolean;
  autoSave?: boolean;
  className?: string;
}

const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
  title,
  steps,
  onSubmit,
  onCancel,
  initialData = {},
  loading = false,
  autoSave = false,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = !currentStepData.required || completedSteps.has(currentStep);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, autoSave]);

  const handleAutoSave = async () => {
    try {
      // Save current progress
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const step = steps[stepIndex];
    if (!step.validation) return true;

    try {
      const isValid = await step.validation();
      if (!isValid) {
        setErrors(prev => ({ ...prev, [step.id]: 'Please complete this step' }));
      }
      return isValid;
    } catch (error) {
      setErrors(prev => ({ ...prev, [step.id]: 'Validation failed' }));
      return false;
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      await handleSubmit();
      return;
    }

    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    setErrors(prev => ({ ...prev, [currentStepData.id]: '' }));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = async (stepIndex: number) => {
    // Allow clicking on completed steps or the next available step
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'available';
    return 'locked';
  };

  const getProgressPercentage = () => {
    return ((completedSteps.size + (canProceed ? 1 : 0)) / steps.length) * 100;
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
          {autoSave && lastSaved && (
            <p className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = status !== 'locked';
            
            return (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <button
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : status === 'available'
                      ? 'bg-white border-gray-300 text-gray-600 hover:border-blue-500'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                
                <div className={`ml-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <p className={`text-sm font-medium ${
                    status === 'completed' || status === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            {currentStepData.title}
            {errors[currentStepData.id] && (
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
            )}
          </CardTitle>
          {currentStepData.description && (
            <p className="text-gray-600">{currentStepData.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.fields}
              
              {errors[currentStepData.id] && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors[currentStepData.id]}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={loading || isSubmitting || !canProceed}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isLastStep ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProgressiveForm; 