"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FAQItem } from "@/types/index";
import { Plus, X } from "lucide-react";

interface StepCustomizeProps {
  greeting: string;
  faq: FAQItem[];
  instructions: string;
  tone: string;
  businessName: string;
  ownerName: string;
  onGreetingChange: (value: string) => void;
  onFaqChange: (value: FAQItem[]) => void;
  onInstructionsChange: (value: string) => void;
  onToneChange: (value: string) => void;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
];

export default function StepCustomize({
  greeting,
  faq,
  instructions,
  tone,
  businessName,
  ownerName,
  onGreetingChange,
  onFaqChange,
  onInstructionsChange,
  onToneChange,
}: StepCustomizeProps) {
  const addFaqItem = () => {
    onFaqChange([...faq, { q: "", a: "" }]);
  };

  const updateFaqItem = (index: number, field: "q" | "a", value: string) => {
    const updated = [...faq];
    updated[index] = { ...updated[index], [field]: value };
    onFaqChange(updated);
  };

  const removeFaqItem = (index: number) => {
    onFaqChange(faq.filter((_, i) => i !== index));
  };

  const defaultGreeting = `Thank you for calling ${businessName || "[Your Business]"}. This is our AI receptionist. How can I help you today?`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Customize Your AI Receptionist</h2>
        <p className="text-muted-foreground">
          Personalize how your AI assistant interacts with callers.
        </p>
      </div>

      {/* Tone Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="tone">AI Tone</Label>
            <Select value={tone} onValueChange={(v) => v && onToneChange(v)}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how formal or casual you want your AI to sound.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Greeting */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="greeting">Custom Greeting (Optional)</Label>
            <Textarea
              id="greeting"
              placeholder={defaultGreeting}
              value={greeting}
              onChange={(e) => onGreetingChange(e.target.value)}
              rows={3}
            />
            {!greeting && (
              <p className="text-sm text-muted-foreground">
                Default: <span className="italic text-muted-foreground/80">{defaultGreeting}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add common questions and answers to help your AI provide quick responses.
          </p>

          {faq.map((item, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-md bg-muted/50">
              <div className="flex justify-between items-start">
                <Label className="text-sm font-medium">Q&A #{index + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaqItem(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Question (e.g., What are your rates?)"
                  value={item.q}
                  onChange={(e) => updateFaqItem(index, "q", e.target.value)}
                />
                <Textarea
                  placeholder="Answer"
                  value={item.a}
                  onChange={(e) => updateFaqItem(index, "a", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}

          <Button onClick={addFaqItem} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      {/* Additional Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="instructions">Additional AI Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder={`e.g., Always mention our 24/7 emergency service for urgent calls. Ask for caller's location before providing pricing estimates.`}
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Provide specific guidance on how the AI should handle calls for your business.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
