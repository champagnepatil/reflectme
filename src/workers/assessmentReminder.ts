// Assessment reminder worker
// TODO cursor: run this as a daily CRON job at 08:00 Europe/Rome

import { getDueAssessments } from '@/api/assessments';
import { sendAssessmentReminder, generateMagicLink } from '@/services/emailService';
import { supabase } from '@/lib/supabase';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
}

// Daily assessment reminder job
export const runAssessmentReminderJob = async (): Promise<{
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}> => {
  console.log('🕐 Starting daily assessment reminder job...');
  
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    // Get all due assessments
    const dueAssessments = await getDueAssessments();
    console.log(`📋 Found ${dueAssessments.length} due assessments`);

    for (const assessment of dueAssessments) {
      results.processed++;

      try {
        // Get client profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', assessment.clientId)
          .single();

        if (profileError || !profile) {
          console.error(`❌ Profile not found for client ${assessment.clientId}`);
          results.failed++;
          results.errors.push(`Profile not found for client ${assessment.clientId}`);
          continue;
        }

        // Generate secure magic link
        const magicLink = generateMagicLink(assessment.id, assessment.clientId);

        // Get instrument name
        const instrumentNames = {
          'PHQ-9': 'Patient Health Questionnaire-9',
          'GAD-7': 'Generalized Anxiety Disorder 7-item',
          'WHODAS-2.0': 'WHO Disability Assessment Schedule 2.0',
          'DSM-5-CC': 'DSM-5 Cross-Cutting Symptom Measure'
        };

        // Send reminder email
        const emailSent = await sendAssessmentReminder(profile.email, {
          clientName: profile.name,
          instrumentName: instrumentNames[assessment.instrument as keyof typeof instrumentNames],
          dueDate: assessment.nextDueAt,
          magicLink
        });

        if (emailSent) {
          results.sent++;
          console.log(`✅ Reminder sent to ${profile.email} for ${assessment.instrument}`);

          // Log the reminder in database for tracking
          await supabase
            .from('assessment_reminders')
            .insert({
              assessment_id: assessment.id,
              client_id: assessment.clientId,
              email: profile.email,
              sent_at: new Date().toISOString(),
              magic_link: magicLink
            });

        } else {
          results.failed++;
          results.errors.push(`Failed to send email to ${profile.email}`);
          
          // Fallback: create in-app notification
          await createInAppNotification(assessment.clientId, {
            title: 'Assessment in Scadenza',
            message: `Il tuo assessment ${instrumentNames[assessment.instrument as keyof typeof instrumentNames]} è in scadenza.`,
            type: 'assessment_due',
            data: { assessmentId: assessment.id }
          });
        }

      } catch (error) {
        console.error(`❌ Error processing assessment ${assessment.id}:`, error);
        results.failed++;
        results.errors.push(`Error processing assessment ${assessment.id}: ${error}`);
      }
    }

    // Update assessment schedules for successfully sent reminders
    await updateAssessmentSchedules(dueAssessments);

    console.log('📊 Assessment reminder job completed:', results);
    return results;

  } catch (error) {
    console.error('❌ Assessment reminder job failed:', error);
    results.errors.push(`Job failed: ${error}`);
    return results;
  }
};

// Update assessment schedules after sending reminders
const updateAssessmentSchedules = async (assessments: any[]) => {
  for (const assessment of assessments) {
    try {
      let nextDueDate: Date;
      const now = new Date();

      switch (assessment.schedule) {
        case 'biweekly':
          nextDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
        case 'once':
          // Don't reschedule one-time assessments
          continue;
        default:
          nextDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      }

      await supabase
        .from('assessments')
        .update({ 
          next_due_at: nextDueDate.toISOString(),
          reminder_sent_at: now.toISOString()
        })
        .eq('id', assessment.id);

    } catch (error) {
      console.error(`Error updating schedule for assessment ${assessment.id}:`, error);
    }
  }
};

// Create in-app notification as fallback
const createInAppNotification = async (
  clientId: string, 
  notification: {
    title: string;
    message: string;
    type: string;
    data: any;
  }
) => {
  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: clientId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString()
      });

    console.log(`📱 In-app notification created for client ${clientId}`);
  } catch (error) {
    console.error('Error creating in-app notification:', error);
  }
};

// Check for overdue assessments (more than 3 days late)
export const checkOverdueAssessments = async (): Promise<void> => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: overdueAssessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        profiles!inner(name, email)
      `)
      .lt('next_due_at', threeDaysAgo.toISOString())
      .is('completed_at', null);

    if (error) {
      console.error('Error fetching overdue assessments:', error);
      return;
    }

    if (overdueAssessments.length > 0) {
      console.log(`⚠️ Found ${overdueAssessments.length} overdue assessments`);
      
      // Notify therapists about overdue assessments
      for (const assessment of overdueAssessments) {
        // TODO cursor: Send notification to therapist
        console.log(`⚠️ Overdue assessment: ${assessment.instrument} for ${assessment.profiles.name}`);
      }
    }

  } catch (error) {
    console.error('Error checking overdue assessments:', error);
  }
};

// Health check for the reminder system
export const reminderSystemHealthCheck = async (): Promise<{
  status: 'healthy' | 'warning' | 'error';
  details: string[];
}> => {
  const details: string[] = [];
  let status: 'healthy' | 'warning' | 'error' = 'healthy';

  try {
    // Check database connectivity
    const { error: dbError } = await supabase
      .from('assessments')
      .select('count')
      .limit(1);

    if (dbError) {
      status = 'error';
      details.push(`Database connection failed: ${dbError.message}`);
    } else {
      details.push('Database connection: OK');
    }

    // Check for stuck assessments (due for more than 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: stuckAssessments, error: stuckError } = await supabase
      .from('assessments')
      .select('count')
      .lt('next_due_at', weekAgo.toISOString());

    if (stuckError) {
      status = 'warning';
      details.push(`Warning: Could not check stuck assessments: ${stuckError.message}`);
    } else if (stuckAssessments && stuckAssessments.length > 0) {
      status = 'warning';
      details.push(`Warning: ${stuckAssessments.length} assessments overdue by more than 7 days`);
    } else {
      details.push('No stuck assessments found');
    }

    // Check environment variables
    const requiredEnvVars = ['NEXT_PUBLIC_BASE_URL'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        status = 'warning';
        details.push(`Warning: Missing environment variable ${envVar}`);
      }
    }

    return { status, details };

  } catch (error) {
    return {
      status: 'error',
      details: [`Health check failed: ${error}`]
    };
  }
};

// Manual trigger for testing
export const testReminderSystem = async () => {
  console.log('🧪 Testing reminder system...');
  
  const healthCheck = await reminderSystemHealthCheck();
  console.log('Health check:', healthCheck);
  
  if (healthCheck.status === 'healthy') {
    // Run a limited test
    console.log('🔄 Running test reminder job...');
    const results = await runAssessmentReminderJob();
    console.log('Test results:', results);
  } else {
    console.log('❌ System not healthy, skipping test run');
  }
};

// Export for CRON job setup
export default {
  runAssessmentReminderJob,
  checkOverdueAssessments,
  reminderSystemHealthCheck,
  testReminderSystem
}; 