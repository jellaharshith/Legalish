import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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

  const features = [
    {
      id: 'celebrities',
      name: 'Celebrity Voices',
      description: 'Famous voices read your legal terms',
      icon: Headphones,
      free: false,
      pro: true
    },
    {
      id: 'compare',
      name: 'Side-by-Side Comparison',
      description: 'See original text next to the translation',
      icon: Zap,
      free: false,
      pro: true
    },
    {
      id: 'reddit',
      name: 'Reddit Meme Share',
      description: 'Share ridiculous terms as Reddit-ready memes',
      icon: Share2,
      free: false,
      pro: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited Analyses',
      description: 'No monthly limits on terms you can analyze',
      icon: Laugh,
      free: false,
      pro: true
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
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Yearly
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-muted relative overflow-hidden shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  {!isSubscribed && (
                    <Badge variant="outline" className="bg-muted/50">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="mb-6">
                  <p className="text-4xl font-bold">$0</p>
                  <p className="text-muted-foreground">Forever free</p>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>5 analyses per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>Basic summaries & red flags</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>2 voice options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>General document analysis</span>
                  </li>
                  {features.map(feature => (
                    <li key={feature.id} className="flex items-start gap-3 text-muted-foreground">
                      <X className="text-muted-foreground/50 mt-1 flex-shrink-0" size={18} />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => navigate('/summary')}
                >
                  {!isSubscribed ? 'Current Plan' : 'Use Free Features'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className={`border-2 relative overflow-hidden shadow-xl ${
              isSubscribed ? 'border-green-500/50 bg-green-500/5' : 'border-primary bg-primary/5'
            }`}>
              <div className="absolute top-0 right-0 w-20 h-20">
                <div className={`absolute transform rotate-45 text-xs font-bold text-center py-1 right-[-40px] top-[22px] w-[170px] ${
                  isSubscribed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {isSubscribed ? 'ACTIVE' : 'POPULAR'}
                </div>
              </div>
              
              <CardHeader className="pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                </div>
                <CardDescription className="text-base">Everything you need for professional use</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="mb-6">
                  <p className="text-4xl font-bold">
                    ${billingCycle === 'monthly' ? '9.99' : '7.99'}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'month' : 'month'}
                    </span>
                  </p>
                  {billingCycle === 'yearly' && (
                    <p className="text-muted-foreground">
                      Billed annually ($95.88/year)
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span className="font-medium">Unlimited analyses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>Advanced summaries & red flags</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>8 premium voice options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>Specialized contract analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                    <span>Priority support</span>
                  </li>
                  {features.map(feature => (
                    <li key={feature.id} className="flex items-start gap-3">
                      <Check className="text-green-500 mt-1 flex-shrink-0" size={18} />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isSubscribed ? (
                  <Button 
                    variant="outline"
                    className="w-full h-12 border-green-500 text-green-500 hover:bg-green-500/10"
                    onClick={() => navigate('/dashboard')}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold"
                    onClick={handlePurchase}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Upgrade to Pro
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-16">
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

          {/* Feature Toggles */}
          <div className="bg-card border-2 border-border rounded-xl p-8 mb-12">
            <h3 className="text-xl font-bold mb-6 text-center">Pro Features in Detail</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map(feature => (
                <div 
                  key={feature.id}
                  className="flex items-center p-4 border border-border rounded-lg bg-background/50"
                >
                  <feature.icon className="text-primary mr-4 flex-shrink-0" size={24} />
                  <div className="flex-grow">
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch disabled checked={true} id={feature.id} />
                </div>
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