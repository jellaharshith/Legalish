import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, Clock, Users, Star, CheckCircle, AlertTriangle, Brain, FileSearch } from 'lucide-react';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { SplineBackground } from '@/components/ui/spline-background';
import { Typewriter } from '@/components/ui/typewriter';
import SectionWithMockup from '@/components/ui/section-with-mockup';

export default function HomePage() {
  const navigate = useNavigate();
  const { setLegalText } = useLegalTerms();

  const handleStartDemo = () => {
    setLegalText(DEMO_TEXT);
    navigate('/summary');
  };

  const features = [
    {
      icon: Zap,
      title: "Analyze in a Flash",
      description: "Upload → Understand in seconds. V.O.L.T delivers full analysis in under 30 seconds — no legal background needed.",
      emoji: "⚡"
    },
    {
      icon: AlertTriangle,
      title: "Catch the Red Flags",
      description: "AI that knows what to look for. V.O.L.T identifies risky clauses like hidden fees or one-sided terms using red flag detection trained on real-world legal documents.",
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
      description: "Legal clarity without the scroll. No more decoding contracts line by line. V.O.L.T turns dense documents into summaries and voice narration you'll actually understand.",
      emoji: "⏳"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      content: "V.O.L.T saved me hours on contract reviews. The red flag detection is incredibly accurate.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Freelancer",
      content: "Finally understand what I'm signing. The different voice tones make it actually enjoyable.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Small Business Owner",
      content: "Game changer for my business. No more expensive lawyer consultations for simple reviews.",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast Analysis",
      description: "Get results in under 30 seconds"
    },
    {
      icon: Shield,
      title: "Advanced Red Flag Detection",
      description: "AI identifies concerning clauses automatically"
    },
    {
      icon: Clock,
      title: "Save Hours of Reading",
      description: "No more endless legal jargon"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join 10,000+ satisfied users"
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
                <span>{"V.O.L.T uses AI to translate complex legal documents into plain English, highlighting red flags and saving you "}</span>
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

      {/* Why Choose V.O.L.T Section with SectionWithMockup */}
      <SectionWithMockup
        title={
          <>
            Why choose
            <br />
            <span className="text-primary">V.O.L.T?</span>
          </>
        }
        description={
          <>
            Because nobody has time for legal jargon. V.O.L.T breaks it down — fast, smart, and backed by real legal data.
            <br /><br />
            Get instant analysis with AI-powered red flag detection, multiple voice personalities, and plain-English summaries 
            that actually make sense. From terms of service to employment contracts, we've got you covered.
          </>
        }
        primaryImageSrc="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
        secondaryImageSrc="https://images.pexels.com/photos/8721342/pexels-photo-8721342.jpeg?auto=compress&cs=tinysrgb&w=800"
        reverseLayout={false}
      />

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
              <span className="text-2xl">⚖️</span> Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              V.O.L.T combines cutting-edge AI with legal expertise to deliver unmatched document analysis.
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
                Watch how V.O.L.T transforms complex legal documents into easy-to-understand summaries, 
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
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-primary" />
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

      {/* Testimonials */}
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
              Loved by thousands
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users are saying about V.O.L.T
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to simplify your legal reading?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who've already saved hours with V.O.L.T. 
              Start analyzing your legal documents today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/summary')}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/upgrade')}
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2"
              >
                View Pricing
              </Button>
            </div>
          </motion.div>
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

6. ARBITRATION AGREEMENT
All disputes will be resolved through binding arbitration. YOU WAIVE YOUR RIGHT TO A JURY TRIAL.

7. LIMITATION OF LIABILITY
Our liability is limited to the maximum extent permitted by law. We will not be liable for any indirect, incidental, special, consequential, or punitive damages.

8. CHANGES TO TERMS
We may modify these terms at any time. Your continued use of our service means you accept the changes.
`;