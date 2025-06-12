import React from 'react';
import { motion } from 'framer-motion';
import { useTherapy } from '../../contexts/TherapyContext';
import { FileText, Search, Tag, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotesOverview: React.FC = () => {
  const { clients } = useTherapy();
  
  // Get all notes from all clients
  const allNotes = clients.flatMap(client => 
    client.notes.map(note => ({
      ...note,
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Session Notes</h1>
        <div className="flex items-center text-neutral-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes..."
              className="input pl-10"
            />
          </div>
        </div>
        <button className="btn btn-outline">
          <Tag className="w-4 h-4 mr-2" />
          Filter by Tags
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {allNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img 
                  src={note.clientAvatar}
                  alt={note.clientName}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-neutral-900">{note.clientName}</h3>
                  <p className="text-sm text-neutral-500">
                    {new Date(note.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <Link
                to={`/therapist/notes/${note.clientId}`}
                className="btn btn-ghost"
              >
                <span className="text-sm">Edit Note</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <h4 className="font-medium text-neutral-900 mb-2">{note.title}</h4>
            <p className="text-neutral-600 mb-4 line-clamp-2">{note.content}</p>

            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotesOverview;