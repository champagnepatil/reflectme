import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Star, Play, Filter, Search, Sparkles } from 'lucide-react';
import { useReflectMe } from '../contexts/ReflectMeContext';

const CopingTools: React.FC = () => {
  const { copingTools, getRecommendedTools } = useReflectMe();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Tools', emoji: '✨' },
    { id: 'breathing', label: 'Breathing', emoji: '🫁' },
    { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
    { id: 'grounding', label: 'Grounding', emoji: '🌱' },
    { id: 'cognitive', label: 'Cognitive', emoji: '🧠' },
    { id: 'physical', label: 'Physical', emoji: '💪' },
  ];

  const filteredTools = copingTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recommendedTools = getRecommendedTools();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'mindfulness': return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'grounding': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'cognitive': return 'bg-accent-100 text-accent-800 border-accent-200';
      case 'physical': return 'bg-peach-100 text-peach-800 border-peach-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-neutral-800 mb-3">Coping Tools</h1>
          <p className="text-xl text-neutral-600">Personalized techniques approved by your therapist</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-10 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search coping tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 input input-soft text-lg"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <Filter className="w-6 h-6 text-neutral-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-300'
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Tools */}
        {selectedCategory === 'all' && recommendedTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center">
              <Star className="w-6 h-6 text-accent-300 mr-3" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover gradient-accent p-8 border-2 border-accent-200"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">🌟</span>
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-800">{tool.title}</h3>
                        <div className="flex items-center mt-2">
                          <Clock className="w-4 h-4 text-neutral-600 mr-2" />
                          <span className="text-neutral-600">{tool.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center bg-accent-200 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-accent-700 mr-1" />
                      <span className="text-sm font-medium text-accent-800">Recommended</span>
                    </div>
                  </div>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">{tool.description}</p>
                  
                  <button className="w-full btn btn-primary">
                    <Play className="w-5 h-5 mr-2" />
                    Start Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 text-primary-500 mr-3" />
            {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          
          {filteredTools.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-neutral-800 mb-3">No tools found</h3>
              <p className="text-neutral-600 text-lg">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">
                        {tool.category === 'breathing' && '🫁'}
                        {tool.category === 'mindfulness' && '🧘'}
                        {tool.category === 'grounding' && '🌱'}
                        {tool.category === 'cognitive' && '🧠'}
                        {tool.category === 'physical' && '💪'}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-800">{tool.title}</h3>
                        <div className="flex items-center mt-2">
                          <Clock className="w-4 h-4 text-neutral-600 mr-2" />
                          <span className="text-neutral-600">{tool.duration}</span>
                        </div>
                      </div>
                    </div>
                    {tool.isRecommended && (
                      <Star className="w-6 h-6 text-accent-300" />
                    )}
                  </div>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">{tool.description}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                    {tool.therapistApproved && (
                      <span className="text-sm text-success-600 font-medium">✓ Therapist Approved</span>
                    )}
                  </div>
                  
                  <button className="w-full btn btn-soft hover:btn-primary transition-all">
                    <Play className="w-5 h-5 mr-2" />
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