import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, FileText, Clock } from 'lucide-react';

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPNoteEditorProps {
  initialNote?: SOAPNote;
  onSave?: (note: SOAPNote) => void;
  className?: string;
  readOnly?: boolean;
}

export const SOAPNoteEditor: React.FC<SOAPNoteEditorProps> = ({
  initialNote,
  onSave,
  className = '',
  readOnly = false,
}) => {
  const [note, setNote] = useState<SOAPNote>(
    initialNote || {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    }
  );

  const [isEditing, setIsEditing] = useState(!readOnly && !initialNote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave(note);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving SOAP note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNote = (field: keyof SOAPNote, value: string) => {
    setNote(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    {
      key: 'subjective' as keyof SOAPNote,
      title: 'Subjective',
      description: 'Patient\'s reported symptoms, concerns, and history',
      placeholder: 'What the patient reports about their symptoms, feelings, and concerns...',
    },
    {
      key: 'objective' as keyof SOAPNote,
      title: 'Objective',
      description: 'Observable findings and measurements',
      placeholder: 'Observable behaviors, test results, and clinical findings...',
    },
    {
      key: 'assessment' as keyof SOAPNote,
      title: 'Assessment',
      description: 'Clinical judgment and diagnosis',
      placeholder: 'Clinical impressions, diagnosis, and progress evaluation...',
    },
    {
      key: 'plan' as keyof SOAPNote,
      title: 'Plan',
      description: 'Treatment plan and next steps',
      placeholder: 'Treatment recommendations, interventions, and follow-up plans...',
    },
  ];

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">SOAP Note</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-neutral-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            {!readOnly && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-ghost text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-primary text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-neutral-900 text-lg">
                {section.title}
              </h4>
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                {section.key}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-3">
              {section.description}
            </p>
            
            {isEditing ? (
              <textarea
                value={note[section.key]}
                onChange={(e) => updateNote(section.key, e.target.value)}
                placeholder={section.placeholder}
                className="textarea min-h-[120px] w-full"
                rows={4}
              />
            ) : (
              <div className="min-h-[120px] p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                {note[section.key] ? (
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {note[section.key]}
                  </p>
                ) : (
                  <p className="text-neutral-400 italic">
                    No {section.title.toLowerCase()} information recorded
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {isEditing && (
        <div className="border-t border-neutral-200 p-4 bg-neutral-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setNote(initialNote || { subjective: '', objective: '', assessment: '', plan: '' });
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save SOAP Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};