"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Phone, Plus, ArrowRight } from "lucide-react";

interface AssignedNumber {
  id: string;
  business_name: string;
  twilio_phone_number: string;
  twilio_phone_sid: string;
  is_active: boolean;
  subscription_plan: string;
  users: { id: string; email: string; full_name: string | null };
}

interface UnassignedNumber {
  phoneNumber: string;
  sid: string;
  friendlyName: string;
}

interface TwilioData {
  assigned: AssignedNumber[];
  unassigned: UnassignedNumber[];
  total_twilio: number;
}

export default function AdminTwilioPage() {
  const [data, setData] = useState<TwilioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyAreaCode, setBuyAreaCode] = useState("");
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignNumber, setAssignNumber] = useState<UnassignedNumber | null>(null);
  const [businesses, setBusinesses] = useState<{ id: string; business_name: string }[]>([]);
  const [assignBusinessId, setAssignBusinessId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/twilio/numbers");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to load twilio data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyNumber() {
    setBuying(true);
    setBuyError(null);
    try {
      const res = await fetch("/api/admin/twilio/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area_code: buyAreaCode || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to buy number");
      }

      setBuyDialogOpen(false);
      setBuyAreaCode("");
      loadData();
    } catch (error) {
      setBuyError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setBuying(false);
    }
  }

  async function openAssignDialog(number: UnassignedNumber) {
    setAssignNumber(number);
    setAssignDialogOpen(true);
    setAssignBusinessId("");

    // Load businesses to pick from
    try {
      const res = await fetch("/api/admin/businesses");
      const data = await res.json();
      setBusinesses(data);
    } catch {
      setBusinesses([]);
    }
  }

  async function handleAssign() {
    if (!assignNumber || !assignBusinessId) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/twilio/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: assignBusinessId,
          phone_number: assignNumber.phoneNumber,
          phone_sid: assignNumber.sid,
        }),
      });

      if (res.ok) {
        setAssignDialogOpen(false);
        loadData();
      }
    } catch (error) {
      console.error("Failed to assign number:", error);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Twilio Numbers</h1>
          <p className="text-muted-foreground">
            {data?.total_twilio ?? 0} numbers in Twilio account |{" "}
            {data?.assigned.length ?? 0} assigned |{" "}
            {data?.unassigned.length ?? 0} unassigned
          </p>
        </div>
        <Button onClick={() => setBuyDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Buy Number
        </Button>
      </div>

      {/* Assigned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Numbers</CardTitle>
          <CardDescription>Numbers currently assigned to businesses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.assigned.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-mono font-semibold">{item.twilio_phone_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.business_name} &mdash; {item.users?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.subscription_plan}</Badge>
                <Badge
                  className={
                    item.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
          {data?.assigned.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No numbers assigned yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Numbers</CardTitle>
          <CardDescription>
            Numbers in your Twilio account not assigned to any business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.unassigned.map((num) => (
            <div
              key={num.sid}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-mono font-semibold">{num.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground">{num.friendlyName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAssignDialog(num)}
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Assign
              </Button>
            </div>
          ))}
          {data?.unassigned.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              All numbers are assigned.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Buy Number Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy a New Twilio Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Area Code (optional)</Label>
              <Input
                placeholder="e.g. 415"
                value={buyAreaCode}
                onChange={(e) => setBuyAreaCode(e.target.value)}
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank for any available US number
              </p>
            </div>
            {buyError && (
              <p className="text-sm text-destructive">{buyError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuyNumber} disabled={buying}>
              {buying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Buy Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Number Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {assignNumber?.phoneNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Business</Label>
              <Select value={assignBusinessId} onValueChange={setAssignBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a business..." />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((biz) => (
                    <SelectItem key={biz.id} value={biz.id}>
                      {biz.business_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assigning || !assignBusinessId}
            >
              {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
