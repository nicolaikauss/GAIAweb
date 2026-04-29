"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";
import { StripeService } from "@/lib/stripe";
import stripePromise from "@/integrations/stripe/client";
import type { CreateCheckoutSessionParams } from "@/integrations/stripe/types";

interface PaymentFormProps {
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({
  priceId,
  price,
  currency,
  interval,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      onError?.("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const params: CreateCheckoutSessionParams = {
        priceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
        customerEmail: email,
        metadata: {
          customer_name: name,
          subscription_interval: interval,
        },
      };

      const session = await StripeService.createCheckoutSession(params);
      
      // Redirect to Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("No checkout URL returned from Stripe");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Payment error:", error);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Purchase
        </CardTitle>
        <CardDescription>
          Subscribe to Art<span className="bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">0</span> for {formatPrice(price, currency)}/{interval}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe for {formatPrice(price, currency)}/{interval}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
