import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy, ChatMessage } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Info, HelpCircle, Mic, Square, X, Brain, AlertCircle, Calendar } from 'lucide-react';
import { EnhancedAICompanionMCP, CopingSuggestion, EnhancedChatMessage } from '../../services/enhancedAICompanionMCP';
import AudioRecorder from '../../components/audio/AudioRecorder';

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

  const handleVoiceMessage = async (audioBlob: Blob) => {
    // Placeholder for voice message handling
    const voiceMessage: ChatMessage = {
      id: Date.now().toString(),
      content: "🎤 Voice message received. (Voice processing coming soon!)",
      sender: 'user',
      timestamp: new Date()
    };
    addChatMessage(voiceMessage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 animate-scale-in hover-lift">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Companion</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your personal AI therapist is here to listen, support, and guide you.
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Chat Header */}
          <div className="border-b border-gray-100 p-4 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Companion</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Online & Ready to Help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hover-scale"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="border-b border-gray-100 bg-blue-50 p-4 animate-fade-in-down">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Tips for Better Conversations:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Be open and honest about your feelings</li>
                    <li>• Ask for specific advice or coping strategies</li>
                    <li>• Share what's working or not working for you</li>
                    <li>• Remember: I'm here to support, not replace professional therapy</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 mobile-scroll">
            <AnimatePresence>
              {chatHistory.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    {message.sender === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 hover-scale">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`chat-bubble ${
                        message.sender === 'user'
                          ? 'chat-bubble-user'
                          : message.sender === 'assistant'
                          ? 'chat-bubble-assistant'
                          : 'chat-bubble-system'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </motion.div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 hover-scale">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 bg-white/50">
            <div className="flex items-end space-x-3">
              {/* Voice Recording Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isRecording ? "🎤 Listening..." : "Type your message here..."}
                  disabled={isRecording}
                  className="input w-full pr-12 focus:scale-105 transition-transform duration-200"
                />
                {inputValue && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    type="button"
                    onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover-scale"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputValue.trim() || isRecording}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { emoji: '😊', text: 'Improve mood', message: 'How can I improve my mood today?' },
            { emoji: '😰', text: 'Manage anxiety', message: 'I\'m feeling anxious. Can you help me?' },
            { emoji: '😴', text: 'Sleep better', message: 'I\'m having trouble sleeping. Any advice?' },
            { emoji: '🎯', text: 'Set goals', message: 'Help me set some wellness goals' }
          ].map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (index * 0.1) }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputValue(item.message)}
              className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white/80 transition-all duration-200 text-center"
            >
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs text-gray-600 font-medium">{item.text}</div>
            </motion.button>
          ))}
        </motion.div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50/80 backdrop-blur-sm rounded-xl p-4"
          >
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              AI Suggestions for You
            </h4>
            <div className="grid gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 rounded-lg p-3 hover:bg-white/90 transition-colors cursor-pointer hover-lift"
                  onClick={() => setInputValue(`Tell me more about: ${suggestion.title}`)}
                >
                  <h5 className="font-medium text-blue-900">{suggestion.title}</h5>
                  <p className="text-sm text-blue-700">{suggestion.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Proactive Support Panel */}
        {showProactivePanel && proactiveMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="modal-overlay"
            onClick={() => setShowProactivePanel(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              className="modal-content max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">💙 Just Checking In</h3>
                  <p className="text-gray-600">{proactiveMessage}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowProactivePanel(false);
                      setInputValue("Hi! I'd like to talk about how I'm feeling.");
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover-lift"
                  >
                    Let's Chat
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProactivePanel(false)}
                    className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 hover-lift"
                  >
                    Not Right Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Chat;