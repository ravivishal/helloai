"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  businesses: {
    id: string;
    business_name: string;
    twilio_phone_number: string | null;
    subscription_plan: string;
    is_active: boolean;
  }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [myRole, setMyRole] = useState<UserRole>("admin");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((me) => { if (me.role) setMyRole(me.role); })
      .catch(() => {});
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setEditRole(user.role);
    setEditName(user.full_name || "");
    setEditPhone(user.phone || "");
  }

  async function saveUser() {
    if (!editingUser) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          full_name: editName,
          phone: editPhone,
        }),
      });

      if (res.ok) {
        setEditingUser(null);
        loadUsers();
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      setSaveError("Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  const roleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      user: "bg-gray-100 text-gray-800",
      admin: "bg-blue-100 text-blue-800",
      superadmin: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[role]}>{role}</Badge>;
  };

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
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">{users.length} total users</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {user.full_name || "No name"}
                    </span>
                    {roleBadge(user.role)}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {user.businesses.length} business{user.businesses.length !== 1 ? "es" : ""}
                    </p>
                    {user.businesses.map((b) => (
                      <p key={b.id} className="text-muted-foreground text-xs">
                        {b.business_name} ({b.subscription_plan})
                      </p>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email</Label>
              <Input value={editingUser?.email || ""} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {myRole === "superadmin" && (
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {myRole !== "superadmin" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Only a Super Admin can promote users to Super Admin.
                </p>
              )}
            </div>
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveUser} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
