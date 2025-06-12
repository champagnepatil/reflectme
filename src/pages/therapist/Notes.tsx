import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { Tag, X, Save, ArrowLeft, Plus } from 'lucide-react';

const Notes: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { getClient, addNote } = useTherapy();
  const client = getClient(clientId || '');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Client not found</h2>
        <button onClick={() => navigate('/therapist')} className="btn btn-primary mt-4">Return to Dashboard</button>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    addNote(client.id, {
      date: new Date().toISOString().split('T')[0],
      title,
      content,
      tags,
    });
    
    navigate(`/therapist/client/${client.id}`);
  };
  
  const addTagToList = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString());
      
      // Get position for the popup
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 40
      });
      
      setShowTagPopup(true);
    } else {
      setShowTagPopup(false);
    }
  };
  
  const handleAddAsTag = () => {
    if (selectedText.trim() && !tags.includes(selectedText.trim())) {
      setTags([...tags, selectedText.trim()]);
      setShowTagPopup(false);
    }
  };
  
  const handleAddAsTrigger = () => {
    alert(`Added "${selectedText}" as a trigger. This would update the client's digital twin.`);
    setShowTagPopup(false);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(`/therapist/client/${client.id}`)} 
          className="p-2 rounded-full hover:bg-neutral-100 mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Add Session Note</h1>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="client" className="label">Client</label>
            <div className="flex items-center px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <img 
                  src={client.avatar} 
                  alt={client.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium text-neutral-900">{client.name}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="title" className="label">Note Title</label>
            <input
              type="text"
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Initial Assessment, CBT Session, Progress Review"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="label">Session Notes</label>
            <p className="text-sm text-neutral-500 mb-2">
              Select text to tag as triggers or coping strategies.
            </p>
            <textarea
              id="content"
              className="textarea min-h-[300px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={handleTextSelection}
              placeholder="Document your observations, interventions, and client's progress..."
              required
            ></textarea>
            
            {showTagPopup && (
              <div 
                className="absolute bg-white shadow-lg rounded-lg border border-neutral-200 p-2 z-10"
                style={{ 
                  left: `${popupPosition.x}px`, 
                  top: `${popupPosition.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAddAsTag}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-md text-sm"
                  >
                    Add as Tag
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAsTrigger}
                    className="px-3 py-1 bg-warning-100 text-warning-800 rounded-md text-sm"
                  >
                    Mark as Trigger
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="label">Tags</label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                className="input rounded-r-none"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Add tags (e.g., anxiety, CBT, homework)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTagToList();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTagToList}
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
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
              onClick={() => navigate(`/therapist/client/${client.id}`)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !content.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </button>
          </div>
        </form>
      </motion.div>
      
      <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h2 className="font-medium text-primary-900 mb-2">Note to Therapists</h2>
        <p className="text-sm text-primary-800">
          Tagged content and triggers identified in your notes help build your client's digital twin. 
          This allows the companion to provide personalized support based on your therapeutic approach.
          All notes are encrypted and only accessible to you and the client's digital companion.
        </p>
      </div>
    </div>
  );
};

export default Notes;