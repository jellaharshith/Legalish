import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { useLegalTerms } from '@/context/LegalTermsContext';
import { SplineBackground } from '@/components/ui/spline-background';
import { HeroScrollDemo } from '@/components/demo/HeroScrollDemo';

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
      title: "Lightning Fast",
      description: "Get comprehensive analysis in under 30 seconds"
    },
    {
      icon: Shield,
      title: "Red Flag Detection",
      description: "AI identifies concerning clauses automatically"
    },
    {
      icon: Clock,
      title: "Save Hours",
      description: "No more reading through endless legal jargon"
    },
    {
      icon: Users,
      title: "Trusted by 10K+",
      description: "Join thousands who've simplified their legal reading"
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
      {/* Hero Section with Scroll Animation */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Spline 3D Background */}
        <SplineBackground />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 pt-32 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-white/10 border-white/20 text-white backdrop-blur-sm">
                🚀 Trusted by 10,000+ users worldwide
              </Badge>
            </motion.div>
          </div>
          
          {/* Scroll Animation Component */}
          <HeroScrollDemo />
          
          {/* Action Buttons Below Animation */}
          <div className="container mx-auto px-4 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/summary')}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
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
                  <span>No credit card required</span>
                </div>
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
              Why choose V.O.L.T?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop wasting time on legal jargon. Get instant, accurate analysis with AI-powered insights.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/80 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
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
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl"
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