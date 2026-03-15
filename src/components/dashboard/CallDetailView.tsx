"use client";

import { Phone, Mail, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UrgencyBadge } from "./UrgencyBadge";
import { TranscriptViewer } from "./TranscriptViewer";
import { formatPhone } from "@/lib/utils/format-phone";
import { formatDuration } from "@/lib/utils/format-duration";
import type { Call } from "@/types/index";
import { format } from "date-fns";

interface CallDetailViewProps {
  call: Call;
  onMarkAsReviewed?: () => void;
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

export function CallDetailView({ call, onMarkAsReviewed }: CallDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Call Summary</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(call.created_at), "PPpp")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {call.urgency && <UrgencyBadge urgency={call.urgency} />}
              {call.call_outcome && (
                <Badge
                  variant="secondary"
                  className={outcomeColors[call.call_outcome] || ""}
                >
                  {outcomeLabels[call.call_outcome] || call.call_outcome}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {call.call_summary && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Summary</h4>
              <p className="text-gray-700">{call.call_summary}</p>
            </div>
          )}

          {call.caller_need && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Caller Need</h4>
              <p className="text-gray-700">{call.caller_need}</p>
            </div>
          )}

          {call.call_duration_seconds && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Duration</h4>
              <p className="text-gray-700">
                {formatDuration(call.call_duration_seconds)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Caller Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Caller Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {call.caller_phone
                  ? formatPhone(call.caller_phone)
                  : "Not provided"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="h-4 w-4 flex items-center justify-center">
              <span className="text-gray-400 font-semibold">N</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {call.caller_name || "Not provided"}
              </p>
            </div>
          </div>

          {call.caller_email && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{call.caller_email}</p>
                </div>
              </div>
            </>
          )}

          {call.caller_address && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{call.caller_address}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Appointment Info */}
      {call.appointment_requested && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            {call.appointment_datetime ? (
              <p className="text-gray-700">
                {format(new Date(call.appointment_datetime), "PPpp")}
              </p>
            ) : (
              <p className="text-gray-500">No specific time provided</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {call.transcript && call.transcript.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Call Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <TranscriptViewer messages={call.transcript} />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {!call.owner_reviewed && onMarkAsReviewed && (
          <Button onClick={onMarkAsReviewed}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Reviewed
          </Button>
        )}
        {call.caller_phone && (
          <a href={`tel:${call.caller_phone}`}>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Call Back
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
