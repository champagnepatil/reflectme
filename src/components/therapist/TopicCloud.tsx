import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, TrendingUp, Clock, Hash } from 'lucide-react';

interface TagData {
  tag: string;
  frequency: number;
  avg_score: number;
  last_seen: string;
  tag_category: string;
}

interface TopicCloudProps {
  clientId?: string;
  className?: string;
  timeRange?: 'week' | 'month' | 'all';
  maxTags?: number;
}

export const TopicCloud: React.FC<TopicCloudProps> = ({
  clientId,
  className = '',
  timeRange = 'week',
  maxTags = 20
}) => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchTopTags();
  }, [clientId, timeRange]);

  const fetchTopTags = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('chat_tags')
        .select('tag, tag_category, score, ts');

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const now = new Date();
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('ts', weekAgo.toISOString());
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('ts', monthAgo.toISOString());
      }

      const { data, error: fetchError } = await query.order('ts', { ascending: false });

      if (fetchError) throw fetchError;

      const tagMap = new Map<string, {
        count: number;
        scores: number[];
        category: string;
        lastSeen: string;
      }>();

      data?.forEach(row => {
        const key = row.tag;
        if (!tagMap.has(key)) {
          tagMap.set(key, {
            count: 0,
            scores: [],
            category: row.tag_category || 'uncategorized',
            lastSeen: row.ts
          });
        }
        
        const entry = tagMap.get(key)!;
        entry.count++;
        entry.scores.push(row.score || 0.5);
        if (row.ts > entry.lastSeen) {
          entry.lastSeen = row.ts;
        }
      });

      const processedTags = Array.from(tagMap.entries()).map(([tag, data]) => ({
        tag,
        frequency: data.count,
        avg_score: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
        last_seen: data.lastSeen,
        tag_category: data.category
      }));

      const sortedTags = processedTags
        .sort((a, b) => {
          if (b.frequency !== a.frequency) return b.frequency - a.frequency;
          return b.avg_score - a.avg_score;
        })
        .slice(0, maxTags);

      setTags(sortedTags);

    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Error loading topics');
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = useMemo(() => {
    if (selectedCategory === 'all') return tags;
    return tags.filter(tag => tag.tag_category === selectedCategory);
  }, [tags, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(tags.map(tag => tag.tag_category).filter(Boolean));
    return Array.from(cats);
  }, [tags]);

  const getTagSize = (frequency: number) => {
    const maxFreq = Math.max(...filteredTags.map(t => t.frequency));
    const minFreq = Math.min(...filteredTags.map(t => t.frequency));
    const range = maxFreq - minFreq || 1;
    
    const normalizedSize = (frequency - minFreq) / range;
    const minSize = 0.8;
    const maxSize = 2.5;
    
    return minSize + (normalizedSize * (maxSize - minSize));
  };

  const getTagColor = (tag: TagData) => {
    const intensity = Math.min(tag.avg_score, 1);
    
    switch (tag.tag_category) {
      case 'emotion':
        return `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`;
      case 'topic':
        return `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`;
      case 'symptom':
        return `rgba(245, 158, 11, ${0.5 + intensity * 0.5})`;
      case 'coping-strategy':
        return `rgba(34, 197, 94, ${0.5 + intensity * 0.5})`;
      case 'trigger':
        return `rgba(147, 51, 234, ${0.5 + intensity * 0.5})`;
      default:
        return `rgba(107, 114, 128, ${0.5 + intensity * 0.5})`;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'emotion': return 'Emotions';
      case 'topic': return 'Topics';
      case 'symptom': return 'Symptoms';
      case 'coping-strategy': return 'Strategies';
      case 'trigger': return 'Triggers';
      default: return 'Other';
    }
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="loader"></div>
          <span className="ml-3 text-neutral-600">Loading tags...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center text-error-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>Error loading topics</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="bg-white p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Hash className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Topic Cloud
            </h3>
            {tags.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {filteredTags.length} tags
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {timeRange === 'week' ? 'Last week' : 
               timeRange === 'month' ? 'Last month' : 'All data'}
            </span>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({tags.length})
            </button>
            {categories.map(category => {
              const count = tags.filter(t => t.tag_category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {getCategoryName(category)} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6">
        {filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-neutral-800 mb-2">
              No Tags Available
            </h4>
            <p className="text-neutral-600">
              {selectedCategory === 'all' 
                ? 'No conversations have been tagged in the selected period.'
                : `No tags in the "${getCategoryName(selectedCategory)}" category.`
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3 min-h-[200px]">
            {filteredTags.map((tag, index) => (
              <motion.div
                key={tag.tag}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="group relative cursor-pointer"
                style={{
                  fontSize: `${getTagSize(tag.frequency)}rem`,
                  color: getTagColor(tag),
                  fontWeight: 500 + (tag.frequency * 100)
                }}
                title={`${tag.tag}: ${tag.frequency} times (score: ${tag.avg_score.toFixed(2)})`}
              >
                <span className="hover:opacity-80 transition-opacity">
                  {tag.tag}
                </span>
                
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-medium">{tag.tag}</div>
                  <div className="text-neutral-300">
                    Frequency: {tag.frequency} | Score: {tag.avg_score.toFixed(2)}
                  </div>
                  <div className="text-neutral-400 text-xs">
                    Category: {getCategoryName(tag.tag_category)}
                  </div>
                  <div className="text-neutral-400 text-xs">
                    Last: {new Date(tag.last_seen).toLocaleDateString('en-US')}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {filteredTags.length > 0 && (
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div className="flex items-center space-x-4">
              <span>
                <strong>{filteredTags.reduce((sum, tag) => sum + tag.frequency, 0)}</strong> total mentions
              </span>
              <span>
                Average Score: <strong>{(filteredTags.reduce((sum, tag) => sum + tag.avg_score, 0) / filteredTags.length).toFixed(2)}</strong>
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              Updated: {new Date().toLocaleDateString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 