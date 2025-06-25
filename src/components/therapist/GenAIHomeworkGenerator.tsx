import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clipboard, Target, Zap, Clock, CheckCircle } from 'lucide-react';
import GenAIService, { TherapeuticHomework, ClientProfile } from '../../services/genAIService';

interface GenAIHomeworkGeneratorProps {
  clientId: string;
  clientProfile?: ClientProfile;
  onHomeworkGenerated?: (homework: TherapeuticHomework) => void;
}

const GenAIHomeworkGenerator: React.FC<GenAIHomeworkGeneratorProps> = ({ 
  clientId, 
  clientProfile,
  onHomeworkGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [homeworkType, setHomeworkType] = useState<'mindfulness' | 'cognitive' | 'behavioral' | 'journaling' | 'exposure' | 'creative'>('mindfulness');
  const [duration, setDuration] = useState(7);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [generatedHomework, setGeneratedHomework] = useState<TherapeuticHomework | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const genAIService = new GenAIService();

  // Mock client profile if not provided
  const defaultClientProfile: ClientProfile = {
    id: clientId,
    challenges: ['anxiety', 'stress management', 'communication skills'],
    mood: 3,
    therapyGoals: ['reduce anxiety', 'improve sleep', 'build confidence'],
    preferences: ['structured exercises', 'gradual progress', 'practical tools'],
    journalEntries: [],
    copingStrategies: ['deep breathing', 'progressive relaxation'],
    triggers: ['work stress', 'social situations'],
    progressAreas: ['emotional regulation', 'self-awareness']
  };

  const profile = clientProfile || defaultClientProfile;

  const generateHomework = async () => {
    setIsGenerating(true);
    try {
      const homework = await genAIService.generateTherapeuticHomework(
        profile,
        homeworkType,
        duration,
        difficulty
      );
      setGeneratedHomework(homework);
      onHomeworkGenerated?.(homework);
    } catch (error) {
      console.error('Error generating homework:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const assignHomework = async () => {
    if (!generatedHomework) return;
    
    setIsAssigning(true);
    try {
      // Here you would integrate with your backend to save the homework assignment
      console.log('Assigning homework to client:', clientId, generatedHomework);
      
      // Mock assignment delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success feedback
      alert('Homework successfully assigned to client!');
    } catch (error) {
      console.error('Error assigning homework:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const homeworkTypeDescriptions = {
    mindfulness: 'Meditation, breathing exercises, and present-moment awareness',
    cognitive: 'Thought challenging, reframing, and CBT techniques',
    behavioral: 'Activity scheduling, behavioral experiments, and habit building',
    journaling: 'Structured prompts, gratitude practice, and emotional processing',
    exposure: 'Graduated exposure exercises with anxiety management',
    creative: 'Art therapy, creative writing, and expressive activities'
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Clipboard className="h-4 w-4 text-white" />
          </div>
          AI Homework Generator
        </CardTitle>
        <CardDescription>
          Generate personalized therapeutic homework plans tailored to your client's specific needs and progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Homework Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Homework Type</label>
            <Select value={homeworkType} onValueChange={(value: any) => setHomeworkType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mindfulness">Mindfulness</SelectItem>
                <SelectItem value="cognitive">Cognitive</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="journaling">Journaling</SelectItem>
                <SelectItem value="exposure">Exposure</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {homeworkTypeDescriptions[homeworkType]}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Profile Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Client Profile Summary:</h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-600">Challenges:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.challenges.slice(0, 3).map((challenge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-600">Goals:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.therapyGoals.slice(0, 3).map((goal, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateHomework}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating AI Homework Plan...
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4 mr-2" />
              Generate Personalized Homework
            </>
          )}
        </Button>

        {/* Generated Homework Display */}
        {generatedHomework && (
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg text-purple-800">{generatedHomework.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{generatedHomework.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-purple-100">
                  {generatedHomework.type}
                </Badge>
                <Badge variant="outline" className="bg-purple-100">
                  {generatedHomework.duration} days
                </Badge>
              </div>
            </div>

            {/* Objectives */}
            <div className="mb-4">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Objectives
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {generatedHomework.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-1 text-green-500" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Daily Tasks Preview */}
            <div className="mb-4">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Daily Tasks Preview (First 3 Days)
              </h5>
              <div className="space-y-2">
                {generatedHomework.dailyTasks.slice(0, 3).map((task, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start mb-1">
                      <h6 className="font-medium text-sm">Day {task.day}: {task.title}</h6>
                      <Badge variant="outline" className="text-xs">{task.duration} min</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{task.instructions.substring(0, 120)}...</p>
                  </div>
                ))}
                {generatedHomework.dailyTasks.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{generatedHomework.dailyTasks.length - 3} more days planned
                  </p>
                )}
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="mb-6">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Progress Tracking
              </h5>
              <div className="flex flex-wrap gap-1">
                {generatedHomework.progressTracking.map((track, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {track}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Assign Button */}
            <Button 
              onClick={assignHomework}
              disabled={isAssigning}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning to Client...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Homework to Client
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GenAIHomeworkGenerator;