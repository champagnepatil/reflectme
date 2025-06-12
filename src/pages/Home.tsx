import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HeroSection from '../components/ui/dynamic-animated-hero-section-with-gradient';
import { CTASection } from '../components/ui/cta-with-glow';
import { Shield, Brain, Users, Clock, BarChart2, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Dynamic Animated Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How MindTwin Works</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our platform creates a secure bridge between therapy sessions, providing personalized support based on your unique therapeutic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Twin Technology</h3>
              <p className="text-slate-600">
                Creates a personalized profile that grows with each therapy session, ensuring advice is tailored to your unique needs.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-slate-600">
                Access personalized coping strategies and exercises anytime, bridging the gap between weekly therapy sessions.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="card p-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy & Security</h3>
              <p className="text-slate-600">
                Built with HIPAA compliance and end-to-end encryption, ensuring your mental health data stays private and secure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Therapists Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">For Mental Health Professionals</h2>
              <p className="text-lg text-slate-600 mb-6">
                MindTwin extends your therapeutic impact beyond the session room, while reducing administrative burden.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-1 mr-3">
                    <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Enhanced Client Outcomes</h3>
                    <p className="text-slate-600">Support clients between sessions with personalized coping strategies and exercises.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-1 mr-3">
                    <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Reduced Administrative Burden</h3>
                    <p className="text-slate-600">Automated note drafting and documentation saves you time for what matters most.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center mt-1 mr-3">
                    <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Data-Driven Insights</h3>
                    <p className="text-slate-600">Gain valuable insights into client progress between sessions.</p>
                  </div>
                </div>
              </div>
              
              <Link to="/register" className="btn btn-primary mt-8 inline-block">
                Join as a Therapist
              </Link>
            </div>
            
            <div className="md:w-1/2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <img 
                  src="https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Therapist using MindTwin" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Therapist Dashboard</h3>
                    <div className="flex items-center">
                      <BarChart2 className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-600 font-medium">Analytics</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-700">Active Clients</p>
                      <p className="font-medium">24</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-700">Mood Improvement</p>
                      <p className="font-medium text-success-600">+18%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-700">Weekly Sessions</p>
                      <p className="font-medium">32</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-700">Time Saved</p>
                      <p className="font-medium">6.5 hrs/week</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Professionals & Patients</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              See how MindTwin is transforming mental healthcare for both providers and patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-center mb-6">
                <img 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=Dr.Williams" 
                  alt="Dr. Williams" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">Dr. Rebecca Williams</h3>
                  <p className="text-sm text-slate-500">Clinical Psychologist</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "MindTwin has revolutionized my practice. My clients have better outcomes with the continuous support, and I save hours each week on documentation. The digital twin technology ensures the guidance is truly personalized to each client's therapy journey."
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-center mb-6">
                <img 
                  src="https://api.dicebear.com/7.x/personas/svg?seed=Jamie" 
                  alt="Jamie Chen" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">Jamie Chen</h3>
                  <p className="text-sm text-slate-500">MindTwin User</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4">
                "Having MindTwin between my therapy sessions has been life-changing. During a panic attack at work, the app guided me through the exact breathing technique my therapist had taught me. It feels like having my therapist's wisdom available 24/7."
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Dual Buttons */}
      <CTASection
        title="Ready to Transform Mental Healthcare?"
        actions={{
          primary: {
            text: "Join as Patient",
            href: "/login?role=patient",
            variant: "glow"
          },
          secondary: {
            text: "Join as Therapist", 
            href: "/login?role=therapist",
            variant: "outline"
          }
        }}
        className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white"
      />

      <Footer />
    </div>
  );
};

export default Home;