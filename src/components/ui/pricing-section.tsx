"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CheckoutButton } from "@/components/ui/checkout-button"

interface Feature {
  name: string
  description: string
  included: boolean
}

interface PricingTier {
  name: string
  price: {
    monthly: number
    yearly: number
  }
  priceId: {
    monthly: string
    yearly: string
  }
  description: string
  features: Feature[]
  highlight?: boolean
  badge?: string
  icon: React.ReactNode
}

interface PricingSectionProps {
  tiers: PricingTier[]
  className?: string
}

function PricingSection({ tiers, className }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false)

  const buttonStyles = {
    default: cn(
      "h-12 bg-white/80 dark:bg-zinc-800/80",
      "hover:bg-white dark:hover:bg-zinc-800",
      "text-black dark:text-white",
      "border border-gray-200 dark:border-zinc-700",
      "hover:border-gray-300 dark:hover:border-zinc-600",
      "shadow-sm hover:shadow-md",
      "text-sm font-medium",
    ),
    highlight: cn(
      "h-12 bg-black dark:bg-white",
      "hover:bg-gray-800 dark:hover:bg-gray-200",
      "text-white dark:text-black",
      "shadow-[0_1px_15px_rgba(0,0,0,0.1)]",
      "hover:shadow-[0_1px_20px_rgba(0,0,0,0.15)]",
      "font-semibold text-base",
    ),
  }

  const badgeStyles = cn(
    "px-4 py-1.5 text-sm font-medium",
    "bg-black dark:bg-white",
    "text-white dark:text-black",
    "border-none shadow-lg",
  )

  return (
    <section
      className={cn(
        "relative text-black dark:text-white",
        "py-12 px-4 md:py-24 lg:py-32",
        "overflow-hidden",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-black dark:text-white">
            Simple, transparent pricing
          </h2>
          <div className="inline-flex items-center p-1.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm">
            {["Monthly", "Yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setIsYearly(period === "Yearly")}
                className={cn(
                  "px-8 py-2.5 text-sm font-medium rounded-full transition-all duration-300",
                  (period === "Yearly") === isYearly
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white",
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(
          "grid gap-8",
          isYearly ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 md:grid-cols-2"
        )}>
          {tiers.filter(tier => !isYearly || tier.name === "Annual").map((tier) => (
            <div
              key={tier.name}
                className={cn(
                  "relative group backdrop-blur-sm",
                  "rounded-3xl transition-all duration-300",
                  "flex flex-col",
                  tier.highlight
                    ? "bg-white/90 dark:bg-zinc-800/90"
                    : "bg-white/80 dark:bg-zinc-800/80",
                  "border",
                  tier.highlight
                    ? "border-gray-300 dark:border-zinc-600 shadow-xl"
                    : "border-gray-200 dark:border-zinc-700 shadow-md",
                  "hover:translate-y-0 hover:shadow-lg",
                )}
            >
              {tier.badge && tier.highlight && (
                <div className="absolute -top-4 left-6">
                  <Badge className={badgeStyles}>{tier.badge}</Badge>
                </div>
              )}

              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      tier.highlight
                        ? "bg-primary/10 text-primary"
                        : "bg-accent text-muted-foreground",
                    )}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    {tier.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-black dark:text-white">
                      €{isYearly ? tier.price.yearly : tier.price.monthly}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                  {isYearly && tier.price.yearly < tier.price.monthly * 12 && (
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Save €{tier.price.monthly * 12 - tier.price.yearly} per year
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex gap-4">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full transition-colors duration-200",
                          feature.included
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500",
                        )}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black dark:text-white">
                          {feature.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <CheckoutButton
                  priceId={isYearly ? tier.priceId.yearly : tier.priceId.monthly}
                  className={cn(
                    "w-full relative transition-all duration-300",
                    tier.highlight
                      ? buttonStyles.highlight
                      : buttonStyles.default,
                  )}
                  successUrl={`${window.location.origin}/success`}
                  cancelUrl={`${window.location.origin}/pricing`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {tier.highlight ? "Get Started" : "Get Started"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </CheckoutButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
