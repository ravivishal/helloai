"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Copy, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StepTestCallProps {
  phoneNumber: string;
  businessId: string;
}

type CallStatus = "idle" | "calling" | "connected" | "completed";

const CARRIER_INSTRUCTIONS = [
  {
    carrier: "AT&T",
    instruction: "Dial *21* followed by the number, then #",
    example: "*21*",
  },
  {
    carrier: "Verizon",
    instruction: "Dial *72 followed by the number",
    example: "*72",
  },
  {
    carrier: "T-Mobile",
    instruction: "Dial **21* followed by the number, then #",
    example: "**21*",
  },
];

export default function StepTestCall({ phoneNumber, businessId }: StepTestCallProps) {
  const [copied, setCopied] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [testCallError, setTestCallError] = useState<string | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleTestCall = async () => {
    setCallStatus("calling");
    setTestCallError(null);

    try {
      const response = await fetch(`/api/businesses/${businessId}/test-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initiate test call");
      }

      const data = await response.json();

      // Simulate call flow
      setCallStatus("connected");
      setTimeout(() => {
        setCallStatus("completed");
      }, 2000);
    } catch (error) {
      console.error("Error making test call:", error);
      setTestCallError("Failed to make test call. Please try again.");
      setCallStatus("idle");
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +15551234567 -> (555) 123-4567)
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const areaCode = cleaned.slice(1, 4);
      const prefix = cleaned.slice(4, 7);
      const line = cleaned.slice(7);
      return `(${areaCode}) ${prefix}-${line}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your AI Receptionist is Ready!</h2>
        <p className="text-muted-foreground">
          Set up call forwarding and test your new AI receptionist.
        </p>
      </div>

      {/* Provisioned Phone Number */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>Your AI Phone Number</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={formatPhoneNumber(phoneNumber)}
              readOnly
              className="text-2xl font-bold text-center bg-background"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call Forwarding Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Set Up Call Forwarding</CardTitle>
          <CardDescription>
            Forward your business line to your new AI receptionist number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose your carrier and follow the instructions:
          </p>

          {CARRIER_INSTRUCTIONS.map((carrier) => (
            <div key={carrier.carrier} className="p-4 border rounded-md space-y-2">
              <div className="font-semibold">{carrier.carrier}</div>
              <div className="text-sm text-muted-foreground">
                {carrier.instruction}
              </div>
              <div className="flex items-center space-x-2">
                <code className="px-3 py-1 bg-muted rounded text-sm font-mono">
                  {carrier.example}
                  {formatPhoneNumber(phoneNumber)}
                  {carrier.carrier !== "Verizon" && "#"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const code = `${carrier.example}${phoneNumber}${carrier.carrier !== "Verizon" ? "#" : ""}`;
                    navigator.clipboard.writeText(code);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <div className="p-4 bg-muted/50 rounded-md text-sm">
            <strong>Note:</strong> To disable call forwarding, dial *73 (Verizon) or ##21#
            (AT&T/T-Mobile) from your phone.
          </div>
        </CardContent>
      </Card>

      {/* Test Call Section */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Test Call</CardTitle>
          <CardDescription>
            Test your AI receptionist to ensure everything is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTestCall}
            disabled={callStatus !== "idle"}
            className="w-full"
            size="lg"
          >
            {callStatus === "idle" && (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Make a Test Call
              </>
            )}
            {callStatus === "calling" && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calling...
              </>
            )}
            {callStatus === "connected" && (
              <>
                <Phone className="w-4 h-4 mr-2 animate-pulse" />
                Connected
              </>
            )}
            {callStatus === "completed" && (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Test Call Completed
              </>
            )}
          </Button>

          {testCallError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {testCallError}
            </div>
          )}

          {callStatus === "completed" && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md text-sm text-green-800 dark:text-green-200">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Your AI receptionist is working perfectly! Check your dashboard to see the call
              details.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Link */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">You're All Set!</h3>
              <p className="text-muted-foreground">
                Your AI receptionist is ready to handle calls. Head to your dashboard to
                monitor calls and manage your settings.
              </p>
            </div>
            <Link href="/dashboard">
              <Button size="lg" className="mt-2">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
