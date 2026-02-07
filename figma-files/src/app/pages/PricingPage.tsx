import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Sparkles, Check, Zap } from "lucide-react";

export function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "For smaller dealerships",
      gradient: "from-blue-400 to-blue-600",
      features: [
        "Up to 50 vehicles",
        "1 ad account",
        "Basic templates",
        "Email support"
      ]
    },
    {
      name: "Professional",
      price: "$199",
      period: "/month",
      description: "For growing businesses",
      featured: true,
      gradient: "from-indigo-500 to-purple-600",
      features: [
        "Up to 200 vehicles",
        "3 ad accounts",
        "All templates",
        "Priority support",
        "Custom templates"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Unlimited vehicles",
        "Unlimited ad accounts",
        "Dedicated success manager",
        "Custom integration",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Agentic Ads</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link to="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            14-day free trial
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6 max-w-3xl">
            Simple, transparent pricing
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl">
            Choose the plan that fits your business. No contract commitment.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <Card 
              key={idx} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${ 
                plan.featured ? "border-2 border-indigo-300 shadow-lg scale-105" : "border-2 border-gray-200"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600" />
              )}
              
              <CardContent className="p-8">
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold mb-4">
                    <Sparkles className="h-3 w-3" />
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-600">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-100">
                        <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup" className="block">
                  <Button 
                    className={`w-full rounded-lg ${
                      plan.featured 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700" 
                        : "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time."
              },
              {
                q: "What happens at vehicle limit?",
                a: "We'll notify you when approaching the limit. Upgrade for more."
              },
              {
                q: "Is there a contract?",
                a: "No, all plans are month-to-month and can be cancelled anytime."
              },
              {
                q: "Is ad spend included?",
                a: "No, you pay Meta, TikTok, and LinkedIn directly for ad spend."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-16 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to automate your ads?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Try free for 14 days • No credit card required
          </p>
          <Link to="/signup">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 rounded-lg px-8 py-6 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}