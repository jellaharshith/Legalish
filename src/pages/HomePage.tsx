import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Brain, FileSearch, Clock } from 'lucide-react';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { SplineBackground } from '@/components/ui/spline-background';
import { Typewriter } from '@/components/ui/typewriter';

export default function HomePage() {
  const navigate = useNavigate();
  const { setLegalText } = useLegalTerms();

  const handleStartDemo = () => {
    setLegalText(DEMO_TEXT);
    navigate('/summary');
  };

  const features = [
    {
      icon: Brain,
      title: "Analyze in a Flash",
      description: "Upload → Understand in seconds. Legalish delivers full analysis in under 30 seconds — no legal background needed.",
      emoji: "⚡"
    },
    {
      icon: FileSearch,
      title: "Catch the Red Flags",
      description: "AI that knows what to look for. Legalish identifies risky clauses like hidden fees or one-sided terms using red flag detection trained on real-world legal documents.",
      emoji: "🚩"
    },
    {
      icon: Brain,
      title: "Trained on 70,000+ Legal Clauses",
      description: "Expertise that scales. Our AI taps into a meticulously curated dataset of over 70,000 legal document excerpts, including lease agreements, employment contracts, and TOS. That's how it understands the nuance—and doesn't miss a beat.",
      emoji: "🧠"
    },
    {
      icon: Clock,
      title: "Save Hours of Reading",
      description: "Legal clarity without the scroll. No more decoding contracts line by line. Legalish turns dense documents into summaries and voice narration you'll actually understand.",
      emoji: "⏳"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Spline Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Spline 3D Background */}
        <SplineBackground />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
              Never read
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                {" "}legal terms{" "}
              </span>
              again
            </h1>
            
            <div className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              <p className="whitespace-pre-wrap">
                <span>{"Legalish uses AI to translate complex legal documents into plain English, highlighting red flags and saving you "}</span>
                <Typewriter
                  text={[
                    "hours of reading",
                    "expensive lawyer fees",
                    "confusing legal jargon",
                    "hidden contract traps",
                    "time and money"
                  ]}
                  speed={70}
                  className="text-primary font-semibold"
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar={"_"}
                />
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/summary')}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                Start Analyzing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleStartDemo}
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Try Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>30-second analysis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-2xl">⚖️</span> Why Choose Legalish?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Because nobody has time for legal jargon. Legalish breaks it down — fast, smart, and backed by real legal data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/80 backdrop-blur-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{feature.emoji}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4 px-3 py-1 text-sm bg-primary/10 border-primary/20">
                See it in action
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                From legal gibberish to 
                <span className="text-primary"> plain English</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Watch how Legalish transforms complex legal documents into easy-to-understand summaries, 
                complete with red flag detection and multiple voice options.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Instant analysis in under 30 seconds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Automatic red flag detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Multiple voice personalities</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <img 
                        src="/Logo-version-1.png" 
                        alt="Legalish Logo" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <p className="text-muted-foreground">Interactive Demo</p>
                  </div>
                </div>
                <Button 
                  onClick={handleStartDemo}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Try Demo Now
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Demo legal text for the "Try Demo" button
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

6. DATA COLLECTION
We collect and use your personal information as described in our Privacy Policy. By using our service, you consent to our data practices.

6. ARBITRATION AGREEMENT
All disputes will be resolved through binding arbitration. YOU WAIVE YOUR RIGHT TO A JURY TRIAL.

7. LIMITATION OF LIABILITY
Our liability is limited to the maximum extent permitted by law. We will not be liable for any indirect, incidental, special, consequential, or punitive damages.

8. CHANGES TO TERMS
We may modify these terms at any time. Your continued use of our service means you accept the changes.
`;