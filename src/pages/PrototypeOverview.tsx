import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Bot, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Target, 
  Zap, 
  Database,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  Star
} from 'lucide-react';

const PrototypeOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'genai' | 'phase4' | 'integration'>('genai');

  const genAIFeatures = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Chat AI Terapeutico",
      description: "Assistente AI avanzato per supporto 24/7 ai pazienti",
      link: "/chat",
      status: "attivo",
      highlights: ["Elaborazione linguaggio naturale", "Risposte contestuali", "Supporto multilingue"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Analisi Predittiva",
      description: "IA per prevedere episodi critici e suggerire interventi",
      link: "/therapist/analytics", 
      status: "attivo",
      highlights: ["Machine Learning", "Pattern Recognition", "Early Warning System"]
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Generazione Automatica Note",
      description: "Creazione intelligente di note cliniche da sessioni",
      link: "/therapist/notes",
      status: "attivo", 
      highlights: ["NLP avanzato", "Structured output", "HIPAA compliant"]
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Raccomandazioni Personalizzate",
      description: "Suggerimenti terapeutici basati su dati paziente",
      link: "/therapist/dashboard",
      status: "attivo",
      highlights: ["Personalizzazione avanzata", "Evidence-based", "Adaptive learning"]
    }
  ];

  const phase4Features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Visualizzazioni avanzate per monitoraggio progressi",
      link: "/phase4-test",
      status: "completo",
      highlights: ["Real-time charts", "Trend analysis", "Multi-metric tracking"]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Task Management AI",
      description: "Gestione intelligente compiti terapeutici",
      link: "/therapist/dashboard",
      status: "completo",
      highlights: ["Auto-scheduling", "Progress tracking", "Adaptive difficulty"]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Monitoring Avanzato",
      description: "Tracciamento continuo parametri salute mentale",
      link: "/data-seeder",
      status: "completo", 
      highlights: ["Mood tracking", "Sleep analysis", "Exercise metrics"]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Seeding System",
      description: "Generazione dati realistici per testing",
      link: "/data-seeder",
      status: "completo",
      highlights: ["Realistic data", "Bulk generation", "Demo-ready"]
    }
  ];

  const integrationPoints = [
    {
      title: "Database Integration",
      description: "Connessione completa con Supabase",
      status: "✅ Completo",
      details: ["RLS Policies", "Real-time updates", "Secure authentication"]
    },
    {
      title: "Gen AI Pipeline", 
      description: "Elaborazione intelligente dati terapeutici",
      status: "✅ Attivo",
      details: ["NLP processing", "Sentiment analysis", "Pattern detection"]
    },
    {
      title: "Monitoring System",
      description: "Tracciamento continuo parametri vitali",
      status: "✅ Funzionante",
      details: ["Real-time data", "Alert system", "Trend analysis"]
    },
    {
      title: "User Experience",
      description: "Interfaccia ottimizzata per terapisti e pazienti",
      status: "✅ Ottimizzato", 
      details: ["Responsive design", "Intuitive flows", "Accessibility"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 text-primary-600 mr-4" />
              <h1 className="text-4xl font-bold text-neutral-900">
                ReflectMe <span className="text-primary-600">Gen AI</span>
              </h1>
            </div>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Prototipo completo di piattaforma per salute mentale con intelligenza artificiale avanzata
              e monitoraggio in tempo reale
            </p>
            <div className="flex items-center justify-center mt-6 space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Phase 4 Completo
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                <Zap className="w-4 h-4 mr-2" />
                Gen AI Integrato
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'genai', label: 'Gen AI Features', icon: <Brain className="w-4 h-4" /> },
              { id: 'phase4', label: 'Phase 4 Components', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'integration', label: 'Sistema Integrato', icon: <Zap className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.icon}
                <span className="ml-2 font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gen AI Features */}
        {activeTab === 'genai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Funzionalità Intelligenza Artificiale
              </h2>
              <p className="text-lg text-neutral-600">
                Tecnologie AI avanzate per supporto terapeutico e analisi predittiva
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {genAIFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-success-100 text-success-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 mb-4">{feature.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-neutral-600">
                        <Star className="w-3 h-3 text-warning-500 mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Prova Funzionalità
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 4 Components */}
        {activeTab === 'phase4' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Componenti Phase 4
              </h2>
              <p className="text-lg text-neutral-600">
                Sistema completo di monitoraggio e analytics per la fase finale del prototipo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {phase4Features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600 mr-4">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-success-100 text-success-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 mb-4">{feature.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-neutral-600">
                        <Star className="w-3 h-3 text-warning-500 mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-secondary-600 hover:text-secondary-700 font-medium"
                  >
                    Accedi al Componente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Quick Access Phase 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Accesso Rapido Phase 4
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/phase4-test"
                  className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 hover:shadow-md transition-all"
                >
                  <BarChart3 className="w-6 h-6 text-secondary-600 mr-3" />
                  <div>
                    <div className="font-medium text-neutral-900">Test Dashboard</div>
                    <div className="text-sm text-neutral-500">Analytics completo</div>
                  </div>
                </Link>
                
                <Link
                  to="/data-seeder"
                  className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 hover:shadow-md transition-all"
                >
                  <Database className="w-6 h-6 text-secondary-600 mr-3" />
                  <div>
                    <div className="font-medium text-neutral-900">Data Seeder</div>
                    <div className="text-sm text-neutral-500">Genera dati demo</div>
                  </div>
                </Link>
                
                <Link
                  to="/therapist/dashboard"
                  className="flex items-center p-4 border border-neutral-200 rounded-lg hover:border-secondary-300 hover:shadow-md transition-all"
                >
                  <Users className="w-6 h-6 text-secondary-600 mr-3" />
                  <div>
                    <div className="font-medium text-neutral-900">Therapist Hub</div>
                    <div className="text-sm text-neutral-500">Dashboard completo</div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Integration Overview */}
        {activeTab === 'integration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Sistema Integrato
              </h2>
              <p className="text-lg text-neutral-600">
                Architettura completa che unisce Gen AI e Phase 4 in un ecosistema coeso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrationPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">{point.title}</h3>
                    <span className="text-sm font-medium text-success-600">{point.status}</span>
                  </div>
                  
                  <p className="text-neutral-600 mb-4">{point.description}</p>
                  
                  <div className="space-y-2">
                    {point.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm text-neutral-600">
                        <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* System Architecture */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                Architettura del Sistema
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Layer AI</h4>
                  <p className="text-sm text-neutral-600">
                    Elaborazione intelligente, NLP, machine learning per analisi predittiva
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Layer Analytics</h4>
                  <p className="text-sm text-neutral-600">
                    Visualizzazioni avanzate, monitoring real-time, trend analysis
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-warning-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Layer Data</h4>
                  <p className="text-sm text-neutral-600">
                    Supabase integration, RLS security, real-time sync
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-lg p-8 text-white text-center mt-12"
        >
          <h3 className="text-2xl font-bold mb-4">
            Prototipo ReflectMe Completo
          </h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Sistema integrato di salute mentale con AI avanzata, analytics in tempo reale 
            e monitoraggio continuo. Pronto per testing e demo complete.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/therapist/dashboard"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Dashboard Terapeuta
            </Link>
            <Link
              to="/chat"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Chat AI
            </Link>
            <Link
              to="/phase4-test"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Phase 4 Test
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrototypeOverview; 