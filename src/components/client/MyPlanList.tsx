import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Plus,
  Smile,
  Star
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  due_at: string | null;
  created_at: string;
  completion_criteria: string | null;
  max_completions: number;
  is_archived: boolean;
  task_type: string;
}

interface TaskProgress {
  id: string;
  task_id: string;
  pct: number;
  ts: string;
  notes: string | null;
  mood_after: number | null;
  difficulty_rating: number | null;
  completion_time_minutes: number | null;
}

interface MyPlanListProps {
  clientId: string;
  className?: string;
}

export const MyPlanList: React.FC<MyPlanListProps> = ({
  clientId,
  className = ''
}) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskProgress, setTaskProgress] = useState<Map<string, TaskProgress[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionData, setCompletionData] = useState({
    notes: '',
    moodAfter: 7,
    difficultyRating: 3,
    timeSpent: 0
  });

  useEffect(() => {
    fetchTasks();
  }, [clientId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks for the client
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);

      // Fetch progress for all tasks
      if (tasksData && tasksData.length > 0) {
        const taskIds = tasksData.map(t => t.id);
        const { data: progressData, error: progressError } = await supabase
          .from('homework_progress')
          .select('*')
          .in('task_id', taskIds)
          .order('ts', { ascending: false });

        if (progressError) throw progressError;

        // Group progress by task_id
        const progressMap = new Map<string, TaskProgress[]>();
        progressData?.forEach(progress => {
          if (!progressMap.has(progress.task_id)) {
            progressMap.set(progress.task_id, []);
          }
          progressMap.get(progress.task_id)!.push(progress);
        });

        setTaskProgress(progressMap);
      }

    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Errore nel caricamento dei task');
    } finally {
      setLoading(false);
    }
  };

  const getTaskCompletionStatus = (task: Task) => {
    const progress = taskProgress.get(task.id) || [];
    const completions = progress.filter(p => p.pct === 100).length;
    const avgProgress = progress.length > 0 
      ? progress.reduce((sum, p) => sum + p.pct, 0) / progress.length 
      : 0;

    let overallCompletion = 0;
    if (task.max_completions > 1) {
      overallCompletion = Math.min((completions / task.max_completions) * 100, 100);
    } else {
      overallCompletion = avgProgress;
    }

    return {
      completionPercentage: overallCompletion,
      completionsCount: completions,
      isCompleted: overallCompletion >= 100,
      lastActivity: progress[0]?.ts || null
    };
  };

  const handleTaskCompletion = async (task: Task) => {
    setSelectedTask(task);
    setShowCompletionModal(true);
  };

  const submitTaskCompletion = async () => {
    if (!selectedTask) return;

    try {
      setCompletingTaskId(selectedTask.id);

      const progressData = {
        task_id: selectedTask.id,
        client_id: clientId,
        pct: 100,
        notes: completionData.notes.trim() || null,
        mood_after: completionData.moodAfter,
        difficulty_rating: completionData.difficultyRating,
        completion_time_minutes: completionData.timeSpent > 0 ? completionData.timeSpent : null,
        completed_via: 'manual'
      };

      const { error: insertError } = await supabase
        .from('homework_progress')
        .insert(progressData);

      if (insertError) throw insertError;

      console.log('✅ Task completato:', selectedTask.title);

      // Reset form and close modal
      setCompletionData({
        notes: '',
        moodAfter: 7,
        difficultyRating: 3,
        timeSpent: 0
      });
      setShowCompletionModal(false);
      setSelectedTask(null);

      // Refresh data
      await fetchTasks();

    } catch (err) {
      console.error('❌ Errore completamento task:', err);
      setError('Errore nel completamento del task');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-100';
      case 'medium': return 'text-warning-600 bg-warning-100';
      case 'low': return 'text-success-600 bg-success-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return <BookOpen className="w-4 h-4" />;
      case 'cbt': return <Target className="w-4 h-4" />;
      case 'behavioral': return <Activity className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'mindfulness': return 'Mindfulness';
      case 'cbt': return 'CBT';
      case 'behavioral': return 'Comportamentale';
      case 'emotional-regulation': return 'Regolazione Emotiva';
      default: return 'Generale';
    }
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="loader"></div>
          <span className="ml-3 text-neutral-600">Caricamento piano...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center text-error-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-xl font-semibold">Il Mio Piano</h2>
              <p className="text-primary-100 text-sm">
                {tasks.length} task assegnati
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {tasks.filter(task => getTaskCompletionStatus(task).isCompleted).length}
            </div>
            <div className="text-primary-100 text-sm">Completati</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-neutral-200">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              Nessun Task Assegnato
            </h3>
            <p className="text-neutral-600">
              I tuoi task di terapia appariranno qui quando verranno assegnati.
            </p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const status = getTaskCompletionStatus(task);
            const isOverdue = task.due_at && new Date(task.due_at) < new Date() && !status.isCompleted;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 ${status.isCompleted ? 'bg-success-50' : 'hover:bg-neutral-50'} transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <button
                      onClick={() => !status.isCompleted && handleTaskCompletion(task)}
                      className={`mr-4 mt-1 ${
                        status.isCompleted 
                          ? 'text-success-600 cursor-default' 
                          : 'text-primary-600 hover:text-primary-700 cursor-pointer'
                      }`}
                      disabled={status.isCompleted}
                    >
                      {status.isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className={`font-semibold ${
                          status.isCompleted ? 'text-success-800 line-through' : 'text-neutral-900'
                        }`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex items-center ml-3 space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Bassa'}
                          </span>
                          
                          {task.category && (
                            <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
                              {getCategoryIcon(task.category)}
                              <span className="ml-1">{getCategoryName(task.category)}</span>
                            </span>
                          )}
                          
                          {isOverdue && (
                            <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-error-100 text-error-600">
                              <Clock className="w-3 h-3 mr-1" />
                              In Ritardo
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        status.isCompleted ? 'text-success-600' : 'text-neutral-600'
                      }`}>
                        {task.description}
                      </p>
                      
                      {/* Progress Bar */}
                      {task.max_completions > 1 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                            <span>Progresso</span>
                            <span>{status.completionsCount}/{task.max_completions} completamenti</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${status.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-neutral-500 space-x-4">
                        {task.due_at && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              Due date: {new Date(task.due_at).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        )}
                        
                        {status.lastActivity && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              Last update: {new Date(status.lastActivity).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {task.completion_criteria && (
                        <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                          <div className="text-xs font-medium text-neutral-700 mb-1">
                            Criteri di Completamento:
                          </div>
                          <div className="text-xs text-neutral-600">
                            {task.completion_criteria}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${
                      status.isCompleted ? 'text-success-600' : 'text-neutral-400'
                    }`}>
                      {Math.round(status.completionPercentage)}%
                    </div>
                    {status.isCompleted && (
                      <div className="flex items-center text-xs text-success-600 mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        <span>Completato!</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCompletionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-success-600 mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Completa Task
                  </h3>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium text-neutral-900 mb-1">{selectedTask.title}</p>
                  <p className="text-sm text-neutral-600">{selectedTask.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Note (opzionale)</label>
                    <textarea
                      value={completionData.notes}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
                      className="input min-h-[80px] resize-y"
                      placeholder="Come è andata? Scrivi le tue impressioni..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Umore Dopo (1-10)</label>
                      <select
                        value={completionData.moodAfter}
                        onChange={(e) => setCompletionData(prev => ({ ...prev, moodAfter: parseInt(e.target.value) }))}
                        className="input"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} {i + 1 <= 3 ? '😔' : i + 1 <= 6 ? '😐' : '😊'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">Difficoltà (1-5)</label>
                      <select
                        value={completionData.difficultyRating}
                        onChange={(e) => setCompletionData(prev => ({ ...prev, difficultyRating: parseInt(e.target.value) }))}
                        className="input"
                      >
                        <option value={1}>1 - Molto Facile</option>
                        <option value={2}>2 - Facile</option>
                        <option value={3}>3 - Normale</option>
                        <option value={4}>4 - Difficile</option>
                        <option value={5}>5 - Molto Difficile</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">Tempo Impiegato (minuti, opzionale)</label>
                    <input
                      type="number"
                      value={completionData.timeSpent}
                      onChange={(e) => setCompletionData(prev => ({ ...prev, timeSpent: parseInt(e.target.value) || 0 }))}
                      className="input"
                      min="0"
                      max="480"
                      placeholder="Es: 15"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="btn btn-outline"
                    disabled={completingTaskId === selectedTask.id}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={submitTaskCompletion}
                    className="btn btn-primary"
                    disabled={completingTaskId === selectedTask.id}
                  >
                    {completingTaskId === selectedTask.id ? (
                      <>
                        <div className="loader-sm mr-2"></div>
                        Completamento...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completa Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 