"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { CallDetailView } from "@/components/dashboard/CallDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Call } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CallDetailPage() {
  const params = useParams();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCall() {
      try {
        const res = await fetch(`/api/calls/${params.callId}`);
        if (res.ok) {
          const data = await res.json();
          setCall(data);
        }
      } catch (error) {
        console.error("Failed to load call:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.callId) loadCall();
  }, [params.callId]);

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Call Details" />
      <Link href="/calls">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Calls
        </Button>
      </Link>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      ) : call ? (
        <CallDetailView call={call} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Call not found</p>
        </div>
      )}
    </div>
  );
}
