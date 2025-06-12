import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCaseHistory } from '../../hooks/useCaseHistory';
import { ArrowLeft, Edit, User, Brain, Smile as Family, Baby, AlertTriangle, Calendar, MapPin, Languages } from 'lucide-react';

const CaseHistoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { caseHistories, loading } = useCaseHistory();
  
  const caseHistory = caseHistories.find(h => h.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (!caseHistory) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Case History Not Found</h2>
        <p className="text-neutral-600 mb-6">The requested case history could not be found.</p>
        <Link to="/therapist/case-histories" className="btn btn-primary">
          Back to Case Histories
        </Link>
      </div>
    );
  }

  const getRiskLevel = () => {
    if (caseHistory.mental_status_examination?.suicidal_ideation) {
      return { level: 'high', color: 'error', label: 'High Risk', icon: AlertTriangle };
    }
    if (caseHistory.primary_concerns?.toLowerCase().includes('depression') || 
        caseHistory.primary_concerns?.toLowerCase().includes('anxiety')) {
      return { level: 'medium', color: 'warning', label: 'Medium Risk', icon: AlertTriangle };
    }
    return { level: 'low', color: 'success', label: 'Low Risk', icon: null };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/therapist/case-histories')} 
            className="p-2 rounded-full hover:bg-neutral-100 mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{caseHistory.patient_name}</h1>
            <p className="text-neutral-500">Case History</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${risk.color}-100 text-${risk.color}-800 flex items-center`}>
            {risk.icon && <risk.icon className="w-4 h-4 mr-1" />}
            {risk.label}
          </div>
          <Link to={`/therapist/case-histories/${caseHistory.id}/edit`} className="btn btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Patient Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">{caseHistory.patient_name}</h2>
              <div className="flex items-center text-neutral-600 mt-1">
                {caseHistory.age && (
                  <span className="mr-4">Age: {caseHistory.age}</span>
                )}
                {caseHistory.gender && (
                  <span className="mr-4">Gender: {caseHistory.gender}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-neutral-500">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              Created: {new Date(caseHistory.created_at).toLocaleDateString()}
            </div>
            {caseHistory.updated_at !== caseHistory.created_at && (
              <div>Updated: {new Date(caseHistory.updated_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseHistory.address && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-neutral-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">Address</p>
                <p className="text-neutral-600">{caseHistory.address}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Languages className="w-5 h-5 text-neutral-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-900">Language</p>
              <p className="text-neutral-600">{caseHistory.language_of_communication}</p>
            </div>
          </div>
          
          {caseHistory.referred_by && (
            <div className="flex items-start">
              <User className="w-5 h-5 text-neutral-400 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">Referred By</p>
                <p className="text-neutral-600">{caseHistory.referred_by}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Primary Concerns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Primary Concerns</h2>
        <p className="text-neutral-700 whitespace-pre-line">
          {caseHistory.primary_concerns || 'No primary concerns documented.'}
        </p>
        
        {caseHistory.history_of_concerns && Object.values(caseHistory.history_of_concerns).some(v => v) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseHistory.history_of_concerns.onset && (
              <div>
                <p className="font-medium text-neutral-900">Onset</p>
                <p className="text-neutral-600">{caseHistory.history_of_concerns.onset}</p>
              </div>
            )}
            {caseHistory.history_of_concerns.duration && (
              <div>
                <p className="font-medium text-neutral-900">Duration</p>
                <p className="text-neutral-600">{caseHistory.history_of_concerns.duration}</p>
              </div>
            )}
            {caseHistory.history_of_concerns.stressful_factors && (
              <div className="md:col-span-2">
                <p className="font-medium text-neutral-900">Stressful Factors</p>
                <p className="text-neutral-600">{caseHistory.history_of_concerns.stressful_factors}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Mental Status Examination */}
      {caseHistory.mental_status_examination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="bg-primary-50 border-b border-primary-200 p-4">
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-primary-900">Mental Status Examination</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {caseHistory.mental_status_examination.suicidal_ideation && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <div className="flex items-center text-error-700 mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Suicidal Ideation Present</span>
                </div>
                {caseHistory.mental_status_examination.risk_assessment && (
                  <p className="text-error-800">{caseHistory.mental_status_examination.risk_assessment}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseHistory.mental_status_examination.speech_assessment && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Speech Assessment</h3>
                  <p className="text-neutral-700">{caseHistory.mental_status_examination.speech_assessment}</p>
                </div>
              )}
              
              {caseHistory.mental_status_examination.mood_and_affect && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Mood and Affect</h3>
                  <p className="text-neutral-700">{caseHistory.mental_status_examination.mood_and_affect}</p>
                </div>
              )}
              
              {caseHistory.mental_status_examination.thought_content && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Thought Content</h3>
                  <p className="text-neutral-700">{caseHistory.mental_status_examination.thought_content}</p>
                </div>
              )}
              
              {caseHistory.mental_status_examination.insight_level && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Insight Level</h3>
                  <p className="text-neutral-700">{caseHistory.mental_status_examination.insight_level}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Family History */}
      {caseHistory.family_history && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="bg-secondary-50 border-b border-secondary-200 p-4">
            <div className="flex items-center">
              <Family className="w-5 h-5 text-secondary-600 mr-2" />
              <h2 className="text-xl font-semibold text-secondary-900">Family History</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {caseHistory.family_history.family_tree && (
              <div>
                <h3 className="font-medium text-neutral-900 mb-2">Family Tree</h3>
                <p className="text-neutral-700">{caseHistory.family_history.family_tree}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseHistory.family_history.losses && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Losses</h3>
                  <p className="text-neutral-700">{caseHistory.family_history.losses}</p>
                </div>
              )}
              
              {caseHistory.family_history.family_atmosphere && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Family Atmosphere</h3>
                  <p className="text-neutral-700">{caseHistory.family_history.family_atmosphere}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Management Plan */}
      {caseHistory.management_plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Management Plan</h2>
          <p className="text-neutral-700 whitespace-pre-line">{caseHistory.management_plan}</p>
        </motion.div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseHistory.behavioral_observation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Behavioral Observation</h2>
            <p className="text-neutral-700">{caseHistory.behavioral_observation}</p>
          </motion.div>
        )}
        
        {caseHistory.strengths && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Strengths</h2>
            <p className="text-neutral-700">{caseHistory.strengths}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CaseHistoryView;