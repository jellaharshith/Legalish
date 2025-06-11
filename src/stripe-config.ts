export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RXAXqJIz8cwPcMUHUZxcJ1o',
    name: 'V.O.L.T Pro',
    description: 'Premium legal term analysis with unlimited features and celebrity voices',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};