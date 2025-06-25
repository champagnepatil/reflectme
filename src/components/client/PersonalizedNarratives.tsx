import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, BookOpen, Heart, Sparkles, Clock, Volume2 } from 'lucide-react';
import GenAIService, { PersonalizedNarrative, ClientProfile } from '../../services/genAIService';

interface PersonalizedNarrativesProps {
  clientProfile: ClientProfile;
}

const PersonalizedNarratives: React.FC<PersonalizedNarrativesProps> = ({ clientProfile }) => {
  const [narratives, setNarratives] = useState<PersonalizedNarrative[]>([]);
  const [selectedNarrative, setSelectedNarrative] = useState<PersonalizedNarrative | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrativeType, setNarrativeType] = useState<'story' | 'meditation' | 'visualization' | 'allegory'>('story');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');

  const genAIService = new GenAIService();

  // Mock existing narratives
  useEffect(() => {
    const mockNarratives: PersonalizedNarrative[] = [
      {
        id: 'narrative-1',
        title: 'The Mountain Path of Confidence',
        content: 'In a quiet valley surrounded by towering mountains, there lived a young climber who had always dreamed of reaching the summit...',
        type: 'story',
        themes: ['confidence', 'growth', 'resilience'],
        duration: 6,
        targetChallenges: ['public speaking anxiety'],
        moodContext: '3/5',
        personalizations: ['Incorporates nature themes', 'Addresses public speaking'],
        created: '2024-12-22T10:00:00Z'
      },
      {
        id: 'narrative-2',
        title: 'Mindful Breathing Journey',
        content: 'Close your eyes and imagine yourself sitting by a peaceful lake. Feel the gentle breeze on your skin...',
        type: 'meditation',
        themes: ['peace', 'mindfulness', 'calm'],
        duration: 8,
        targetChallenges: ['anxiety', 'stress'],
        moodContext: '3/5',
        personalizations: ['Gentle guidance', 'Nature-based imagery'],
        created: '2024-12-21T15:30:00Z'
      }
    ];
    setNarratives(mockNarratives);
  }, []);

  const generateNewNarrative = async () => {
    setIsGenerating(true);
    try {
      const challenge = selectedChallenge || clientProfile.challenges[0];
      const narrative = await genAIService.generatePersonalizedNarrative(
        clientProfile,
        narrativeType,
        challenge
      );
      setNarratives(prev => [narrative, ...prev]);
      setSelectedNarrative(narrative);
    } catch (error) {
      console.error('Error generating narrative:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playNarrative = (narrative: PersonalizedNarrative) => {
    setSelectedNarrative(narrative);
    setIsPlaying(true);
    setPlaybackPosition(0);
    
    // Mock audio playback - in real implementation, this would use text-to-speech
    console.log('Playing narrative:', narrative.title);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setPlaybackPosition(0);
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const narrativeTypeIcons = {
    story: BookOpen,
    meditation: Heart,
    visualization: Sparkles,
    allegory: BookOpen
  };

  const narrativeTypeColors = {
    story: 'from-blue-500 to-purple-500',
    meditation: 'from-green-500 to-teal-500',
    visualization: 'from-pink-500 to-rose-500',
    allegory: 'from-orange-500 to-red-500'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-white" />
            </div>
            Your Personalized Narratives
          </CardTitle>
          <CardDescription>
            AI-crafted stories, meditations, and visualizations designed specifically for your healing journey.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Generate New Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Narrative</CardTitle>
          <CardDescription>Generate a personalized story or meditation tailored to your current needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Narrative Type</label>
              <Select value={narrativeType} onValueChange={(value: any) => setNarrativeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Therapeutic Story</SelectItem>
                  <SelectItem value="meditation">Guided Meditation</SelectItem>
                  <SelectItem value="visualization">Visualization Exercise</SelectItem>
                  <SelectItem value="allegory">Allegorical Tale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Focus Challenge (Optional)</label>
              <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose specific challenge..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General support</SelectItem>
                  {clientProfile.challenges.map((challenge, index) => (
                    <SelectItem key={index} value={challenge}>
                      {challenge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateNewNarrative}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin mr-2" />
                Creating Your Personal Narrative...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Narrative
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Narrative Library */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {narratives.map((narrative) => {
          const IconComponent = narrativeTypeIcons[narrative.type];
          const colorClass = narrativeTypeColors[narrative.type];
          
          return (
            <Card key={narrative.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{narrative.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {narrative.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(narrative.duration)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Themes */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Themes:</p>
                  <div className="flex flex-wrap gap-1">
                    {narrative.themes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {narrative.content.substring(0, 150)}...
                  </p>
                </div>

                {/* Personalizations */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Personalized for you:</p>
                  <div className="flex flex-wrap gap-1">
                    {narrative.personalizations.map((personalization, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {personalization}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex gap-2 pt-2">
                  {selectedNarrative?.id === narrative.id && isPlaying ? (
                    <Button
                      onClick={pausePlayback}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      onClick={() => playNarrative(narrative)}
                      size="sm"
                      className={`flex-1 bg-gradient-to-r ${colorClass} hover:opacity-90`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Listen
                    </Button>
                  )}
                  
                  {selectedNarrative?.id === narrative.id && (
                    <Button
                      onClick={resetPlayback}
                      size="sm"
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Currently Playing */}
      {selectedNarrative && isPlaying && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Now Playing
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedNarrative.title}</h4>
                <p className="text-sm text-gray-600">
                  {formatDuration(selectedNarrative.duration)} • {selectedNarrative.type}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={pausePlayback} size="sm" variant="outline">
                  <Pause className="h-4 w-4" />
                </Button>
                <Button onClick={resetPlayback} size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Mock Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(playbackPosition / selectedNarrative.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.floor(playbackPosition)}:00</span>
                <span>{selectedNarrative.duration}:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {narratives.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Narratives Yet</h3>
            <p className="text-gray-600">
              Generate your first personalized narrative to begin your therapeutic journey.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedNarratives;