import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileDown, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  Brain, 
  BarChart3,
  Download,
  X,
  Plus,
  Settings,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';

interface CustomReport {
  id: string;
  name: string;
  metrics: string[];
  format: 'PDF' | 'CSV' | 'Excel';
  dateRange: string;
  clients: string[];
  created: string;
  lastGenerated?: string;
}

interface ReportMetric {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
}

const CustomReports: React.FC = () => {
  const { user } = useAuth();
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Report Builder State
  const [reportName, setReportName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'Excel'>('PDF');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('last_30_days');

  const availableMetrics: ReportMetric[] = [
    { 
      id: 'mood_trends', 
      name: 'Mood Trends', 
      description: 'Average mood scores and patterns over time',
      category: 'emotional',
      icon: TrendingUp
    },
    { 
      id: 'treatment_adherence', 
      name: 'Treatment Adherence', 
      description: 'Completion rates for assigned tasks and exercises',
      category: 'behavioral',
      icon: CheckCircle2
    },
    { 
      id: 'topic_cloud', 
      name: 'Topic Cloud', 
      description: 'Most discussed themes and recurring topics',
      category: 'content',
      icon: Brain
    },
    { 
      id: 'session_frequency', 
      name: 'Session Frequency', 
      description: 'Attendance patterns and scheduling consistency',
      category: 'engagement',
      icon: Calendar
    },
    { 
      id: 'progress_milestones', 
      name: 'Progress Milestones', 
      description: 'Goal achievements and therapeutic breakthroughs',
      category: 'progress',
      icon: BarChart3
    },
    { 
      id: 'ai_interactions', 
      name: 'AI Companion Usage', 
      description: 'AI companion engagement and effectiveness metrics',
      category: 'technology',
      icon: Brain
    },
    { 
      id: 'crisis_indicators', 
      name: 'Risk Assessment', 
      description: 'Crisis flags and intervention needs tracking',
      category: 'safety',
      icon: Users
    },
    { 
      id: 'engagement_metrics', 
      name: 'Platform Engagement', 
      description: 'Overall platform usage and participation rates',
      category: 'engagement',
      icon: BarChart3
    }
  ];

  const mockClients = [
    { id: '1', name: 'Sarah Johnson', status: 'active' },
    { id: '2', name: 'Michael Chen', status: 'active' },
    { id: '3', name: 'Emily Davis', status: 'active' },
    { id: '4', name: 'James Wilson', status: 'paused' },
    { id: '5', name: 'Anna Rodriguez', status: 'active' },
    { id: '6', name: 'David Kim', status: 'active' }
  ];

  const dateRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 3 months' },
    { value: 'last_6_months', label: 'Last 6 months' },
    { value: 'last_year', label: 'Last year' },
    { value: 'custom', label: 'Custom date range' }
  ];

  useEffect(() => {
    loadExistingReports();
  }, []);

  const loadExistingReports = () => {
    const mockReports: CustomReport[] = [
      {
        id: '1',
        name: 'Weekly Progress Summary',
        metrics: ['mood_trends', 'treatment_adherence'],
        format: 'PDF',
        dateRange: 'last_7_days',
        clients: ['1', '2', '3'],
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Monthly Analytics Report',
        metrics: ['mood_trends', 'ai_interactions', 'engagement_metrics', 'progress_milestones'],
        format: 'Excel',
        dateRange: 'last_30_days',
        clients: ['1', '2', '3', '4', '5'],
        created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Crisis Intervention Report',
        metrics: ['crisis_indicators', 'mood_trends', 'session_frequency'],
        format: 'PDF',
        dateRange: 'last_90_days',
        clients: ['1', '4'],
        created: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setCustomReports(mockReports);
  };

  const generateReport = async () => {
    if (!reportName || selectedMetrics.length === 0) return;

    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: reportName,
      metrics: selectedMetrics,
      format: selectedFormat,
      dateRange,
      clients: selectedClients.length > 0 ? selectedClients : mockClients.map(c => c.id),
      created: new Date().toISOString(),
      lastGenerated: new Date().toISOString()
    };

    setCustomReports(prev => [...prev, newReport]);
    setIsGenerating(newReport.id);
    
    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(null);
      alert(`Report "${reportName}" generated successfully! File would download as ${selectedFormat}.`);
    }, 2000);
    
    // Reset form
    resetForm();
  };

  const regenerateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    
    // Simulate regeneration
    setTimeout(() => {
      setCustomReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, lastGenerated: new Date().toISOString() }
            : report
        )
      );
      setIsGenerating(null);
      alert('Report regenerated successfully!');
    }, 1500);
  };

  const resetForm = () => {
    setReportName('');
    setSelectedMetrics([]);
    setSelectedClients([]);
    setDateRange('last_30_days');
    setSelectedFormat('PDF');
    setShowReportBuilder(false);
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const getMetricsByCategory = () => {
    const categories: { [key: string]: ReportMetric[] } = {};
    availableMetrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric);
    });
    return categories;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return FileText;
      case 'CSV': return FileDown;
      case 'Excel': return BarChart3;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600 mt-1">Generate personalized client progress reports with selected metrics</p>
        </div>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Report
        </button>
      </div>

      {/* Existing Reports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {customReports.map((report) => {
            const FormatIcon = getFormatIcon(report.format);
            return (
              <div key={report.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FormatIcon className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{report.metrics.length} metrics</span>
                          <span>{report.clients.length} clients</span>
                          <span>Created {formatDate(report.created)}</span>
                          {report.lastGenerated && (
                            <span>Last generated {formatDate(report.lastGenerated)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {report.metrics.slice(0, 3).map(metricId => {
                        const metric = availableMetrics.find(m => m.id === metricId);
                        return metric ? (
                          <span 
                            key={metricId}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {metric.name}
                          </span>
                        ) : null;
                      })}
                      {report.metrics.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{report.metrics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => regenerateReport(report.id)}
                      disabled={isGenerating === report.id}
                      className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isGenerating === report.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Builder Modal */}
      <AnimatePresence>
        {showReportBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Create Custom Report</h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Report Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g., Weekly Progress Summary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Metrics Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Metrics ({selectedMetrics.length} selected)
                  </label>
                  <div className="space-y-4">
                    {Object.entries(getMetricsByCategory()).map(([category, metrics]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2 capitalize">
                          {category} Metrics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {metrics.map((metric) => {
                            const IconComponent = metric.icon;
                            const isSelected = selectedMetrics.includes(metric.id);
                            return (
                              <div
                                key={metric.id}
                                onClick={() => toggleMetric(metric.id)}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <IconComponent className={`w-5 h-5 mt-0.5 ${
                                    isSelected ? 'text-blue-600' : 'text-gray-400'
                                  }`} />
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${
                                      isSelected ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      {metric.name}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {metric.description}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format and Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as 'PDF' | 'CSV' | 'Excel')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PDF">PDF Report</option>
                      <option value="CSV">CSV Data</option>
                      <option value="Excel">Excel Spreadsheet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dateRangeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Clients ({selectedClients.length > 0 ? selectedClients.length : 'All'} selected)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockClients.map((client) => {
                      const isSelected = selectedClients.includes(client.id);
                      return (
                        <div
                          key={client.id}
                          onClick={() => toggleClient(client.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${client.status === 'paused' ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${
                                isSelected ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {client.name}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {client.status}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Leave unselected to include all active clients
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateReport}
                  disabled={!reportName || selectedMetrics.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomReports; 