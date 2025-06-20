import { NextRequest, NextResponse } from 'next/server';
import { SCALES } from 'packages/utils/scales';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, answers } = await req.json();
    if (!assessmentId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ ok: false, error: 'Dati mancanti' }, { status: 400 });
    }

    // Recupera l'assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessment')
      .select('*')
      .eq('id', assessmentId)
      .single();
    if (assessmentError || !assessment) {
      return NextResponse.json({ ok: false, error: 'Assessment non trovato' }, { status: 404 });
    }

    const scale = SCALES[assessment.instrument];
    if (!scale) {
      return NextResponse.json({ ok: false, error: 'Strumento non supportato' }, { status: 400 });
    }

    // Calcola il punteggio server-side
    const score = scale.scoring(answers);

    // Inserisci AssessmentResult
    const { error: insertError } = await supabase
      .from('assessment_result')
      .insert({
        assessment_id: assessmentId,
        score,
        raw_json: answers,
      });
    if (insertError) {
      return NextResponse.json({ ok: false, error: 'Errore inserimento risultato' }, { status: 500 });
    }

    // Trigger RPC per aggiornare dashboard
    await supabase.rpc('updateEvidenceDelta', { assessment_id: assessmentId });

    return NextResponse.json({ ok: true, score });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Errore server' }, { status: 500 });
  }
} 