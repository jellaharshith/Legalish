import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, X, CreditCard, Zap, Share2, Headphones, Laugh, Loader2, ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { stripeProducts } from '@/stripe-config';
import { Pricing } from '@/components/ui/pricing';

export default function UpgradePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, redirectToCheckout, getSubscription } = useStripe();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const subscription = await getSubscription();
          setCurrentSubscription(subscription);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
      setSubscriptionLoading(false);
    };

    fetchSubscription();
  }, [user, getSubscription]);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your account.",
        variant: "destructive"
      });
      return;
    }

    const product = stripeProducts[0]; // V.O.L.T Pro
    
    try {
      await redirectToCheckout({
        priceId: product.priceId,
        mode: product.mode,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isSubscribed = currentSubscription?.subscription_status === 'active';

  const pricingPlans = [
    {
      name: "FREE",
      price: "0",
      yearlyPrice: "0",
      period: "forever",
      features: [
        "5 analyses per month",
        "Basic summaries & red flags",
        "2 voice options (Serious, Sarcastic)",
        "General document analysis",
        "Community support"
      ],
      description: "Perfect for getting started with legal document analysis",
      buttonText: isSubscribed ? "Current Plan" : "Get Started Free",
      href: "/summary",
      isPopular: false,
      onClick: () => navigate('/summary')
    },
    {
      name: "PRO",
      price: "9.99",
      yearlyPrice: "7.99",
      period: "month",
      features: [
        "Unlimited analyses",
        "Advanced summaries & red flags",
        "8 premium voice options",
        "Specialized contract analysis (Lease, Employment)",
        "Priority support",
        "Celebrity voices",
        "Side-by-side comparison",
        "Reddit meme sharing",
        "Advanced red flag detection",
        "Interactive chatbot assistant"
      ],
      description: "Everything you need for professional legal document analysis",
      buttonText: isSubscribed ? "Manage Subscription" : "Upgrade to Pro",
      href: "/upgrade",
      isPopular: true,
      onClick: isSubscribed ? () => navigate('/dashboard') : handlePurchase
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

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 border-primary/20">
              🚀 Upgrade to unlock premium features
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Supercharge your
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}legal analysis
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get unlimited access to premium features, celebrity voices, and advanced analysis tools.
            </p>
            
            {isSubscribed && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-4 py-2">
                ✓ Currently Subscribed to Pro
              </Badge>
            )}
          </div>
          
          {/* Advanced Pricing Component */}
          <Pricing
            plans={pricingPlans}
            title="Choose Your V.O.L.T Experience"
            description="From casual document reviews to professional legal analysis\nEvery plan includes our core AI-powered analysis engine"
            onPlanSelect={(plan) => {
              if (plan.onClick) {
                plan.onClick();
              }
            }}
          />
          
          {/* Benefits Section */}
          <div className="mt-20 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Why choose V.O.L.T Pro?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 h-full border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-card border-2 border-border rounded-xl p-8 mb-12">
            <h3 className="text-xl font-bold mb-6 text-center">What's Included</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Free Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">5 analyses per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic summaries & red flags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">2 voice options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">General document analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Pro Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Unlimited analyses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">8 premium voice options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Celebrity voices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Specialized contract analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Interactive chatbot assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">Advanced red flag detection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Not ready to upgrade? You can always start with our free plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/summary')}
                className="px-8 py-3"
              >
                Try Free Version
              </Button>
              <Button 
                onClick={() => navigate('/summary')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-3"
              >
                Start Analyzing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}