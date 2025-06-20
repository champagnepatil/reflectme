// 📊 Netlify Function for Biometrics Sync with Google Fit
// Scheduled every 2 hours: "0 */2 * * *"

import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Google Fit API types
interface GoogleFitDataPoint {
  value: { doubleVal: number };
  startTimeNanos: string;
  endTimeNanos: string;
}

interface GoogleFitResponse {
  point?: GoogleFitDataPoint[];
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event, context) => {
  console.log('🔄 Starting biometrics sync job...');
  
  try {
    // 1. Get clients with valid OAuth tokens
    const { data: clients, error } = await supabase
      .rpc('get_clients_with_oauth', { provider_name: 'google_fit' });
    
    if (error) {
      console.error('Error fetching OAuth clients:', error);
      throw error;
    }
    
    console.log(`📊 Found ${clients?.length || 0} clients with Google Fit access`);
    
    let totalSynced = 0;
    let totalErrors = 0;
    
    // 2. Sync each client's data
    for (const client of clients || []) {
      try {
        console.log(`🔄 Syncing client: ${client.client_id}`);
        const syncCount = await syncClientBiometrics(client);
        totalSynced += syncCount;
        
        // Log successful sync
        await supabase.from('audit_logs').insert({
          actor_id: client.client_id,
          actor_type: 'system',
          action: 'biometrics_sync',
          object_type: 'biometrics_hourly',
          metadata: { synced_points: syncCount, provider: 'google_fit' }
        });
        
        console.log(`✅ Synced ${syncCount} data points for client ${client.client_id}`);
        
      } catch (clientError) {
        totalErrors++;
        console.error(`❌ Error syncing client ${client.client_id}:`, clientError);
        
        // Log failed sync
        await supabase.from('audit_logs').insert({
          actor_id: client.client_id,
          actor_type: 'system', 
          action: 'biometrics_sync_failed',
          object_type: 'biometrics_hourly',
          metadata: { 
            error: clientError instanceof Error ? clientError.message : String(clientError), 
            provider: 'google_fit' 
          }
        });
      }
    }
    
    // 3. Publish realtime update if we synced data
    if (totalSynced > 0) {
      await supabase.channel('biometrics').send({
        type: 'broadcast',
        event: 'biometrics:new',
        payload: { 
          total_synced: totalSynced, 
          timestamp: new Date().toISOString(),
          clients_updated: (clients?.length || 0) - totalErrors
        }
      });
      
      console.log('📡 Published realtime update for biometrics');
    }
    
    const response = {
      success: true,
      clients_processed: clients?.length || 0,
      total_synced: totalSynced,
      total_errors: totalErrors,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Biometrics sync job completed:', response);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('❌ Biometrics sync job failed:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
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

async function syncClientBiometrics(client: any): Promise<number> {
  const { client_id, access_token } = client;
  
  // Calculate time range (last 24 hours)
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
  
  let syncedCount = 0;
  
  try {
    // Sync steps data
    console.log(`📈 Fetching steps data for client ${client_id}`);
    const stepsData = await fetchGoogleFitData(
      access_token,
      'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      startTime,
      endTime
    );
    
    const stepsSynced = await upsertBiometricsData(client_id, 'steps', stepsData);
    syncedCount += stepsSynced;
    console.log(`📈 Synced ${stepsSynced} step data points`);
    
    // Sync sleep data
    console.log(`😴 Fetching sleep data for client ${client_id}`);
    const sleepData = await fetchGoogleFitData(
      access_token,
      'derived:com.google.sleep.segment:com.google.android.gms:merged',
      startTime,
      endTime
    );
    
    const sleepSynced = await upsertBiometricsData(client_id, 'sleep_minutes', sleepData);
    syncedCount += sleepSynced;
    console.log(`😴 Synced ${sleepSynced} sleep data points`);
    
    // Sync calories (optional)
    try {
      console.log(`🔥 Fetching calories data for client ${client_id}`);
      const caloriesData = await fetchGoogleFitData(
        access_token,
        'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
        startTime,
        endTime
      );
      
      const caloriesSynced = await upsertBiometricsData(client_id, 'calories', caloriesData);
      syncedCount += caloriesSynced;
      console.log(`🔥 Synced ${caloriesSynced} calories data points`);
      
    } catch (caloriesError) {
      console.warn(`⚠️ Could not sync calories for client ${client_id}:`, caloriesError);
      // Not critical, continue
    }
    
  } catch (error) {
    console.error(`❌ Error in syncClientBiometrics for ${client_id}:`, error);
    throw error;
  }
  
  return syncedCount;
}

async function fetchGoogleFitData(
  accessToken: string,
  dataSourceId: string,
  startTime: Date,
  endTime: Date
): Promise<GoogleFitDataPoint[]> {
  
  const startTimeNanos = startTime.getTime() * 1000000; // Convert to nanoseconds
  const endTimeNanos = endTime.getTime() * 1000000;
  
  const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`;
  
  console.log(`🌐 Fetching Google Fit data: ${dataSourceId}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Google Fit API error (${response.status}):`, errorText);
    
    if (response.status === 401) {
      throw new Error('OAuth token expired or invalid');
    } else if (response.status === 403) {
      throw new Error('Insufficient permissions for Google Fit API');
    } else {
      throw new Error(`Google Fit API error: ${response.status} - ${errorText}`);
    }
  }
  
  const data: GoogleFitResponse = await response.json();
  const points = data.point || [];
  
  console.log(`📊 Received ${points.length} data points from Google Fit`);
  return points;
}

async function upsertBiometricsData(
  clientId: string,
  metric: string,
  dataPoints: GoogleFitDataPoint[]
): Promise<number> {
  
  if (!dataPoints.length) {
    console.log(`📊 No ${metric} data points to sync for client ${clientId}`);
    return 0;
  }
  
  const biometricsData = dataPoints.map(point => {
    const recordedAt = new Date(parseInt(point.startTimeNanos) / 1000000); // Convert from nanoseconds
    
    // Convert sleep data from nanoseconds to minutes if needed
    let value = point.value.doubleVal;
    if (metric === 'sleep_minutes' && point.endTimeNanos) {
      const duration = (parseInt(point.endTimeNanos) - parseInt(point.startTimeNanos)) / 1000000 / 1000 / 60; // Convert to minutes
      value = Math.round(duration);
    }
    
    return {
      client_id: clientId,
      metric,
      value,
      recorded_at: recordedAt.toISOString(),
      source: 'google_fit'
    };
  });
  
  console.log(`💾 Upserting ${biometricsData.length} ${metric} records for client ${clientId}`);
  
  // Upsert with conflict resolution
  const { error, count } = await supabase
    .from('biometrics_hourly')
    .upsert(biometricsData, {
      onConflict: 'client_id,metric,recorded_at',
      ignoreDuplicates: false // Update existing records
    });
  
  if (error) {
    console.error(`❌ Error upserting ${metric} data:`, error);
    throw new Error(`Failed to upsert ${metric} data: ${error.message}`);
  }
  
  const upsertedCount = count || biometricsData.length;
  console.log(`✅ Successfully upserted ${upsertedCount} ${metric} records`);
  
  return upsertedCount;
}

// Export for testing
export { syncClientBiometrics, fetchGoogleFitData, upsertBiometricsData }; 