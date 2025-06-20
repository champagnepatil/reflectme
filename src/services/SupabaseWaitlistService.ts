import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jjflfhcdxgmpustkffqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmxmaGNkeGdtcHVzdGtmZnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjczNDQsImV4cCI6MjA2NDcwMzM0NH0.XBgnbTT3AdQCh_RqeW6N5mpvG2LBUrnYUB2f_pET--w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WaitlistSubscriber {
  id?: string;
  email: string;
  full_name?: string;
  source?: string;
  status?: 'active' | 'inactive' | 'converted';
  notification_preferences?: {
    email: boolean;
    browser: boolean;
  };
  metadata?: Record<string, any>;
  position_in_queue?: number;
  subscribed_at?: string;
  updated_at?: string;
}

export interface WaitlistNotification {
  id?: string;
  subscriber_id: string;
  type: 'welcome' | 'update' | 'launch' | 'reminder';
  title: string;
  message: string;
  sent_at?: string;
  delivery_status?: 'sent' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

class SupabaseWaitlistService {
  // Add a new subscriber to the waitlist
  async addSubscriber(subscriberData: Omit<WaitlistSubscriber, 'id' | 'subscribed_at' | 'updated_at'>): Promise<{ data: WaitlistSubscriber | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_subscribers')
        .insert([{
          email: subscriberData.email,
          full_name: subscriberData.full_name || null,
          source: subscriberData.source || 'homepage',
          status: subscriberData.status || 'active',
          notification_preferences: subscriberData.notification_preferences || { email: true, browser: true },
          metadata: subscriberData.metadata || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding subscriber:', error);
        return { data: null, error };
      }

      console.log(`✅ Subscriber added to Supabase:`, data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error adding subscriber:', err);
      return { data: null, error: err };
    }
  }

  // Check if email already exists
  async isEmailSubscribed(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('waitlist_subscribers')
        .select('id')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking email subscription:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Unexpected error checking email:', err);
      return false;
    }
  }

  // Get subscriber by email
  async getSubscriberByEmail(email: string): Promise<{ data: WaitlistSubscriber | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_subscribers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error getting subscriber:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error getting subscriber:', err);
      return { data: null, error: err };
    }
  }

  // Get total subscriber count
  async getSubscriberCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) {
        console.error('Error getting subscriber count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Unexpected error getting count:', err);
      return 0;
    }
  }

  // Get all subscribers with pagination
  async getSubscribers(page = 1, limit = 50): Promise<{ data: WaitlistSubscriber[]; error: any; total: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('subscribed_at', { ascending: true })
        .range(from, to);

      if (error) {
        console.error('Error getting subscribers:', error);
        return { data: [], error, total: 0 };
      }

      return { data: data || [], error: null, total: count || 0 };
    } catch (err) {
      console.error('Unexpected error getting subscribers:', err);
      return { data: [], error: err, total: 0 };
    }
  }

  // Add a notification record
  async addNotification(notificationData: Omit<WaitlistNotification, 'id' | 'sent_at'>): Promise<{ data: WaitlistNotification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_notifications')
        .insert([{
          subscriber_id: notificationData.subscriber_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          delivery_status: notificationData.delivery_status || 'sent',
          metadata: notificationData.metadata || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding notification:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error adding notification:', err);
      return { data: null, error: err };
    }
  }

  // Get notifications for a subscriber
  async getNotificationsBySubscriber(subscriberId: string): Promise<{ data: WaitlistNotification[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_notifications')
        .select('*')
        .eq('subscriber_id', subscriberId)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error getting notifications:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Unexpected error getting notifications:', err);
      return { data: [], error: err };
    }
  }

  // Update subscriber status
  async updateSubscriberStatus(email: string, status: 'active' | 'inactive' | 'converted'): Promise<{ data: WaitlistSubscriber | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('waitlist_subscribers')
        .update({ status })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscriber status:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error updating status:', err);
      return { data: null, error: err };
    }
  }

  // Get waitlist statistics
  async getWaitlistStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    bySource: Record<string, number>;
  }> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get total count
      const { count: total } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get today's count
      const { count: today } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('subscribed_at', todayStart.toISOString());

      // Get this week's count
      const { count: thisWeek } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('subscribed_at', weekStart.toISOString());

      // Get this month's count
      const { count: thisMonth } = await supabase
        .from('waitlist_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('subscribed_at', monthStart.toISOString());

      // Get by source
      const { data: sourceData } = await supabase
        .from('waitlist_subscribers')
        .select('source')
        .eq('status', 'active');

      const bySource: Record<string, number> = {};
      sourceData?.forEach(item => {
        const source = item.source || 'unknown';
        bySource[source] = (bySource[source] || 0) + 1;
      });

      return {
        total: total || 0,
        today: today || 0,
        thisWeek: thisWeek || 0,
        thisMonth: thisMonth || 0,
        bySource
      };
    } catch (err) {
      console.error('Error getting waitlist stats:', err);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        bySource: {}
      };
    }
  }

  // Unsubscribe user
  async unsubscribe(email: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('waitlist_subscribers')
        .update({ status: 'inactive' })
        .eq('email', email);

      if (error) {
        console.error('Error unsubscribing:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected error unsubscribing:', err);
      return { success: false, error: err };
    }
  }
}

export default new SupabaseWaitlistService(); 