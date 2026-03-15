"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UrgencyBadge } from "./UrgencyBadge";
import { Badge } from "@/components/ui/badge";
import type { Call } from "@/types/index";

interface RecentCallsListProps {
  calls: Call[];
}

const outcomeColors: Record<string, string> = {
  appointment_booked: "bg-green-100 text-green-800",
  message_taken: "bg-blue-100 text-blue-800",
  info_provided: "bg-purple-100 text-purple-800",
  caller_hung_up: "bg-gray-100 text-gray-800",
  transferred: "bg-amber-100 text-amber-800",
};

const outcomeLabels: Record<string, string> = {
  appointment_booked: "Appointment Booked",
  message_taken: "Message Taken",
  info_provided: "Info Provided",
  caller_hung_up: "Caller Hung Up",
  transferred: "Transferred",
};

export function RecentCallsList({ calls }: RecentCallsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Caller Name</TableHead>
            <TableHead>Need</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No calls yet
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">
                  {formatDistanceToNow(new Date(call.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {call.caller_name || "Unknown Caller"}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {call.caller_need || "N/A"}
                </TableCell>
                <TableCell>
                  {call.urgency ? (
                    <UrgencyBadge urgency={call.urgency} />
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {call.call_outcome ? (
                    <Badge
                      variant="secondary"
                      className={outcomeColors[call.call_outcome] || ""}
                    >
                      {outcomeLabels[call.call_outcome] || call.call_outcome}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/calls/${call.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
