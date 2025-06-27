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

    const product = stripeProducts[0]; // Legalish Pro
    
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
      period: "forever",
      description: "Perfect for getting started with legal document analysis",
      features: [
        "Up to 10 analyses per month",
        "Basic summaries & red flag highlights",
        "2 voice styles",
        "General document analysis",
        "Community support",
        "Access to interactive legal chatbot"
      ],
      buttonText: "Get Started Free",
      href: "/summary",
      isPopular: false,
      onClick: () => navigate('/summary')
    },
    {
      name: "PRO",
      price: "10",
      period: "month",
      description: "Everything you need for professional legal document analysis",
      features: [
        "Unlimited legal document analyses",
        "Advanced summaries with detailed red flag detection",
        "8 premium voice tones",
        "Specialized contract analysis (e.g., Lease, Employment, IP)",
        "Interactive chatbot assistant with follow-up capabilities",
        "Deeper risk detection & clause breakdowns"
      ],
      buttonText: isSubscribed ? "Current Plan" : "Upgrade to Pro",
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
          
          {/* Pricing Plans */}
          <div className="flex justify-center mb-20">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`h-full border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.isPopular 
                      ? 'border-primary shadow-lg bg-gradient-to-br from-primary/5 to-purple-600/5' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                      </div>
                      <CardDescription className="mt-4 text-base">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                    
                    <CardFooter className="pt-8">
                      <Button
                        onClick={plan.onClick}
                        disabled={loading && plan.name === 'PRO'}
                        className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white'
                            : 'bg-background border-2 border-primary text-primary hover:bg-primary hover:text-white'
                        }`}
                        variant={plan.isPopular ? "default" : "outline"}
                      >
                        {loading && plan.name === 'PRO' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mt-20 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Why choose Legalish Pro?</h3>
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