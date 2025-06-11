import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, MessageSquare, Zap, Award } from 'lucide-react';

export default function FeatureList() {
  const features = [
    {
      icon: Zap,
      title: 'Super Fast',
      description: 'Get a summary in seconds, not hours',
      color: 'text-blue-500'
    },
    {
      icon: AlertTriangle,
      title: 'Red Flag Detection',
      description: 'We highlight the scary parts',
      color: 'text-red-500'
    },
    {
      icon: MessageSquare,
      title: 'Easy to Understand',
      description: 'Legal jargon translated to human speak',
      color: 'text-green-500'
    },
    {
      icon: Award,
      title: 'Premium Voices',
      description: 'Celebrity voices read terms to you',
      color: 'text-yellow-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="py-16"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 border-muted hover:border-primary/50 transition-colors group">
            <CardContent className="pt-6">
              <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors">
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}