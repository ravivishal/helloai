"use client";

import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Set Up Your AI Receptionist
          </h1>
          <p className="text-gray-500 mt-2">
            You&apos;ll be up and running in just a few minutes
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
}
