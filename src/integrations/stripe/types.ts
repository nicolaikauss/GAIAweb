export interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}
