// 📧 Netlify Function for Automated Assessment Reminders
// Scheduled to run daily at 8:00 AM UTC (9:00 AM Italy time)

import { Handler } from '@netlify/functions';

// Import dell'assessment reminder worker
// Note: Questo percorso dovrà essere aggiustato durante il build
// import { runAssessmentReminderJob } from '../../src/workers/assessmentReminder';

// Temporary mock implementation
const runAssessmentReminderJob = async () => {
  console.log('🔄 Running assessment reminder job...');
  
  // Mock logic - in produzione sarà sostituito con l'implementazione reale
  const results = [
    { clientId: '123', email: 'client@example.com', status: 'sent' },
    { clientId: '456', email: 'client2@example.com', status: 'sent' }
  ];
  
  console.log(`✅ Sent ${results.length} reminder emails`);
  return results;
};

export const handler: Handler = async (event, context) => {
  console.log('📧 Assessment Reminders Function triggered');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Verifica autorizzazione per chiamate manuali
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    const isScheduled = event.httpMethod === 'POST' && 
                       (event.path?.includes('assessment-reminders') || 
                        context.clientContext?.custom?.netlify?.event_type === 'scheduled');
    
    // Log per debugging
    console.log('Auth header:', authHeader);
    console.log('Is scheduled:', isScheduled);
    console.log('HTTP method:', event.httpMethod);
    console.log('Path:', event.path);
    
    // Permetti chiamate scheduled o con autorizzazione corretta
    if (!isScheduled && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('❌ Unauthorized access attempt');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
          message: 'This endpoint requires proper authorization or scheduled execution'
        })
      };
    }
    
    console.log('✅ Authorization verified, running reminder job...');
    
    // Esegui il job dei reminder
    const startTime = Date.now();
    const results = await runAssessmentReminderJob();
    const duration = Date.now() - startTime;
    
    const response = {
      success: true,
      processed: results.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        clientId: r.clientId,
        status: r.status
        // Ometti email per privacy nei logs
      }))
    };
    
    console.log('📊 Job completed:', response);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('❌ Error in assessment reminders function:', error);
    
    const errorResponse = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};

// Per development/testing - esporta anche come default
export default handler; 