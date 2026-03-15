"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessHours } from "@/types/index";
import { DAYS_OF_WEEK } from "@/lib/utils/constants";
import { Plus, X } from "lucide-react";

interface StepServicesProps {
  services: string[];
  businessHours: BusinessHours;
  pricingInfo: string;
  bookingUrl: string;
  onServicesChange: (value: string[]) => void;
  onBusinessHoursChange: (value: BusinessHours) => void;
  onPricingInfoChange: (value: string) => void;
  onBookingUrlChange: (value: string) => void;
}

export default function StepServices({
  services,
  businessHours,
  pricingInfo,
  bookingUrl,
  onServicesChange,
  onBusinessHoursChange,
  onPricingInfoChange,
  onBookingUrlChange,
}: StepServicesProps) {
  const [newService, setNewService] = useState("");

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      onServicesChange(services.filter((s) => s !== service));
    } else {
      onServicesChange([...services, service]);
    }
  };

  const addCustomService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      onServicesChange([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    onServicesChange(services.filter((s) => s !== service));
  };

  const toggleDayOpen = (dayKey: string) => {
    const currentValue = businessHours[dayKey];
    if (currentValue === "closed") {
      onBusinessHoursChange({
        ...businessHours,
        [dayKey]: { open: "08:00", close: "17:00" },
      });
    } else {
      onBusinessHoursChange({
        ...businessHours,
        [dayKey]: "closed",
      });
    }
  };

  const updateDayHours = (dayKey: string, field: "open" | "close", value: string) => {
    const currentValue = businessHours[dayKey];
    if (currentValue !== "closed") {
      onBusinessHoursChange({
        ...businessHours,
        [dayKey]: { ...currentValue, [field]: value },
      });
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const display = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        options.push({ value: time, label: display });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Services & Business Hours</h2>
        <p className="text-muted-foreground">
          Configure what services you offer and when you're available.
        </p>
      </div>

      {/* Services Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Services Offered <span className="text-destructive">*</span>
            </Label>

            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={true} onCheckedChange={() => toggleService(service)} />
                    <span>{service}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(service)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Add custom service..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomService();
                  }
                }}
              />
              <Button onClick={addCustomService} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Business Hours</Label>

            {DAYS_OF_WEEK.map((day) => {
              const hours = businessHours[day.key];
              const isOpen = hours !== "closed";

              return (
                <div key={day.key} className="flex items-center space-x-4">
                  <div className="w-32">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isOpen}
                        onCheckedChange={() => toggleDayOpen(day.key)}
                      />
                      <Label className="font-normal">{day.label}</Label>
                    </div>
                  </div>

                  {isOpen && typeof hours === "object" ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Select
                        value={hours.open}
                        onValueChange={(value) => value && updateDayHours(day.key, "open", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">to</span>
                      <Select
                        value={hours.close}
                        onValueChange={(value) => value && updateDayHours(day.key, "close", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pricingInfo">Pricing Information (Optional)</Label>
          <Textarea
            id="pricingInfo"
            placeholder="e.g., Service call: $85, Hourly rate: $125/hr"
            value={pricingInfo}
            onChange={(e) => onPricingInfoChange(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bookingUrl">Online Booking URL (Optional)</Label>
          <Input
            id="bookingUrl"
            type="url"
            placeholder="e.g., https://calendly.com/yourname"
            value={bookingUrl}
            onChange={(e) => onBookingUrlChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
