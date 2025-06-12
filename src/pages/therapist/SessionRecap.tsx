import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, FileText, Save, User } from 'lucide-react';
import { AudioRecorder } from '../../components/audio/AudioRecorder';
import { SOAPNoteEditor } from '../../components/notes/SOAPNoteEditor';
import { useTherapy } from '../../contexts/TherapyContext';
import { generateSOAPNote } from '../../utils/noteGenerators';

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const SessionRecap: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { getClient, addNote } = useTherapy();
  
  const client = getClient(clientId || '');
  const [transcription, setTranscription] = useState<string>('');
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'soap'>('record');

  const handleTranscriptionComplete = (newTranscription: string, generatedSOAP: SOAPNote) => {
    setTranscription(newTranscription);
    setSOAPNote(generatedSOAP);
    setActiveTab('soap');
  };

  const handleSaveNote = async (finalSOAP: SOAPNote) => {
    if (!client) return;

    try {
      setIsSaving(true);
      
      // Create a comprehensive note from the SOAP data
      const noteContent = `
SOAP Note - ${new Date().toLocaleDateString()}

SUBJECTIVE:
${finalSOAP.subjective}

OBJECTIVE:
${finalSOAP.objective}

ASSESSMENT:
${finalSOAP.assessment}

PLAN:
${finalSOAP.plan}

---
Original Transcription:
${transcription}
      `.trim();

      await addNote(client.id, {
        date: new Date().toISOString().split('T')[0],
        title: `Session Recap - ${new Date().toLocaleDateString()}`,
        content: noteContent,
        tags: ['session-recap', 'soap-note', 'audio-transcription'],
      });

      navigate(`/therapist/client/${client.id}`);
    } catch (error) {
      console.error('Error saving session recap:', error);
      alert('Failed to save session recap. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-900">Client not found</h2>
        <button onClick={() => navigate('/therapist')} className="btn btn-primary mt-4">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/therapist/client/${client.id}`)} 
            className="p-2 rounded-full hover:bg-neutral-100 mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Session Recap</h1>
            <p className="text-neutral-500">60-second audio recap for {client.name}</p>
          </div>
        </div>
        
        {soapNote && (
          <button
            onClick={() => handleSaveNote(soapNote)}
            disabled={isSaving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Notes'}
          </button>
        )}
      </div>

      {/* Client Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img 
              src={client.avatar} 
              alt={client.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">{client.name}</h3>
            <p className="text-sm text-neutral-500">
              Last session: {new Date(client.lastSessionDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('record')}
            className={`py-4 px-1 text-sm font-medium border-b-2 flex items-center ${
              activeTab === 'record'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Record Session
          </button>
          
          <button
            onClick={() => setActiveTab('soap')}
            disabled={!soapNote}
            className={`py-4 px-1 text-sm font-medium border-b-2 flex items-center ${
              activeTab === 'soap'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            } ${!soapNote ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            SOAP Note
            {soapNote && <span className="ml-2 w-2 h-2 bg-success-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'record' && (
          <div className="space-y-6">
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              className="max-w-2xl mx-auto"
            />
            
            <div className="card p-6 max-w-2xl mx-auto">
              <h3 className="font-medium text-neutral-900 mb-3">Instructions</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>• Record a 60-second summary of your therapy session</li>
                <li>• Include key observations, patient responses, and interventions</li>
                <li>• Mention any homework assignments or follow-up plans</li>
                <li>• The system will automatically generate a SOAP note from your recording</li>
                <li>• You can edit the generated note before saving</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'soap' && soapNote && (
          <SOAPNoteEditor
            initialNote={soapNote}
            onSave={handleSaveNote}
            className="max-w-4xl mx-auto"
          />
        )}
      </motion.div>

      {/* Digital Twin Integration Note */}
      <div className="card p-4 bg-primary-50 border-primary-200 max-w-4xl mx-auto">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-primary-900 mb-1">Digital Twin Integration</h4>
            <p className="text-sm text-primary-800">
              This session recap will be automatically integrated into {client.name}'s digital twin, 
              enhancing the personalized support provided between sessions. The SOAP note structure 
              ensures comprehensive documentation for both clinical records and AI-powered insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRecap;