"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StripeService } from "@/lib/stripe";
import stripePromise from "@/integrations/stripe/client";
import type { CreateCheckoutSessionParams } from "@/integrations/stripe/types";

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export function CheckoutButton({
  priceId,
  children,
  className,
  successUrl = `${window.location.origin}/success`,
  cancelUrl = `${window.location.origin}/pricing`,
  customerEmail,
  metadata,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const params: CreateCheckoutSessionParams = {
        priceId,
        successUrl,
        cancelUrl,
        customerEmail,
        metadata,
      };

      const session = await StripeService.createCheckoutSession(params);
      
      // Redirect to Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("No checkout URL returned from Stripe");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
