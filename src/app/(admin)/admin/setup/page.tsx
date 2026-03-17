"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSuperadmin, setHasSuperadmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; full_name: string | null } | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const [setupRes, meRes] = await Promise.all([
          fetch("/api/admin/setup"),
          fetch("/api/auth/me"),
        ]);
        const setupData = await setupRes.json();
        const meData = await meRes.json();

        setHasSuperadmin(setupData.has_superadmin);
        if (meData.email) {
          setCurrentUser(meData);
        }

        // If superadmin already exists, redirect to admin panel
        if (setupData.has_superadmin) {
          router.push("/admin");
        }
      } catch {
        setError("Failed to check setup status");
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [router]);

  async function handlePromote() {
    setPromoting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to promote");
      }

      setDone(true);
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setPromoting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasSuperadmin) {
    return null; // Will redirect
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <CardDescription>
            No superadmin exists yet. Promote yourself to set up the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentUser && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">You are logged in as</p>
              <p className="font-semibold mt-1">{currentUser.full_name || currentUser.email}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          )}

          {done ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800">
                You are now the Super Admin!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Redirecting to admin panel...
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={handlePromote}
                disabled={promoting}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {promoting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Make Me Super Admin
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                This action is only available once. After setup, manage roles from
                the admin panel.
              </p>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
