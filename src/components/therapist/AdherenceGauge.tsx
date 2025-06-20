import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  Calendar
} from 'lucide-react';

interface AdherenceGaugeProps {
  clientId: string;
  className?: string;
  timeRange?: 'week' | 'month' | 'all';
  showDetails?: boolean;
}

interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  avg_completion_rate: number;
  completion_trend: number; // % change from previous period
}

interface TaskDetail {
  id: string;
  title: string;
  category: string;
  completion_percentage: number;
  status: 'completed' | 'active' | 'overdue' | 'stale';
  due_at: string | null;
  last_activity: string | null;
}

export const AdherenceGauge: React.FC<AdherenceGaugeProps> = ({
  clientId,
  className = '',
  timeRange = 'month',
  showDetails = false
}) => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdherenceData();
  }, [clientId, timeRange]);

  const fetchAdherenceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Fetch tasks for the client
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          category,
          due_at,
          max_completions,
          created_at,
          is_archived
        `)
        .eq('client_id', clientId)
        .eq('is_archived', false)
        .gte('created_at', startDate.toISOString());

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        setStats({
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          overdue_tasks: 0,
          avg_completion_rate: 0,
          completion_trend: 0
        });
        setTaskDetails([]);
        return;
      }

      // Fetch progress for all tasks
      const taskIds = tasks.map(t => t.id);
      const { data: progressData, error: progressError } = await supabase
        .from('homework_progress')
        .select('task_id, pct, ts, mood_after')
        .in('task_id', taskIds)
        .order('ts', { ascending: false });

      if (progressError) throw progressError;

      // Calculate stats for each task
      const taskStatsMap = new Map<string, {
        completion_percentage: number;
        status: string;
        last_activity: string | null;
        completions: number;
      }>();

      tasks.forEach(task => {
        const taskProgress = progressData?.filter(p => p.task_id === task.id) || [];
        const completions = taskProgress.filter(p => p.pct === 100).length;
        const avgProgress = taskProgress.length > 0 
          ? taskProgress.reduce((sum, p) => sum + p.pct, 0) / taskProgress.length 
          : 0;

        // Calculate overall completion percentage
        let overallCompletion = 0;
        if (task.max_completions && task.max_completions > 1) {
          overallCompletion = Math.min((completions / task.max_completions) * 100, 100);
        } else {
          overallCompletion = avgProgress;
        }

        // Determine status
        const now = new Date();
        const dueDate = task.due_at ? new Date(task.due_at) : null;
        const lastActivity = taskProgress[0]?.ts || null;
        
        let status = 'active';
        if (overallCompletion >= 100) {
          status = 'completed';
        } else if (dueDate && dueDate < now && overallCompletion < 100) {
          status = 'overdue';
        } else if (lastActivity && new Date(lastActivity) < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          status = 'stale';
        }

        taskStatsMap.set(task.id, {
          completion_percentage: overallCompletion,
          status,
          last_activity: lastActivity,
          completions
        });
      });

      // Calculate overall stats
      const totalTasks = tasks.length;
      const completedTasks = Array.from(taskStatsMap.values()).filter(s => s.status === 'completed').length;
      const inProgressTasks = Array.from(taskStatsMap.values()).filter(s => s.status === 'active').length;
      const overdueTasks = Array.from(taskStatsMap.values()).filter(s => s.status === 'overdue').length;
      const avgCompletionRate = Array.from(taskStatsMap.values())
        .reduce((sum, s) => sum + s.completion_percentage, 0) / totalTasks;

      // Calculate trend (simplified - would need historical data for real trend)
      const recentCompletions = progressData?.filter(p => 
        new Date(p.ts) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const olderCompletions = progressData?.filter(p => 
        new Date(p.ts) < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) &&
        new Date(p.ts) >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      ).length || 0;
      
      const trend = olderCompletions > 0 ? ((recentCompletions - olderCompletions) / olderCompletions) * 100 : 0;

      setStats({
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        overdue_tasks: overdueTasks,
        avg_completion_rate: avgCompletionRate,
        completion_trend: trend
      });

      // Set task details if requested
      if (showDetails) {
        const details: TaskDetail[] = tasks.map(task => {
          const taskStat = taskStatsMap.get(task.id)!;
          return {
            id: task.id,
            title: task.title,
            category: task.category || 'homework',
            completion_percentage: taskStat.completion_percentage,
            status: taskStat.status as any,
            due_at: task.due_at,
            last_activity: taskStat.last_activity
          };
        });

        setTaskDetails(details.sort((a, b) => b.completion_percentage - a.completion_percentage));
      }

    } catch (err) {
      console.error('Error fetching adherence data:', err);
      setError('Error loading adherence data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate donut chart parameters
  const donutParams = useMemo(() => {
    if (!stats || stats.total_tasks === 0) {
      return { completedAngle: 0, inProgressAngle: 0, overdueAngle: 360 };
    }

    const completedPercent = (stats.completed_tasks / stats.total_tasks) * 100;
    const inProgressPercent = (stats.in_progress_tasks / stats.total_tasks) * 100;
    const overduePercent = (stats.overdue_tasks / stats.total_tasks) * 100;

    return {
      completedAngle: (completedPercent / 100) * 360,
      inProgressAngle: (inProgressPercent / 100) * 360,
      overdueAngle: (overduePercent / 100) * 360
    };
  }, [stats]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-error-600" />;
      case 'stale': return <Clock className="w-4 h-4 text-warning-600" />;
      default: return <Target className="w-4 h-4 text-primary-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600';
      case 'overdue': return 'text-error-600';
      case 'stale': return 'text-warning-600';
      default: return 'text-primary-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'stale': return 'Stale';
      case 'active': return 'Active';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="loader"></div>
          <span className="ml-3 text-neutral-600">Loading adherence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center text-error-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading adherence data</span>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_tasks === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-neutral-800 mb-2">
            No Tasks Assigned
          </h4>
          <p className="text-neutral-600">
            No tasks in the selected period to calculate adherence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-white p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Treatment Adherence
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {timeRange === 'week' ? 'Last week' : 
               timeRange === 'month' ? 'Last month' : 'All data'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="20"
                />
                
                {/* Completed segment */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(donutParams.completedAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset="0"
                  className="transition-all duration-1000"
                />
                
                {/* In Progress segment */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray={`${(donutParams.inProgressAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset={`-${(donutParams.completedAngle / 360) * 502.65}`}
                  className="transition-all duration-1000"
                />
                
                {/* Overdue segment */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(donutParams.overdueAngle / 360) * 502.65} 502.65`}
                  strokeDashoffset={`-${((donutParams.completedAngle + donutParams.inProgressAngle) / 360) * 502.65}`}
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-neutral-900">
                  {Math.round(stats.avg_completion_rate)}%
                </div>
                <div className="text-sm text-neutral-500">Average Completion Rate</div>
                {stats.completion_trend !== 0 && (
                  <div className={`flex items-center text-xs mt-1 ${
                    stats.completion_trend > 0 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {stats.completion_trend > 0 ? 
                      <TrendingUp className="w-3 h-3 mr-1" /> : 
                      <TrendingDown className="w-3 h-3 mr-1" />
                    }
                    {Math.abs(stats.completion_trend).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-success-500 rounded-full mr-2"></div>
                <span>Completed ({stats.completed_tasks})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary-500 rounded-full mr-2"></div>
                <span>In Progress ({stats.in_progress_tasks})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-error-500 rounded-full mr-2"></div>
                <span>Overdue ({stats.overdue_tasks})</span>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-50 rounded-lg p-4"
              >
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.total_tasks}
                </div>
                <div className="text-sm text-neutral-600">Total Tasks</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-success-50 rounded-lg p-4"
              >
                <div className="text-2xl font-bold text-success-700">
                  {stats.completed_tasks}
                </div>
                <div className="text-sm text-success-600">Completed</div>
              </motion.div>
            </div>

            {/* Task Details Preview */}
            {showDetails && taskDetails.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900 mb-3">Recent Tasks</h4>
                {taskDetails.slice(0, 3).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      {getStatusIcon(task.status)}
                      <div className="ml-2 flex-1">
                        <div className="font-medium text-sm text-neutral-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {task.category} • {getStatusLabel(task.status)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                        {Math.round(task.completion_percentage)}%
                      </div>
                      {task.due_at && (
                        <div className="text-xs text-neutral-500">
                          {new Date(task.due_at) > new Date() ? 'Due Date' : 'Due Date'} {' '}
                          {new Date(task.due_at).toLocaleDateString('en-US')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>
            Last evaluation: {new Date().toLocaleDateString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {stats.completion_trend > 0 && (
            <div className="flex items-center text-success-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Positive Trend</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 