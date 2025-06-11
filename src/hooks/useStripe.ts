import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  mode: 'subscription' | 'payment';
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createCheckoutSession = async (request: CheckoutRequest): Promise<CheckoutResponse | null> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to continue with checkout.',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const defaultSuccessUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const defaultCancelUrl = `${window.location.origin}/upgrade`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: request.priceId,
          success_url: request.successUrl || defaultSuccessUrl,
          cancel_url: request.cancelUrl || defaultCancelUrl,
          mode: request.mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data: CheckoutResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout process',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redirectToCheckout = async (request: CheckoutRequest): Promise<void> => {
    const result = await createCheckoutSession(request);
    
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  const getSubscription = async (): Promise<SubscriptionData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  return {
    loading,
    createCheckoutSession,
    redirectToCheckout,
    getSubscription,
  };
}