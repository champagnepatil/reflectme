import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Heart, MessageCircle, Brain, Shield, Clock, Users } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mr-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold">ReflectMe</h1>
            </div>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your personalized digital therapy companion, providing empathetic support between sessions using AI and your therapy history.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link 
                to="/demo"
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How ReflectMe Supports Your Journey</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Bridging the gap between therapy sessions with personalized, AI-powered support that understands your unique therapeutic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Chat Support</h3>
              <p className="text-slate-600">
                Chat with an AI companion that knows your therapy history and provides contextual support when you need it most.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Therapist-Approved Tools</h3>
              <p className="text-slate-600">
                Access a library of coping techniques and exercises specifically recommended by your therapist for your unique needs.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Session Insights</h3>
              <p className="text-slate-600">
                Review key takeaways from your therapy sessions and track your progress over time with visual insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Always There When You Need Support</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">24/7 Availability</h3>
                    <p className="text-slate-600">Get support whenever you need it, not just during therapy hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Contextual Understanding</h3>
                    <p className="text-slate-600">AI that remembers your therapy sessions and provides relevant, personalized guidance.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Privacy & Security</h3>
                    <p className="text-slate-600">Your conversations and data are encrypted and completely confidential.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 flex-grow">
                    <p className="text-sm text-blue-900">I'm feeling anxious about my presentation tomorrow...</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center mr-3 mt-1">
                    <MessageCircle className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3 flex-grow">
                    <p className="text-sm text-slate-800">I understand that presentations trigger your anxiety. Based on your recent sessions, the 4-7-8 breathing technique has been helpful. Would you like to practice it together?</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-slate-500">Personalized support based on your therapy history</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Mental Health Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands who are already experiencing the benefits of personalized digital therapy support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Your Journey
            </Link>
            <Link 
              to="/demo"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;