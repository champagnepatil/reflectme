import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MonitoringEntry, MonitoringFormData } from '../types/monitoring';

export const useMonitoring = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MonitoringEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async (clientId?: string, dateRange?: { start: Date; end: Date }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('monitoring_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      // If clientId is provided (for therapists), filter by that client
      // Otherwise, use the current user's ID (for patients)
      const targetClientId = clientId || user.id;
      query = query.eq('client_id', targetClientId);

      // Apply date range filter if provided
      if (dateRange) {
        query = query
          .gte('entry_date', dateRange.start.toISOString().split('T')[0])
          .lte('entry_date', dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedEntries: MonitoringEntry[] = data?.map(entry => ({
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

      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring entries');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (data: MonitoringFormData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const entryData = {
        client_id: user.id,
        water_intake: data.waterIntake,
        sunlight_exposure: data.sunlightExposure,
        healthy_meals: data.healthyMeals,
        exercise_duration: data.exerciseDuration,
        sleep_hours: data.sleepHours,
        social_interactions: data.socialInteractions,
        task_notes: data.taskNotes,
        task_remarks: data.taskRemarks,
        entry_date: data.date.toISOString().split('T')[0]
      };

      const { data: newEntry, error } = await supabase
        .from('monitoring_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;

      // Refresh entries after creation
      await fetchEntries();

      return newEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create monitoring entry');
    }
  };

  const updateEntry = async (id: string, data: Partial<MonitoringFormData>) => {
    try {
      const updateData: any = {};
      
      if (data.waterIntake !== undefined) updateData.water_intake = data.waterIntake;
      if (data.sunlightExposure !== undefined) updateData.sunlight_exposure = data.sunlightExposure;
      if (data.healthyMeals !== undefined) updateData.healthy_meals = data.healthyMeals;
      if (data.exerciseDuration !== undefined) updateData.exercise_duration = data.exerciseDuration;
      if (data.sleepHours !== undefined) updateData.sleep_hours = data.sleepHours;
      if (data.socialInteractions !== undefined) updateData.social_interactions = data.socialInteractions;
      if (data.taskNotes !== undefined) updateData.task_notes = data.taskNotes;
      if (data.taskRemarks !== undefined) updateData.task_remarks = data.taskRemarks;
      if (data.date !== undefined) updateData.entry_date = data.date.toISOString().split('T')[0];

      const { error } = await supabase
        .from('monitoring_entries')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Refresh entries after update
      await fetchEntries();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update monitoring entry');
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monitoring_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh entries after deletion
      await fetchEntries();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete monitoring entry');
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries
  };
};