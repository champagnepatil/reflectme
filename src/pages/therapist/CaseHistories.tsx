import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCaseHistory } from '../../hooks/useCaseHistory';
import { FileText, Plus, Search, Calendar, User, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';

const CaseHistories: React.FC = () => {
  const { caseHistories, loading, error, deleteCaseHistory } = useCaseHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);

  const filteredHistories = caseHistories.filter(history =>
    history.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.primary_concerns?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this case history? This action cannot be undone.')) {
      try {
        await deleteCaseHistory(id);
      } catch (err) {
        alert('Failed to delete case history');
      }
    }
  };

  const getRiskLevel = (history: any) => {
    if (history.mental_status_examination?.suicidal_ideation) {
      return { level: 'high', color: 'error', label: 'High Risk' };
    }
    if (history.primary_concerns?.toLowerCase().includes('depression') || 
        history.primary_concerns?.toLowerCase().includes('anxiety')) {
      return { level: 'medium', color: 'warning', label: 'Medium Risk' };
    }
    return { level: 'low', color: 'success', label: 'Low Risk' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-error-700 mb-2">Error Loading Case Histories</h2>
        <p className="text-error-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Case Histories</h1>
        <Link to="/therapist/case-histories/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Case History
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name or concerns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Case Histories List */}
      {filteredHistories.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            {searchTerm ? 'No matching case histories found' : 'No case histories yet'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first case history to start documenting patient information'}
          </p>
          {!searchTerm && (
            <Link to="/therapist/case-histories/new" className="btn btn-primary mx-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create First Case History
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHistories.map((history, index) => {
            const risk = getRiskLevel(history);
            return (
              <motion.div
                key={history.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-lg">
                          {history.patient_name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {history.age && `Age: ${history.age}`}
                          {history.age && history.gender && ' • '}
                          {history.gender && `Gender: ${history.gender}`}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${risk.color}-100 text-${risk.color}-800`}>
                      {risk.label}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-neutral-900 mb-2">Primary Concerns</h4>
                    <p className="text-neutral-700 text-sm line-clamp-2">
                      {history.primary_concerns || 'No concerns documented'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-neutral-900 mb-2">Management Plan</h4>
                    <p className="text-neutral-700 text-sm line-clamp-2">
                      {history.management_plan || 'No management plan documented'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Created: {new Date(history.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {history.updated_at !== history.created_at && (
                      <span>
                        Updated: {new Date(history.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div className="flex space-x-2">
                      <Link
                        to={`/therapist/case-histories/${history.id}`}
                        className="btn btn-ghost text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/therapist/case-histories/${history.id}/edit`}
                        className="btn btn-ghost text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(history.id)}
                      className="btn btn-ghost text-sm text-error-600 hover:bg-error-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Risk Indicators */}
                {history.mental_status_examination?.suicidal_ideation && (
                  <div className="bg-error-50 border-t border-error-200 p-3">
                    <div className="flex items-center text-error-700">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Suicidal ideation documented</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaseHistories;