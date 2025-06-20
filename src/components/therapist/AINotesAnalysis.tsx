import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  BookOpen,
  Loader2,
  Lightbulb,
  Heart,
  CheckCircle
} from 'lucide-react';
import { GeminiAIService, NotesAnalysis } from '../../services/geminiAIService';

interface AINotesAnalysisProps {
  clientId: string;
  clientName: string;
  noteIds?: string[];
  className?: string;
}

export const AINotesAnalysis: React.FC<AINotesAnalysisProps> = ({
  clientId,
  clientName,
  noteIds,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<NotesAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🤖 Generazione analisi AI per cliente:', clientId);
      
      const result = await GeminiAIService.analizzaNoteTerapeutiche(clientId, noteIds);
      setAnalysis(result);
    } catch (err) {
      console.error('❌ Errore analisi AI:', err);
      setError('Impossibile generare l\'analisi AI. Riprovare più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const getBenessereColor = (punteggio: number) => {
    if (punteggio >= 75) return 'text-success-600 bg-success-100';
    if (punteggio >= 50) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  const getBenessereLabel = (punteggio: number) => {
    if (punteggio >= 75) return 'Buono';
    if (punteggio >= 50) return 'Moderato';
    return 'Necessita attenzione';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con bottone di generazione */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Analisi AI - {clientName}
              </h3>
              <p className="text-neutral-600">
                Insights intelligenti sulle note terapeutiche
              </p>
            </div>
          </div>
          
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="btn btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Analizzando...' : 'Genera Analisi'}</span>
          </button>
        </div>
      </div>

      {/* Errore */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-error-50 border-error-200"
        >
          <div className="flex items-center text-error-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Risultati dell'analisi */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Riassunto principale */}
          <div className="card p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-primary-600 mr-2" />
              <h4 className="text-lg font-semibold text-neutral-900">Riassunto Generale</h4>
            </div>
            <p className="text-neutral-700 leading-relaxed">{analysis.riassunto}</p>
          </div>

          {/* Metriche principali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Punteggio benessere */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="card p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className={`text-3xl font-bold mb-2 ${getBenessereColor(analysis.punteggioBenessere).split(' ')[0]}`}>
                {analysis.punteggioBenessere}%
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBenessereColor(analysis.punteggioBenessere)}`}>
                {getBenessereLabel(analysis.punteggioBenessere)}
              </div>
              <p className="text-neutral-600 text-sm mt-2">Indice di Benessere</p>
            </motion.div>

            {/* Temi principali */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-primary-600 mr-2" />
                <h5 className="font-semibold text-neutral-900">Temi Principali</h5>
              </div>
              <div className="space-y-2">
                {analysis.temiPrincipali.slice(0, 4).map((tema, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                    <span className="text-sm text-neutral-700">{tema}</span>
                  </div>
                ))}
                {analysis.temiPrincipali.length === 0 && (
                  <p className="text-neutral-500 text-sm">Nessun tema specifico identificato</p>
                )}
              </div>
            </motion.div>

            {/* Progressi */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-success-600 mr-2" />
                <h5 className="font-semibold text-neutral-900">Progressi</h5>
              </div>
              <div className="space-y-2">
                {analysis.progressi.slice(0, 3).map((progresso, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                    <span className="text-sm text-neutral-700">{progresso}</span>
                  </div>
                ))}
                {analysis.progressi.length === 0 && (
                  <p className="text-neutral-500 text-sm">Progressi in fase di valutazione</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Raccomandazioni */}
          {analysis.raccomandazioni.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-5 h-5 text-warning-600 mr-2" />
                <h4 className="text-lg font-semibold text-neutral-900">Raccomandazioni</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.raccomandazioni.map((raccomandazione, index) => (
                  <div key={index} className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                    <p className="text-warning-800 text-sm">{raccomandazione}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer informativo */}
          <div className="card p-4 bg-neutral-50 border-neutral-200">
            <div className="flex items-center justify-center text-neutral-600 text-sm">
              <Brain className="w-4 h-4 mr-2" />
              <span>
                Analisi generata da AI • Le raccomandazioni sono suggerimenti e non sostituiscono il giudizio clinico
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stato iniziale */}
      {!analysis && !loading && !error && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">Analisi AI Pronta</h3>
          <p className="text-neutral-600 mb-6">
            Clicca su "Genera Analisi" per ottenere insights intelligenti sulle note terapeutiche
          </p>
        </div>
      )}
    </div>
  );
}; 