import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTherapy, JournalEntry } from '../../contexts/TherapyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SpeechJournalMood } from '../../components/SpeechJournalMood';
import { PenSquare, Calendar, Tag, X, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry } = useTherapy();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [mood, setMood] = useState(3);
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Your Journal</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
          disabled={isCreating}
        >
          <PenSquare className="w-4 h-4 mr-2" />
          New Entry
        </button>
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
        <div className="space-y-6">
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
        </div>
      ) : (
        <div className="card p-12 text-center">
          <PenSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Your Journal is Empty</h2>
          <p className="text-neutral-600 mb-6">
            Start journaling to track your thoughts, feelings, and progress over time.
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