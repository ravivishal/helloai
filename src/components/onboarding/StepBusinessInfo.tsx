"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessCategory, BusinessTemplate } from "@/types/index";
import { BUSINESS_CATEGORIES } from "@/lib/utils/constants";

interface StepBusinessInfoProps {
  businessName: string;
  category: BusinessCategory | "";
  ownerName: string;
  phone: string;
  email: string;
  serviceArea: string;
  onBusinessNameChange: (value: string) => void;
  onCategoryChange: (value: BusinessCategory) => void;
  onOwnerNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onServiceAreaChange: (value: string) => void;
  onTemplateLoad: (template: BusinessTemplate) => void;
}

export default function StepBusinessInfo({
  businessName,
  category,
  ownerName,
  phone,
  email,
  serviceArea,
  onBusinessNameChange,
  onCategoryChange,
  onOwnerNameChange,
  onPhoneChange,
  onEmailChange,
  onServiceAreaChange,
  onTemplateLoad,
}: StepBusinessInfoProps) {
  useEffect(() => {
    if (category) {
      // Fetch template data when category changes
      fetchTemplate(category);
    }
  }, [category]);

  const fetchTemplate = async (categoryValue: BusinessCategory) => {
    try {
      const response = await fetch(
        `/api/businesses/templates?category=${categoryValue}`
      );
      if (response.ok) {
        const template = await response.json();
        onTemplateLoad(template);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
        <p className="text-muted-foreground">
          We'll use this information to set up your AI receptionist.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            placeholder="e.g., Smith & Sons Plumbing"
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Business Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(value) => onCategoryChange(value as BusinessCategory)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName">
            Owner Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ownerName"
            placeholder="e.g., John Smith"
            value={ownerName}
            onChange={(e) => onOwnerNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Business Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., (555) 123-4567"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g., john@smithplumbing.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceArea">Service Area</Label>
          <Input
            id="serviceArea"
            placeholder="e.g., Austin, TX and surrounding areas"
            value={serviceArea}
            onChange={(e) => onServiceAreaChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
