import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  Plus, 
  Calendar, 
  Target, 
  BookOpen, 
  Brain, 
  Heart, 
  Activity,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface TaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onTaskCreated?: (task: any) => void;
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultDuration: number; // giorni
  icon: React.ReactNode;
  color: string;
}

const taskTemplates: TaskTemplate[] = [
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Practice the 4-7-8 breathing technique for 5 minutes every morning',
    category: 'mindfulness',
    defaultDuration: 7,
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'mood-diary',
    title: 'Mood Diary',
    description: 'Record mood 3 times a day with notes on emotional triggers',
    category: 'emotional-regulation',
    defaultDuration: 14,
    icon: <BookOpen className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'behavioral-activation',
    title: 'Behavioral Activation',
    description: 'Plan and engage in one pleasant activity every day',
    category: 'behavioral',
    defaultDuration: 7,
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'cbt-exercise',
    title: 'Cognitive Restructuring',
    description: 'Identify and challenge 3 automatic negative thoughts daily',
    category: 'cbt',
    defaultDuration: 10,
    icon: <Brain className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding Technique',
    description: 'Use the technique when feeling anxiety or stress',
    category: 'cbt',
    defaultDuration: 5,
    icon: <Target className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'custom',
    title: 'Custom Task',
    description: 'Create a tailored task for the client',
    category: 'custom',
    defaultDuration: 7,
    icon: <Plus className="w-4 h-4" />,
    color: 'bg-neutral-100 text-neutral-700'
  }
];

export const TaskCreator: React.FC<TaskCreatorProps> = ({
  isOpen,
  onClose,
  clientId,
  onTaskCreated
}) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'homework',
    priority: 'medium',
    dueDate: '',
    maxCompletions: 1,
    completionCriteria: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'template' | 'form'>('template');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('template');
      setSelectedTemplate(null);
      setFormData({
        title: '',
        description: '',
        category: 'homework',
        priority: 'medium',
        dueDate: '',
        maxCompletions: 1,
        completionCriteria: ''
      });
      setError(null);
    }
  }, [isOpen]);

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + selectedTemplate.defaultDuration);
      
      setFormData({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        priority: 'medium',
        dueDate: defaultDueDate.toISOString().split('T')[0],
        maxCompletions: selectedTemplate.category === 'practice' ? 7 : 1,
        completionCriteria: selectedTemplate.category === 'practice' 
          ? `Complete for ${selectedTemplate.defaultDuration} consecutive days`
          : 'Activity completion'
      });
      setStep('form');
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData = {
        client_id: clientId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_at: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        task_type: formData.category === 'custom' ? 'homework' : formData.category,
        priority: formData.priority,
        category: formData.category === 'custom' ? null : formData.category,
        created_by: user?.id || 'unknown',
        completion_criteria: formData.completionCriteria.trim() || null,
        max_completions: Math.max(1, formData.maxCompletions)
      };

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Task creato:', data);

      // Call callback if provided
      if (onTaskCreated) {
        onTaskCreated(data);
      }

      // Close modal
      onClose();

    } catch (err) {
      console.error('❌ Errore creazione task:', err);
      setError('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return <Heart className="w-4 h-4" />;
      case 'cbt': return <Brain className="w-4 h-4" />;
      case 'behavioral': return <Activity className="w-4 h-4" />;
      case 'emotional-regulation': return <BookOpen className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'mindfulness': return 'Mindfulness';
      case 'cbt': return 'Cognitive Behavioral Therapy';
      case 'behavioral': return 'Behavioral Activation';
      case 'emotional-regulation': return 'Emotional Regulation';
      case 'practice': return 'Daily Practice';
      case 'assessment': return 'Assessment';
      default: return 'Homework';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Plus className="w-6 h-6 mr-3" />
                <div>
                                  <h2 className="text-xl font-semibold">Create New Task</h2>
                <p className="text-primary-100 text-sm">
                  {step === 'template' ? 'Choose a template or create from scratch' : 'Customize the task'}
                </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === 'template' ? (
              // Template Selection Step
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Available Task Templates
                  </h3>
                  <p className="text-neutral-600">
                    Select a predefined template or create a custom task
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {taskTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="border border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg ${template.color} mr-3 flex-shrink-0`}>
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 mb-1">
                            {template.title}
                          </h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center text-xs text-neutral-500">
                            {getCategoryIcon(template.category)}
                            <span className="ml-1">
                              {getCategoryName(template.category)}
                            </span>
                            <span className="mx-2">•</span>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{template.defaultDuration} days</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Form Step
              <div className="p-6">
                <div className="mb-6">
                  <button
                    onClick={() => setStep('template')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    ← Back to templates
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="label">
                      Task Title <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="E.g.: Daily breathing exercises"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">
                      Description <span className="text-error-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input min-h-[100px] resize-y"
                      placeholder="Describe in detail what the client should do..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                      <label className="label">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="input"
                      >
                        <option value="homework">Homework</option>
                        <option value="practice">Practice</option>
                        <option value="exercise">Exercise</option>
                        <option value="reflection">Reflection</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="label">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div>
                      <label className="label">Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Max Completions */}
                    <div>
                      <label className="label">Required Completions</label>
                      <input
                        type="number"
                        value={formData.maxCompletions}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxCompletions: parseInt(e.target.value) || 1 }))}
                        className="input"
                        min="1"
                        max="30"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        For repeatable tasks (e.g.: daily practice)
                      </p>
                    </div>
                  </div>

                  {/* Completion Criteria */}
                  <div>
                    <label className="label">Completion Criteria</label>
                    <textarea
                      value={formData.completionCriteria}
                      onChange={(e) => setFormData(prev => ({ ...prev, completionCriteria: e.target.value }))}
                      className="input min-h-[80px] resize-y"
                      placeholder="Describe what constitutes task completion..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                      <div className="flex items-center text-error-700">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Suggested Resources */}
                  {selectedTemplate && selectedTemplate.id !== 'custom' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Suggested Resources</h4>
                          <p className="text-sm text-blue-700">
                            For this type of task you could suggest the client to use:
                          </p>
                          <ul className="text-sm text-blue-600 mt-1 list-disc list-inside">
                            {selectedTemplate.id === 'breathing' && (
                              <>
                                <li>Meditation apps (Headspace, Calm)</li>
                                <li>Guided breathing videos</li>
                                <li>Exercise timers</li>
                              </>
                            )}
                            {selectedTemplate.id === 'mood-diary' && (
                              <>
                                <li>Paper diary or apps (Daylio, Mood Meter)</li>
                                <li>Mood rating scales</li>
                                <li>Reflection prompts</li>
                              </>
                            )}
                            {selectedTemplate.id === 'behavioral-activation' && (
                              <>
                                <li>Pleasant activities list</li>
                                <li>Weekly planner</li>
                                <li>Reward system</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loader-sm mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Task
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 