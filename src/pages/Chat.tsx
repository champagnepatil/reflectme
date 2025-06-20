import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Lightbulb, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useZentia } from '../contexts/ZentiaContext';
import { EmotionPrivacyManager } from '../utils/emotionPrivacy';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { chatHistory, addMessage, getRecommendedTools, isGeneratingResponse } = useZentia();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isGeneratingResponse]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isGeneratingResponse) return;
    
    addMessage({
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    });
    
    setInputValue('');
  };

  const handleQuickResponse = (message: string) => {
    if (isGeneratingResponse) return;
    
    addMessage({
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recommendedTools = getRecommendedTools().slice(0, 2);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="flex items-center">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mr-4 shadow-soft">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">AI Companion</h2>
            <p className="text-neutral-600">Your supportive therapeutic assistant - available 24/7</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
        {chatHistory.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[85%]">
              <div
                className={`chat-bubble ${
                  message.sender === 'user'
                    ? 'chat-bubble-user'
                    : message.sender === 'system'
                    ? 'chat-bubble-system'
                    : 'chat-bubble-assistant'
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                
                {/* Show metadata if present */}
                {message.metadata && (
                  <div className="mt-4 pt-4 border-t border-primary-200 space-y-2">
                    {message.metadata.emotionalContext && (() => {
                      const isTherapist = EmotionPrivacyManager.isTherapist(user?.role);
                      const displayEmotions = isTherapist 
                        ? message.metadata.emotionalContext 
                        : EmotionPrivacyManager.filterEmotionsForPatient(message.metadata.emotionalContext);
                      
                      if (!displayEmotions) return null;
                      
                      return (
                        <div className="flex items-center text-primary-700">
                          <Heart className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {isTherapist ? 'Detected: ' : ''}
                            {isTherapist ? displayEmotions : EmotionPrivacyManager.getEmotionInsight(message.metadata.emotionalContext)}
                          </span>
                        </div>
                      );
                    })()}
                    {message.metadata.copingToolSuggested && (
                      <div className="flex items-center text-primary-700">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Suggested: {message.metadata.copingToolSuggested}</span>
                      </div>
                    )}
                    {message.metadata.therapistNotesUsed && message.metadata.therapistNotesUsed.length > 0 && (
                      <div className="flex items-center text-primary-700">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span className="text-sm">Referenced: {message.metadata.therapistNotesUsed.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <span className={`text-xs mt-2 text-neutral-500 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {/* AI Typing Indicator */}
        <AnimatePresence>
          {isGeneratingResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-assistant">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  <span className="text-sm text-neutral-600">Zentia is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Quick Actions with Examples */}
      {chatHistory.length <= 1 && !isGeneratingResponse && (
        <div className="px-6 py-6 bg-white border-t border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary-500" />
            How are you feeling today? Choose what resonates:
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-2">💭 Overthinking & Worry</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickResponse("I keep replaying that conversation over and over")}
                  className="text-left w-full p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all text-sm"
                >
                  "I keep replaying that conversation over and over"
                  <p className="text-xs text-gray-600 mt-1">→ Learn thought-stopping techniques and reframing</p>
                </button>
                <button
                  onClick={() => handleQuickResponse("Everything feels off today and I can't shake it")}
                  className="text-left w-full p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all text-sm"
                >
                  "Everything feels off today and I can't shake it"
                  <p className="text-xs text-gray-600 mt-1">→ Explore grounding exercises and mood tracking</p>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Challenges & Growth</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickResponse("I have this presentation tomorrow and I'm dreading it")}
                  className="text-left w-full p-3 bg-white hover:bg-green-50 border border-green-200 rounded-xl transition-all text-sm"
                >
                  "I have this presentation tomorrow and I'm dreading it"
                  <p className="text-xs text-gray-600 mt-1">→ Practice confidence building and anxiety management</p>
                </button>
                <button
                  onClick={() => handleQuickResponse("I don't know why I always mess these things up")}
                  className="text-left w-full p-3 bg-white hover:bg-green-50 border border-green-200 rounded-xl transition-all text-sm"
                >
                  "I don't know why I always mess these things up"
                  <p className="text-xs text-gray-600 mt-1">→ Work on self-compassion and positive self-talk</p>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-2">✨ Positive Check-ins</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickResponse("I'm feeling pretty good today and want to talk about my progress")}
                  className="text-left w-full p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl transition-all text-sm"
                >
                  "I'm feeling pretty good today and want to talk about my progress"
                  <p className="text-xs text-gray-600 mt-1">→ Celebrate wins and build on positive momentum</p>
                </button>
                <button
                  onClick={() => handleQuickResponse("I want to practice some coping strategies")}
                  className="text-left w-full p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl transition-all text-sm"
                >
                  "I want to practice some coping strategies"
                  <p className="text-xs text-gray-600 mt-1">→ Choose from personalized tools and exercises</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Tools */}
      {recommendedTools.length > 0 && chatHistory.length > 1 && !isGeneratingResponse && (
        <div className="px-6 py-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-primary-200">
          <h3 className="text-lg font-semibold text-primary-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recommended for you:
          </h3>
          <div className="flex space-x-4 overflow-x-auto">
            {recommendedTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleQuickResponse(`Can you guide me through ${tool.title}?`)}
                className="flex-shrink-0 p-4 bg-white rounded-2xl border border-primary-200 hover:border-primary-300 hover:shadow-soft transition-all"
              >
                <p className="font-semibold text-neutral-800">{tool.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{tool.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-neutral-200 px-6 py-6">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="How are you feeling today?"
            className="flex-grow input input-soft"
            disabled={isGeneratingResponse}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGeneratingResponse}
            className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
          >
            {isGeneratingResponse ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
        
        {/* API Status */}
        <div className="mt-3 text-center">
          <p className="text-xs text-neutral-500">
            {import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here' 
              ? '🤖 Powered by Google Gemini AI' 
              : '⚠️ Using fallback responses - Add Gemini API key for full AI capabilities'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;