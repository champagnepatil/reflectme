import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handler() {
  const now = new Date().toISOString();
  // Trova assessment in scadenza
  const { data: dueAssessments, error } = await supabase
    .from('assessment')
    .select('*')
    .lte('next_due_at', now);

  if (error) {
    console.error('Errore query assessment:', error);
    return { ok: false, error };
  }

  const notifications: any[] = [];

  for (const assessment of dueAssessments || []) {
    // Simula invio notifica (qui solo log, in prod invia email o push)
    const link = `https://your-app.com/?a=${assessment.id}`;
    notifications.push({
      clientId: assessment.client_id,
      instrument: assessment.instrument,
      link,
      sentAt: new Date().toISOString(),
    });
    console.log(`Notifica inviata a client ${assessment.client_id} per ${assessment.instrument}: ${link}`);

    // Aggiorna nextDueAt
    let nextDueAt = new Date(assessment.next_due_at);
    if (assessment.schedule === 'biweekly') {
      nextDueAt.setDate(nextDueAt.getDate() + 14);
    } else if (assessment.schedule === 'monthly') {
      nextDueAt.setMonth(nextDueAt.getMonth() + 1);
    } else {
      nextDueAt = null; // "once" non si ripete
    }
    if (nextDueAt) {
      await supabase
        .from('assessment')
        .update({ next_due_at: nextDueAt.toISOString() })
        .eq('id', assessment.id);
    }
  }

  return { ok: true, notifications };
} 