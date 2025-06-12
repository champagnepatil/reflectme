import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { SplineSceneBasic } from '../components/ui/SplineSceneBasic';
import { MessageSquare, FileText, BarChart2, AlarmClock, Bell, Shield } from 'lucide-react';

const Demo: React.FC = () => {
  const [activeView, setActiveView] = useState<'patient' | 'therapist'>('patient');
  const [messages, setMessages] = useState<{id: number; text: string; sender: 'bot' | 'user'}[]>([
    { id: 1, text: "Hi there! I'm your MindLink companion. How are you feeling today?", sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Simulate bot response after a delay
    setTimeout(() => {
      let botResponse = '';
      
      if (inputValue.toLowerCase().includes('anxious') || inputValue.toLowerCase().includes('anxiety')) {
        botResponse = "I notice you're feeling anxious. Your therapist has noted that box breathing helps you in these situations. Would you like to try that technique now?";
      } else if (inputValue.toLowerCase().includes('sad') || inputValue.toLowerCase().includes('depressed')) {
        botResponse = "I'm sorry to hear you're feeling down. Your therapist recommended behavioral activation exercises for these moments. Would you like me to suggest a small activity that might help lift your mood?";
      } else if (inputValue.toLowerCase().includes('yes') || inputValue.toLowerCase().includes('please')) {
        botResponse = "Great! Let's try this box breathing exercise:\n\n1. Find a comfortable position\n2. Breathe in slowly through your nose for 4 counts\n3. Hold your breath for 4 counts\n4. Exhale slowly through your mouth for 4 counts\n5. Hold your breath for 4 counts\n\nRepeat this cycle 4 times. I'll check in with you afterward.";
      } else {
        botResponse = "Thank you for sharing that with me. Based on your therapy goals, would it be helpful to practice one of your coping strategies right now?";
      }
      
      const newBotMessage = { id: messages.length + 2, text: botResponse, sender: 'bot' as const };
      setMessages(prev => [...prev, newBotMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex flex-col items-center px-4 py-12 bg-neutral-50">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">MindLink Demo</h1>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Experience how MindLink bridges the gap between therapy sessions with personalized support.
            </p>
            
            <div className="flex justify-center mt-8">
              <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveView('patient')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    activeView === 'patient' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Patient View
                </button>
                <button
                  onClick={() => setActiveView('therapist')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    activeView === 'therapist' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Therapist View
                </button>
              </div>
            </div>
          </motion.div>

          {/* 3D Interactive Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <SplineSceneBasic />
          </motion.div>

          {activeView === 'patient' ? (
            <div className="card overflow-hidden">
              <div className="bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h2 className="font-medium text-neutral-900">MindLink Companion</h2>
                    <p className="text-xs text-neutral-500">Always here to support you</p>
                  </div>
                </div>
                <div className="flex">
                  <button className="p-2 rounded-full hover:bg-neutral-100">
                    <Bell className="w-5 h-5 text-neutral-500" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-neutral-100">
                    <Shield className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 h-96 overflow-y-auto flex flex-col">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`chat-bubble ${
                        message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                      }`}
                    >
                      {message.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i !== message.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="bg-white border-t border-neutral-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type how you're feeling..."
                    className="flex-grow px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
                  >
                    Send
                  </button>
                </form>
                <p className="text-xs text-neutral-500 mt-2">
                  Try typing: "I'm feeling anxious about my presentation tomorrow"
                </p>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="bg-white border-b border-neutral-200 p-4">
                <h2 className="font-medium text-neutral-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Therapist Dashboard
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-neutral-900">Active Clients</h3>
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">24</p>
                    <p className="text-sm text-neutral-500">+3 this month</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-neutral-900">Avg. Mood Score</h3>
                      <BarChart2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-success-600">3.8/5</p>
                    <p className="text-sm text-success-600">+0.4 improvement</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-neutral-900">Time Saved</h3>
                      <AlarmClock className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">6.5 hrs</p>
                    <p className="text-sm text-neutral-500">This week</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm mb-6">
                  <h3 className="font-medium text-neutral-900 mb-4">Client Interactions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <img 
                          src="https://api.dicebear.com/7.x/personas/svg?seed=Sarah" 
                          alt="Sarah J." 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">Sarah Johnson</p>
                          <p className="text-xs text-neutral-500">Last active: 10 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-error-600 mr-2">Anxiety Detected</span>
                        <span className="inline-block w-3 h-3 bg-error-500 rounded-full"></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <img 
                          src="https://api.dicebear.com/7.x/personas/svg?seed=Michael" 
                          alt="Michael C." 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">Michael Chen</p>
                          <p className="text-xs text-neutral-500">Last active: 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-success-600 mr-2">Mood Improved</span>
                        <span className="inline-block w-3 h-3 bg-success-500 rounded-full"></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <img 
                          src="https://api.dicebear.com/7.x/personas/svg?seed=Jessica" 
                          alt="Jessica R." 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">Jessica Rodriguez</p>
                          <p className="text-xs text-neutral-500">Last active: Yesterday</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-neutral-600 mr-2">Stable</span>
                        <span className="inline-block w-3 h-3 bg-neutral-500 rounded-full"></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                  <h3 className="font-medium text-neutral-900 mb-3">Ready for Review</h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    These auto-generated progress notes are ready for your review and signature.
                  </p>
                  
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sarah Johnson - Session Notes</span>
                        <span className="text-xs text-neutral-500">June 14, 2023</span>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Michael Chen - Session Notes</span>
                        <span className="text-xs text-neutral-500">June 12, 2023</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-neutral-700 mb-4">Ready to experience MindLink for yourself?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary">
                Sign Up Now
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Component not found in JSX
const Users: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
};

export default Demo;