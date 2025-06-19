import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, FileText, MessageCircle, Crown } from 'lucide-react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

const demoContent = {
  overview: `V.O.L.T transforms complex legal documents into clear, understandable summaries with AI-powered analysis. 
  
  Our advanced system uses machine learning trained on over 70,000 legal clauses to identify red flags, explain terms in plain English, and provide voice narration with multiple personality options.
  
  Whether you're reviewing a lease agreement, employment contract, or terms of service, V.O.L.T makes legal documents accessible to everyone.`,
  
  features: [
    {
      icon: Zap,
      title: "30-Second Analysis",
      description: "Lightning-fast document processing with real-time progress tracking"
    },
    {
      icon: AlertTriangle,
      title: "Red Flag Detection",
      description: "AI identifies concerning clauses and potential issues automatically"
    },
    {
      icon: FileText,
      title: "Plain English Summaries",
      description: "Complex legal jargon translated into understandable language"
    },
    {
      icon: MessageCircle,
      title: "Interactive Chat",
      description: "Ask follow-up questions about your document with V.O.L.T Assistant"
    },
    {
      icon: Crown,
      title: "Premium Voices",
      description: "Celebrity and character voices read your analysis aloud"
    }
  ]
};

const DemoContent = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Main Overview */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          See V.O.L.T in Action
        </h2>
        <p className="text-lg text-white/90 max-w-4xl mx-auto leading-relaxed">
          {demoContent.overview}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoContent.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl"
            onClick={() => window.location.href = '/summary'}
          >
            Try V.O.L.T Free
            <Zap className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10"
            onClick={() => window.location.href = '/upgrade'}
          >
            View Pricing
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>5 free analyses per month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Instant results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InteractiveDemo() {
  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.mp4"
      posterSrc="https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg"
      bgImageSrc="https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
      title="V.O.L.T Demo Experience"
      date="Interactive Preview"
      scrollToExpand="Scroll to Expand Demo"
      textBlend={true}
    >
      <DemoContent />
    </ScrollExpandMedia>
  );
}