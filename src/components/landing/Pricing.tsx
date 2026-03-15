import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for trying out the service",
      callLimit: "5 calls/month",
      features: [
        "AI call answering",
        "SMS summaries",
        "Call transcripts",
        "Basic analytics",
        "Email support",
      ],
      cta: "Get Started Free",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Starter",
      price: "999",
      description: "Great for small businesses",
      callLimit: "50 calls/month",
      features: [
        "Everything in Free",
        "Appointment booking",
        "Calendar integration",
        "Custom greetings",
        "Priority support",
        "Call recording",
      ],
      cta: "Get Started",
      href: "/sign-up",
      popular: true,
    },
    {
      name: "Pro",
      price: "1,999",
      description: "For growing businesses",
      callLimit: "200 calls/month",
      features: [
        "Everything in Starter",
        "Advanced AI customization",
        "Multiple phone numbers",
        "Team member access",
        "Analytics dashboard",
        "API access",
        "White-label option",
      ],
      cta: "Get Started",
      href: "/sign-up",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your business. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-blue-600 border-2 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">
                    ₹{plan.price}
                  </span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.callLimit}</p>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-8">
                <a href={plan.href} className="w-full">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 14-day money-back guarantee. No contracts, cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
