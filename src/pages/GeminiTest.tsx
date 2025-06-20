import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, XCircle, Loader2, Bot } from 'lucide-react';
import { GeminiAIService } from '../services/geminiAIService';

const GeminiTest: React.FC = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isTestingChat, setIsTestingChat] = useState(false);
  const [apiStatus, setApiStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [testMessage, setTestMessage] = useState("Mi sento molto ansioso oggi");
  const [chatError, setChatError] = useState<string>('');

  const testAPIConnection = async () => {
    setIsTestingAPI(true);
    setApiStatus('pending');
    
    try {
      // Test basic API connection
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Test di connessione: rispondi solo 'Connessione riuscita'" }]
          }]
        })
      });
      
      if (response.ok) {
        setApiStatus('success');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Errore test API:', error);
      setApiStatus('error');
    } finally {
      setIsTestingAPI(false);
    }
  };

  const testChatResponse = async () => {
    setIsTestingChat(true);
    setChatResponse('');
    setChatError('');
    
    try {
      const response = await GeminiAIService.generaRispostaChat(testMessage);
      setChatResponse(response.contenuto);
    } catch (error) {
      console.error('Errore test chat:', error);
      setChatError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsTestingChat(false);
    }
  };

  const getAPIKeyStatus = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { status: 'error', message: 'API Key non configurata' };
    }
    
    if (apiKey === 'AIzaSyYourGeminiApiKeyHere') {
      return { status: 'error', message: 'API Key è ancora il placeholder' };
    }
    
    if (!apiKey.startsWith('AIza')) {
      return { status: 'error', message: 'API Key non valida (deve iniziare con AIza)' };
    }
    
    return { status: 'success', message: `API Key configurata (${apiKey.length} caratteri)` };
  };

  const apiKeyStatus = getAPIKeyStatus();

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Test Integrazione Gemini AI
          </h1>
          <p className="text-xl text-neutral-600">
            Verifica che l'integrazione con Google Gemini funzioni correttamente
          </p>
        </motion.div>

        {/* API Key Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-soft mb-8"
        >
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center">
            {apiKeyStatus.status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 mr-3" />
            )}
            Stato API Key
          </h2>
          
          <div className={`p-4 rounded-xl ${
            apiKeyStatus.status === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-medium ${
              apiKeyStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {apiKeyStatus.message}
            </p>
          </div>

          {apiKeyStatus.status === 'error' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Come configurare l'API Key:</h3>
              <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                <li>Vai su <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>Accedi con il tuo account Google</li>
                <li>Clicca "Create API Key"</li>
                <li>Copia la chiave generata</li>
                <li>Crea un file <code className="bg-blue-100 px-1 rounded">.env</code> nella root del progetto</li>
                <li>Aggiungi: <code className="bg-blue-100 px-1 rounded">VITE_GEMINI_API_KEY=la_tua_chiave_qui</code></li>
                <li>Riavvia il server di sviluppo</li>
              </ol>
            </div>
          )}
        </motion.div>

        {/* API Connection Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-soft mb-8"
        >
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
            Test Connessione API
          </h2>
          
          <button
            onClick={testAPIConnection}
            disabled={isTestingAPI || apiKeyStatus.status === 'error'}
            className="btn btn-primary mb-6 flex items-center"
          >
            {isTestingAPI ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {isTestingAPI ? 'Testing...' : 'Testa Connessione'}
          </button>

          {apiStatus !== 'pending' && (
            <div className={`p-4 rounded-xl ${
              apiStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {apiStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${
                  apiStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {apiStatus === 'success' 
                    ? 'Connessione riuscita! Gemini AI è disponibile.' 
                    : 'Errore di connessione. Controlla la tua API key.'
                  }
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Chat Response Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-soft"
        >
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6">
            Test Risposta Chat
          </h2>
          
          <div className="mb-6">
            <label htmlFor="testMessage" className="block text-sm font-medium text-neutral-700 mb-2">
              Messaggio di test:
            </label>
            <input
              id="testMessage"
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="input input-soft w-full"
              placeholder="Scrivi un messaggio per testare l'AI..."
            />
          </div>

          <button
            onClick={testChatResponse}
            disabled={isTestingChat || apiKeyStatus.status === 'error' || !testMessage.trim()}
            className="btn btn-primary mb-6 flex items-center"
          >
            {isTestingChat ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Bot className="w-5 h-5 mr-2" />
            )}
            {isTestingChat ? 'Generando risposta...' : 'Testa Risposta AI'}
          </button>

          {chatResponse && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl mb-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Risposta AI generata con successo:
              </h3>
              <div className="text-green-700 bg-white p-4 rounded-lg border border-green-200">
                {chatResponse}
              </div>
            </div>
          )}

          {chatError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="font-medium text-red-800">Errore:</span>
              </div>
              <p className="text-red-700 mt-2">{chatError}</p>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-neutral-600 mb-4">
            Una volta che tutti i test passano, puoi provare la chat completa:
          </p>
          <a
            href="/chat"
            className="btn btn-secondary"
          >
            Vai alla Chat →
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default GeminiTest; 