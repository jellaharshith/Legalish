import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, SkipForward, Volume2, MessageSquareWarning, Award, Loader2, Wand2, FileText, Home, Briefcase, Zap, AlertTriangle, Crown, Lock } from 'lucide-react';
import RedFlagBadge from '@/components/summary/RedFlagBadge';
import SummaryHighlights from '@/components/summary/SummaryHighlights';
import FloatingChatbot from '@/components/summary/FloatingChatbot';
import DocumentInputSelector from '@/components/summary/DocumentInputSelector';
import DocumentTypeSelector from '@/components/summary/DocumentTypeSelector';
import AuthModal from '@/components/auth/AuthModal';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import { z } from 'zod';
import { AnalysisService } from '@/services/analysisService';
import { supabase } from '@/lib/supabase';

// Demo legal text for free users
const DEMO_TEXT = `
TERMS OF SERVICE

Last Updated: April 20, 2025

By accessing our service, you agree to the following terms:

1. ACCOUNT REGISTRATION
You must be at least 13 years old to use our service. You agree to provide accurate information when you register and to update your information to keep it accurate.

2. CONTENT OWNERSHIP
By uploading content to our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in any media.

3. PROHIBITED ACTIVITIES
You may not use our service for any illegal purpose or to violate any laws. You may not impersonate others or provide inaccurate information.

4. TERMINATION
We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.

5. DATA COLLECTION
We collect and use your personal information as described in our Privacy Policy. By using our service, you consent to our data practices.

6. ARBITRATION AGREEMENT
All disputes will be resolved through binding arbitration. YOU WAIVE YOUR RIGHT TO A JURY TRIAL.

7. LIMITATION OF LIABILITY
Our liability is limited to the maximum extent permitted by law. We will not be liable for any indirect, incidental, special, consequential, or punitive damages.

8. CHANGES TO TERMS
We may modify these terms at any time. Your continued use of our service means you accept the changes.
`;

// Validation schemas
const urlSchema = z.string().url().max(2048);
const textSchema = z.string().min(10).max(2800);
const fileSchema = z.object({
  size: z.number().max(20 * 1024 * 1024),
  type: z.string().refine(type => 
    ['text/plain', 'application/pdf', 'application/msword', 
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/rtf'].includes(type)
  )
});

// ElevenLabs Voice IDs mapping - Updated with your actual voice IDs
const ELEVENLABS_VOICES: Record<string, string> = {
  serious: "fVEZmEO2dF9bNae3YBOh",
  sarcastic: "UeDSHLMzdueVERuLQA8O",
  meme: "B5wR8yZLTi6wn9mE00pD",
  ominous: "qsNN3em0r2h3mSLj1mBw",
  academic: "RWOpmSIBSHmk63ppkzqN",
  child: "1ehM0LJPoYlTLKFMkKL2",
  authoritative: "ee96tsRT1AJLlkQuesbX",
  wizard: "mewzbG3QpSxmuCBD4QKx"
};

// Define which voices are available for free users
const FREE_VOICES = ['serious', 'sarcastic'];

export default function SummaryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [tab, setTab] = useState('summary');
  const { legalText, setLegalText, summary, redFlags, tone, setTone, selectedVoiceId, setSelectedVoiceId, documentType, setDocumentType } = useLegalTerms();
  const [urlInput, setUrlInput] = useState('');
  const { isAnalyzing, analyze } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    text?: string;
    url?: string;
    file?: string;
  }>({});

  // Get user's subscription tier from profiles table
  const [userProfile, setUserProfile] = useState<{ subscription_tier: string } | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
          
          setUserProfile(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Set default voice ID based on current tone and user's subscription
  useEffect(() => {
    const isProUser = userProfile?.subscription_tier === 'pro';
    const availableTones = isProUser ? Object.keys(ELEVENLABS_VOICES) : FREE_VOICES;

    if (availableTones.includes(tone)) {
      setSelectedVoiceId(ELEVENLABS_VOICES[tone]);
    } else {
      // If current tone is not available for the user, default to a free one
      setTone(FREE_VOICES[0] as any);
      setSelectedVoiceId(ELEVENLABS_VOICES[FREE_VOICES[0]]);
    }
  }, [tone, userProfile?.subscription_tier, setTone, setSelectedVoiceId]);

  // Check if user can analyze custom documents
  const canAnalyzeCustom = user && userProfile?.subscription_tier === 'pro';
  const isDemoMode = !canAnalyzeCustom;

  // Set demo text for non-pro users
  useEffect(() => {
    if (isDemoMode && !legalText) {
      setLegalText(DEMO_TEXT);
    }
  }, [isDemoMode, legalText, setLegalText]);

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      urlSchema.parse(url);
      setValidationErrors(prev => ({ ...prev, url: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(prev => ({ ...prev, url: 'Please enter a valid URL' }));
      }
      return false;
    }
  };

  const validateText = (text: string): boolean => {
    if (!text) return true;
    try {
      textSchema.parse(text);
      setValidationErrors(prev => ({ ...prev, text: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          text: text.length < 10 ? 'Text is too short' : 'Text is too long (max 2,800 characters)'
        }));
      }
      return false;
    }
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) return true;
    try {
      fileSchema.parse(file);
      setValidationErrors(prev => ({ ...prev, file: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          file: file.size > 20 * 1024 * 1024 
            ? 'File size must be less than 20MB'
            : 'Invalid file type'
        }));
      }
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    validateUrl(url);
    if (url) {
      setLegalText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLegalText(text);
    validateText(text);
    if (text) {
      setUrlInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      let text = await file.text();
      
      if (text.length > 2800) {
        text = text.substring(0, 2800);
        toast({
          title: "File content truncated",
          description: "File content was truncated to 2,800 characters to fit within analysis limits",
          variant: "default"
        });
      }
      
      if (!validateText(text)) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setLegalText(text);
      setUrlInput('');
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not read the uploaded file",
        variant: "destructive"
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyze = async () => {
    // Check if user is trying to analyze custom content without proper access
    if (isDemoMode && (legalText !== DEMO_TEXT || urlInput || fileInputRef.current?.files?.length)) {
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to analyze custom documents. You can try our demo without signing in.",
          variant: "destructive"
        });
        return;
      } else {
        toast({
          title: "Upgrade Required",
          description: "Upgrade to Pro to analyze custom documents. Free users can only analyze the demo document.",
          variant: "destructive"
        });
        return;
      }
    }

    setValidationErrors({});

    const isTextValid = validateText(legalText);
    const isUrlValid = validateUrl(urlInput);
    const isFileValid = validateFile(fileInputRef.current?.files?.[0] || null);

    if (!isTextValid || !isUrlValid || !isFileValid) {
      return;
    }

    if (!legalText && !urlInput && !fileInputRef.current?.files?.length) {
      toast({
        title: "No input provided",
        description: "Please paste some text, enter a URL, or upload a file",
        variant: "destructive"
      });
      return;
    }

    try {
      let analysisRequest;
      
      if (urlInput) {
        analysisRequest = {
          input_url: urlInput,
          tone: tone,
          max_tokens: 2000,
          temperature: 0.7,
          document_type: documentType
        };
      } else {
        analysisRequest = {
          legal_terms: legalText,
          tone: tone,
          max_tokens: 2000,
          temperature: 0.7,
          document_type: documentType
        };
      }

      const result = await analyze(analysisRequest);

      if (result?.success) {
        setTab('summary');
        toast({
          title: "Analysis Complete!",
          description: `Found ${result.data?.red_flags.length || 0} red flags`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the terms. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };
  
  const togglePlayback = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!summary || summary.length === 0 || !summary[0]?.description) {
        toast({
          title: "No summary to play",
          description: "Please analyze some terms first to generate a summary.",
          variant: "destructive"
        });
        return;
      }

      if (isSynthesizing) return;

      setIsSynthesizing(true);
      toast({
        title: "Synthesizing Audio",
        description: "Please wait while we generate the voice playback...",
      });

      try {
        const textToSpeak = summary[0].description;
        const result = await AnalysisService.synthesizeSpeech(textToSpeak, selectedVoiceId);

        if (result.success && result.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
          audioRef.current = audio;
          audio.play();
          setIsPlaying(true);

          audio.onended = () => {
            setIsPlaying(false);
            toast({
              title: "Playback Finished",
              description: "The summary has been read.",
            });
          };

          toast({
            title: "Playback Started",
            description: "The summary is now being read aloud.",
          });
        } else {
          throw new Error(result.error || "Failed to synthesize speech.");
        }
      } catch (error) {
        console.error("Speech synthesis error:", error);
        toast({
          title: "Audio Playback Error",
          description: error instanceof Error ? error.message : "An error occurred during audio playback.",
          variant: "destructive",
        });
        setIsPlaying(false);
      } finally {
        setIsSynthesizing(false);
      }
    }
  };

  const hasValidInput = () => {
    return (legalText.trim().length >= 10) || 
           (urlInput.trim().length > 0) || 
           (fileInputRef.current?.files?.length || 0) > 0;
  };

  const hasValidationErrors = () => {
    return Object.values(validationErrors).some(error => error !== undefined);
  };

  const isProUser = userProfile?.subscription_tier === 'pro';
  const availableTones = isProUser ? Object.keys(ELEVENLABS_VOICES) : FREE_VOICES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Legal Document
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              {" "}Analyzer
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            {isDemoMode 
              ? "Try our demo analysis or sign in to analyze custom documents"
              : "Upload your legal document and get instant analysis with red flag detection"
            }
          </p>
        </motion.div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <Card className="border-2 border-amber-500/20 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center">
                      <Lock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Demo Mode</p>
                      <p className="text-sm text-amber-700">
                        {!user 
                          ? "Sign in to analyze custom documents. Currently showing demo analysis."
                          : "Upgrade to Pro to analyze custom documents. Free users can only use the demo."
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!user ? (
                      <AuthModal>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                          Sign In
                        </Button>
                      </AuthModal>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/upgrade')}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Document Type Selection */}
            <DocumentTypeSelector
              documentType={documentType}
              setDocumentType={setDocumentType}
              isAnalysisDisabled={isDemoMode}
            />

            {/* Enhanced Input Methods with Action Search Bar */}
            <DocumentInputSelector
              legalText={legalText}
              setLegalText={setLegalText}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
              validationErrors={validationErrors}
              onTextChange={handleTextChange}
              onUrlChange={handleUrlChange}
              isAnalysisDisabled={isDemoMode}
            />

            {/* Analyze Button */}
            <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-r from-primary/5 to-purple-600/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Wand2 className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">AI Analysis</h3>
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || hasValidationErrors() || !hasValidInput()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                  size="lg"
                  data-tutorial="analyze-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {isDemoMode ? 'Analyze Demo Document' : 'Analyze Document'}
                    </>
                  )}
                </Button>
                
                {!hasValidInput() && !isAnalyzing && (
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    {isDemoMode 
                      ? "Demo document is ready to analyze"
                      : "Please provide text, URL, or file to analyze"
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="border-2 border-muted shadow-lg h-fit" data-tutorial="results-section">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <TabsList className="bg-muted/50 p-1">
                      <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-2">
                        <FileText className="h-4 w-4 mr-2" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="redflags" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground px-6 py-2">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Red Flags
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-3">
                      <Select value={tone} onValueChange={(value) => setTone(value as any)} data-tutorial="tone-selector">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Voice tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(ELEVENLABS_VOICES).map((t) => {
                            const isProVoice = !FREE_VOICES.includes(t);
                            const isDisabled = isProVoice && !isProUser;
                            return (
                              <SelectItem key={t} value={t} disabled={isDisabled}>
                                {t.charAt(0).toUpperCase() + t.slice(1)} {isDisabled && '(Pro)'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      
                      <Badge variant={isAnalyzing ? "destructive" : "secondary"} className="px-3 py-1">
                        {isAnalyzing ? 'ANALYZING' : 'READY'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="min-h-[400px]">
                  <TabsContent value="summary" className="mt-0">
                    <SummaryHighlights />
                  </TabsContent>
                  
                  <TabsContent value="redflags" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Red Flags Detected
                      </h3>
                      <div className="space-y-3">
                        {redFlags.map((flag, index) => (
                          <RedFlagBadge key={index} text={flag} />
                        ))}
                        {redFlags.length === 0 && (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No red flags found yet. Analyze a document to see potential issues.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
                
                {/* Audio Controls */}
                <div className="border-t bg-muted/30 p-4" data-tutorial="audio-controls">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant={isPlaying ? "default" : "outline"}
                        onClick={togglePlayback}
                        disabled={isSynthesizing || !summary[0]?.description}
                        className="h-10 w-10"
                      >
                        {isSynthesizing ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="outline" className="h-10 w-10" disabled={true}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-10 w-10" disabled={true}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/upgrade')}
                      className="flex items-center gap-2"
                    >
                      <Award className="h-4 w-4" />
                      Upgrade for Premium Voices
                    </Button>
                  </div>
                  
                  <div className="mt-3">
                    <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`} 
                        style={{ width: isPlaying ? '100%' : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot 
        legalText={legalText}
        summary={summary}
        redFlags={redFlags}
        documentType={documentType}
      />
    </div>
  );
}