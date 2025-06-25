import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users, FileText, Clipboard, Globe, Sparkles, Brain, Target, Heart, Zap, Award } from 'lucide-react';
import * as Sentry from "@sentry/react";
import GenAIService, { 
  PersonalizedNarrative, 
  RolePlayScenario, 
  ClinicalNoteSummary, 
  TherapeuticHomework, 
  TherapeuticContent,
  ClientProfile 
} from '../services/genAIService';

const GenAIDemoPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('narrative');
  const [isLoading, setIsLoading] = useState(false);
  const [narrativeResult, setNarrativeResult] = useState<PersonalizedNarrative | null>(null);
  const [rolePlayResult, setRolePlayResult] = useState<RolePlayScenario | null>(null);
  const [clinicalResult, setClinicalResult] = useState<ClinicalNoteSummary | null>(null);
  const [homeworkResult, setHomeworkResult] = useState<TherapeuticHomework | null>(null);
  const [contentResult, setContentResult] = useState<TherapeuticContent | null>(null);
  
  const genAIService = new GenAIService();

  // Mock client profile for demos
  const mockClientProfile: ClientProfile = {
    id: 'demo-client-001',
    challenges: ['public speaking anxiety', 'self-doubt', 'perfectionism'],
    mood: 3,
    therapyGoals: ['build confidence', 'manage anxiety', 'improve communication'],
    preferences: ['nature themes', 'gentle guidance', 'practical exercises'],
    journalEntries: [
      {
        date: '2024-12-22',
        content: 'Had a presentation at work today. Felt really nervous beforehand but managed to get through it. Still felt like everyone was judging me.',
        mood: 3,
        themes: ['anxiety', 'work stress', 'self-criticism']
      },
      {
        date: '2024-12-21',
        content: 'Spent time in the garden today. It always helps me feel more grounded and peaceful. Nature really is my sanctuary.',
        mood: 4,
        themes: ['peace', 'nature', 'grounding']
      }
    ],
    copingStrategies: ['deep breathing', 'mindfulness', 'nature walks'],
    triggers: ['public speaking', 'performance evaluation', 'social gatherings'],
    progressAreas: ['emotional regulation', 'self-compassion', 'confidence building']
  };

  // Mock session notes for clinical demo
  const mockSessionNotes = [
    {
      id: 'session-001',
      date: '2024-12-15',
      content: 'Client reported increased anxiety about upcoming presentation. We practiced breathing techniques and cognitive reframing. Homework assigned: daily mindfulness practice.',
      themes: ['anxiety', 'work stress', 'coping skills'],
      interventions: ['breathing techniques', 'cognitive reframing', 'mindfulness'],
      mood: 3
    },
    {
      id: 'session-002',
      date: '2024-12-08',
      content: 'Good progress on self-compassion exercises. Client noted less harsh self-criticism after difficult situations. Discussed boundary setting at work.',
      themes: ['self-compassion', 'boundaries', 'progress'],
      interventions: ['self-compassion training', 'boundary work'],
      mood: 4
    }
  ];

  const generateNarrative = async () => {
    const { logger } = Sentry;
    
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Generate Personalized Narrative Demo",
      },
      async (span) => {
        span.setAttribute("demo_type", "narrative");
        span.setAttribute("client_mood", mockClientProfile.mood);
        span.setAttribute("challenge_count", mockClientProfile.challenges.length);
        
        logger.info("User initiated narrative generation demo", {
          demoType: "narrative",
          clientMood: mockClientProfile.mood,
          challengeCount: mockClientProfile.challenges.length
        });

        setIsLoading(true);
        try {
          const narrative = await genAIService.generatePersonalizedNarrative(
            mockClientProfile,
            'story',
            'public speaking anxiety'
          );
          setNarrativeResult(narrative);
          
          span.setAttribute("success", true);
          span.setAttribute("narrative_duration", narrative.duration);
          span.setAttribute("theme_count", narrative.themes.length);
          
          logger.info("Successfully generated narrative demo", {
            narrativeDuration: narrative.duration,
            themeCount: narrative.themes.length,
            contentLength: narrative.content.length
          });
        } catch (error) {
          span.setAttribute("success", false);
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error('Error generating narrative demo', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          Sentry.captureException(error);
          console.error('Error generating narrative:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const generateRolePlay = async () => {
    setIsLoading(true);
    try {
      const rolePlay = await genAIService.generateRolePlayScenario(
        mockClientProfile,
        'workplace boundary setting',
        'intermediate'
      );
      setRolePlayResult(rolePlay);
    } catch (error) {
      console.error('Error generating role play:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClinicalSummary = async () => {
    setIsLoading(true);
    try {
      const summary = await genAIService.generateClinicalSummary(
        'demo-client-001',
        mockSessionNotes,
        mockClientProfile
      );
      setClinicalResult(summary);
    } catch (error) {
      console.error('Error generating clinical summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHomework = async () => {
    setIsLoading(true);
    try {
      const homework = await genAIService.generateTherapeuticHomework(
        mockClientProfile,
        'mindfulness',
        7,
        'intermediate'
      );
      setHomeworkResult(homework);
    } catch (error) {
      console.error('Error generating homework:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    setIsLoading(true);
    try {
      const content = await genAIService.generateTherapeuticContent(
        'article',
        'Understanding and Managing Social Anxiety in the Digital Age',
        ['clients'],
        500,
        'compassionate'
      );
      setContentResult(content);
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
            🤖 Gen AI Killer Functions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the revolutionary power of Generative AI in mental health care. 
            These 5 advanced functions represent the future of personalized therapeutic support.
          </p>
        </div>

        {/* Function Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Personalized Narratives</CardTitle>
              <CardDescription>AI-generated therapeutic stories, meditations, and visualizations</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Role-Play Scenarios</CardTitle>
              <CardDescription>Dynamic AI conversations for practicing real-world skills</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Clinical Synthesis</CardTitle>
              <CardDescription>Automated analysis and summarization of therapy sessions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Clipboard className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Therapeutic Homework</CardTitle>
              <CardDescription>Personalized exercises and assignments tailored to each client</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Content Creation</CardTitle>
              <CardDescription>Expanding library of therapeutic articles, guides, and resources</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Platform Intelligence</CardTitle>
              <CardDescription>All functions working together for unprecedented personalization</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Interactive Demo Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
              <Zap className="h-6 w-6 text-purple-600" />
              Interactive Gen AI Demonstrations
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Experience each killer function with live AI generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="narrative" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Narratives
                </TabsTrigger>
                <TabsTrigger value="roleplay" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Role-Play
                </TabsTrigger>
                <TabsTrigger value="clinical" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Clinical
                </TabsTrigger>
                <TabsTrigger value="homework" className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Homework
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Content
                </TabsTrigger>
              </TabsList>

              {/* Personalized Narrative Demo */}
              <TabsContent value="narrative" className="space-y-6">
                <Card className="bg-gradient-to-r from-pink-50 to-rose-50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-pink-600" />
                      Personalized Narrative Generation
                    </CardTitle>
                    <CardDescription>
                      Generate therapeutic stories, meditations, and visualizations tailored to specific challenges and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Client Profile Sample:</h4>
                        <div className="space-y-2">
                          <Badge variant="outline">Public Speaking Anxiety</Badge>
                          <Badge variant="outline">Self-Doubt</Badge>
                          <Badge variant="outline">Perfectionism</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Prefers nature themes and gentle guidance</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Generate:</h4>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                          Generate Therapeutic Story
                        </Button>
                      </div>
                    </div>

                    {narrativeResult && (
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-pink-200">
                        <h4 className="font-semibold text-lg mb-2 text-pink-800">{narrativeResult.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {narrativeResult.themes.map((theme, index) => (
                            <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">Duration:</span> {narrativeResult.duration} minutes • 
                          <span className="font-medium ml-2">Type:</span> {narrativeResult.type}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {narrativeResult.content.substring(0, 800)}...
                          </p>
                        </div>
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Personalizations:</h5>
                          <div className="flex flex-wrap gap-1">
                            {narrativeResult.personalizations.map((personalization, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {personalization}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Role-Play Scenario Demo */}
              <TabsContent value="roleplay" className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      Dynamic Role-Playing Scenarios
                    </CardTitle>
                    <CardDescription>
                      Practice real-world communication skills with adaptive AI personas that respond to your approach.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Scenario Type:</h4>
                        <p className="text-sm text-gray-600">Workplace boundary setting with demanding colleague</p>
                        <div className="mt-2">
                          <Badge variant="outline">Intermediate Level</Badge>
                        </div>
                      </div>
                      <div>
                        <Button 
                          onClick={generateRolePlay} 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                          Generate Role-Play Scenario
                        </Button>
                      </div>
                    </div>

                    {rolePlayResult && (
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-blue-200">
                        <h4 className="font-semibold text-lg mb-2 text-blue-800">{rolePlayResult.title}</h4>
                        <p className="text-gray-700 mb-4">{rolePlayResult.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium mb-2">Context:</h5>
                            <p className="text-sm text-gray-600">{rolePlayResult.context}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Objective:</h5>
                            <p className="text-sm text-gray-600">{rolePlayResult.objective}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            AI Persona
                          </h5>
                          <p className="text-sm mb-2"><strong>Role:</strong> {rolePlayResult.aiPersona.role}</p>
                          <p className="text-sm mb-2"><strong>Personality:</strong> {rolePlayResult.aiPersona.personality}</p>
                          <p className="text-sm"><strong>Opening Line:</strong> "{rolePlayResult.aiPersona.initialResponse}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Success Metrics:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {rolePlayResult.successMetrics.map((metric, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Award className="h-3 w-3 mt-1 text-green-500" />
                                  {metric}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Guidance Tips:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {rolePlayResult.userGuidance.map((guidance, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Heart className="h-3 w-3 mt-1 text-blue-500" />
                                  {guidance}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clinical Summary Demo */}
              <TabsContent value="clinical" className="space-y-6">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      Automated Clinical Note Synthesis
                    </CardTitle>
                    <CardDescription>
                      AI analyzes therapy session notes to identify patterns, progress, and recommendations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Sample Sessions:</h4>
                        <p className="text-sm text-gray-600">2 recent therapy sessions focusing on anxiety management and workplace stress</p>
                      </div>
                      <div>
                        <Button 
                          onClick={generateClinicalSummary} 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                          Generate Clinical Analysis
                        </Button>
                      </div>
                    </div>

                    {clinicalResult && (
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-green-200">
                        <h4 className="font-semibold text-lg mb-4 text-green-800">Clinical Synthesis Report</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h5 className="font-medium mb-2">Key Themes:</h5>
                            <div className="space-y-1">
                              {clinicalResult.keyThemes.map((theme, index) => (
                                <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Progress Indicators:</h5>
                            <div className="space-y-1">
                              {clinicalResult.progressIndicators.map((indicator, index) => (
                                <Badge key={index} variant="secondary" className="mr-1 mb-1 bg-green-100 text-green-800">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium mb-2">Mood Trend Analysis:</h5>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Pattern:</strong> {clinicalResult.moodTrends.pattern}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Analysis:</strong> {clinicalResult.moodTrends.analysis}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Next Session Focus:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {clinicalResult.nextSessionFocus.map((focus, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Target className="h-3 w-3 mt-1 text-green-500" />
                                {focus}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Clinical Summary:</h5>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {clinicalResult.summary}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Therapeutic Homework Demo */}
              <TabsContent value="homework" className="space-y-6">
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Clipboard className="h-5 w-5 text-purple-600" />
                      Personalized Therapeutic Homework
                    </CardTitle>
                    <CardDescription>
                      Generate customized exercise plans tailored to individual client needs and progress.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Plan Specifications:</h4>
                        <div className="space-y-1">
                          <Badge variant="outline">7-Day Mindfulness Plan</Badge>
                          <Badge variant="outline">Intermediate Level</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Focus: Anxiety management and emotional regulation</p>
                      </div>
                      <div>
                        <Button 
                          onClick={generateHomework} 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                          Generate Homework Plan
                        </Button>
                      </div>
                    </div>

                    {homeworkResult && (
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-purple-200">
                        <h4 className="font-semibold text-lg mb-2 text-purple-800">{homeworkResult.title}</h4>
                        <p className="text-gray-700 mb-4">{homeworkResult.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium mb-2">Objectives:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {homeworkResult.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Target className="h-3 w-3 mt-1 text-purple-500" />
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Progress Tracking:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {homeworkResult.progressTracking.map((track, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Zap className="h-3 w-3 mt-1 text-purple-500" />
                                  {track}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-3">Daily Tasks Sample (Day 1-3):</h5>
                          <div className="space-y-3">
                            {homeworkResult.dailyTasks.slice(0, 3).map((task, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <h6 className="font-medium text-sm">Day {task.day}: {task.title}</h6>
                                  <Badge variant="outline" className="text-xs">{task.duration} min</Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{task.instructions}</p>
                                <div className="text-xs text-gray-500">
                                  <strong>Reflection:</strong> {task.reflectionPrompts[0]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Creation Demo */}
              <TabsContent value="content" className="space-y-6">
                <Card className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Globe className="h-5 w-5 text-orange-600" />
                      Therapeutic Content Creation
                    </CardTitle>
                    <CardDescription>
                      Continuously expand the platform's library with fresh, evidence-based therapeutic content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Content Specifications:</h4>
                        <div className="space-y-1">
                          <Badge variant="outline">Article Format</Badge>
                          <Badge variant="outline">500 Words</Badge>
                          <Badge variant="outline">Compassionate Tone</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Topic: Social anxiety in the digital age</p>
                      </div>
                      <div>
                        <Button 
                          onClick={generateContent} 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                          Generate Article Content
                        </Button>
                      </div>
                    </div>

                    {contentResult && (
                      <div className="mt-6 p-6 bg-white rounded-lg border-2 border-orange-200">
                        <h4 className="font-semibold text-lg mb-2 text-orange-800">{contentResult.title}</h4>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {contentResult.category}
                          </Badge>
                          <Badge variant="outline">{contentResult.wordCount} words</Badge>
                          <Badge variant="outline">{contentResult.tone}</Badge>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Therapeutic Techniques:</h5>
                          <div className="flex flex-wrap gap-1">
                            {contentResult.techniques.map((technique, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto mb-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {contentResult.content.substring(0, 1000)}...
                          </p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Call to Action:</h5>
                          <p className="text-sm text-gray-700 italic">"{contentResult.callToAction}"</p>
                        </div>

                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-1">Content Tags:</h5>
                          <div className="flex flex-wrap gap-1">
                            {contentResult.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Competitive Advantage Section */}
        <Card className="mt-12 bg-gradient-to-r from-violet-100 to-purple-100 border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800 flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6" />
              Revolutionary Competitive Advantage
            </CardTitle>
            <CardDescription className="text-lg text-purple-600">
              These Gen AI killer functions position Zentia as the undisputed leader in digital mental health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Unprecedented Personalization</h4>
                <p className="text-sm text-gray-600">Every interaction uniquely tailored to the individual's therapeutic journey</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Real-Time Adaptability</h4>
                <p className="text-sm text-gray-600">AI that learns and evolves with each user interaction</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Therapeutic Excellence</h4>
                <p className="text-sm text-gray-600">Evidence-based AI trained on diverse therapeutic approaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenAIDemoPage;