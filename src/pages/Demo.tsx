import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { MessageCircle, Heart, FileText, Send, Play, Star, TrendingUp } from 'lucide-react';

const Demo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'chat' | 'tools' | 'insights'>('chat');
  const [messages, setMessages] = useState<{id: number; text: string; sender: 'bot' | 'user'}[]>([
    { id: 1, text: "Hi! I'm ReflectMe, your digital therapy companion. I understand you've been working on anxiety management with your therapist. How are you feeling today?", sender: 'bot' },
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
        botResponse = "I can hear that you're feeling anxious. Based on your recent therapy sessions, I know that breathing exercises have been helpful for you. Would you like me to guide you through the 4-7-8 breathing technique that Dr. Smith recommended?";
      } else if (inputValue.toLowerCase().includes('overwhelmed') || inputValue.toLowerCase().includes('stressed')) {
        botResponse = "It sounds like you're feeling overwhelmed. Your therapist mentioned that grounding techniques work well for you. Let's try the 5-4-3-2-1 technique: Can you name 5 things you can see right now?";
      } else if (inputValue.toLowerCase().includes('better') || inputValue.toLowerCase().includes('good')) {
        botResponse = "That's wonderful to hear! I'm glad you're feeling better. What do you think contributed to this positive change? Your therapist will be interested to hear about this progress.";
      } else {
        botResponse = "Thank you for sharing that with me. I'm here to support you using the strategies you've learned in therapy. Is there a particular coping technique you'd like to practice, or would you like to talk through what you're experiencing?";
      }
      
      const newBotMessage = { id: messages.length + 2, text: botResponse, sender: 'bot' as const };
      setMessages(prev => [...prev, newBotMessage]);
    }, 1000);
  };

  const copingTools = [
    {
      title: '4-7-8 Breathing',
      description: 'Calm your nervous system with this proven breathing technique',
      duration: '3 minutes',
      recommended: true,
    },
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to anchor yourself in the present moment',
      duration: '5 minutes',
      recommended: true,
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Release physical tension through systematic muscle relaxation',
      duration: '15 minutes',
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex flex-col items-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">ReflectMe Demo</h1>
            </div>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Experience how ReflectMe provides personalized support between therapy sessions using AI and your therapy history.
            </p>
            
            <div className="flex justify-center mt-8">
              <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                <button
                  onClick={() => setActiveDemo('chat')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center ${
                    activeDemo === 'chat' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Support
                </button>
                <button
                  onClick={() => setActiveDemo('tools')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center ${
                    activeDemo === 'tools' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Coping Tools
                </button>
                <button
                  onClick={() => setActiveDemo('insights')}
                  className={`px-4 py-2 rounded-md transition-all flex items-center ${
                    activeDemo === 'insights' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Session Insights
                </button>
              </div>
            </div>
          </motion.div>

          {/* Demo Content */}
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {activeDemo === 'chat' && (
              <div className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <div className="flex items-center">
                    <Heart className="w-6 h-6 mr-3" />
                    <div>
                      <h3 className="font-semibold">ReflectMe Assistant</h3>
                      <p className="text-sm text-blue-100">Personalized support based on your therapy history</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="border-t border-slate-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Try typing: 'I'm feeling anxious about work'"
                      className="flex-grow px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeDemo === 'tools' && (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Therapist-Approved Coping Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {copingTools.map((tool, index) => (
                    <motion.div
                      key={tool.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                        tool.recommended 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-slate-900">{tool.title}</h4>
                        {tool.recommended && (
                          <div className="flex items-center text-blue-600">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">Recommended</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{tool.duration}</span>
                        <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                          <Play className="w-4 h-4 mr-2" />
                          Try Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeDemo === 'insights' && (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Session Recaps & Progress</h3>
                
                {/* Progress Chart Placeholder */}
                <div className="bg-slate-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Mood Progress</h4>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg flex items-end justify-center">
                    <span className="text-slate-600 mb-4">📈 Steady improvement over the last month</span>
                  </div>
                </div>

                {/* Recent Session */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Latest Session: Anxiety Management</h4>
                    <span className="text-sm text-slate-500">January 15, 2024</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Key Takeaways:</h5>
                      <ul className="space-y-1 text-slate-700">
                        <li>• Identified work presentations as a major anxiety trigger</li>
                        <li>• Learned about the connection between thoughts and physical sensations</li>
                        <li>• Practiced breathing techniques during the session</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Action Items:</h5>
                      <ul className="space-y-1 text-slate-700">
                        <li>• Practice 4-7-8 breathing twice daily</li>
                        <li>• Use grounding techniques when feeling overwhelmed</li>
                        <li>• Complete thought record worksheet</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          <div className="mt-8 text-center">
            <p className="text-slate-700 mb-4">Ready to start your personalized mental health journey?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                Get Started Free
              </Link>
              <Link to="/login" className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Demo;