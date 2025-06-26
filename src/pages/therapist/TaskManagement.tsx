import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { CRUDTable, CRUDColumn } from '../../components/crud/CRUDTable';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  Brain,
  BookOpen,
  Activity,
  User,
  BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Task {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  due_at?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  task_type: 'homework' | 'exercise' | 'reflection' | 'practice' | 'assessment';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  created_by?: string;
  completion_criteria?: string;
  max_completions: number;
  // Computed fields
  client_name?: string;
  progress_percentage?: number;
  total_completions?: number;
  last_activity?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

interface TaskProgress {
  id: string;
  task_id: string;
  client_id: string;
  pct: number;
  ts: string;
  notes?: string;
  mood_after?: number;
  difficulty_rating?: number;
  completion_time_minutes?: number;
}

const TaskManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tasks for clients assigned to this therapist
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          homework_progress (
            id, pct, ts, notes, mood_after, difficulty_rating
          )
        `)
        .eq('created_by', user?.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (taskError) throw taskError;

      // Get client information
      const clientIds = [...new Set(taskData?.map(t => t.client_id) || [])];
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .in('id', clientIds);

      if (clientError) throw clientError;

      // Create client lookup
      const clientLookup = clientData?.reduce((acc, client) => {
        acc[client.id] = `${client.first_name} ${client.last_name}`;
        return acc;
      }, {} as Record<string, string>) || {};

      // Transform tasks with computed fields
      const transformedTasks = taskData?.map(task => {
        const progress = task.homework_progress || [];
        const totalProgress = progress.length;
        const completions = progress.filter((p: any) => p.pct === 100).length;
        const avgProgress = totalProgress > 0 
          ? progress.reduce((sum: number, p: any) => sum + p.pct, 0) / totalProgress 
          : 0;
        
        const lastActivity = progress.length > 0 
          ? progress[progress.length - 1].ts 
          : null;

        const now = new Date();
        const dueDate = task.due_at ? new Date(task.due_at) : null;
        
        let status: 'not_started' | 'in_progress' | 'completed' | 'overdue' = 'not_started';
        if (completions >= task.max_completions) {
          status = 'completed';
        } else if (dueDate && dueDate < now && completions === 0) {
          status = 'overdue';
        } else if (totalProgress > 0) {
          status = 'in_progress';
        }

        return {
          ...task,
          client_name: clientLookup[task.client_id] || 'Unknown Client',
          progress_percentage: Math.round(avgProgress),
          total_completions: completions,
          last_activity: lastActivity,
          status
        };
      }) || [];

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    navigate('/therapist/tasks/new');
  };

  const handleEditTask = (task: Task) => {
    navigate(`/therapist/tasks/${task.id}/edit`);
  };

  const handleViewTask = (task: Task) => {
    navigate(`/therapist/tasks/${task.id}`);
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_archived: true })
        .eq('id', task.id);

      if (error) throw error;

      await loadTasks();
    } catch (error) {
      console.error('Error archiving task:', error);
      setError(error instanceof Error ? error.message : 'Failed to archive task');
    }
  };

  const handleBulkDelete = async (tasks: Task[]) => {
    try {
      const taskIds = tasks.map(t => t.id);
      const { error } = await supabase
        .from('tasks')
        .update({ is_archived: true })
        .in('id', taskIds);

      if (error) throw error;

      await loadTasks();
    } catch (error) {
      console.error('Error archiving tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to archive tasks');
    }
  };

  const columns: CRUDColumn<Task>[] = [
    {
      key: 'title',
      label: 'Task',
      render: (_, task) => (
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            task.task_type === 'homework' ? 'bg-blue-100' :
            task.task_type === 'exercise' ? 'bg-green-100' :
            task.task_type === 'reflection' ? 'bg-purple-100' :
            task.task_type === 'practice' ? 'bg-orange-100' :
            'bg-pink-100'
          }`}>
            {task.task_type === 'homework' ? <BookOpen className="w-5 h-5 text-blue-600" /> :
             task.task_type === 'exercise' ? <Activity className="w-5 h-5 text-green-600" /> :
             task.task_type === 'reflection' ? <Brain className="w-5 h-5 text-purple-600" /> :
             task.task_type === 'practice' ? <Target className="w-5 h-5 text-orange-600" /> :
             <CheckSquare className="w-5 h-5 text-pink-600" />}
          </div>
          <div className="flex-1">
            <div className="font-medium text-neutral-900">{task.title}</div>
            <div className="text-sm text-neutral-500 line-clamp-2">
              {task.description || 'No description'}
            </div>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                task.task_type === 'homework' ? 'bg-blue-100 text-blue-800' :
                task.task_type === 'exercise' ? 'bg-green-100 text-green-800' :
                task.task_type === 'reflection' ? 'bg-purple-100 text-purple-800' :
                task.task_type === 'practice' ? 'bg-orange-100 text-orange-800' :
                'bg-pink-100 text-pink-800'
              }`}>
                {task.task_type}
              </span>
              {task.category && (
                <span className="ml-2 text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  {task.category}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (value) => (
        <div className="flex items-center">
          <User className="w-4 h-4 text-neutral-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'high' ? 'bg-error-100 text-error-800' :
          value === 'medium' ? 'bg-warning-100 text-warning-800' :
          'bg-success-100 text-success-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-success-100 text-success-800' :
          value === 'in_progress' ? 'bg-primary-100 text-primary-800' :
          value === 'overdue' ? 'bg-error-100 text-error-800' :
          'bg-neutral-100 text-neutral-800'
        }`}>
          {value === 'not_started' ? 'Not Started' :
           value === 'in_progress' ? 'In Progress' :
           value === 'completed' ? 'Completed' :
           'Overdue'}
        </span>
      )
    },
    {
      key: 'progress_percentage',
      label: 'Progress',
      render: (value, task) => (
        <div className="w-24">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>{value}%</span>
            <span className="text-neutral-500">
              {task.total_completions}/{task.max_completions}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                value === 100 ? 'bg-success-500' :
                value >= 50 ? 'bg-primary-500' :
                'bg-warning-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'due_at',
      label: 'Due Date',
      type: 'date',
      render: (value, task) => {
        if (!value) return <span className="text-neutral-400">No due date</span>;
        
        const dueDate = new Date(value);
        const now = new Date();
        const isOverdue = dueDate < now && task.status !== 'completed';
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className={`flex items-center ${isOverdue ? 'text-error-600' : ''}`}>
            <Calendar className="w-4 h-4 mr-1" />
            <div>
              <div className="text-sm">{dueDate.toLocaleDateString()}</div>
              {isOverdue ? (
                <div className="text-xs text-error-600">
                  {Math.abs(daysUntil)} days overdue
                </div>
              ) : daysUntil <= 7 ? (
                <div className="text-xs text-warning-600">
                  {daysUntil} days left
                </div>
              ) : null}
            </div>
          </div>
        );
      }
    },
    {
      key: 'last_activity',
      label: 'Last Activity',
      render: (value) => value ? (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-neutral-400 mr-1" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-neutral-400">No activity</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions'
    }
  ];

  const customActions = [
    {
      label: 'View Progress',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: (task: Task) => navigate(`/therapist/tasks/${task.id}/progress`)
    },
    {
      label: 'Duplicate',
      icon: <Plus className="w-4 h-4" />,
      onClick: (task: Task) => navigate(`/therapist/tasks/new?duplicate=${task.id}`)
    }
  ];

  const bulkActions = [
    {
      label: 'Set Due Date',
      icon: <Calendar className="w-4 h-4" />,
      onClick: (tasks: Task[]) => console.log('Set due date for:', tasks)
    },
    {
      label: 'Change Priority',
      icon: <AlertTriangle className="w-4 h-4" />,
      onClick: (tasks: Task[]) => console.log('Change priority for:', tasks)
    }
  ];

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    notStarted: tasks.filter(t => t.status === 'not_started').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
              <CheckSquare className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Task Management</h1>
              <p className="text-neutral-600">Manage homework assignments and therapeutic tasks</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.completed}</div>
              <div className="text-sm text-neutral-600">Completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.inProgress}</div>
              <div className="text-sm text-neutral-600">In Progress</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.overdue}</div>
              <div className="text-sm text-neutral-600">Overdue</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.notStarted}</div>
              <div className="text-sm text-neutral-600">Not Started</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-neutral-600">Completion Rate</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Table */}
      <CRUDTable
        title="Tasks & Assignments"
        data={tasks}
        columns={columns}
        loading={loading}
        error={error}
        onCreate={handleCreateTask}
        onEdit={handleEditTask}
        onView={handleViewTask}
        onDelete={handleDeleteTask}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadTasks}
        customActions={customActions}
        bulkActions={bulkActions}
        canExport={true}
        searchPlaceholder="Search tasks..."
        emptyMessage="No tasks found"
        emptyActionText="Create New Task"
        onEmptyAction={handleCreateTask}
      />
    </div>
  );
};

export default TaskManagement; 