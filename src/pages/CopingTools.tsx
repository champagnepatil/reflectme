import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Star, Play, Filter, Search } from 'lucide-react';
import { useReflectMe } from '../contexts/ReflectMeContext';

const CopingTools: React.FC = () => {
  const { copingTools, getRecommendedTools } = useReflectMe();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'mindfulness', label: 'Mindfulness' },
    { id: 'grounding', label: 'Grounding' },
    { id: 'cognitive', label: 'Cognitive' },
    { id: 'physical', label: 'Physical' },
  ];

  const filteredTools = copingTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recommendedTools = getRecommendedTools();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing': return '🫁';
      case 'mindfulness': return '🧘';
      case 'grounding': return '🌱';
      case 'cognitive': return '🧠';
      case 'physical': return '💪';
      default: return '✨';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing': return 'bg-blue-100 text-blue-800';
      case 'mindfulness': return 'bg-purple-100 text-purple-800';
      case 'grounding': return 'bg-green-100 text-green-800';
      case 'cognitive': return 'bg-orange-100 text-orange-800';
      case 'physical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Coping Tools</h1>
          <p className="text-slate-600">Personalized techniques approved by your therapist</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coping tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Tools */}
        {selectedCategory === 'all' && recommendedTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCategoryIcon(tool.category)}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-slate-500 mr-1" />
                          <span className="text-sm text-slate-600">{tool.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-slate-700">Recommended</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 mb-4">{tool.description}</p>
                  
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No tools found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getCategoryIcon(tool.category)}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 text-slate-500 mr-1" />
                          <span className="text-sm text-slate-600">{tool.duration}</span>
                        </div>
                      </div>
                    </div>
                    {tool.isRecommended && (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  <p className="text-slate-700 mb-4">{tool.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                    {tool.therapistApproved && (
                      <span className="text-xs text-green-600 font-medium">✓ Therapist Approved</span>
                    )}
                  </div>
                  
                  <button className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Try Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopingTools;