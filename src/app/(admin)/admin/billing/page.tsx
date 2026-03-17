"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Users } from "lucide-react";

interface AdminBusiness {
  id: string;
  business_name: string;
  owner_name: string;
  subscription_plan: string;
  subscription_status: string;
  calls_used_this_month: number;
  calls_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_cycle_start: string;
  users: { id: string; email: string; full_name: string | null };
}

export default function AdminBillingPage() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((res) => res.json())
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const planCounts = businesses.reduce<Record<string, number>>((acc, b) => {
    acc[b.subscription_plan] = (acc[b.subscription_plan] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = businesses.reduce<Record<string, number>>((acc, b) => {
    acc[b.subscription_status] = (acc[b.subscription_status] || 0) + 1;
    return acc;
  }, {});

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800",
    starter: "bg-blue-100 text-blue-800",
    pro: "bg-purple-100 text-purple-800",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    past_due: "bg-yellow-100 text-yellow-800",
    canceled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Overview of all subscription plans and billing status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(planCounts).map(([plan, count]) => (
          <Card key={plan}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground capitalize">{plan} Plan</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
              <div className={`p-2 rounded-lg ${planColors[plan] || "bg-gray-100"}`}>
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Summary */}
      <div className="flex gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Badge key={status} className={statusColors[status] || "bg-gray-100 text-gray-800"}>
            {status}: {count}
          </Badge>
        ))}
      </div>

      {/* All Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>{businesses.length} businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{biz.business_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {biz.owner_name} &mdash; {biz.users?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="text-right">
                    <p>
                      Calls: {biz.calls_used_this_month}/{biz.calls_limit}
                    </p>
                    {biz.stripe_subscription_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {biz.stripe_subscription_id.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                  <Badge className={planColors[biz.subscription_plan]}>
                    {biz.subscription_plan}
                  </Badge>
                  <Badge className={statusColors[biz.subscription_status]}>
                    {biz.subscription_status}
                  </Badge>
                </div>
              </div>
            ))}

            {businesses.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No businesses found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
