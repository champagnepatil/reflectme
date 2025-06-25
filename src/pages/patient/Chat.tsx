import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy, ChatMessage } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Info, HelpCircle, Mic, Square, X, Brain, AlertCircle, Calendar } from 'lucide-react';
import { EnhancedAICompanionMCP, CopingSuggestion, EnhancedChatMessage } from '../../services/enhancedAICompanionMCP';

const Chat: React.FC = () => {
  const { chatHistory, addChatMessage } = useTherapy();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Enhanced AI features
  const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
  const [showProactivePanel, setShowProactivePanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<CopingSuggestion[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // STEP 4: Proactive Check-ins
  useEffect(() => {
    const checkForProactiveSupport = async () => {
      if (!user?.id) return;
      
      try {
        // Simulate checking patterns (in real implementation, this would query mood history)
        const shouldCheckIn = Math.random() > 0.7; // 30% chance for demo
        
        if (shouldCheckIn && !proactiveMessage) {
          const checkInMessages = [
            "Hi! I noticed it's been a few days since we last talked. How are you feeling today?",
            "Just wanted to check in - I see you have a therapy session coming up. Would you like to prepare or discuss anything?",
            "I've noticed some patterns in your recent mood entries. Would you like to explore some coping strategies together?",
            "Hey there! How has your week been going? I'm here if you need support or just want to chat."
          ];
          
          const randomMessage = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
          setProactiveMessage(randomMessage);
          setShowProactivePanel(true);
        }
      } catch (error) {
        console.error('Error checking for proactive support:', error);
      }
    };

    // Check for proactive support after a delay (simulate real-world timing)
    const timer = setTimeout(checkForProactiveSupport, 3000);
    return () => clearTimeout(timer);
  }, [user?.id, proactiveMessage]);

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setInputValue(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err) {
      console.error('Speech recognition error:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    addChatMessage({
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    });
    
    const userMessage = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    try {
      // STEP 3: Therapy History Integration & Context-Aware Responses
      const userId = user?.id || 'demo-user';
      
      // Analyze message for mood and themes
      const isLowMoodMessage = /\b(sad|depressed|down|awful|terrible|anxious|worried|stressed)\b/i.test(userMessage);
      const moodScore = isLowMoodMessage ? 2 : 4; // Simple mood detection
      
      // Get AI response with therapy context
      let aiResponse: EnhancedChatMessage;
      let suggestions: CopingSuggestion[] = [];
      
      if (isLowMoodMessage) {
        // Handle as mood trigger
        const moodResponse = await EnhancedAICompanionMCP.handleMoodTrigger(
          moodScore,
          userMessage,
          userId
        );
        aiResponse = moodResponse.message;
        suggestions = moodResponse.suggestions;
      } else {
        // Analyze as journal-like entry for themes
        const analysis = await EnhancedAICompanionMCP.analyzeJournalEntry(
          userMessage,
          userId,
          moodScore
        );
        aiResponse = analysis.message;
        suggestions = analysis.suggestions;
      }
      
      // Add AI response to chat
      addChatMessage({
        sender: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
      });
      
      // Store suggestions for quick access
      setAiSuggestions(suggestions);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      addChatMessage({
        sender: 'assistant',
        content: "Thank you for sharing that with me. I'm here to listen and support you. How can I help you feel better today?",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {chatHistory.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-primary-100 text-primary-900'
                  : 'bg-neutral-100 text-neutral-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-neutral-500 mt-1 block">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200">
        <div className="flex items-end space-x-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-resize textarea
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-grow p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px] max-h-32 overflow-y-auto leading-tight"
            style={{
              height: 'auto',
              minHeight: '44px',
              maxHeight: '128px'
            }}
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Proactive Check-in Panel */}
      <AnimatePresence>
        {showProactivePanel && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-4 text-white z-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">AI Companion Check-in</h4>
                  <p className="text-sm opacity-90">{proactiveMessage}</p>
                  
                  {aiSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs opacity-75 mb-2">Quick coping tools available:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.slice(0, 2).map((suggestion) => (
                          <button
                            key={suggestion.id}
                            className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded"
                            onClick={() => {
                              addChatMessage({
                                sender: 'assistant',
                                content: `Here's a quick technique: ${suggestion.title}\n\n${suggestion.description}\n\nSteps:\n${suggestion.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
                                timestamp: new Date().toISOString(),
                              });
                              setShowProactivePanel(false);
                            }}
                          >
                            {suggestion.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      onClick={() => {
                        addChatMessage({
                          sender: 'assistant',
                          content: proactiveMessage || '',
                          timestamp: new Date().toISOString(),
                        });
                        setShowProactivePanel(false);
                      }}
                      className="bg-white bg-opacity-20 text-xs px-3 py-1 rounded hover:bg-opacity-30 transition-colors"
                    >
                      Let's chat
                    </button>
                    <button
                      onClick={() => setShowProactivePanel(false)}
                      className="text-xs opacity-75 hover:opacity-100"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProactivePanel(false)}
                className="text-white opacity-75 hover:opacity-100 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">About Your Companion</h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-neutral-600">
                  Your AI companion is here to support you between therapy sessions. You can:
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                    <span className="text-neutral-700">Share your thoughts and feelings</span>
                  </li>
                  <li className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                    <span className="text-neutral-700">Get support during difficult moments</span>
                  </li>
                  <li className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                    <span className="text-neutral-700">Practice coping strategies</span>
                  </li>
                  <li className="flex items-start">
                    <HelpCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                    <span className="text-neutral-700">Track your progress over time</span>
                  </li>
                </ul>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Remember: This is a supportive tool, not a replacement for professional help. 
                    If you're in crisis, please contact your therapist or emergency services.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;