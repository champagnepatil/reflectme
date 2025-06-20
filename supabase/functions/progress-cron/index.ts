import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('⏰ Progress Cron Job started:', new Date().toISOString())

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, client_id, title, due_at, max_completions')
      .eq('is_archived', false)

    if (tasksError) throw new Error(`Failed to fetch tasks: ${tasksError.message}`)

    console.log(`📋 Found ${tasks?.length || 0} active tasks`)

    let totalProcessed = 0
    const results = []

    for (const task of tasks || []) {
      try {
        const { data: progressEntries } = await supabase
          .from('homework_progress')
          .select('pct, ts, mood_after')
          .eq('task_id', task.id)
          .order('ts', { ascending: false })

        const completionCount = progressEntries?.filter(p => p.pct === 100).length || 0
        const averageProgress = progressEntries?.length 
          ? progressEntries.reduce((sum, p) => sum + p.pct, 0) / progressEntries.length 
          : 0

        let overallCompletion = 0
        if (task.max_completions && task.max_completions > 1) {
          overallCompletion = Math.min((completionCount / task.max_completions) * 100, 100)
        } else {
          overallCompletion = averageProgress
        }

        const now = new Date()
        const dueDate = task.due_at ? new Date(task.due_at) : null
        
        let status = 'active'
        if (overallCompletion >= 100) status = 'completed'
        else if (dueDate && dueDate < now && overallCompletion < 100) status = 'overdue'

        // Insert summary into homework_progress for tracking
        if (overallCompletion > 0) {
          await supabase
            .from('homework_progress')
            .insert({
              task_id: task.id,
              client_id: task.client_id,
              pct: Math.round(overallCompletion),
              notes: `Calcolo automatico progresso: ${completionCount} completamenti`,
              completed_via: 'auto'
            })
        }

        results.push({
          task_id: task.id,
          completion_percentage: Math.round(overallCompletion),
          status
        })

        totalProcessed++
        console.log(`✅ ${task.title}: ${overallCompletion}% (${status})`)

      } catch (error) {
        console.error(`❌ Error processing task ${task.id}:`, error)
      }
    }

    // Send realtime notification
    const channel = supabase.channel('progress-updates')
    await channel.send({
      type: 'broadcast',
      event: 'progress:calculated',
      payload: { processed: totalProcessed, timestamp: new Date().toISOString() }
    })

    return new Response(JSON.stringify({
      success: true,
      processed: totalProcessed,
      results: results.slice(0, 5)
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Cron Job failed:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Helper function to send notifications to therapists about task status
 */
async function sendTherapistNotifications(overdueTasks: any[], staleTasks: any[]) {
  // This would integrate with email/push notification service
  // For now, just log the notifications that would be sent
  
  const notifications = []
  
  // Group by client for better notification management
  const clientGroups = new Map()
  
  [...overdueTasks, ...staleTasks].forEach(task => {
    if (!clientGroups.has(task.client_id)) {
      clientGroups.set(task.client_id, { overdue: [], stale: [] })
    }
    
    if (task.status === 'overdue') {
      clientGroups.get(task.client_id).overdue.push(task)
    } else {
      clientGroups.get(task.client_id).stale.push(task)
    }
  })
  
  for (const [clientId, tasks] of clientGroups) {
    let message = `Update su task per cliente ${clientId}:\n`
    
    if (tasks.overdue.length > 0) {
      message += `• ${tasks.overdue.length} task scaduti\n`
    }
    
    if (tasks.stale.length > 0) {
      message += `• ${tasks.stale.length} task senza attività recente\n`
    }
    
    notifications.push({
      client_id: clientId,
      message,
      priority: tasks.overdue.length > 0 ? 'high' : 'medium',
      type: 'task_status_alert'
    })
  }
  
  console.log('📨 Would send notifications:', notifications)
  return notifications
} 