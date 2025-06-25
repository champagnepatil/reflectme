import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  BookOpen, 
  Users, 
  FileText, 
  Clipboard, 
  Globe, 
  Sparkles, 
  Target, 
  Heart, 
  Zap, 
  Award,
  Loader2,
  ChevronRight,
  Star,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Shield,
  Settings,
  Play,
  Download,
  Share
} from 'lucide-react';
import * as Sentry from "@sentry/react";
import GenAIService, { 
  PersonalizedNarrative, 
  RolePlayScenario, 
  ClinicalNoteSummary, 
  TherapeuticHomework, 
  TherapeuticContent,
  ClientProfile 
} from '../../services/genAIService';

// Mock client profiles for therapist use
const mockClientProfiles: ClientProfile[] = [
  {
    id: 'client-001',
    challenges: ['anxiety', 'public speaking', 'perfectionism'],
    mood: 3,
    therapyGoals: ['build confidence', 'manage anxiety', 'improve communication'],
    preferences: ['nature themes', 'gentle guidance', 'practical exercises'],
    journalEntries: [
      {
        date: '2024-12-22',
        content: 'Had a presentation at work today. Felt nervous but managed to get through it.',
        mood: 3,
        themes: ['anxiety', 'work stress']
      }
    ],
    copingStrategies: ['deep breathing', 'mindfulness'],
    triggers: ['public speaking', 'performance evaluation'],
    progressAreas: ['emotional regulation', 'confidence building']
  },
  {
    id: 'client-002', 
    challenges: ['depression', 'social isolation', 'low motivation'],
    mood: 2,
    therapyGoals: ['improve mood', 'build social connections', 'find motivation'],
    preferences: ['creative activities', 'structured approach', 'peer support'],
    journalEntries: [
      {
        date: '2024-12-21',
        content: 'Feeling disconnected from friends and family. Hard to find energy for daily tasks.',
        mood: 2,
        themes: ['isolation', 'low energy']
      }
    ],
    copingStrategies: ['journaling', 'art therapy'],
    triggers: ['social gatherings', 'overwhelming tasks'],
    progressAreas: ['social engagement', 'daily routine']
  }
];

const AIToolbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generation');
  const [selectedClient, setSelectedClient] = useState<ClientProfile>(mockClientProfiles[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    narrative?: PersonalizedNarrative;
    rolePlay?: RolePlayScenario;
    clinical?: ClinicalNoteSummary;
    homework?: TherapeuticHomework;
    content?: TherapeuticContent;
  }>({});

  const genAIService = new GenAIService();

  // Sentry tracking for AI toolbox usage
  const trackToolboxUsage = (toolType: string, action: string) => {
    const { logger } = Sentry;
    
    Sentry.startSpan(
      {
        op: "therapist.ai_toolbox",
        name: `AI Toolbox - ${toolType}`,
      },
      (span) => {
        span.setAttribute("tool_type", toolType);
        span.setAttribute("action", action);
        span.setAttribute("client_mood", selectedClient.mood);
        
        logger.info("Therapist using AI toolbox", {
          toolType,
          action,
          clientChallenges: selectedClient.challenges.length,
          clientMood: selectedClient.mood
        });
      }
    );
  };

  const generatePersonalizedNarrative = async (narrativeType: 'story' | 'meditation' | 'visualization' | 'allegory') => {
    trackToolboxUsage('narrative', 'generate');
    setIsLoading(true);
    try {
      const narrative = await genAIService.generatePersonalizedNarrative(
        selectedClient,
        narrativeType,
        selectedClient.challenges[0]
      );
      setResults(prev => ({ ...prev, narrative }));
    } catch (error) {
      console.error('Error generating narrative:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRolePlayScenario = async (scenarioType: string) => {
    trackToolboxUsage('roleplay', 'generate');
    setIsLoading(true);
    try {
      const rolePlay = await genAIService.generateRolePlayScenario(
        selectedClient,
        scenarioType,
        'intermediate'
      );
      setResults(prev => ({ ...prev, rolePlay }));
    } catch (error) {
      console.error('Error generating role play:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTherapeuticHomework = async (homeworkType: 'mindfulness' | 'cognitive' | 'behavioral' | 'journaling' | 'exposure' | 'creative') => {
    trackToolboxUsage('homework', 'generate');
    setIsLoading(true);
    try {
      const homework = await genAIService.generateTherapeuticHomework(
        selectedClient,
        homeworkType,
        7,
        'intermediate'
      );
      setResults(prev => ({ ...prev, homework }));
    } catch (error) {
      console.error('Error generating homework:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTherapeuticContent = async (contentType: 'article' | 'exercise' | 'worksheet' | 'guide' | 'script') => {
    trackToolboxUsage('content', 'generate');
    setIsLoading(true);
    try {
      const content = await genAIService.generateTherapeuticContent(
        contentType,
        'Understanding and Managing ' + selectedClient.challenges[0],
        ['clients'],
        500,
        'compassionate'
      );
      setResults(prev => ({ ...prev, content }));
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 AI Toolbox for Therapists
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced generative AI tools to enhance your therapeutic practice. Create personalized content, 
            generate insights, and streamline your workflow with cutting-edge AI assistance.
          </p>
        </div>

        {/* Client Selection */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Client Context Selection
            </CardTitle>
            <CardDescription>
              Select a client profile to personalize AI-generated content and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Client Profile</label>
                <Select 
                  value={selectedClient.id} 
                  onValueChange={(id) => setSelectedClient(mockClientProfiles.find(c => c.id === id) || mockClientProfiles[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClientProfiles.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.id} - {client.challenges.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Selected Client Overview</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div><strong>Challenges:</strong> {selectedClient.challenges.join(', ')}</div>
                  <div><strong>Mood:</strong> {selectedClient.mood}/5</div>
                  <div><strong>Goals:</strong> {selectedClient.therapyGoals.slice(0, 2).join(', ')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 bg-white/70 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="generation" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Content Generation</span>
              <span className="sm:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="roleplay" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Role Play</span>
              <span className="sm:hidden">Role Play</span>
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center">
              <Clipboard className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Homework</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="content-library" className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Content Library</span>
              <span className="sm:hidden">Library</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">AI Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Personalized Content Generation */}
          <TabsContent value="generation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Personalized Narratives
                  </CardTitle>
                  <CardDescription>
                    Generate therapeutic stories, meditations, and visualizations tailored to client needs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => generatePersonalizedNarrative('story')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Story
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => generatePersonalizedNarrative('meditation')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Meditation
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => generatePersonalizedNarrative('visualization')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Visualization
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => generatePersonalizedNarrative('allegory')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Allegory
                    </Button>
                  </div>
                  
                  {results.narrative && (
                    <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold text-pink-900 mb-2">{results.narrative.title}</h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {results.narrative.themes.map((theme, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-pink-800 mb-3 line-clamp-3">
                        {results.narrative.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-pink-600">
                        <span>{results.narrative.duration} min read</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Notes Summary */}
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Clinical Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of session notes and progress patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                    onClick={() => {
                      trackToolboxUsage('clinical', 'analyze');
                      // Mock clinical analysis for demo
                      setResults(prev => ({ 
                        ...prev, 
                        clinical: {
                          id: Date.now().toString(),
                          clientId: selectedClient.id,
                          sessionIds: ['session-1', 'session-2'],
                          keyThemes: ['anxiety management', 'confidence building'],
                          emotionalPatterns: ['cyclical mood patterns', 'stress-triggered responses'],
                          copingStrategies: ['breathing techniques', 'mindfulness'],
                          progressIndicators: ['improved communication', 'reduced avoidance'],
                          concernAreas: ['public speaking anxiety'],
                          suggestedTopics: ['exposure therapy', 'cognitive restructuring'],
                          moodTrends: {
                            pattern: 'gradual improvement',
                            analysis: 'Client showing steady progress',
                            recommendations: ['continue current approach', 'add behavioral experiments']
                          },
                          nextSessionFocus: ['practice public speaking', 'review homework'],
                          summary: 'Client demonstrates good progress in anxiety management with continued need for confidence building exercises.',
                          synthesisDate: new Date().toISOString()
                        }
                      }));
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Analyze Session Notes
                  </Button>
                  
                  {results.clinical && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Clinical Summary</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <div>
                          <strong>Key Themes:</strong> {results.clinical.keyThemes.join(', ')}
                        </div>
                        <div>
                          <strong>Progress:</strong> {results.clinical.progressIndicators.slice(0, 2).join(', ')}
                        </div>
                        <div>
                          <strong>Next Focus:</strong> {results.clinical.nextSessionFocus.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Role Play Scenarios */}
          <TabsContent value="roleplay">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Dynamic Role-Play Scenarios
                </CardTitle>
                <CardDescription>
                  Create interactive AI-powered scenarios for skill practice and therapeutic exploration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => generateRolePlayScenario('workplace communication')}
                    disabled={isLoading}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Workplace Communication
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => generateRolePlayScenario('social interaction')}
                    disabled={isLoading}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Users className="w-6 h-6 mb-2" />
                    Social Interaction
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => generateRolePlayScenario('conflict resolution')}
                    disabled={isLoading}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Shield className="w-6 h-6 mb-2" />
                    Conflict Resolution
                  </Button>
                </div>
                
                {results.rolePlay && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">{results.rolePlay.title}</h4>
                    <p className="text-blue-800 mb-4">{results.rolePlay.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">Scenario Context</h5>
                        <p className="text-sm text-blue-700">{results.rolePlay.context}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">Learning Objective</h5>
                        <p className="text-sm text-blue-700">{results.rolePlay.objective}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant="secondary">{results.rolePlay.difficulty}</Badge>
                      <Button size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Start Session
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Therapeutic Homework */}
          <TabsContent value="homework">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clipboard className="w-5 h-5 mr-2 text-purple-600" />
                  Personalized Homework Generator
                </CardTitle>
                <CardDescription>
                  Create customized therapeutic assignments based on client needs and progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {(['mindfulness', 'cognitive', 'behavioral', 'journaling', 'exposure', 'creative'] as const).map((type) => (
                    <Button 
                      key={type}
                      variant="outline" 
                      onClick={() => generateTherapeuticHomework(type)}
                      disabled={isLoading}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      {type === 'mindfulness' && <Heart className="w-4 h-4 mb-1" />}
                      {type === 'cognitive' && <Brain className="w-4 h-4 mb-1" />}
                      {type === 'behavioral' && <Target className="w-4 h-4 mb-1" />}
                      {type === 'journaling' && <BookOpen className="w-4 h-4 mb-1" />}
                      {type === 'exposure' && <Zap className="w-4 h-4 mb-1" />}
                      {type === 'creative' && <Sparkles className="w-4 h-4 mb-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
                
                {results.homework && (
                  <div className="mt-6 p-6 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">{results.homework.title}</h4>
                    <p className="text-purple-800 mb-4">{results.homework.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-purple-900 mb-2">Objectives</h5>
                        <ul className="text-sm text-purple-700 space-y-1">
                          {results.homework.objectives.slice(0, 3).map((obj, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-purple-900 mb-2">Schedule ({results.homework.duration} days)</h5>
                        <div className="text-sm text-purple-700">
                          {results.homework.dailyTasks.length} daily tasks prepared
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="secondary">{results.homework.type}</Badge>
                          <Badge variant="secondary">{results.homework.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Library */}
          <TabsContent value="content-library">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-teal-600" />
                  Therapeutic Content Creation
                </CardTitle>
                <CardDescription>
                  Generate educational materials, worksheets, and therapeutic resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {(['article', 'exercise', 'worksheet', 'guide', 'script'] as const).map((type) => (
                    <Button 
                      key={type}
                      variant="outline" 
                      onClick={() => generateTherapeuticContent(type)}
                      disabled={isLoading}
                      className="h-16 flex flex-col items-center justify-center text-xs"
                    >
                      {type === 'article' && <FileText className="w-4 h-4 mb-1" />}
                      {type === 'exercise' && <Zap className="w-4 h-4 mb-1" />}
                      {type === 'worksheet' && <Clipboard className="w-4 h-4 mb-1" />}
                      {type === 'guide' && <BookOpen className="w-4 h-4 mb-1" />}
                      {type === 'script' && <MessageSquare className="w-4 h-4 mb-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
                
                {results.content && (
                  <div className="mt-6 p-6 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">{results.content.title}</h4>
                    <div className="flex items-center gap-4 mb-4 text-sm text-teal-700">
                      <span>Type: {results.content.type}</span>
                      <span>Words: {results.content.wordCount}</span>
                      <span>Tone: {results.content.tone}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {results.content.tags.slice(0, 5).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-teal-800 line-clamp-3">
                      {results.content.content.substring(0, 300)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                    AI Usage Analytics
                  </CardTitle>
                  <CardDescription>
                    Monitor AI tool effectiveness and client engagement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-900 font-medium">Content Generated</span>
                      <span className="text-orange-700 font-bold">142</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-900 font-medium">Client Engagement</span>
                      <span className="text-orange-700 font-bold">87%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-900 font-medium">Success Rate</span>
                      <span className="text-orange-700 font-bold">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Feature Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered suggestions for improving your practice.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-start">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Consider mindfulness homework</p>
                          <p className="text-xs text-yellow-700">Based on current client challenges</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-start">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Role-play scenarios effective</p>
                          <p className="text-xs text-yellow-700">92% completion rate this month</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Generating AI Content...</p>
                  <p className="text-sm text-gray-600">This may take a few moments</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToolbox; 