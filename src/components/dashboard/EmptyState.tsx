"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-blue-50 p-6 mb-4">
          <Phone className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Your AI receptionist is ready!
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Set up call forwarding to your hello.ai number to start receiving
          intelligent call summaries and never miss another opportunity.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Forward calls to your AI receptionist:
          </p>
          <div className="bg-gray-50 px-4 py-3 rounded-lg border">
            <p className="font-mono text-lg font-semibold">
              Your forwarding number will appear here
            </p>
          </div>
          <Link href="/settings">
            <Button>Go to Settings</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
