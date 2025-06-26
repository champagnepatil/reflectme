import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { CRUDTable, CRUDColumn } from '../../components/crud/CRUDTable';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileText,
  User,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Assessment {
  id: string;
  client_id: string;
  instrument: 'PHQ-9' | 'GAD-7' | 'WHODAS-2.0' | 'DSM-5-CC';
  schedule: 'biweekly' | 'monthly' | 'once';
  next_due_at: string;
  created_at: string;
  // Computed fields
  client_name?: string;
  total_results?: number;
  latest_score?: number;
  latest_result_date?: string;
  trend?: 'improving' | 'stable' | 'declining';
  status?: 'pending' | 'completed' | 'overdue';
  severity_level?: string;
}

interface AssessmentResult {
  id: string;
  assessment_id: string;
  score: number;
  raw_json: any;
  interpretation?: string;
  severity_level?: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  completed_at: string;
}

const AssessmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, [user]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assessments for clients assigned to this therapist
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_results (
            id, score, severity_level, completed_at, interpretation
          )
        `)
        .order('created_at', { ascending: false });

      if (assessmentError) throw assessmentError;

      // Get client information
      const clientIds = [...new Set(assessmentData?.map(a => a.client_id) || [])];
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

      // Transform assessments with computed fields
      const transformedAssessments = assessmentData?.map(assessment => {
        const results = assessment.assessment_results || [];
        const latestResult = results.length > 0 ? results[results.length - 1] : null;
        
        // Calculate trend
        let trend: 'improving' | 'stable' | 'declining' = 'stable';
        if (results.length >= 2) {
          const latest = results[results.length - 1].score;
          const previous = results[results.length - 2].score;
          if (latest < previous - 2) trend = 'improving';
          else if (latest > previous + 2) trend = 'declining';
        }

        // Determine status
        const now = new Date();
        const dueDate = new Date(assessment.next_due_at);
        const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'pending' | 'completed' | 'overdue' = 'pending';
        if (latestResult && new Date(latestResult.completed_at) > dueDate) {
          status = 'completed';
        } else if (daysSinceDue > 0) {
          status = 'overdue';
        }

        return {
          ...assessment,
          client_name: clientLookup[assessment.client_id] || 'Unknown Client',
          total_results: results.length,
          latest_score: latestResult?.score,
          latest_result_date: latestResult?.completed_at,
          severity_level: latestResult?.severity_level,
          trend,
          status
        };
      }) || [];

      setAssessments(transformedAssessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    navigate('/therapist/assessments/new');
  };

  const handleEditAssessment = (assessment: Assessment) => {
    navigate(`/therapist/assessments/${assessment.id}/edit`);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    navigate(`/therapist/assessments/${assessment.id}`);
  };

  const handleDeleteAssessment = async (assessment: Assessment) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessment.id);

      if (error) throw error;

      await loadAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete assessment');
    }
  };

  const handleBulkDelete = async (assessments: Assessment[]) => {
    try {
      const assessmentIds = assessments.map(a => a.id);
      const { error } = await supabase
        .from('assessments')
        .delete()
        .in('id', assessmentIds);

      if (error) throw error;

      await loadAssessments();
    } catch (error) {
      console.error('Error deleting assessments:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete assessments');
    }
  };

  const columns: CRUDColumn<Assessment>[] = [
    {
      key: 'instrument',
      label: 'Assessment',
      render: (value, assessment) => (
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            value === 'PHQ-9' ? 'bg-blue-100' :
            value === 'GAD-7' ? 'bg-green-100' :
            value === 'WHODAS-2.0' ? 'bg-purple-100' :
            'bg-orange-100'
          }`}>
            <ClipboardList className={`w-5 h-5 ${
              value === 'PHQ-9' ? 'text-blue-600' :
              value === 'GAD-7' ? 'text-green-600' :
              value === 'WHODAS-2.0' ? 'text-purple-600' :
              'text-orange-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-neutral-900">{value}</div>
            <div className="text-sm text-neutral-500">
              {value === 'PHQ-9' ? 'Patient Health Questionnaire' :
               value === 'GAD-7' ? 'Generalized Anxiety Disorder' :
               value === 'WHODAS-2.0' ? 'WHO Disability Assessment' :
               'DSM-5 Cross-Cutting'}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
              assessment.schedule === 'once' ? 'bg-neutral-100 text-neutral-800' :
              assessment.schedule === 'biweekly' ? 'bg-primary-100 text-primary-800' :
              'bg-success-100 text-success-800'
            }`}>
              {assessment.schedule}
            </span>
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
      key: 'status',
      label: 'Status',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' }
      ],
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-success-100 text-success-800' :
          value === 'overdue' ? 'bg-error-100 text-error-800' :
          'bg-warning-100 text-warning-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'latest_score',
      label: 'Latest Score',
      render: (value, assessment) => {
        if (!value) return <span className="text-neutral-400">No results</span>;
        
        const maxScore = assessment.instrument === 'PHQ-9' ? 27 :
                         assessment.instrument === 'GAD-7' ? 21 :
                         assessment.instrument === 'WHODAS-2.0' ? 48 :
                         100;
        
        const percentage = (value / maxScore) * 100;
        
        return (
          <div className="flex items-center">
            <div className="flex-1 bg-neutral-200 rounded-full h-2 mr-2 w-16">
              <div 
                className={`h-2 rounded-full ${
                  percentage <= 25 ? 'bg-success-500' :
                  percentage <= 50 ? 'bg-warning-500' :
                  percentage <= 75 ? 'bg-orange-500' :
                  'bg-error-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-sm">
              <div className="font-medium">{value}/{maxScore}</div>
              {assessment.severity_level && (
                <div className={`text-xs ${
                  assessment.severity_level === 'minimal' ? 'text-success-600' :
                  assessment.severity_level === 'mild' ? 'text-warning-600' :
                  assessment.severity_level === 'moderate' ? 'text-orange-600' :
                  'text-error-600'
                }`}>
                  {assessment.severity_level}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'trend',
      label: 'Trend',
      render: (value, assessment) => {
        if (assessment.total_results! < 2) {
          return <span className="text-neutral-400">Insufficient data</span>;
        }
        
        return (
          <div className="flex items-center">
            <TrendingUp className={`w-4 h-4 mr-1 ${
              value === 'improving' ? 'text-success-600 rotate-180' :
              value === 'declining' ? 'text-error-600' :
              'text-neutral-400'
            }`} />
            <span className={`text-sm ${
              value === 'improving' ? 'text-success-600' :
              value === 'declining' ? 'text-error-600' :
              'text-neutral-600'
            }`}>
              {value}
            </span>
          </div>
        );
      }
    },
    {
      key: 'total_results',
      label: 'Completions',
      render: (value) => (
        <div className="flex items-center">
          <BarChart3 className="w-4 h-4 text-neutral-400 mr-1" />
          <span className="font-medium">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'next_due_at',
      label: 'Next Due',
      type: 'date',
      render: (value, assessment) => {
        const dueDate = new Date(value);
        const now = new Date();
        const isOverdue = dueDate < now && assessment.status !== 'completed';
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
      key: 'latest_result_date',
      label: 'Last Completed',
      render: (value) => value ? (
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-neutral-400 mr-1" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-neutral-400">Never</span>
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
      label: 'View Results',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: (assessment: Assessment) => navigate(`/therapist/assessments/${assessment.id}/results`)
    },
    {
      label: 'Send Reminder',
      icon: <Target className="w-4 h-4" />,
      onClick: (assessment: Assessment) => console.log('Send reminder for:', assessment)
    },
    {
      label: 'Generate Report',
      icon: <FileText className="w-4 h-4" />,
      onClick: (assessment: Assessment) => navigate(`/therapist/assessments/${assessment.id}/report`)
    }
  ];

  const bulkActions = [
    {
      label: 'Send Reminders',
      icon: <Target className="w-4 h-4" />,
      onClick: (assessments: Assessment[]) => console.log('Send reminders for:', assessments)
    },
    {
      label: 'Export Results',
      icon: <FileText className="w-4 h-4" />,
      onClick: (assessments: Assessment[]) => console.log('Export results for:', assessments)
    }
  ];

  // Calculate stats
  const stats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    pending: assessments.filter(a => a.status === 'pending').length,
    overdue: assessments.filter(a => a.status === 'overdue').length,
    improving: assessments.filter(a => a.trend === 'improving').length,
    declining: assessments.filter(a => a.trend === 'declining').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
              <ClipboardList className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Assessment Management</h1>
              <p className="text-neutral-600">Track and manage client assessments and progress</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total Assessments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.pending}</div>
              <div className="text-sm text-neutral-600">Pending</div>
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
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-success-600 rotate-180" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.improving}</div>
              <div className="text-sm text-neutral-600">Improving</div>
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
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{stats.declining}</div>
              <div className="text-sm text-neutral-600">Declining</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-primary-600" />
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

      {/* Assessment Table */}
      <CRUDTable
        title="Assessments"
        data={assessments}
        columns={columns}
        loading={loading}
        error={error}
        onCreate={handleCreateAssessment}
        onEdit={handleEditAssessment}
        onView={handleViewAssessment}
        onDelete={handleDeleteAssessment}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadAssessments}
        customActions={customActions}
        bulkActions={bulkActions}
        canExport={true}
        searchPlaceholder="Search assessments..."
        emptyMessage="No assessments found"
        emptyActionText="Create New Assessment"
        onEmptyAction={handleCreateAssessment}
      />
    </div>
  );
};

export default AssessmentManagement; 