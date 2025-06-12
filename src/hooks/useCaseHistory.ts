import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CaseHistory, CompleteCaseHistory, MentalStatusExamination, FamilyHistory, DevelopmentalHistory } from '../types/caseHistory';

export const useCaseHistory = () => {
  const { user } = useAuth();
  const [caseHistories, setCaseHistories] = useState<CompleteCaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseHistories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: histories, error: historiesError } = await supabase
        .from('case_histories')
        .select(`
          *,
          mental_status_examinations(*),
          family_histories(*),
          developmental_histories(*)
        `)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (historiesError) throw historiesError;

      const formattedHistories: CompleteCaseHistory[] = histories?.map(history => ({
        ...history,
        mental_status_examination: history.mental_status_examinations?.[0] || undefined,
        family_history: history.family_histories?.[0] || undefined,
        developmental_history: history.developmental_histories?.[0] || undefined,
      })) || [];

      setCaseHistories(formattedHistories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case histories');
    } finally {
      setLoading(false);
    }
  };

  const createCaseHistory = async (caseHistoryData: Partial<CaseHistory>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('case_histories')
        .insert([{ ...caseHistoryData, therapist_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      await fetchCaseHistories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create case history');
    }
  };

  const updateCaseHistory = async (id: string, updates: Partial<CaseHistory>) => {
    try {
      const { error } = await supabase
        .from('case_histories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await fetchCaseHistories();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update case history');
    }
  };

  const createMSE = async (mseData: Partial<MentalStatusExamination>) => {
    try {
      const { data, error } = await supabase
        .from('mental_status_examinations')
        .insert([mseData])
        .select()
        .single();

      if (error) throw error;

      await fetchCaseHistories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create MSE');
    }
  };

  const createFamilyHistory = async (familyData: Partial<FamilyHistory>) => {
    try {
      const { data, error } = await supabase
        .from('family_histories')
        .insert([familyData])
        .select()
        .single();

      if (error) throw error;

      await fetchCaseHistories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create family history');
    }
  };

  const createDevelopmentalHistory = async (devData: Partial<DevelopmentalHistory>) => {
    try {
      const { data, error } = await supabase
        .from('developmental_histories')
        .insert([devData])
        .select()
        .single();

      if (error) throw error;

      await fetchCaseHistories();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create developmental history');
    }
  };

  const deleteCaseHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('case_histories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCaseHistories();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete case history');
    }
  };

  useEffect(() => {
    fetchCaseHistories();
  }, [user]);

  return {
    caseHistories,
    loading,
    error,
    createCaseHistory,
    updateCaseHistory,
    createMSE,
    createFamilyHistory,
    createDevelopmentalHistory,
    deleteCaseHistory,
    refetch: fetchCaseHistories,
  };
};