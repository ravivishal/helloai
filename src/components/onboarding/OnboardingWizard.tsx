"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Business, BusinessCategory, BusinessHours, FAQItem } from "@/types/index";
import { DEFAULT_BUSINESS_HOURS } from "@/lib/utils/constants";
import StepBusinessInfo from "./StepBusinessInfo";
import StepServices from "./StepServices";
import StepCustomize from "./StepCustomize";
import StepTestCall from "./StepTestCall";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { number: 1, label: "Business Info" },
  { number: 2, label: "Services & Hours" },
  { number: 3, label: "Customize AI" },
  { number: 4, label: "Test & Launch" },
];

interface FormData {
  businessName: string;
  category: BusinessCategory | "";
  ownerName: string;
  phone: string;
  email: string;
  serviceArea: string;
  services: string[];
  businessHours: BusinessHours;
  pricingInfo: string;
  bookingUrl: string;
  customGreeting: string;
  faq: FAQItem[];
  instructions: string;
  tone: string;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);

  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    category: "",
    ownerName: "",
    phone: "",
    email: "",
    serviceArea: "",
    services: [],
    businessHours: DEFAULT_BUSINESS_HOURS,
    pricingInfo: "",
    bookingUrl: "",
    customGreeting: "",
    faq: [],
    instructions: "",
    tone: "professional",
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      // On step 3's "Activate" button, submit the form
      await handleActivate();
    } else if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleActivate = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        business_name: formData.businessName,
        business_category: formData.category,
        owner_name: formData.ownerName,
        owner_phone: formData.phone,
        owner_email: formData.email || null,
        service_area: formData.serviceArea || null,
        business_hours: formData.businessHours,
        services_offered: formData.services,
        pricing_info: formData.pricingInfo || null,
        booking_url: formData.bookingUrl || null,
        custom_greeting: formData.customGreeting || null,
        custom_instructions: formData.instructions || null,
        faq: formData.faq,
        tone: formData.tone,
      };

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create business");
      }

      const business = await response.json();
      setCreatedBusiness(business);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error creating business:", error);
      alert("Failed to create business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.businessName &&
          formData.category &&
          formData.ownerName &&
          formData.phone
        );
      case 2:
        return formData.services.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors",
                    currentStep >= step.number
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-muted"
                  )}
                >
                  {step.number}
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepBusinessInfo
              businessName={formData.businessName}
              category={formData.category}
              ownerName={formData.ownerName}
              phone={formData.phone}
              email={formData.email}
              serviceArea={formData.serviceArea}
              onBusinessNameChange={(value) => updateFormData("businessName", value)}
              onCategoryChange={(value) => updateFormData("category", value)}
              onOwnerNameChange={(value) => updateFormData("ownerName", value)}
              onPhoneChange={(value) => updateFormData("phone", value)}
              onEmailChange={(value) => updateFormData("email", value)}
              onServiceAreaChange={(value) => updateFormData("serviceArea", value)}
              onTemplateLoad={(template) => {
                updateFormData("services", template.default_services);
                updateFormData("faq", template.default_faq);
                updateFormData("instructions", template.default_instructions);
              }}
            />
          )}

          {currentStep === 2 && (
            <StepServices
              services={formData.services}
              businessHours={formData.businessHours}
              pricingInfo={formData.pricingInfo}
              bookingUrl={formData.bookingUrl}
              onServicesChange={(value) => updateFormData("services", value)}
              onBusinessHoursChange={(value) => updateFormData("businessHours", value)}
              onPricingInfoChange={(value) => updateFormData("pricingInfo", value)}
              onBookingUrlChange={(value) => updateFormData("bookingUrl", value)}
            />
          )}

          {currentStep === 3 && (
            <StepCustomize
              greeting={formData.customGreeting}
              faq={formData.faq}
              instructions={formData.instructions}
              tone={formData.tone}
              businessName={formData.businessName}
              ownerName={formData.ownerName}
              onGreetingChange={(value) => updateFormData("customGreeting", value)}
              onFaqChange={(value) => updateFormData("faq", value)}
              onInstructionsChange={(value) => updateFormData("instructions", value)}
              onToneChange={(value) => updateFormData("tone", value)}
            />
          )}

          {currentStep === 4 && createdBusiness && (
            <StepTestCall
              phoneNumber={createdBusiness.twilio_phone_number || ""}
              businessId={createdBusiness.id}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
              >
                {currentStep === 3 ? (
                  isSubmitting ? "Activating..." : "Activate"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
