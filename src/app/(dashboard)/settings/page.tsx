"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Business, FAQItem } from "@/types";
import { DAYS_OF_WEEK } from "@/lib/utils/constants";
import { formatPhone } from "@/lib/utils/format-phone";
import { toast } from "sonner";
import { Save, Plus, Trash2, Phone, Calendar, Link2, Unlink } from "lucide-react";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [businessHours, setBusinessHours] = useState<Record<string, any>>({});
  const [pricingInfo, setPricingInfo] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [faq, setFaq] = useState<FAQItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/businesses");
        const businesses = await res.json();
        if (businesses.length > 0) {
          const biz = businesses[0];
          setBusiness(biz);
          setBusinessName(biz.business_name);
          setOwnerName(biz.owner_name);
          setOwnerPhone(biz.owner_phone);
          setOwnerEmail(biz.owner_email || "");
          setServiceArea(biz.service_area || "");
          setServicesOffered(biz.services_offered || []);
          setBusinessHours(biz.business_hours || {});
          setPricingInfo(biz.pricing_info || "");
          setBookingUrl(biz.booking_url || "");
          setCustomGreeting(biz.custom_greeting || "");
          setCustomInstructions(biz.custom_instructions || "");
          setFaq(biz.faq || []);
        }
      } catch (error) {
        console.error("Failed to load business:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          owner_name: ownerName,
          owner_phone: ownerPhone,
          owner_email: ownerEmail || null,
          service_area: serviceArea || null,
          services_offered: servicesOffered,
          business_hours: businessHours,
          pricing_info: pricingInfo || null,
          booking_url: bookingUrl || null,
          custom_greeting: customGreeting || null,
          custom_instructions: customInstructions || null,
          faq,
        }),
      });
      if (res.ok) {
        toast.success("Settings saved! AI receptionist updated.");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Handle Google Calendar OAuth callback params
  const searchParams = useSearchParams();
  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (googleStatus === "connected") {
      toast.success("Google Calendar connected successfully!");
      // Refresh business data to get updated google_calendar_connected
      fetch("/api/businesses")
        .then((r) => r.json())
        .then((businesses) => {
          if (businesses.length > 0) setBusiness(businesses[0]);
        });
    } else if (googleStatus === "error") {
      toast.error("Failed to connect Google Calendar. Please try again.");
    }
  }, [searchParams]);

  const connectGoogleCalendar = async () => {
    if (!business) return;
    setConnectingGoogle(true);
    try {
      const res = await fetch(`/api/google/connect?businessId=${business.id}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to generate Google auth URL");
      }
    } catch {
      toast.error("Failed to connect Google Calendar");
    } finally {
      setConnectingGoogle(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!business) return;
    try {
      const res = await fetch("/api/google/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (res.ok) {
        setBusiness({ ...business, google_calendar_connected: false, google_refresh_token: null });
        toast.success("Google Calendar disconnected");
      }
    } catch {
      toast.error("Failed to disconnect Google Calendar");
    }
  };

  const addService = () => {
    if (newService.trim()) {
      setServicesOffered([...servicesOffered, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setServicesOffered(servicesOffered.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setFaq([...faq, { q: "", a: "" }]);
  };

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    const updated = [...faq];
    updated[index] = { ...updated[index], [field]: value };
    setFaq(updated);
  };

  const removeFaq = (index: number) => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const updateHours = (day: string, field: string, value: string) => {
    setBusinessHours((prev) => {
      const current = prev[day];
      if (field === "status") {
        if (value === "closed") return { ...prev, [day]: "closed" };
        return { ...prev, [day]: { open: "08:00", close: "17:00" } };
      }
      if (typeof current === "object" && current !== null) {
        return { ...prev, [day]: { ...current, [field]: value } };
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-6">
        <TopBar title="Settings" />
        <div className="text-center py-12 text-gray-500">
          <p>No business found. Complete onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <TopBar title="Settings" />

      {business.twilio_phone_number && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <Phone className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Your AI Receptionist Number</p>
              <p className="text-xl font-bold text-blue-900">
                {formatPhone(business.twilio_phone_number)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={business.google_calendar_connected ? "border-green-200 bg-green-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Connect Google Calendar to automatically create events when appointments are booked by your AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {business.google_calendar_connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectGoogleCalendar}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Unlink className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectGoogleCalendar}
              disabled={connectingGoogle}
              className="gap-2"
              variant="outline"
            >
              <Link2 className="h-4 w-4" />
              {connectingGoogle ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Basic details about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label>Owner Name</Label>
              <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div>
              <Label>Phone (for SMS alerts)</Label>
              <Input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Service Area</Label>
              <Input
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g., Greater Austin, TX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>Services your AI receptionist can reference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {servicesOffered.map((service, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {service}
                <button onClick={() => removeService(i)} className="ml-1 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a service..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
            />
            <Button onClick={addService} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const hours = businessHours[key];
            const isOpen = hours && hours !== "closed";
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{label}</span>
                <Select
                  value={isOpen ? "open" : "closed"}
                  onValueChange={(v) => v && updateHours(key, "status", v)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {isOpen && typeof hours === "object" && (
                  <>
                    <Input
                      type="time"
                      value={(hours as { open: string }).open}
                      onChange={(e) => updateHours(key, "open", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={(hours as { close: string }).close}
                      onChange={(e) => updateHours(key, "close", e.target.value)}
                      className="w-32"
                    />
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Customization</CardTitle>
          <CardDescription>Customize how your AI receptionist behaves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Custom Greeting</Label>
            <Textarea
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder={`Hi, thanks for calling ${businessName}! ${ownerName} isn't available right now, but I can help you out.`}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use the default greeting</p>
          </div>
          <div>
            <Label>Pricing Info</Label>
            <Textarea
              value={pricingInfo}
              onChange={(e) => setPricingInfo(e.target.value)}
              placeholder="Describe your pricing so the AI can reference it..."
              rows={3}
            />
          </div>
          <div>
            <Label>Booking URL</Label>
            <Input
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              placeholder="https://cal.com/your-link"
            />
          </div>
          <div>
            <Label>Additional Instructions</Label>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any special instructions for your AI receptionist..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Common questions your AI can answer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faq.map((item, i) => (
            <div key={i} className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.q}
                    onChange={(e) => updateFaq(i, "q", e.target.value)}
                    placeholder="Question..."
                  />
                  <Textarea
                    value={item.a}
                    onChange={(e) => updateFaq(i, "a", e.target.value)}
                    placeholder="Answer..."
                    rows={2}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFaq(i)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addFaq} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
