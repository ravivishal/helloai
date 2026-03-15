"use client";

import { Phone, PhoneIncoming, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsCardsProps {
  totalCalls: number;
  callsToday: number;
  avgDuration: number;
  callsRemaining: number;
  callsLimit: number;
}

export function StatsCards({
  totalCalls,
  callsToday,
  avgDuration,
  callsRemaining,
  callsLimit,
}: StatsCardsProps) {
  const usagePercentage = ((callsLimit - callsRemaining) / callsLimit) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Calls This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Calls This Month
          </CardTitle>
          <Phone className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalls}</div>
        </CardContent>
      </Card>

      {/* Calls Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
          <PhoneIncoming className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{callsToday}</div>
        </CardContent>
      </Card>

      {/* Avg Call Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Call Duration
          </CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
          </div>
        </CardContent>
      </Card>

      {/* Calls Remaining */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Calls Remaining
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {callsRemaining} / {callsLimit}
          </div>
          <Progress value={usagePercentage} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
