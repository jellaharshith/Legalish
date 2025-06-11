import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStripe } from '@/hooks/useStripe';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSubscription } = useStripe();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!sessionId) {
      navigate('/upgrade');
      return;
    }

    const fetchSubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionData = await getSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, sessionId, navigate, getSubscription]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card className="border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,_197,_94,_0.3)]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Welcome to V.O.L.T Pro! Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Subscription Details</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Status: <span className="text-green-500 font-medium capitalize">{subscription.subscription_status}</span></p>
                  {subscription.current_period_end && (
                    <p>Next billing: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}</p>
                  )}
                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <p>Payment method: {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/summary')} 
                className="w-full"
              >
                Start Analyzing Terms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}