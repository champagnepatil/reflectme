import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy, JournalEntry } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SpeechJournalMood } from '../../components/SpeechJournalMood';
import { 
  PenSquare, 
  Calendar, 
  Tag, 
  X, 
  PlusCircle, 
  Brain,
  Sparkles,
  Folder,
  Search,
  Filter,
  TrendingUp,
  Heart,
  Zap,
  Target,
  BookOpen,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { GeminiAIService } from '../../services/GeminiAIService';

interface JournalCluster {
  id: string;
  name: string;
  description: string;
  emotion: string;
  color: string;
  icon: string;
  entries: JournalEntry[];
  insights: string[];
  growthPatterns: string[];
  recommendedActions: string[];
}

interface AIInsights {
  emotionalPatterns: { emotion: string; frequency: number; trend: 'increasing' | 'decreasing' | 'stable' }[];
  topThemes: { theme: string; count: number; impact: 'positive' | 'negative' | 'neutral' }[];
  growthMoments: string[];
  suggestedFocus: string[];
  personalizedRecommendations: string[];
}

const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry } = useTherapy();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [mood, setMood] = useState(3);
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'clusters' | 'timeline' | 'insights'>('clusters');
  const [clusters, setClusters] = useState<JournalCluster[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (journalEntries.length > 0) {
      generateClusters();
      generateAIInsights();
    }
  }, [journalEntries]);

  const generateClusters = async () => {
    if (journalEntries.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Simple clustering based on tags and content analysis
      const emotionalClusters: { [key: string]: JournalEntry[] } = {};
      const thematicClusters: { [key: string]: JournalEntry[] } = {};
      
      journalEntries.forEach(entry => {
        // Cluster by mood
        const moodCategory = getMoodCategory(entry.mood);
        if (!emotionalClusters[moodCategory]) {
          emotionalClusters[moodCategory] = [];
        }
        emotionalClusters[moodCategory].push(entry);
        
        // Cluster by themes (using simple keyword matching)
        const themes = extractThemes(entry.content, entry.tags);
        themes.forEach(theme => {
          if (!thematicClusters[theme]) {
            thematicClusters[theme] = [];
          }
          thematicClusters[theme].push(entry);
        });
      });

      // Create cluster objects
      const newClusters: JournalCluster[] = [];
      
      // Emotional clusters
      Object.entries(emotionalClusters).forEach(([emotion, entries]) => {
        if (entries.length >= 2) {
          newClusters.push({
            id: `emotion-${emotion}`,
            name: `${emotion} Moments`,
            description: `Entries when you felt ${emotion.toLowerCase()}`,
            emotion,
            color: getEmotionColor(emotion),
            icon: getEmotionIcon(emotion),
            entries,
            insights: generateClusterInsights(entries),
            growthPatterns: identifyGrowthPatterns(entries),
            recommendedActions: generateRecommendations(entries, emotion)
          });
        }
      });

      // Thematic clusters
      Object.entries(thematicClusters).forEach(([theme, entries]) => {
        if (entries.length >= 2) {
          newClusters.push({
            id: `theme-${theme}`,
            name: `${theme} Journey`,
            description: `Your experiences with ${theme.toLowerCase()}`,
            emotion: 'mixed',
            color: getThemeColor(theme),
            icon: 'folder',
            entries,
            insights: generateClusterInsights(entries),
            growthPatterns: identifyGrowthPatterns(entries),
            recommendedActions: generateRecommendations(entries, theme)
          });
        }
      });

      setClusters(newClusters);
    } catch (error) {
      console.error('Error generating clusters:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAIInsights = async () => {
    if (journalEntries.length < 3) return;
    
    try {
      // Create insights using AI service
      const entriesText = journalEntries.map(entry => 
        `Date: ${entry.date}, Mood: ${entry.mood}/5, Content: ${entry.content}, Tags: ${entry.tags.join(', ')}`
      ).join('\n\n');

      // For now, generate insights locally (can be enhanced with Gemini AI)
      const emotionalPatterns = analyzeEmotionalPatterns();
      const topThemes = analyzeTopThemes();
      
      const insights: AIInsights = {
        emotionalPatterns,
        topThemes,
        growthMoments: identifyGrowthMoments(),
        suggestedFocus: generateSuggestedFocus(),
        personalizedRecommendations: generatePersonalizedRecommendations()
      };
      
      setAIInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  const analyzeEmotionalPatterns = () => {
    const emotions: { [key: string]: number[] } = {};
    
    journalEntries.forEach((entry, index) => {
      const emotion = getMoodCategory(entry.mood);
      if (!emotions[emotion]) emotions[emotion] = [];
      emotions[emotion].push(index);
    });

    return Object.entries(emotions).map(([emotion, indices]) => ({
      emotion,
      frequency: indices.length,
      trend: indices.length > journalEntries.length / 4 ? 'increasing' : 'stable' as const
    }));
  };

  const analyzeTopThemes = () => {
    const themes: { [key: string]: number } = {};
    
    journalEntries.forEach(entry => {
      const entryThemes = extractThemes(entry.content, entry.tags);
      entryThemes.forEach(theme => {
        themes[theme] = (themes[theme] || 0) + 1;
      });
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({
        theme,
        count,
        impact: 'neutral' as const
      }));
  };

  const identifyGrowthMoments = () => {
    return journalEntries
      .filter(entry => entry.mood >= 4 || entry.content.toLowerCase().includes('progress') || entry.content.toLowerCase().includes('better'))
      .slice(0, 3)
      .map(entry => `${format(new Date(entry.date), 'MMM d')}: ${entry.content.substring(0, 100)}...`);
  };

  const generateSuggestedFocus = () => {
    const recentMoods = journalEntries.slice(-5).map(e => e.mood);
    const avgMood = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    
    if (avgMood < 3) {
      return ['Self-care practices', 'Mood boosting activities', 'Support network'];
    } else if (avgMood > 3.5) {
      return ['Goal setting', 'New challenges', 'Sharing positivity'];
    } else {
      return ['Balance and consistency', 'Mindfulness', 'Routine building'];
    }
  };

  const generatePersonalizedRecommendations = () => {
    return [
      'Continue your regular journaling practice - it\'s helping you process emotions',
      'Consider exploring patterns in your high-mood entries to replicate positive experiences',
      'Your writing shows growth over time - celebrate these small victories'
    ];
  };

  const extractThemes = (content: string, tags: string[]) => {
    const themes = [...tags];
    const keywords = {
      'work': ['work', 'job', 'career', 'office', 'colleague'],
      'relationships': ['friend', 'family', 'partner', 'relationship', 'social'],
      'health': ['health', 'exercise', 'sleep', 'energy', 'tired'],
      'anxiety': ['anxious', 'worry', 'stress', 'nervous', 'fear'],
      'growth': ['learn', 'grow', 'progress', 'achieve', 'goal'],
      'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed', 'happy']
    };
    
    Object.entries(keywords).forEach(([theme, words]) => {
      if (words.some(word => content.toLowerCase().includes(word))) {
        themes.push(theme);
      }
    });
    
    return [...new Set(themes)];
  };

  const getMoodCategory = (mood: number) => {
    if (mood <= 2) return 'Challenging';
    if (mood === 3) return 'Neutral';
    return 'Positive';
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Positive': return 'from-green-400 to-blue-500';
      case 'Challenging': return 'from-red-400 to-pink-500';
      case 'Neutral': return 'from-gray-400 to-gray-600';
      default: return 'from-blue-400 to-purple-500';
    }
  };

  const getThemeColor = (theme: string) => {
    const colors = [
      'from-purple-400 to-pink-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-teal-500',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-purple-500'
    ];
    return colors[theme.length % colors.length];
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Positive': return 'heart';
      case 'Challenging': return 'target';
      case 'Neutral': return 'brain';
      case 'folder': return 'folder';
      default: return 'folder';
    }
  };

  const generateClusterInsights = (entries: JournalEntry[]) => {
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
    const timeSpan = entries.length > 1 ? 
      Math.ceil((new Date(entries[0].date).getTime() - new Date(entries[entries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    
    return [
      `Average mood: ${avgMood.toFixed(1)}/5`,
      `${entries.length} entries over ${timeSpan} days`,
      `Most recent: ${format(new Date(entries[0].date), 'MMM d, yyyy')}`
    ];
  };

  const identifyGrowthPatterns = (entries: JournalEntry[]) => {
    if (entries.length < 2) return [];
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstMood = sortedEntries[0].mood;
    const lastMood = sortedEntries[sortedEntries.length - 1].mood;
    
    if (lastMood > firstMood) {
      return ['Mood improvement over time', 'Increased self-awareness', 'Better coping strategies'];
    } else if (lastMood === firstMood) {
      return ['Consistent emotional state', 'Stable patterns', 'Regular processing'];
    } else {
      return ['Recent challenges', 'Need for additional support', 'Opportunity for growth'];
    }
  };

  const generateRecommendations = (entries: JournalEntry[], context: string) => {
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
    
    if (avgMood >= 4) {
      return [
        'Continue practices that support this positive state',
        'Consider what specific factors contribute to these good days',
        'Share your insights with others who might benefit'
      ];
    } else if (avgMood <= 2) {
      return [
        'Focus on self-care and gentle activities',
        'Consider reaching out for additional support',
        'Look for small moments of progress or relief'
      ];
    } else {
      return [
        'Maintain consistency in your journaling practice',
        'Explore what shifts your mood in either direction',
        'Set small, achievable goals for emotional well-being'
      ];
    }
  };

  const toggleClusterExpansion = (clusterId: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    addJournalEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      mood,
      content,
      tags,
    });
    
    // Reset form
    setContent('');
    setMood(3);
    setTags([]);
    setIsCreating(false);
  };
  
  const addTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const getMoodEmoji = (moodValue: number) => {
    switch (moodValue) {
      case 1: return '😔';
      case 2: return '🙁';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😊';
      default: return '😐';
    }
  };
  
  const getMoodLabel = (moodValue: number) => {
    switch (moodValue) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'Neutral';
      case 4: return 'Good';
      case 5: return 'Very Good';
      default: return 'Neutral';
    }
  };

  const handleVoiceJournalUpdate = (data: { journal: string; mood: number }) => {
    if (data.journal && data.mood > 0) {
      addJournalEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: data.mood,
        content: data.journal,
        tags: ['voice-recorded'],
      });
    }
  };

  const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
    switch (iconName) {
      case 'heart': return <Heart className={className} />;
      case 'target': return <Target className={className} />;
      case 'brain': return <Brain className={className} />;
      case 'folder': return <Folder className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cluster.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with AI branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
              Personal Memory Wallet
              <Sparkles className="w-5 h-5 ml-2 text-purple-500" />
            </h1>
            <p className="text-neutral-600">AI-powered journal clustering and insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
            disabled={isCreating}
          >
            <PenSquare className="w-4 h-4 mr-2" />
            New Entry
          </button>
          {journalEntries.length > 0 && (
            <button
              onClick={generateClusters}
              disabled={isAnalyzing}
              className="btn btn-outline"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Re-analyze
            </button>
          )}
        </div>
      </div>

      {/* Voice Journal Interface */}
      {user?.role === 'patient' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SpeechJournalMood 
            onDataUpdate={handleVoiceJournalUpdate}
            className="mb-6"
          />
        </motion.div>
      )}

      {/* View Mode Tabs */}
      {journalEntries.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'clusters', label: 'Memory Pockets', icon: Folder },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'insights', label: 'AI Insights', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  viewMode === id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
          
          {viewMode === 'clusters' && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clusters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      {isCreating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">New Journal Entry</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="label">How are you feeling today?</label>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Very Low</span>
                  <span className="text-sm text-neutral-500">Very Good</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-2xl">{getMoodEmoji(mood)}</span>
                  <p className="text-neutral-700 font-medium mt-1">{getMoodLabel(mood)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="journal-content" className="label">What's on your mind?</label>
              <textarea
                id="journal-content"
                className="textarea min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your thoughts, feelings, and experiences..."
                required
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="label">Tags</label>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  className="input rounded-r-none"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add tags (e.g., anxiety, work, self-care)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((t, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    <span className="text-sm">{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!content.trim()}
              >
                Save Entry
              </button>
            </div>
          </form>
        </motion.div>
      ) : journalEntries.length > 0 ? (
        <AnimatePresence mode="wait">
          {viewMode === 'clusters' && (
            <motion.div
              key="clusters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isAnalyzing && (
                <div className="card p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                  <p className="text-gray-600">Analyzing your journal entries and creating memory clusters...</p>
                </div>
              )}
              
              {filteredClusters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredClusters.map((cluster) => (
                    <motion.div
                      key={cluster.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${cluster.color}`}></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <IconComponent iconName={cluster.icon} className="w-6 h-6 text-gray-600 mr-3" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{cluster.name}</h3>
                              <p className="text-sm text-gray-600">{cluster.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleClusterExpansion(cluster.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedClusters.has(cluster.id) ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-purple-600">{cluster.entries.length}</span>
                          <span className="text-sm text-gray-500">entries</span>
                        </div>
                        
                        <div className="space-y-2">
                          {cluster.insights.map((insight, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                              {insight}
                            </div>
                          ))}
                        </div>
                        
                        {expandedClusters.has(cluster.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Growth Patterns
                              </h4>
                              <div className="space-y-1">
                                {cluster.growthPatterns.map((pattern, index) => (
                                  <div key={index} className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                    {pattern}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Recommendations
                              </h4>
                              <div className="space-y-1">
                                {cluster.recommendedActions.map((action, index) => (
                                  <div key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {action}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recent Entries</h4>
                              <div className="space-y-2">
                                {cluster.entries.slice(0, 3).map((entry) => (
                                  <div key={entry.id} className="text-sm p-2 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-gray-500 text-xs">{entry.date}</span>
                                      <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                                    </div>
                                    <p className="text-gray-700">
                                      {entry.content.length > 100 
                                        ? entry.content.substring(0, 100) + '...' 
                                        : entry.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No clusters found</h3>
                  <p className="text-gray-500">Write a few more entries to see AI-generated memory clusters.</p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {journalEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-neutral-500 mr-2" />
                      <span className="text-neutral-700">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center bg-neutral-100 px-3 py-1 rounded-full">
                      <span className="text-xl mr-2">{getMoodEmoji(entry.mood)}</span>
                      <span className="text-sm font-medium text-neutral-700">{getMoodLabel(entry.mood)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-neutral-800 whitespace-pre-line">
                      {entry.content}
                    </p>
                  </div>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <div key={index} className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full text-xs flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'insights' && aiInsights && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emotional Patterns */}
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Emotional Patterns
                  </h3>
                  <div className="space-y-3">
                    {aiInsights.emotionalPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{pattern.emotion}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">{pattern.frequency}x</span>
                          <div className={`w-2 h-2 rounded-full ${
                            pattern.trend === 'increasing' ? 'bg-green-500' :
                            pattern.trend === 'decreasing' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Themes */}
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-blue-500" />
                    Top Themes
                  </h3>
                  <div className="space-y-3">
                    {aiInsights.topThemes.map((theme, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{theme.theme}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">{theme.count}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            theme.impact === 'positive' ? 'bg-green-500' :
                            theme.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Growth Moments */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Growth Moments
                </h3>
                <div className="space-y-3">
                  {aiInsights.growthMoments.map((moment, index) => (
                    <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                      <p className="text-sm text-green-800">{moment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {aiInsights.personalizedRecommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="card p-12 text-center">
          <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Your Memory Wallet is Empty</h2>
          <p className="text-neutral-600 mb-6">
            Start journaling to create AI-powered memory clusters and discover patterns in your thoughts and emotions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-outline"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Write Entry
            </button>
            <p className="text-sm text-neutral-500 self-center">
              or use the voice journal above
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;