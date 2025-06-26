import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Plus, 
  Send, 
  Clock, 
  Target, 
  CheckCircle, 
  Lightbulb,
  Zap,
  FileText,
  Calendar,
  Tag,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';
import GenAIService, { TherapeuticHomework } from '../../services/genAIService';

interface QuickTaskAssignmentProps {
  clientId: string;
  clientName: string;
  onTaskAssigned?: (task: any) => void;
}

interface TaskTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prompt: string;
}

const QuickTaskAssignment: React.FC<QuickTaskAssignmentProps> = ({
  clientId,
  clientName,
  onTaskAssigned
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedTask, setGeneratedTask] = useState<TherapeuticHomework | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const taskCategories = [
    {
      id: 'anxiety',
      name: 'Anxiety & Stress',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      description: 'Relaxation and coping techniques'
    },
    {
      id: 'mood',
      name: 'Mood Tracking',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      description: 'Emotional awareness and regulation'
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700 border-green-300',
      description: 'Present-moment awareness practices'
    },
    {
      id: 'behavioral',
      name: 'Behavioral',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      description: 'Activity scheduling and habits'
    },
    {
      id: 'cognitive',
      name: 'Cognitive',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-pink-100 text-pink-700 border-pink-300',
      description: 'Thought challenging and reframing'
    },
    {
      id: 'journaling',
      name: 'Journaling',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      description: 'Written reflection and processing'
    }
  ];

  const quickTemplates: TaskTemplate[] = [
    {
      id: 'daily-mood',
      category: 'mood',
      title: 'Daily Mood Check-in',
      description: 'Track daily mood with reflection questions',
      estimatedTime: '5-10 min',
      difficulty: 'beginner',
      prompt: 'Create a simple daily mood tracking exercise with 3 reflection questions'
    },
    {
      id: 'breathing-exercise',
      category: 'anxiety',
      title: 'Breathing Exercise',
      description: 'Guided breathing for anxiety relief',
      estimatedTime: '10-15 min',
      difficulty: 'beginner',
      prompt: 'Design a progressive breathing exercise for anxiety management'
    },
    {
      id: 'thought-challenge',
      category: 'cognitive',
      title: 'Thought Challenge',
      description: 'Cognitive restructuring exercise',
      estimatedTime: '15-20 min',
      difficulty: 'intermediate',
      prompt: 'Create a thought challenging worksheet for cognitive restructuring'
    },
    {
      id: 'gratitude-practice',
      category: 'mindfulness',
      title: 'Gratitude Practice',
      description: 'Daily gratitude reflection',
      estimatedTime: '5-10 min',
      difficulty: 'beginner',
      prompt: 'Design a gratitude practice with guided prompts for daily use'
    },
    {
      id: 'activity-scheduling',
      category: 'behavioral',
      title: 'Activity Scheduling',
      description: 'Plan meaningful daily activities',
      estimatedTime: '20-30 min',
      difficulty: 'intermediate',
      prompt: 'Create an activity scheduling template for depression management'
    },
    {
      id: 'mindful-journaling',
      category: 'journaling',
      title: 'Mindful Journaling',
      description: 'Reflective writing with prompts',
      estimatedTime: '15-25 min',
      difficulty: 'beginner',
      prompt: 'Design a mindful journaling exercise with specific prompts for self-reflection'
    }
  ];

  const generateQuickTask = async (template: TaskTemplate) => {
    setIsGenerating(true);
    try {
      const genAIService = new GenAIService();
      
      // Simple client profile for task generation
      const clientProfile = {
        name: clientName,
        age: 30,
        concerns: [template.category],
        goals: ['improve well-being'],
        sessionHistory: [],
        preferences: []
      };

      const task = await genAIService.generateTherapeuticHomework(
        clientProfile,
        template.category,
        template.difficulty
      );

      setGeneratedTask({
        ...task,
        title: template.title,
        category: template.category,
        estimatedTime: template.estimatedTime
      });
    } catch (error) {
      console.error('Error generating task:', error);
      // Fallback task
      setGeneratedTask({
        title: template.title,
        description: template.description,
        instructions: `Complete this ${template.category} exercise daily for one week. Pay attention to your responses and note any patterns or insights.`,
        estimatedTime: template.estimatedTime,
        category: template.category,
        difficulty: template.difficulty,
        materials: [],
        outcomes: [`Improved ${template.category} awareness`, 'Better self-regulation skills']
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomTask = async () => {
    if (!customPrompt.trim() || !selectedCategory) return;
    
    setIsGenerating(true);
    try {
      const genAIService = new GenAIService();
      
      const clientProfile = {
        name: clientName,
        age: 30,
        concerns: [selectedCategory],
        goals: ['address specific needs'],
        sessionHistory: [],
        preferences: []
      };

      const task = await genAIService.generateTherapeuticHomework(
        clientProfile,
        selectedCategory,
        'intermediate'
      );

      setGeneratedTask({
        ...task,
        category: selectedCategory
      });
    } catch (error) {
      console.error('Error generating custom task:', error);
      // Fallback
      setGeneratedTask({
        title: 'Custom Therapeutic Task',
        description: customPrompt,
        instructions: 'Follow the guidelines provided and track your progress daily.',
        estimatedTime: '15-20 min',
        category: selectedCategory,
        difficulty: 'intermediate',
        materials: ['Journal or note-taking app'],
        outcomes: ['Increased self-awareness', 'Progress toward therapeutic goals']
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const assignTask = () => {
    if (generatedTask) {
      const taskToAssign = {
        ...generatedTask,
        clientId,
        assignedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        status: 'assigned'
      };
      
      onTaskAssigned?.(taskToAssign);
      
      // Reset state
      setGeneratedTask(null);
      setCustomPrompt('');
      setSelectedCategory('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Zap className="w-6 h-6 text-primary-600 mr-2" />
            Quick Task Assignment
          </h3>
          <p className="text-gray-600 text-sm">
            Create AI-powered therapeutic tasks for {clientName}
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showAdvanced ? 'Simple Mode' : 'Advanced Mode'}
        </button>
      </div>

      {!showAdvanced ? (
        /* Quick Templates Mode */
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Quick Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => generateQuickTask(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {taskCategories.find(c => c.id === template.category)?.icon}
                    <h5 className="font-medium text-gray-900">{template.title}</h5>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {template.estimatedTime}
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Advanced Custom Mode */
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Select Category</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {taskCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedCategory === category.id
                      ? category.color
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {category.icon}
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Task Description
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the therapeutic task you'd like to create..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCustomTask}
            disabled={!selectedCategory || !customPrompt.trim() || isGenerating}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Brain className="w-full h-full" />
                </motion.div>
                Generating Task...
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Custom Task
              </>
            )}
          </button>
        </div>
      )}

      {/* Generated Task Preview */}
      <AnimatePresence>
        {generatedTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-primary-900 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Generated Task
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(generatedTask.difficulty || 'beginner')}`}>
                {generatedTask.difficulty || 'beginner'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-primary-900 mb-1">{generatedTask.title}</h5>
                <p className="text-primary-800 text-sm">{generatedTask.description}</p>
              </div>

              {generatedTask.instructions && (
                <div>
                  <h6 className="font-medium text-primary-900 mb-1">Instructions:</h6>
                  <p className="text-primary-800 text-sm">{generatedTask.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center text-sm text-primary-700 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Duration
                  </div>
                  <div className="font-medium text-primary-900">
                    {generatedTask.estimatedTime || '15-20 min'}
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center text-sm text-primary-700 mb-1">
                    <Tag className="w-4 h-4 mr-1" />
                    Category
                  </div>
                  <div className="font-medium text-primary-900 capitalize">
                    {generatedTask.category || selectedCategory}
                  </div>
                </div>
              </div>

              {generatedTask.outcomes && generatedTask.outcomes.length > 0 && (
                <div>
                  <h6 className="font-medium text-primary-900 mb-2">Expected Outcomes:</h6>
                  <ul className="space-y-1">
                    {generatedTask.outcomes.map((outcome, index) => (
                      <li key={index} className="text-sm text-primary-800 flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-primary-200">
                <button
                  onClick={assignTask}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Assign to {clientName}
                </button>
                <button
                  onClick={() => setGeneratedTask(null)}
                  className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generation Loading */}
      {isGenerating && !generatedTask && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 text-primary-600 mx-auto mb-4"
          >
            <Brain className="w-full h-full" />
          </motion.div>
          <h4 className="font-semibold text-gray-900 mb-2">AI is Creating Your Task...</h4>
          <p className="text-gray-600 text-sm">
            Analyzing therapeutic approaches and personalizing content for {clientName}
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickTaskAssignment;