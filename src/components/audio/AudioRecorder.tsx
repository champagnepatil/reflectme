import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Pause, Play, Trash2, Send, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { generateSOAPNote } from '../../utils/noteGenerators';

interface AudioRecorderProps {
  onTranscriptionComplete?: (transcription: string, soapNote: ReturnType<typeof generateSOAPNote>) => void;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscriptionComplete,
  className = '' 
}) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useAudioRecorder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setError('');
      setTranscription('');
      await startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleProcessRecording = async () => {
    if (!audioBlob) return;

    try {
      setIsProcessing(true);
      setError('');

      // Note: This component now requires external transcription service
      // as ElevenLabs integration has been removed
      const mockTranscription = "This is a mock transcription. Audio recording functionality requires external transcription service integration.";
      setTranscription(mockTranscription);

      // Generate SOAP note from mock transcription
      const soapNote = generateSOAPNote(mockTranscription);

      // Notify parent component
      onTranscriptionComplete?.(mockTranscription, soapNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRecordingProgress = () => {
    return Math.min((recordingTime / 60) * 100, 100);
  };

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Session Recap Recorder</h3>
        <div className="text-sm text-neutral-500">
          {formatTime(recordingTime)} / 1:00
        </div>
      </div>

      {/* Recording Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
        <motion.div
          className={`h-2 rounded-full transition-colors ${
            recordingTime >= 60 ? 'bg-error-500' : 'bg-primary-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${getRecordingProgress()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isRecording && !audioBlob && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartRecording}
            className="w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Mic className="w-6 h-6" />
          </motion.button>
        )}

        {isRecording && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-12 h-12 bg-warning-600 hover:bg-warning-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-16 h-16 bg-error-600 hover:bg-error-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Square className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearRecording}
              className="w-12 h-12 bg-neutral-600 hover:bg-neutral-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProcessRecording}
              disabled={isProcessing}
              className="w-16 h-16 bg-success-600 hover:bg-success-700 disabled:bg-neutral-400 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </motion.button>
          </>
        )}
      </div>

      {/* Recording Status */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-4"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-neutral-700">
                {isPaused ? 'Recording Paused' : 'Recording...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error-50 border border-error-200 rounded-lg p-3 mb-4"
          >
            <p className="text-error-700 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcription Display */}
      <AnimatePresence>
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-neutral-50 border border-neutral-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900">Transcription</h4>
            </div>
            <p className="text-neutral-700 text-sm whitespace-pre-wrap">{transcription}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-sm text-neutral-500 mt-4">
        <p>Click the microphone to start recording your 60-second session recap.</p>
        <p className="text-warning-600 mt-2">Note: External transcription service required for audio processing.</p>
      </div>
    </div>
  );
};