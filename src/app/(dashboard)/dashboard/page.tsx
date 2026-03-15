"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCallsList } from "@/components/dashboard/RecentCallsList";
import { CallsChart } from "@/components/dashboard/CallsChart";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Business, Call } from "@/types";
import { format, subDays, startOfDay } from "date-fns";

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const bizRes = await fetch("/api/businesses");
        const businesses = await bizRes.json();
        if (businesses.length > 0) {
          setBusiness(businesses[0]);
          const callsRes = await fetch("/api/calls?limit=50");
          const callsData = await callsRes.json();
          setCalls(callsData.calls || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!business || !business.setup_completed) {
    return (
      <div className="p-6">
        <TopBar title="Dashboard" />
        <EmptyState />
      </div>
    );
  }

  const today = startOfDay(new Date());
  const callsToday = calls.filter(
    (c) => startOfDay(new Date(c.created_at)).getTime() === today.getTime()
  ).length;

  const avgDuration =
    calls.length > 0
      ? Math.round(
          calls.reduce((sum, c) => sum + (c.call_duration_seconds || 0), 0) /
            calls.length
        )
      : 0;

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayStr = format(date, "MMM d");
    const count = calls.filter(
      (c) => format(new Date(c.created_at), "yyyy-MM-dd") === dateStr
    ).length;
    return { date: dayStr, calls: count };
  });

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Dashboard" />
      <StatsCards
        totalCalls={business.calls_used_this_month}
        callsToday={callsToday}
        avgDuration={avgDuration}
        callsRemaining={business.calls_limit - business.calls_used_this_month}
        callsLimit={business.calls_limit}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CallsChart data={chartData} />
        </div>
        <div>
          <RecentCallsList calls={calls.slice(0, 10)} />
        </div>
      </div>
    </div>
  );
}
