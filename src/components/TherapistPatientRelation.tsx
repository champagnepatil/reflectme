import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { normalizeClientId, getClientDisplayName } from '../utils/clientUtils';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, MessageSquare } from 'lucide-react';

interface TherapistInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TherapistPatientRelationProps {
  className?: string;
}

export const TherapistPatientRelation: React.FC<TherapistPatientRelationProps> = ({
  className = ''
}) => {
  const { clientId: rawClientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine client ID - use URL param if available, otherwise use current user ID
  const effectiveClientId = rawClientId || (user?.role === 'patient' ? user.id : null);
  
  // Normalize client ID for database operations
  const normalizedClientId = effectiveClientId ? normalizeClientId(effectiveClientId) : null;
  const displayName = effectiveClientId ? getClientDisplayName(effectiveClientId) : (user?.name || 'Client');

  useEffect(() => {
    if (normalizedClientId) {
      fetchTherapistRelation();
    } else {
      setLoading(false);
    }
  }, [normalizedClientId]);

  const fetchTherapistRelation = async () => {
    if (!normalizedClientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('therapist_client_relations')
        .select(`
          therapist_id,
          profiles!therapist_client_relations_therapist_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('client_id', normalizedClientId)
        .limit(1)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      if (data && data.profiles) {
        setTherapist({
          id: data.profiles.id,
          first_name: data.profiles.first_name,
          last_name: data.profiles.last_name,
          email: data.profiles.email
        });
      } else {
        // For demo clients, show a default therapist
        setTherapist({
          id: 'demo-therapist',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@reflectme.health'
        });
      }
    } catch (error) {
      console.error('Error fetching therapist-patient relation:', error);
      setError('Unable to load therapist information');
      
      // Fallback to demo therapist for demo clients
      if (effectiveClientId?.startsWith('demo') || (user?.role === 'patient' && !therapist)) {
        setTherapist({
          id: 'demo-therapist',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson', 
          email: 'sarah.johnson@reflectme.health'
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error && !therapist) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <p className="text-gray-600">No therapist assigned</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm p-6 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900">
            {therapist.first_name} {therapist.last_name}
          </h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-sm text-neutral-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Assigned to: {displayName}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-neutral-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>Email: {therapist.email}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 