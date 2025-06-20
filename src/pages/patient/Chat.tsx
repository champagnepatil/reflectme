import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy, ChatMessage } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Info, HelpCircle, Mic, Square, X } from 'lucide-react';

const Chat: React.FC = () => {
  const { chatHistory, addChatMessage } = useTherapy();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

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