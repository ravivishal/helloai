"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Phone } from "lucide-react";

interface BusinessOwner {
  id: string;
  email: string;
  full_name: string | null;
}

interface AdminBusiness {
  id: string;
  business_name: string;
  business_category: string;
  owner_name: string;
  owner_phone: string;
  twilio_phone_number: string | null;
  subscription_plan: string;
  subscription_status: string;
  calls_used_this_month: number;
  calls_limit: number;
  is_active: boolean;
  setup_completed: boolean;
  created_at: string;
  users: BusinessOwner;
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminBusiness | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCallsLimit, setEditCallsLimit] = useState(0);
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const res = await fetch("/api/admin/businesses");
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Failed to load businesses:", error);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(biz: AdminBusiness) {
    setEditing(biz);
    setEditPlan(biz.subscription_plan);
    setEditStatus(biz.subscription_status);
    setEditCallsLimit(biz.calls_limit);
    setEditActive(biz.is_active);
  }

  async function saveBusiness() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/businesses/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_plan: editPlan,
          subscription_status: editStatus,
          calls_limit: editCallsLimit,
          is_active: editActive,
        }),
      });

      if (res.ok) {
        setEditing(null);
        loadBusinesses();
      }
    } catch (error) {
      console.error("Failed to save business:", error);
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Businesses</h1>
        <p className="text-muted-foreground">{businesses.length} total businesses</p>
      </div>

      <div className="space-y-3">
        {businesses.map((biz) => (
          <Card key={biz.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{biz.business_name}</span>
                    <Badge variant="outline">{biz.business_category}</Badge>
                    <Badge
                      className={
                        biz.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {biz.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Owner: {biz.owner_name} ({biz.users?.email})
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {biz.twilio_phone_number && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {biz.twilio_phone_number}
                      </span>
                    )}
                    <span>
                      Plan: <strong>{biz.subscription_plan}</strong>
                    </span>
                    <span>
                      Calls: {biz.calls_used_this_month}/{biz.calls_limit}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => openEdit(biz)}>
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {businesses.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No businesses found.
          </p>
        )}
      </div>

      {/* Edit Business Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business: {editing?.business_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Subscription Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subscription Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Calls Limit</Label>
              <Input
                type="number"
                value={editCallsLimit}
                onChange={(e) => setEditCallsLimit(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={editActive} onCheckedChange={setEditActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveBusiness} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
