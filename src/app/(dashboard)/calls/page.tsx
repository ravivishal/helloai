"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Call } from "@/types";
import { formatPhone } from "@/lib/utils/format-phone";
import { formatDuration } from "@/lib/utils/format-duration";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadCalls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (urgencyFilter !== "all") params.set("urgency", urgencyFilter);
      if (outcomeFilter !== "all") params.set("outcome", outcomeFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/calls?${params}`);
      const data = await res.json();
      setCalls(data.calls || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to load calls:", error);
    } finally {
      setLoading(false);
    }
  }, [page, urgencyFilter, outcomeFilter, startDate, endDate]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const outcomeLabel = (outcome: string | null) => {
    const labels: Record<string, string> = {
      appointment_booked: "Appointment",
      message_taken: "Message",
      info_provided: "Info Given",
      caller_hung_up: "Hung Up",
      transferred: "Transferred",
    };
    return outcome ? labels[outcome] || outcome : "N/A";
  };

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Calls" />

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Urgency</label>
          <Select value={urgencyFilter} onValueChange={(v) => { if (v) { setUrgencyFilter(v); setPage(1); } }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Outcome</label>
          <Select value={outcomeFilter} onValueChange={(v) => { if (v) { setOutcomeFilter(v); setPage(1); } }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="appointment_booked">Appointment</SelectItem>
              <SelectItem value="message_taken">Message</SelectItem>
              <SelectItem value="info_provided">Info Given</SelectItem>
              <SelectItem value="caller_hung_up">Hung Up</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-[160px]"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-[160px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No calls found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Need</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {call.caller_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {call.caller_phone ? formatPhone(call.caller_phone) : "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {call.caller_need || "N/A"}
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={call.urgency || "low"} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{outcomeLabel(call.call_outcome)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDuration(call.call_duration_seconds)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/calls/${call.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
