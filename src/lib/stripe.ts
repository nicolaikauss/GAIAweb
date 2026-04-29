import type { CreateCheckoutSessionParams, CheckoutSession } from '@/integrations/stripe/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class StripeService {
  /**
   * Create a Stripe checkout session
   */
  static async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create checkout session: ${error}`);
    }

    return response.json();
  }

  /**
   * Get available products and prices
   */
  static async getProducts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/stripe/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch products: ${error}`);
    }

    return response.json();
  }

  /**
   * Get customer portal session URL
   */
  static async getCustomerPortalUrl(customerId: string): Promise<{ url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/stripe/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create customer portal session: ${error}`);
    }

    return response.json();
  }
}
