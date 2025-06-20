import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { SymptomTrendData } from '@/types/assessment';
import { SCALES, calculateClinicallySignificantChange, getSeverityColor } from '@/utils/scales';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
// Badge component not available - using inline styles

interface SymptomTrendProps {
  clientId: string;
  instrument: 'PHQ-9' | 'GAD-7' | 'WHODAS-2.0' | 'DSM-5-CC';
  data: SymptomTrendData[];
  className?: string;
  onDataUpdate?: (newData: SymptomTrendData[]) => void;
  showBiometrics?: boolean; // NEW: Toggle biometrics overlay
}

interface BiometricData {
  metric: string;
  value: number;
  recorded_at: string;
}

export const SymptomTrend: React.FC<SymptomTrendProps> = ({
  clientId,
  instrument,
  data,
  className = '',
  onDataUpdate,
  showBiometrics = false
}) => {
  const [realtimeData, setRealtimeData] = useState<SymptomTrendData[]>(data);
  const [isAnimating, setIsAnimating] = useState(false);
  const [biometricsData, setBiometricsData] = useState<BiometricData[]>([]);
  const [biometricsEnabled, setBiometricsEnabled] = useState(showBiometrics);
  const [loadingBiometrics, setLoadingBiometrics] = useState(false);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase.channel('assessment-updates')
      .on('broadcast', { event: 'assessment_completed' }, (payload) => {
        if (payload.payload.client_id === clientId && payload.payload.instrument === instrument) {
          console.log('📊 New assessment result received via realtime:', payload.payload);
          
          // Add new data point with animation
          const newDataPoint: SymptomTrendData = {
            date: new Date().toISOString(),
            score: payload.payload.score,
            instrument: payload.payload.instrument,
            severityLevel: payload.payload.severity_level || 'minimal'
          };
          
          setIsAnimating(true);
          setRealtimeData(prev => {
            const updated = [...prev, newDataPoint].sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            
            // Notify parent component
            onDataUpdate?.(updated);
            
            return updated;
          });
          
          // Reset animation after a short delay
          setTimeout(() => setIsAnimating(false), 1000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, instrument, onDataUpdate]);

  // Update local data when props change
  useEffect(() => {
    setRealtimeData(data);
  }, [data]);

  // Load biometrics data when enabled
  useEffect(() => {
    if (biometricsEnabled && clientId) {
      loadBiometricsData();
    }
  }, [biometricsEnabled, clientId]);

  const loadBiometricsData = async () => {
    try {
      setLoadingBiometrics(true);
      
      // Get biometrics data for the same timeframe as assessments
      const earliestAssessment = sortedData[0]?.date;
      const startDate = earliestAssessment || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: biometrics, error } = await supabase
        .from('biometrics_hourly')
        .select('metric, value, recorded_at')
        .eq('client_id', clientId)
        .gte('recorded_at', startDate)
        .in('metric', ['steps', 'sleep_minutes']);
      
      if (error) throw error;
      
      setBiometricsData(biometrics || []);
      
    } catch (error) {
      console.error('Error loading biometrics:', error);
    } finally {
      setLoadingBiometrics(false);
    }
  };

  const toggleBiometrics = () => {
    setBiometricsEnabled(!biometricsEnabled);
  };
  const scale = SCALES[instrument];
  const sortedData = realtimeData
    .filter(d => d.instrument === instrument)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trend and clinical significance
  const getTrendAnalysis = () => {
    if (sortedData.length < 2) return null;
    
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    
    const change = calculateClinicallySignificantChange(
      instrument,
      previous.score,
      latest.score
    );
    
    return {
      latest,
      previous,
      change
    };
  };

  const trendAnalysis = getTrendAnalysis();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-900">
            {format(new Date(label), 'dd/MM/yyyy')}
          </p>
          <p className="text-sm text-neutral-600">
            Score: <span className="font-medium">{data.score}</span>
          </p>
          <div className={`inline-block px-2 py-1 rounded text-xs ${getSeverityColor(data.severityLevel)}`}>
            {data.severityLevel}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get reference lines for clinical cutoffs
  const getReferenceLines = () => {
    const cutoffs = scale.clinicalCutoffs;
    const lines = [];
    
    if (cutoffs.mild) {
      lines.push(
        <ReferenceLine 
          key="mild" 
          y={cutoffs.mild[0]} 
          stroke="#f59e0b" 
          strokeDasharray="3 3" 
          opacity={0.5}
        />
      );
    }
    
    if (cutoffs.moderate) {
      lines.push(
        <ReferenceLine 
          key="moderate" 
          y={cutoffs.moderate[0]} 
          stroke="#ef4444" 
          strokeDasharray="3 3" 
          opacity={0.5}
        />
      );
    }
    
    if (cutoffs.moderatelyServere) {
      lines.push(
        <ReferenceLine 
          key="severe" 
          y={cutoffs.moderatelyServere[0]} 
          stroke="#dc2626" 
          strokeDasharray="3 3" 
          opacity={0.5}
        />
      );
    }
    
    return lines;
  };

  if (sortedData.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {scale.name} - Trend
        </h3>
        <div className="text-center py-8 text-neutral-500">
          <p>No data available for this instrument</p>
          <p className="text-sm mt-2">Assessment results will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {scale.name}
          </h3>
          <p className="text-sm text-neutral-600">{scale.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Biometrics Toggle */}
          <Button
            variant={biometricsEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleBiometrics}
            disabled={loadingBiometrics}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            {loadingBiometrics ? 'Caricando...' : 'Biometrics'}
            {biometricsData.length > 0 && biometricsEnabled && (
              <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium ml-1">
                {biometricsData.length}
              </span>
            )}
          </Button>
          
          {trendAnalysis && (
            <div className="text-right">
              <div className="flex items-center">
                {trendAnalysis.change.direction === 'improvement' && (
                  <TrendingDown className="w-4 h-4 text-success-600 mr-1" />
                )}
                {trendAnalysis.change.direction === 'deterioration' && (
                  <TrendingUp className="w-4 h-4 text-error-600 mr-1" />
                )}
                {trendAnalysis.change.direction === 'stable' && (
                  <Minus className="w-4 h-4 text-neutral-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trendAnalysis.change.direction === 'improvement' ? 'text-success-600' :
                  trendAnalysis.change.direction === 'deterioration' ? 'text-error-600' :
                  'text-neutral-600'
                }`}>
                  {trendAnalysis.change.direction === 'improvement' && 'Improvement'}
                  {trendAnalysis.change.direction === 'deterioration' && 'Deterioration'}
                  {trendAnalysis.change.direction === 'stable' && 'Stable'}
                </span>
              </div>
              {trendAnalysis.change.isSignificant && (
                <p className="text-xs text-neutral-600 mt-1">
                  Clinically significant change
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'dd/MM')}
              fontSize={12}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {getReferenceLines()}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Latest Score */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div>
            <p className="text-sm text-neutral-600">Latest score</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-neutral-900">
                {sortedData[sortedData.length - 1].score}
              </span>
              <div className={`px-2 py-1 rounded text-xs ${getSeverityColor(sortedData[sortedData.length - 1].severityLevel)}`}>
                {sortedData[sortedData.length - 1].severityLevel}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-neutral-600">
              {format(new Date(sortedData[sortedData.length - 1].date), 'dd MMMM yyyy')}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {sortedData.length} total evaluations
            </p>
          </div>
        </div>
      )}

      {/* Clinical Ranges Legend */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs font-medium text-neutral-700 mb-2">Clinical ranges:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-success-500 rounded mr-1"></div>
            <span>Minimal (0-{scale.clinicalCutoffs.minimal[1]})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-warning-500 rounded mr-1"></div>
            <span>Mild ({scale.clinicalCutoffs.mild[0]}-{scale.clinicalCutoffs.mild[1]})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-error-500 rounded mr-1"></div>
            <span>Moderate+ ({scale.clinicalCutoffs.moderate[0]}+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 