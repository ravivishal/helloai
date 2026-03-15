"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Business } from "@/types";
import { PLAN_PRICES, PLAN_LIMITS } from "@/lib/utils/constants";
import { toast } from "sonner";
import { Check, CreditCard, Zap } from "lucide-react";

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["5 calls/month", "SMS summaries", "Call transcripts"],
  starter: [
    "50 calls/month",
    "SMS + email summaries",
    "Call transcripts",
    "Custom greeting",
  ],
  pro: [
    "200 calls/month",
    "Everything in Starter",
    "Appointment booking",
    "Custom AI instructions",
    "Priority support",
  ],
};

export default function BillingPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/businesses");
        const businesses = await res.json();
        if (businesses.length > 0) setBusiness(businesses[0]);
      } catch (error) {
        console.error("Failed to load business:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpgrade = async (plan: "starter" | "pro") => {
    if (!business) return;
    setUpgrading(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, businessId: business.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Failed to start upgrade");
    } finally {
      setUpgrading(null);
    }
  };

  const handleManage = async () => {
    if (!business) return;
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) return null;

  const usagePercent =
    business.calls_limit > 0
      ? (business.calls_used_this_month / business.calls_limit) * 100
      : 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <TopBar title="Billing" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                <Badge
                  variant={
                    business.subscription_plan === "pro"
                      ? "default"
                      : "secondary"
                  }
                >
                  {business.subscription_plan.charAt(0).toUpperCase() +
                    business.subscription_plan.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription>
                ${PLAN_PRICES[business.subscription_plan]}/month
              </CardDescription>
            </div>
            {business.subscription_plan !== "free" && (
              <Button variant="outline" onClick={handleManage} className="gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Subscription
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Calls used this month
              </span>
              <span className="font-medium">
                {business.calls_used_this_month} / {business.calls_limit}
              </span>
            </div>
            <Progress value={usagePercent} className="h-3" />
            {usagePercent >= 80 && (
              <p className="text-sm text-amber-600">
                You&apos;re running low on calls. Consider upgrading your plan.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["free", "starter", "pro"] as const).map((plan) => {
          const isCurrent = business.subscription_plan === plan;
          const isPopular = plan === "starter";
          return (
            <Card
              key={plan}
              className={`relative ${isPopular ? "border-blue-600 border-2 shadow-lg" : ""} ${isCurrent ? "bg-blue-50" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    ${PLAN_PRICES[plan]}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500">
                  {PLAN_LIMITS[plan]} calls per month
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PLAN_FEATURES[plan].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : plan === "free" ? (
                  <Button variant="outline" disabled className="w-full">
                    Free Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={upgrading === plan}
                    className={`w-full gap-2 ${isPopular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    <Zap className="h-4 w-4" />
                    {upgrading === plan ? "Redirecting..." : `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
