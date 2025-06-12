import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy, ChatMessage } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SpeechJournalMood } from '../../components/SpeechJournalMood';
import { Send, ChevronRight, Info, HelpCircle } from 'lucide-react';

const Chat: React.FC = () => {
  const { chatHistory, addChatMessage, addJournalEntry } = useTherapy();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    addChatMessage({
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    });
    
    setInputValue('');
    setIsTyping(true);
    
    // Simulate typing delay for bot
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAccess = (message: string) => {
    setInputValue(message);
    // Focus the input field
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleVoiceJournalUpdate = (data: { journal: string; mood: number }) => {
    if (data.journal && data.mood > 0) {
      addJournalEntry({
        date: new Date().toISOString().split('T')[0],
        mood: data.mood,
        content: data.journal,
        tags: ['voice-recorded', 'chat-session'],
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Your Digital Companion</h1>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <Info className="w-5 h-5 text-neutral-500" />
        </button>
      </div>

      {/* Voice Journal Interface */}
      {user?.role === 'patient' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <SpeechJournalMood 
            onDataUpdate={handleVoiceJournalUpdate}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="card p-4 bg-primary-50 border border-primary-200">
              <div className="flex items-start">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-primary-900 mb-2">About Your Digital Companion</h3>
                  <p className="text-sm text-primary-800 mb-2">
                    This AI companion is trained on your therapy notes and personal coping strategies. It's designed to provide support between sessions by:
                  </p>
                  <ul className="text-sm text-primary-800 list-disc pl-5 space-y-1 mb-2">
                    <li>Recommending coping techniques your therapist has approved</li>
                    <li>Guiding you through exercises you've learned in therapy</li>
                    <li>Helping you practice skills and strategies</li>
                    <li>Detecting potential crisis situations and providing appropriate resources</li>
                  </ul>
                  <p className="text-sm text-primary-800">
                    <strong>Important:</strong> Your companion is not a replacement for your therapist. In crisis situations, please call emergency services or use the crisis resources provided.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow p-6 overflow-y-auto">
          {chatHistory.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-[80%]">
                <div 
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary-100 text-primary-900' 
                      : message.sender === 'system'
                        ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                        : 'bg-white text-neutral-900 border border-neutral-200 shadow-sm'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <span className={`text-xs mt-1 text-neutral-500 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-neutral-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-3 rounded-r-md hover:bg-primary-700 transition-colors"
              disabled={!inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAccess("I'm feeling anxious right now")}
            className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <span>I'm feeling anxious</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button
            onClick={() => handleQuickAccess("Can you guide me through a breathing exercise?")}
            className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <span>Guide me through breathing</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button
            onClick={() => handleQuickAccess("I need help challenging my negative thoughts")}
            className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <span>Challenge negative thoughts</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;