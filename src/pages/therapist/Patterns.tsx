import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TopicCloud } from '../../components/therapist/TopicCloud';
import { useTherapy } from '../../contexts/TherapyContext';
import { 
  Cloud, 
  Users, 
  TrendingUp, 
  Filter, 
  Calendar,
  BarChart3,
  Brain,
  AlertTriangle,
  Target,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PatternInsight {
  pattern: string;
  frequency: number;
  clients_affected: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface CrossClientCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: 'low' | 'medium' | 'high';
  insight: string;
}

const Patterns: React.FC = () => {
  const { clients } = useTherapy();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'concerning' | 'improving'>('all');
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [correlations, setCorrelations] = useState<CrossClientCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatternData();
  }, [selectedTimeRange, selectedFilter]);

  const loadPatternData = async () => {
    try {
      setLoading(true);
      
      // Load global patterns from database
      const { data: patternsData, error: patternsError } = await supabase
        .rpc('get_global_patterns', {
          time_range: selectedTimeRange,
          filter_type: selectedFilter
        });

      if (patternsError) {
        console.warn('Pattern analysis not available:', patternsError);
        // Use mock data for demo
        setPatterns(getMockPatterns());
      } else {
        setPatterns(patternsData || []);
      }

      // Load cross-client correlations
      const { data: correlationsData, error: correlationsError } = await supabase
        .rpc('get_cross_client_correlations', {
          time_range: selectedTimeRange
        });

      if (correlationsError) {
        console.warn('Correlation analysis not available:', correlationsError);
        setCorrelations(getMockCorrelations());
      } else {
        setCorrelations(correlationsData || []);
      }

    } catch (error) {
      console.error('Error loading pattern data:', error);
      // Fallback to mock data
      setPatterns(getMockPatterns());
      setCorrelations(getMockCorrelations());
    } finally {
      setLoading(false);
    }
  };

  const getMockPatterns = (): PatternInsight[] => [
    {
      pattern: 'Morning Anxiety',
      frequency: 24,
      clients_affected: 8,
      trend: 'increasing',
      severity: 'high',
      recommendations: [
        'Implement structured morning routines',
        'Breathing techniques upon waking',
        'Consider morning session scheduling'
      ]
    },
    {
      pattern: 'Weekend Improvement',
      frequency: 18,
      clients_affected: 12,
      trend: 'stable',
      severity: 'medium',
      recommendations: [
        'Integrate weekend elements into weekdays',
        'Focus on work-life balance',
        'Schedule recreational activities'
      ]
    },
    {
      pattern: 'Work-related Stress',
      frequency: 31,
      clients_affected: 15,
      trend: 'increasing',
      severity: 'high',
      recommendations: [
        'Stress management techniques',
        'Scheduled breaks during work',
        'Communication with employers'
      ]
    },
    {
      pattern: 'Positive Social Support',
      frequency: 14,
      clients_affected: 9,
      trend: 'increasing',
      severity: 'low',
      recommendations: [
        'Continue strengthening relationships',
        'Support groups',
        'Structured social activities'
      ]
    }
  ];

  const getMockCorrelations = (): CrossClientCorrelation[] => [
    {
      factor1: 'Sleep Quality',
      factor2: 'Anxiety Levels',
      correlation: -0.78,
      significance: 'high',
      insight: 'Better sleep quality is strongly correlated with lower anxiety levels'
    },
    {
      factor1: 'Physical Exercise',
      factor2: 'General Mood',
      correlation: 0.65,
      significance: 'high',
      insight: 'Regular physical activity shows strong positive correlation with mood improvement'
    },
    {
      factor1: 'Social Support',
      factor2: 'Treatment Adherence',
      correlation: 0.54,
      significance: 'medium',
      insight: 'Clients with greater social support tend to be more adherent to treatment'
    },
    {
      factor1: 'Work Stress',
      factor2: 'Depressive Episodes',
      correlation: 0.71,
      significance: 'high',
      insight: 'High levels of work stress are strongly associated with depressive episodes'
    }
  ];

  const getPatternSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-error-100 text-error-700 border-error-200';
      case 'medium': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'low': return 'bg-success-100 text-success-700 border-success-200';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-error-600" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-success-600 rotate-180" />;
      case 'stable': return <div className="w-4 h-4 bg-neutral-400 rounded-full" />;
      default: return null;
    }
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Very weak';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? 'text-success-600' : 'text-error-600';
    if (abs >= 0.5) return correlation > 0 ? 'text-success-500' : 'text-error-500';
    return 'text-neutral-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-neutral-200 rounded"></div>
            <div className="h-96 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Pattern Analysis</h1>
            <p className="text-neutral-600">Analisi cross-client e identificazione pattern</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-neutral-600" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="quarter">Ultimo trimestre</option>
              <option value="year">Ultimo anno</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-600" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Tutti i pattern</option>
              <option value="concerning">Pattern preoccupanti</option>
              <option value="improving">Pattern in miglioramento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{clients.length}</div>
          <div className="text-sm text-neutral-600">Clienti Attivi</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Cloud className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{patterns.length}</div>
          <div className="text-sm text-neutral-600">Pattern Identificati</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-5 h-5 text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {patterns.filter(p => p.severity === 'high').length}
          </div>
          <div className="text-sm text-neutral-600">Alta Priorità</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {correlations.filter(c => c.significance === 'high').length}
          </div>
          <div className="text-sm text-neutral-600">Correlazioni Forti</div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Topic Cloud */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <TopicCloud 
            timeRange={selectedTimeRange}
            maxTags={20}
            className="h-96"
          />
          
          {/* Pattern Insights */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Pattern Identificati
              </h2>
            </div>
            
            <div className="space-y-4">
              {patterns.slice(0, 4).map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium text-neutral-900">{pattern.pattern}</h3>
                      {getTrendIcon(pattern.trend)}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getPatternSeverityColor(pattern.severity)}`}>
                      {pattern.severity}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                    <span>📊 {pattern.frequency} occorrenze</span>
                    <span>👥 {pattern.clients_affected} clienti</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-neutral-700 mb-2">Raccomandazioni:</p>
                    <ul className="space-y-1">
                      {pattern.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-neutral-600 text-xs flex items-start">
                          <Target className="w-3 h-3 text-primary-500 mr-1 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Cross-Client Correlations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-6 h-6 text-secondary-600 mr-3" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Correlazioni Cross-Client
              </h2>
            </div>
            
            <div className="space-y-4">
              {correlations.map((correlation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-neutral-900 text-sm">
                      {correlation.factor1} ↔ {correlation.factor2}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getCorrelationColor(correlation.correlation)}`}>
                        {correlation.correlation > 0 ? '+' : ''}{correlation.correlation.toFixed(2)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {getCorrelationStrength(correlation.correlation)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-2">
                    {correlation.insight}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${
                      correlation.significance === 'high' ? 'bg-success-100 text-success-700' :
                      correlation.significance === 'medium' ? 'bg-warning-100 text-warning-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      Significatività: {correlation.significance}
                    </span>
                    
                    <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Dettagli
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Action Items */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-warning-600 mr-3" />
              <h2 className="text-lg font-semibold text-neutral-900">
                Azioni Raccomandate
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-error-50 border border-error-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-error-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-error-900 text-sm">Urgente</p>
                  <p className="text-error-700 text-sm">
                    Monitorare da vicino i 3 clienti con pattern di ansia mattutina crescente
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <Calendar className="w-5 h-5 text-warning-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-warning-900 text-sm">Questa settimana</p>
                  <p className="text-warning-700 text-sm">
                    Implementare workshop su gestione stress lavorativo per 8 clienti
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <Brain className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-primary-900 text-sm">Ricerca</p>
                  <p className="text-primary-700 text-sm">
                    Approfondire la correlazione sonno-ansia per personalizzare i trattamenti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Patterns;