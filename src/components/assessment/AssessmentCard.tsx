import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Assessment } from '@/types/assessment';
import { SCALES, getSeverityColor } from '@/utils/scales';
import { AssessmentForm } from './AssessmentForm';
import { Calendar, Clock, BarChart3, Play, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { generateSymptomTrendReport } from '@/services/pdfService';

interface AssessmentCardProps {
  assessment: Assessment;
  onComplete: (result: any) => void;
  className?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onComplete,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const scale = SCALES[assessment.instrument];
  const isDue = isAfter(new Date(), parseISO(assessment.nextDueAt));
  const isOverdue = isAfter(new Date(), parseISO(assessment.nextDueAt));
  
  // Get last result
  const lastResult = assessment.results.length > 0 
    ? assessment.results[assessment.results.length - 1] 
    : null;

  const handleComplete = (result: any) => {
    setShowForm(false);
    onComplete(result);
  };

  const handleDownloadReport = async () => {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const pdfUrl = await generateSymptomTrendReport(assessment.clientId, currentMonth);
      
      if (pdfUrl) {
        // Open the PDF in a new tab
        window.open(pdfUrl, '_blank');
      } else {
        alert('Errore nella generazione del report PDF');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Errore nella generazione del report PDF');
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <AssessmentForm
            instrument={assessment.instrument}
            assessmentId={assessment.id}
            onComplete={handleComplete}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 ${className} ${isDue ? 'ring-2 ring-primary-200' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
            isDue ? 'bg-primary-100' : 'bg-neutral-100'
          }`}>
            <BarChart3 className={`w-6 h-6 ${
              isDue ? 'text-primary-600' : 'text-neutral-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">
              {scale.name}
            </h3>
            <p className="text-sm text-neutral-600 mb-2">
              {scale.description}
            </p>
            <div className="flex items-center text-sm text-neutral-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                {assessment.schedule === 'biweekly' && 'Every 2 weeks'}
                {assessment.schedule === 'monthly' && 'Monthly'}
                {assessment.schedule === 'once' && 'Once'}
              </span>
            </div>
          </div>
        </div>
        
        {isDue && (
          <div className="flex items-center text-sm font-medium text-primary-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            Due
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Next due date:</span>
          <span className={`text-sm font-medium ${
            isOverdue ? 'text-error-600' : isDue ? 'text-warning-600' : 'text-neutral-900'
          }`}>
            {format(parseISO(assessment.nextDueAt), 'dd/MM/yyyy')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Evaluations completed:</span>
          <span className="text-sm font-medium text-neutral-900">
            {assessment.results.length}
          </span>
        </div>

        {lastResult && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Last score:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-neutral-900">
                {lastResult.score}
              </span>
              {lastResult.severityLevel && (
                <div className={`px-2 py-1 rounded text-xs ${getSeverityColor(lastResult.severityLevel)}`}>
                  {lastResult.severityLevel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {assessment.results.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Progress:</span>
            <span className="text-sm text-neutral-500">
              {assessment.results.length} evaluations
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${Math.min((assessment.results.length / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
        <div className="flex items-center text-sm text-neutral-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>~{scale.questions.length * 0.5}-{scale.questions.length} min</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className={`btn ${isDue ? 'btn-primary' : 'btn-outline'} flex items-center`}
          >
            {isDue ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Complete Now
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                View
              </>
            )}
          </button>
          
          {assessment.results.length > 0 && (
            <button
              onClick={handleDownloadReport}
              className="btn btn-ghost p-2"
              title="Download PDF Report"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Due indicator */}
      {isDue && (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-primary-600 mr-2 mt-0.5" />
            <div>
              <p className="text-primary-800 font-medium text-sm">
                Assessment due
              </p>
              <p className="text-primary-700 text-sm mt-1">
                Complete this assessment to help your therapist monitor your progress.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 