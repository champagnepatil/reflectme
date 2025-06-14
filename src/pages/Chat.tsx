import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Lightbulb, TrendingUp } from 'lucide-react';
import { useReflectMe } from '../contexts/ReflectMeContext';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { chatHistory, addMessage, getRecommendedTools } = useReflectMe();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    addMessage({
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    });
    
    setInputValue('');
    setIsTyping(true);
    
    // Hide typing indicator after AI response
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickResponse = (message: string) => {
    addMessage({
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const recommendedTools = getRecommendedTools().slice(0, 2);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">ReflectMe Assistant</h2>
            <p className="text-sm text-slate-600">Your personalized therapy companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
        {chatHistory.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'system'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Show coping tool suggestion if present */}
                {message.metadata?.copingToolSuggested && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center text-blue-600">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Suggested: {message.metadata.copingToolSuggested}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <span className={`text-xs mt-1 text-slate-500 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {chatHistory.length <= 1 && (
        <div className="px-6 py-4 bg-white border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Quick check-ins:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickResponse("I'm feeling anxious about work today")}
              className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              I'm feeling anxious about work
            </button>
            <button
              onClick={() => handleQuickResponse("I had a good day and want to share")}
              className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              I had a good day today
            </button>
            <button
              onClick={() => handleQuickResponse("I'm feeling overwhelmed and need support")}
              className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              I'm feeling overwhelmed
            </button>
            <button
              onClick={() => handleQuickResponse("Can you help me practice a coping technique?")}
              className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Help me practice coping techniques
            </button>
          </div>
        </div>
      )}

      {/* Recommended Tools */}
      {recommendedTools.length > 0 && chatHistory.length > 1 && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Recommended for you:
          </h3>
          <div className="flex space-x-3 overflow-x-auto">
            {recommendedTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleQuickResponse(`Can you guide me through ${tool.title}?`)}
                className="flex-shrink-0 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <p className="text-sm font-medium text-slate-900">{tool.title}</p>
                <p className="text-xs text-slate-600 mt-1">{tool.duration}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="How are you feeling today?"
            className="flex-grow px-4 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;