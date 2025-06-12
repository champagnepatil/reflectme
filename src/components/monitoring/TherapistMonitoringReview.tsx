import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MonitoringEntry, MonitoringStats } from '../../types/monitoring';
import { 
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Eye,
  User,
  Droplets,
  Sun,
  Utensils,
  Activity,
  Moon,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TherapistMonitoringReviewProps {
  clientId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  className?: string;
}

export const TherapistMonitoringReview: React.FC<TherapistMonitoringReviewProps> = ({
  clientId,
  dateRange,
  className = ''
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [monitoringEntries, setMonitoringEntries] = useState<MonitoringEntry[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState(
    dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  );

  // Fetch therapist's clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!user || user.role !== 'therapist') return;

      try {
        // In a real implementation, this would fetch actual client relationships
        // For now, we'll use mock data based on the existing context
        const mockClients = [
          { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
          { id: '2', name: 'Michael Chen', email: 'michael.c@example.com' }
        ];
        setClients(mockClients);
        
        if (!selectedClientId && mockClients.length > 0) {
          setSelectedClientId(mockClients[0].id);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
      }
    };

    fetchClients();
  }, [user]);

  // Fetch monitoring entries
  useEffect(() => {
    const fetchMonitoringEntries = async () => {
      if (!selectedClientId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('monitoring_entries')
          .select('*')
          .eq('client_id', selectedClientId)
          .gte('entry_date', selectedDateRange.start.toISOString().split('T')[0])
          .lte('entry_date', selectedDateRange.end.toISOString().split('T')[0])
          .order('entry_date', { ascending: false });

        if (fetchError) throw fetchError;

        const entries: MonitoringEntry[] = data?.map(entry => ({
          id: entry.id,
          clientId: entry.client_id,
          waterIntake: entry.water_intake,
          sunlightExposure: entry.sunlight_exposure,
          healthyMeals: entry.healthy_meals,
          exerciseDuration: entry.exercise_duration,
          sleepHours: entry.sleep_hours,
          socialInteractions: entry.social_interactions,
          taskNotes: entry.task_notes,
          taskRemarks: entry.task_remarks,
          date: new Date(entry.entry_date),
          createdAt: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at || entry.created_at)
        })) || [];

        setMonitoringEntries(entries);
        calculateStats(entries);

      } catch (err) {
        console.error('Error fetching monitoring entries:', err);
        setError('Failed to load monitoring data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringEntries();
  }, [selectedClientId, selectedDateRange]);

  const calculateStats = (entries: MonitoringEntry[]) => {
    if (entries.length === 0) {
      setStats(null);
      return;
    }

    const stats: MonitoringStats = {
      averageWaterIntake: entries.reduce((sum, entry) => sum + entry.waterIntake, 0) / entries.length,
      averageSunlightExposure: entries.reduce((sum, entry) => sum + entry.sunlightExposure, 0) / entries.length,
      averageHealthyMeals: entries.reduce((sum, entry) => sum + entry.healthyMeals, 0) / entries.length,
      averageSleepHours: entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length,
      averageSocialInteractions: entries.reduce((sum, entry) => sum + entry.socialInteractions, 0) / entries.length,
      mostCommonExerciseDuration: getMostCommonExerciseDuration(entries),
      totalEntries: entries.length
    };

    setStats(stats);
  };

  const getMostCommonExerciseDuration = (entries: MonitoringEntry[]): string => {
    const counts = entries.reduce((acc, entry) => {
      acc[entry.exerciseDuration] = (acc[entry.exerciseDuration] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  };

  const getChartData = () => {
    return monitoringEntries
      .slice(0, 14) // Last 14 entries
      .reverse()
      .map(entry => ({
        date: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        waterIntake: entry.waterIntake,
        sunlightExposure: entry.sunlightExposure,
        healthyMeals: entry.healthyMeals,
        sleepHours: entry.sleepHours,
        socialInteractions: entry.socialInteractions
      }));
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'waterIntake': return <Droplets className="w-4 h-4" />;
      case 'sunlightExposure': return <Sun className="w-4 h-4" />;
      case 'healthyMeals': return <Utensils className="w-4 h-4" />;
      case 'sleepHours': return <Moon className="w-4 h-4" />;
      case 'socialInteractions': return <Users className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 7) return 'text-success-600';
    if (value >= 5) return 'text-warning-600';
    return 'text-error-600';
  };

  if (user?.role !== 'therapist') {
    return (
      <div className="card p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-error-700 mb-2">Access Denied</h2>
        <p className="text-error-600">This feature is only available to therapists.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Client Monitoring Review</h1>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Select Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="input"
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={selectedDateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDateRange(prev => ({
                ...prev,
                start: new Date(e.target.value)
              }))}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={selectedDateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDateRange(prev => ({
                ...prev,
                end: new Date(e.target.value)
              }))}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading monitoring data...</p>
        </div>
      )}

      {error && (
        <div className="card p-6 bg-error-50 border-error-200">
          <div className="flex items-center text-error-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && selectedClientId && (
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'waterIntake', label: 'Water Intake', value: stats.averageWaterIntake },
                { key: 'sunlightExposure', label: 'Sunlight', value: stats.averageSunlightExposure },
                { key: 'healthyMeals', label: 'Nutrition', value: stats.averageHealthyMeals },
                { key: 'sleepHours', label: 'Sleep', value: stats.averageSleepHours },
                { key: 'socialInteractions', label: 'Social', value: stats.averageSocialInteractions }
              ].map((metric, index) => (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      {getMetricIcon(metric.key)}
                    </div>
                    <span className={`text-2xl font-bold ${getMetricColor(metric.value)}`}>
                      {metric.value.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{metric.label}</p>
                  <p className="text-xs text-neutral-500">Average (30 days)</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Trends Chart */}
          {monitoringEntries.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Wellness Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="waterIntake" stroke="#3b82f6" name="Water Intake" />
                    <Line type="monotone" dataKey="sunlightExposure" stroke="#f59e0b" name="Sunlight" />
                    <Line type="monotone" dataKey="healthyMeals" stroke="#10b981" name="Nutrition" />
                    <Line type="monotone" dataKey="sleepHours" stroke="#8b5cf6" name="Sleep" />
                    <Line type="monotone" dataKey="socialInteractions" stroke="#ef4444" name="Social" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Entries */}
          <div className="card overflow-hidden">
            <div className="bg-white p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Check-ins</h3>
            </div>
            
            {monitoringEntries.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Data Available</h3>
                <p className="text-neutral-600">
                  No monitoring entries found for the selected date range.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {monitoringEntries.slice(0, 10).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-neutral-400 mr-2" />
                        <span className="font-medium text-neutral-900">
                          {entry.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-500">
                        Exercise: {entry.exerciseDuration.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      {[
                        { label: 'Water', value: entry.waterIntake, icon: <Droplets className="w-4 h-4" /> },
                        { label: 'Sun', value: entry.sunlightExposure, icon: <Sun className="w-4 h-4" /> },
                        { label: 'Meals', value: entry.healthyMeals, icon: <Utensils className="w-4 h-4" /> },
                        { label: 'Sleep', value: entry.sleepHours, icon: <Moon className="w-4 h-4" /> },
                        { label: 'Social', value: entry.socialInteractions, icon: <Users className="w-4 h-4" /> }
                      ].map((metric) => (
                        <div key={metric.label} className="text-center">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-1">
                            {metric.icon}
                          </div>
                          <div className={`text-lg font-semibold ${getMetricColor(metric.value)}`}>
                            {metric.value}
                          </div>
                          <div className="text-xs text-neutral-500">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {(entry.taskNotes || entry.taskRemarks) && (
                      <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                        {entry.taskNotes && (
                          <div>
                            <h4 className="font-medium text-neutral-900 mb-1">Task Notes</h4>
                            <p className="text-neutral-700 text-sm">{entry.taskNotes}</p>
                          </div>
                        )}
                        {entry.taskRemarks && (
                          <div>
                            <h4 className="font-medium text-neutral-900 mb-1">Remarks</h4>
                            <p className="text-neutral-700 text-sm">{entry.taskRemarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedClientId && !loading && (
        <div className="card p-12 text-center">
          <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">Select a Client</h3>
          <p className="text-neutral-600">
            Choose a client from the dropdown above to view their monitoring data.
          </p>
        </div>
      )}
    </div>
  );
};