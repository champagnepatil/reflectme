import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { EnhancedAICompanion, EnhancedChatMessage, CopingSuggestion } from '../../services/enhancedAICompanion';
import { Send, Heart, Brain, Lightbulb, Clock } from 'lucide-react';

interface EnhancedChatInterfaceProps {
  className?: string;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CopingSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with proactive check-in
  useEffect(() => {
    initializeProactiveCheckin();
  }, []);

  const initializeProactiveCheckin = async () => {
    try {
      const { message, suggestions: checkinSuggestions } = await EnhancedAICompanion.generateProactiveCheckin(user?.id);
      setMessages([message]);
      setSuggestions(checkinSuggestions);
      setShowSuggestions(checkinSuggestions.length > 0);
    } catch (error) {
      console.error('Error initializing proactive check-in:', error);
      // Fallback welcome message
      const welcomeMessage: EnhancedChatMessage = {
        id: 'welcome',
        sender: 'assistant',
        content: "Hello! I'm your AI companion, here to support you between therapy sessions. How are you feeling today?",
        timestamp: new Date().toISOString(),
        metadata: {
          responseType: 'general',
          confidence: 1.0
        }
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: EnhancedChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
      metadata: {
        responseType: 'general',
        confidence: 1.0
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Determine the type of AI response needed
      const response = await generateAIResponse(inputValue);
      setMessages(prev => [...prev, response.message]);
      
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback response
      const fallbackMessage: EnhancedChatMessage = {
        id: `fallback_${Date.now()}`,
        sender: 'assistant',
        content: "I'm here to listen and support you. Could you tell me more about what you're experiencing?",
        timestamp: new Date().toISOString(),
        metadata: {
          responseType: 'general',
          confidence: 0.5
        }
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<{
    message: EnhancedChatMessage;
    suggestions?: CopingSuggestion[];
  }> => {
    const lowerInput = userInput.toLowerCase();

    // Check if user is reporting mood
    const moodMatch = lowerInput.match(/(?:mood|feeling|feel)\s+(?:like\s+)?(\d+|low|down|bad|good|great|awful)/);
    if (moodMatch) {
      const moodValue = determineMoodValue(moodMatch[1]);
      return await EnhancedAICompanion.handleMoodTrigger(moodValue, userInput, user?.id);
    }

    // Check if this looks like a journal entry (longer, reflective content)
    if (userInput.length > 100 && (lowerInput.includes('today') || lowerInput.includes('feeling') || lowerInput.includes('happened'))) {
      return await EnhancedAICompanion.analyzeJournalEntry(userInput, user?.id);
    }

    // Default to therapy history integration
    return await EnhancedAICompanion.integrateTherapyHistory(userInput, user?.id);
  };

  const determineMoodValue = (moodText: string): number => {
    const numericMatch = moodText.match(/\d+/);
    if (numericMatch) {
      return Math.min(Math.max(parseInt(numericMatch[0]), 1), 10);
    }

    // Convert text to numeric
    switch (moodText.toLowerCase()) {
      case 'awful':
      case 'terrible':
        return 1;
      case 'bad':
      case 'down':
      case 'low':
        return 3;
      case 'okay':
      case 'fine':
        return 5;
      case 'good':
        return 7;
      case 'great':
      case 'excellent':
        return 9;
      default:
        return 5;
    }
  };

  const getResponseTypeIcon = (responseType: string) => {
    switch (responseType) {
      case 'mood-triggered':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'journal-informed':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'therapy-history':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'proactive-checkin':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-soft border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Enhanced AI Companion</h2>
            <p className="text-sm text-gray-600">Personalized support based on your mood, journal, and therapy history</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              } rounded-2xl px-4 py-3 shadow-sm`}>
                <div className="flex items-start space-x-2">
                  {message.sender === 'assistant' && message.metadata && (
                    <div className="mt-1">
                      {getResponseTypeIcon(message.metadata.responseType)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.metadata && message.metadata.confidence && (
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                        }`}>
                          {Math.round(message.metadata.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 p-4 bg-gray-50"
          >
            <h3 className="text-sm font-medium text-gray-800 mb-3">Personalized Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    const suggestionMessage: EnhancedChatMessage = {
                      id: `suggestion_${Date.now()}`,
                      sender: 'assistant',
                      content: `Great choice! Let's try "${suggestion.title}". ${suggestion.reasoning}\n\nHere's how to do it:\n${suggestion.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nThis should take about ${suggestion.duration}.`,
                      timestamp: new Date().toISOString(),
                      metadata: {
                        responseType: 'general',
                        confidence: 0.9,
                        copingToolSuggested: suggestion.id
                      }
                    };
                    setMessages(prev => [...prev, suggestionMessage]);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">{suggestion.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                      <span className="text-xs text-gray-500">Duration: {suggestion.duration}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              Hide suggestions
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share your thoughts, feelings, or ask for support..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInputValue("I'm feeling anxious about work today")}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors"
          >
            Feeling anxious
          </button>
          <button
            onClick={() => setInputValue("My mood today is about a 4/10")}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors"
          >
            Rate my mood
          </button>
          <button
            onClick={() => setInputValue("I want to practice the breathing exercise we discussed")}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors"
          >
            Practice techniques
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface; 