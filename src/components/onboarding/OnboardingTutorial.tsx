import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Typewriter } from '@/components/ui/typewriter';
import { 
  Upload, 
  Wand2, 
  AlertTriangle, 
  Play, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  Trophy,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOverlay?: boolean;
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Legalish! 🚀',
      description: 'Your AI-powered legal document analyzer',
      icon: Rocket,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/Logo-version-1.png" 
              alt="Legalish Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold">
            <Typewriter
              text={[
                "Ready to roast some legal terms? 👩‍⚖️🔥",
                "Time to decode legal gibberish! 📜✨",
                "Let's speedrun those contracts! ⚡🏃‍♂️"
              ]}
              speed={50}
              waitTime={2000}
              deleteSpeed={30}
              className="text-primary"
            />
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We'll walk you through how to analyze legal documents in seconds, not hours. 
            No law degree required!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Takes less than 2 minutes to learn</span>
          </div>
        </div>
      )
    },
    {
      id: 'upload',
      title: 'Step 1: Upload Your Document 📄',
      description: 'Three easy ways to get started',
      icon: Upload,
      targetElement: '[data-tutorial="upload-section"]',
      position: 'right',
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Choose your weapon of choice:"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Paste Text</p>
                <p className="text-sm text-muted-foreground">Copy & paste those sneaky terms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Upload className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Upload File</p>
                <p className="text-sm text-muted-foreground">PDF, DOC, TXT - we eat them all</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <img 
                src="/Logo-version-1.png" 
                alt="Legalish Logo" 
                className="h-5 w-5 object-contain"
              />
              <div>
                <p className="font-medium">Enter URL</p>
                <p className="text-sm text-muted-foreground">Direct link to terms of service</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center">
            💡 Pro tip: We support documents up to 2,800 characters
          </Badge>
        </div>
      )
    },
    {
      id: 'tone',
      title: 'Step 2: Pick Your Vibe 🎭',
      description: 'How should we roast these terms?',
      icon: Wand2,
      targetElement: '[data-tutorial="tone-selector"]',
      position: 'left',
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Choose your narrator personality:"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="font-medium text-blue-700">😐 Serious</p>
              <p className="text-xs text-blue-600">Professional & neutral</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <p className="font-medium text-orange-700">😏 Sarcastic</p>
              <p className="text-xs text-orange-600">Witty & questioning</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="font-medium text-purple-700">🤪 Meme</p>
              <p className="text-xs text-purple-600">Internet culture vibes</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="font-medium text-red-700">😈 Ominous</p>
              <p className="text-xs text-red-600">Dark & foreboding</p>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center">
            <Crown className="h-3 w-3 mr-1" />
            More voices available with Pro
          </Badge>
        </div>
      )
    },
    {
      id: 'analyze',
      title: 'Step 3: Let the Magic Happen ✨',
      description: 'AI analysis in under 30 seconds',
      icon: Sparkles,
      targetElement: '[data-tutorial="analyze-button"]',
      position: 'top',
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Watch the AI work its magic! 🪄"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/Logo-version-1.png" 
                  alt="Legalish Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="font-medium">AI Analysis Engine</p>
                <p className="text-sm text-muted-foreground">Powered by GPT-4 + 70k+ legal clauses</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting clauses...</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Detecting red flags...</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Generating summary...</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'results',
      title: 'Step 4: Review Your Results 📊',
      description: 'Summary + Red flags in plain English',
      icon: AlertTriangle,
      targetElement: '[data-tutorial="results-section"]',
      position: 'left',
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Two tabs of legal wisdom:"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700">Summary Tab</p>
                <p className="text-sm text-blue-600">
                  Main points explained like you're 5 years old
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Red Flags Tab</p>
                <p className="text-sm text-red-600">
                  The scary stuff you should know about
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center">
            🎯 We highlight the most concerning clauses
          </Badge>
        </div>
      )
    },
    {
      id: 'voice',
      title: 'Step 5: Premium AI Voices 🎧',
      description: 'AI voices read the summary aloud',
      icon: Play,
      targetElement: '[data-tutorial="audio-controls"]',
      position: 'top',
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Premium AI voices! 🎵"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">ElevenLabs Voice Synthesis</p>
                <p className="text-sm text-muted-foreground">Premium AI voices</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <p className="text-sm">Your chosen tone comes to life</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎭</span>
                <p className="text-sm">Multiple voice personalities</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <p className="text-sm">Instant audio generation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎪</span>
                <p className="text-sm">Celebrity voices (Pro only)</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <Crown className="h-3 w-3 mr-1 text-yellow-600" />
            <span className="text-yellow-700">Premium voices unlock with Pro subscription</span>
          </Badge>
        </div>
      )
    },
    {
      id: 'chatbot',
      title: 'Step 6: Meet your legal buddy! 🤖',
      description: 'Chat with Legalish Assistant about your document',
      icon: MessageCircle,
      showOverlay: true,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Meet your legal buddy! 🤖"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/Logo-version-1.png" 
                  alt="Legalish Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="font-medium">Legalish Assistant</p>
                <p className="text-sm text-muted-foreground">Context-aware legal chatbot</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <p>"What are my termination rights?"</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <p>"Explain the red flags you found"</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <p>"Are there any hidden costs?"</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <p>"Is this contract fair?"</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <MessageCircle className="h-3 w-3 mr-1 text-purple-600" />
            <span className="text-purple-700">Powered by the same AI that analyzed your document</span>
          </Badge>
        </div>
      )
    },
    {
      id: 'premium',
      title: 'Unlock Premium Features 👑',
      description: 'Take your legal analysis to the next level',
      icon: Crown,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <Typewriter
              text="Ready to level up? 🚀"
              speed={40}
              showCursor={false}
            />
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-700">Unlimited Analyses</p>
                <p className="text-sm text-yellow-600">No monthly limits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <Play className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-700">Premium Voices</p>
                <p className="text-sm text-purple-600">Celebrity & character voices</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-700">Advanced Analysis</p>
                <p className="text-sm text-blue-600">Deeper insights & comparisons</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
              💰 Starting at $10/month
            </Badge>
          </div>
        </div>
      )
    }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleted(true);
    
    // Save completion to user metadata
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }

    // Save to localStorage as backup
    localStorage.setItem('legalish_tutorial_completed', 'true');
    localStorage.setItem('legalish_tutorial_completed_at', new Date().toISOString());

    // Wait a moment for celebration, then complete
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleSkip = () => {
    localStorage.setItem('legalish_tutorial_skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  // Get the current step's icon component
  const CurrentIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      >
        {/* Tutorial Overlay */}
        {steps[currentStep]?.showOverlay && (
          <div className="absolute inset-0 bg-black/30" />
        )}

        {/* Tutorial Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg"
          >
            <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <CurrentIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
                        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSkip}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{currentStep + 1} of {totalSteps}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep].content}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index <= currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      {currentStep === totalSteps - 1 ? (
                        <>
                          Get Started
                          <Rocket className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Completion Celebration */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-60"
            >
              <Card className="border-2 border-green-500/50 shadow-2xl bg-background max-w-md mx-4">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Trophy className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      <Typewriter
                        text="You're Ready! 🎉"
                        speed={60}
                        showCursor={false}
                      />
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Time to analyze some legal documents and become a terms & conditions ninja!
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 py-2">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tutorial completed successfully
                      </Badge>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}