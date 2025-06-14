import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import { useReflectMe } from '../contexts/ReflectMeContext';

const Chat: React.FC = () => {
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
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="flex items-center">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mr-4 shadow-soft">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">ReflectMe Assistant</h2>
            <p className="text-neutral-600">Your personalized therapy companion</p>
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
                
                {/* Show coping tool suggestion if present */}
                {message.metadata?.copingToolSuggested && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex items-center text-primary-700">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Suggested: {message.metadata.copingToolSuggested}</span>
                    </div>
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
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-assistant">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {chatHistory.length <= 1 && (
        <div className="px-6 py-6 bg-white border-t border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary-500" />
            Quick check-ins:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickResponse("I'm feeling anxious about work today")}
              className="text-left p-4 bg-neutral-50 hover:bg-primary-50 hover:border-primary-200 border border-neutral-200 rounded-2xl transition-all text-sm font-medium"
            >
              I'm feeling anxious about work
            </button>
            <button
              onClick={() => handleQuickResponse("I had a good day and want to share")}
              className="text-left p-4 bg-neutral-50 hover:bg-primary-50 hover:border-primary-200 border border-neutral-200 rounded-2xl transition-all text-sm font-medium"
            >
              I had a good day today
            </button>
            <button
              onClick={() => handleQuickResponse("I'm feeling overwhelmed and need support")}
              className="text-left p-4 bg-neutral-50 hover:bg-primary-50 hover:border-primary-200 border border-neutral-200 rounded-2xl transition-all text-sm font-medium"
            >
              I'm feeling overwhelmed
            </button>
            <button
              onClick={() => handleQuickResponse("Can you help me practice a coping technique?")}
              className="text-left p-4 bg-neutral-50 hover:bg-primary-50 hover:border-primary-200 border border-neutral-200 rounded-2xl transition-all text-sm font-medium"
            >
              Help me practice coping techniques
            </button>
          </div>
        </div>
      )}

      {/* Recommended Tools */}
      {recommendedTools.length > 0 && chatHistory.length > 1 && (
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
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;