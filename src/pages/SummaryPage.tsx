import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpeedrunTimer from '@/components/shared/SpeedrunTimer';
import { Play, Pause, SkipForward, Volume2, MessageSquareWarning, Award, Link as LinkIcon, Upload, Loader2, Wand2, FileText, Home, Briefcase, Zap, AlertTriangle } from 'lucide-react';
import RedFlagBadge from '@/components/summary/RedFlagBadge';
import SummaryHighlights from '@/components/summary/SummaryHighlights';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import { z } from 'zod';
import { AnalysisService } from '@/services/analysisService';
import { supabase } from '@/lib/supabase';

// Validation schemas
const urlSchema = z.string().url().max(2048);
const textSchema = z.string().min(10).max(7500);
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
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
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

  useEffect(() => {
    let interval: number;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10) as unknown as number;
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning]);

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
          text: text.length < 10 ? 'Text is too short' : 'Text is too long (max 7,500 characters)'
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
      
      if (text.length > 7500) {
        text = text.substring(0, 7500);
        toast({
          title: "File content truncated",
          description: "File content was truncated to 7,500 characters to fit within analysis limits",
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

    setIsTimerRunning(true);
    setTime(0);

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
          description: `Found ${result.data?.red_flags.length || 0} red flags in ${((result.data?.processing_time_ms || 0) / 1000).toFixed(2)}s`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the terms. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsTimerRunning(false);
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

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return FileText;
      case 'lease':
        return Home;
      case 'employment':
        return Briefcase;
      default:
        return FileText;
    }
  };

  const getDocumentTypeDescription = (type: string) => {
    switch (type) {
      case 'general':
        return 'Standard legal document analysis';
      case 'lease':
        return 'Specialized for rental agreements and lease contracts';
      case 'employment':
        return 'Optimized for job contracts and employment terms';
      default:
        return 'Standard legal document analysis';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header - Made smaller */}
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
            Upload your legal document and get instant analysis with red flag detection
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Document Type Selection */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Document Type</h3>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={documentType} onValueChange={(value) => setDocumentType(value as any)}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center gap-3 py-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">General</div>
                          <div className="text-xs text-muted-foreground">Standard legal document analysis</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="lease">
                      <div className="flex items-center gap-3 py-2">
                        <Home className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Lease Contract</div>
                          <div className="text-xs text-muted-foreground">Specialized for rental agreements</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="employment">
                      <div className="flex items-center gap-3 py-2">
                        <Briefcase className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Employment Contract</div>
                          <div className="text-xs text-muted-foreground">Optimized for job contracts</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {getDocumentTypeDescription(documentType)}
                </p>
              </CardContent>
            </Card>

            {/* Input Methods */}
            <Card className="border-2 border-muted shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Input Document</h3>
                  </div>
                  <SpeedrunTimer isRunning={isTimerRunning} time={time} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-base font-medium">Paste Text</Label>
                  <Textarea 
                    id="text"
                    value={legalText}
                    onChange={handleTextChange}
                    placeholder="Paste your legal document text here..."
                    className={`min-h-[200px] resize-none font-mono text-sm ${
                      validationErrors.text ? 'border-destructive' : ''
                    }`}
                  />
                  {validationErrors.text && (
                    <p className="text-sm text-destructive">{validationErrors.text}</p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{legalText.length}/7,500 characters</span>
                    <Badge variant="outline" className="text-xs">
                      {legalText.length > 0 ? 'Text ready' : 'Enter text'}
                    </Badge>
                  </div>
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base font-medium flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Or enter URL
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={urlInput}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/terms-of-service"
                    className={`h-12 ${validationErrors.url ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.url && (
                    <p className="text-sm text-destructive">{validationErrors.url}</p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-base font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Or upload document
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.doc,.docx,.pdf,.rtf"
                    className={`h-12 cursor-pointer ${validationErrors.file ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.file && (
                    <p className="text-sm text-destructive">{validationErrors.file}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported: TXT, DOC, DOCX, PDF, RTF (max 20MB)
                  </p>
                </div>

                {/* Analyze Button */}
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || hasValidationErrors() || !hasValidInput()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Analyze Document
                    </>
                  )}
                </Button>
                
                {!hasValidInput() && !isAnalyzing && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please provide text, URL, or file to analyze
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
            <Card className="border-2 border-muted shadow-lg h-fit">
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
                      <Select value={tone} onValueChange={(value) => setTone(value as any)}>
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
                      
                      <Badge variant={isTimerRunning ? "destructive" : "secondary"} className="px-3 py-1">
                        {isTimerRunning ? 'ANALYZING' : 'READY'}
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
                <div className="border-t bg-muted/30 p-4">
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
    </div>
  );
}