import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, FileText, BarChart2, Loader2, CheckCircle, AlertCircle, Save, Trash2 } from 'lucide-react';
import Sentiment from 'sentiment';

interface VoiceJournalData {
  journal: string;
  mood: number;
}

interface SpeechJournalMoodProps {
  onDataUpdate?: (data: VoiceJournalData) => void;
  className?: string;
}

export const SpeechJournalMood: React.FC<SpeechJournalMoodProps> = ({ 
  onDataUpdate,
  className = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [moodScore, setMoodScore] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sentiment = new Sentiment();

  // Check for Web Speech API support
  const isWebSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (!isWebSpeechSupported) {
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, [isWebSpeechSupported]);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodEmoji = (mood: number): string => {
    switch (mood) {
      case 1: return '😔';
      case 2: return '🙁';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '❓';
    }
  };

  const getMoodLabel = (mood: number): string => {
    switch (mood) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Neutral';
      case 4: return 'Good';
      case 5: return 'Very Good';
      default: return 'Unknown';
    }
  };

  const mapSentimentToMood = (sentimentScore: number): number => {
    // Sentiment library returns a comparative score typically between -1 and 1
    // Map this to a 1-5 mood scale
    if (sentimentScore <= -0.6) return 1; // Very negative
    if (sentimentScore <= -0.2) return 2; // Negative
    if (sentimentScore <= 0.2) return 3;  // Neutral
    if (sentimentScore <= 0.6) return 4;  // Positive
    return 5; // Very positive
  };

  const analyzeText = (text: string) => {
    if (!text.trim()) {
      setMoodScore(3); // Default to neutral
      return;
    }

    try {
      const result = sentiment.analyze(text);
      const mood = mapSentimentToMood(result.comparative);
      setMoodScore(mood);
      
      console.log('Sentiment analysis:', {
        text: text.substring(0, 50) + '...',
        score: result.score,
        comparative: result.comparative,
        mappedMood: mood
      });
    } catch (err) {
      console.error('Error analyzing sentiment:', err);
      setMoodScore(3); // Default to neutral on error
    }
  };

  const startRecording = async () => {
    if (!isWebSpeechSupported) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      setJournalText('');
      setMoodScore(0);

      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsRecording(true);
        startTimer();
        
        // Auto-stop after 60 seconds
        timeoutRef.current = setTimeout(() => {
          stopRecording();
        }, 60000);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the journal text with both final and interim results
        setJournalText((finalTranscript + interimTranscript).trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        stopTimer();
      };

      recognition.onend = () => {
        setIsRecording(false);
        stopTimer();
        
        if (finalTranscript.trim()) {
          setIsProcessing(true);
          
          // Analyze sentiment and set mood
          analyzeText(finalTranscript.trim());
          
          // Update journal text with final transcript
          setJournalText(finalTranscript.trim());
          
          // Notify parent component
          const result = {
            journal: finalTranscript.trim(),
            mood: mapSentimentToMood(sentiment.analyze(finalTranscript.trim()).comparative)
          };
          
          onDataUpdate?.(result);
          setSuccess(true);
          
          // Clear success state after 3 seconds
          setTimeout(() => setSuccess(false), 3000);
          
          setIsProcessing(false);
        } else {
          setError('No speech was detected. Please try again.');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err) {
      setError('Failed to start speech recognition. Please check your microphone permissions.');
      console.error('Speech recognition error:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();
  };

  const clearRecording = () => {
    setJournalText('');
    setMoodScore(0);
    setRecordingTime(0);
    setError(null);
    setSuccess(false);
  };

  const saveToJournal = () => {
    if (journalText && moodScore > 0) {
      onDataUpdate?.({ journal: journalText, mood: moodScore });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  if (!isWebSpeechSupported) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden ${className}`}>
        <div className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-error-700 mb-2">Speech Recognition Not Supported</h2>
          <p className="text-error-600">
            Your browser doesn't support Web Speech API. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Voice Journal</h2>
            <p className="text-primary-100 text-sm">Record your thoughts with local speech recognition</p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recording Interface */}
      <div className="p-6">
        {/* Voice Recording Button */}
        <div className="flex flex-col items-center mb-6">
          <motion.button
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : isProcessing
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
            } text-white`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </motion.button>
          
          <div className="mt-3 text-center">
            {isRecording && (
              <div className="text-red-600 font-medium">
                Recording: {formatTime(recordingTime)} / 1:00
              </div>
            )}
            {isProcessing && (
              <div className="text-primary-600 font-medium">
                Analyzing speech locally...
              </div>
            )}
            {!isRecording && !isProcessing && (
              <div className="text-neutral-600">
                Tap to start 60-second voice recording
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">Speech processed successfully with local analysis!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Text Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Journal Entry
          </label>
          <textarea
            value={journalText}
            onChange={(e) => {
              setJournalText(e.target.value);
              analyzeText(e.target.value);
            }}
            placeholder="Your journal entry will appear here as you speak..."
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            rows={4}
          />
        </div>

        {/* Mood Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            AI-Detected Mood Score
          </label>
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getMoodEmoji(moodScore)}</span>
              <div>
                <div className="font-medium text-neutral-900">
                  {moodScore > 0 ? `${moodScore}/5` : 'Not detected'}
                </div>
                <div className="text-sm text-neutral-600">
                  {moodScore > 0 ? getMoodLabel(moodScore) : 'Speak to detect mood'}
                </div>
              </div>
            </div>
            
            {/* Mood Bar */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-8 rounded transition-all ${
                    level <= moodScore 
                      ? level <= 2 ? 'bg-red-400' : level === 3 ? 'bg-yellow-400' : 'bg-green-400'
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(journalText || moodScore > 0) && (
          <div className="flex justify-between">
            <button
              onClick={clearRecording}
              className="flex items-center px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </button>
            <button
              onClick={saveToJournal}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Journal
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Record your thoughts and feelings using your browser's speech recognition</li>
            <li>• Speech is processed locally in your browser - no data sent to external servers</li>
            <li>• AI analyzes sentiment locally and maps it to a mood score (1-5 scale)</li>
            <li>• Edit the text if needed, then save to your journal</li>
            <li>• Works best in Chrome, Edge, or Safari browsers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};