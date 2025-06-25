import React, { useState } from 'react';
import { EnhancedAICompanionMCP, CopingSuggestion, EnhancedChatMessage } from '../services/enhancedAICompanionMCP';
import { Brain, Heart, MessageSquare, Database, Activity } from 'lucide-react';

const EnhancedAIMCPDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'mood' | 'journal'>('mood');
  const [moodScore, setMoodScore] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [response, setResponse] = useState<EnhancedChatMessage | null>(null);
  const [suggestions, setSuggestions] = useState<CopingSuggestion[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodTriggerDemo = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedAICompanionMCP.handleMoodTrigger(
        moodScore,
        trigger || undefined,
        'demo-user-123'
      );
      setResponse(result.message);
      setSuggestions(result.suggestions);
      setInsights([]);
    } catch (error) {
      console.error('Error in mood trigger demo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJournalAnalysisDemo = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedAICompanionMCP.analyzeJournalEntry(
        journalContent,
        'demo-user-123',
        moodScore
      );
      setResponse(result.message);
      setSuggestions(result.suggestions);
      setInsights(result.insights);
    } catch (error) {
      console.error('Error in journal analysis demo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SuggestionCard: React.FC<{ suggestion: CopingSuggestion }> = ({ suggestion }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-blue-900">{suggestion.title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {suggestion.priority} priority
        </span>
      </div>
      <p className="text-blue-700 text-sm mb-3">{suggestion.description}</p>
      <div className="mb-3">
        <h5 className="font-medium text-blue-900 mb-1">Steps:</h5>
        <ol className="list-decimal list-inside text-sm text-blue-700">
          {suggestion.steps.map((step, index) => (
            <li key={index} className="mb-1">{step}</li>
          ))}
        </ol>
      </div>
      <div className="flex justify-between text-xs text-blue-600">
        <span>Duration: {suggestion.duration}</span>
        <span>Type: {suggestion.type}</span>
      </div>
      <p className="text-xs text-blue-600 mt-2 italic">{suggestion.reasoning}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Enhanced AI Companion with MCP
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Demonstrating AI-powered mental health support using MCP database calls
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>MCP Integration:</strong> This demo uses Supabase MCP calls for real-time database operations,
              logging mood entries, journal content, and AI suggestions for analytics.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'mood', label: 'Mood-Triggered Support', icon: Heart, desc: 'AI responds to mood scores with MCP logging' },
            { id: 'journal', label: 'Journal-Informed Responses', icon: MessageSquare, desc: 'AI analyzes journal entries via MCP' }
          ].map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id as any)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                activeDemo === demo.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
              }`}
            >
              <demo.icon className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">{demo.label}</div>
                <div className="text-xs">{demo.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              {activeDemo === 'mood' ? 'Mood Input (with MCP)' : 'Journal Input (with MCP)'}
            </h2>

            {activeDemo === 'mood' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Score (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Low (1)</span>
                    <span className="font-semibold">{moodScore}</span>
                    <span>Excellent (10)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger (optional)
                  </label>
                  <input
                    type="text"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    placeholder="e.g., work stress, relationship issue..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>MCP Operations:</strong> Logging mood entry to database via MCP calls
                  </p>
                </div>

                <button
                  onClick={handleMoodTriggerDemo}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing with MCP...
                    </>
                  ) : (
                    'Get AI Support via MCP'
                  )}
                </button>
              </div>
            )}

            {activeDemo === 'journal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Journal Entry
                  </label>
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write about your thoughts, feelings, or experiences..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>MCP Operations:</strong> Storing journal entry and analyzing via MCP
                  </p>
                </div>

                <button
                  onClick={handleJournalAnalysisDemo}
                  disabled={isLoading || !journalContent.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing via MCP...
                    </>
                  ) : (
                    'Analyze via MCP'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              AI Response & MCP Data
            </h2>

            {response ? (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">AI Response</h3>
                  <p className="text-purple-800">{response.content}</p>
                </div>

                {insights.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-900 mb-2">AI Insights</h3>
                    <ul className="space-y-1">
                      {insights.map((insight, index) => (
                        <li key={index} className="text-indigo-800 text-sm">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Coping Suggestions</h3>
                    {suggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">MCP Status</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>✅ Data logged via MCP calls</div>
                    <div>✅ AI suggestions stored</div>
                    <div>✅ Ready for therapist review</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Complete the input to see AI response with MCP integration</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIMCPDemo; 