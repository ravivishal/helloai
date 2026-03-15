"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                Never Lose a Customer to{" "}
                <span className="text-blue-600">Voicemail</span> Again
              </h1>
              <p className="text-lg text-gray-600 sm:text-xl md:text-2xl">
                Your AI-powered receptionist answers every call, books appointments,
                and sends you instant SMS summaries. No more missed opportunities.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="/sign-up">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Button
                onClick={scrollToHowItWorks}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Right Column - Phone Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Phone Frame */}
              <div className="relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="h-full w-full bg-white flex flex-col">
                  {/* Status Bar */}
                  <div className="bg-blue-600 text-white text-xs py-2 px-4 flex justify-between items-center">
                    <span className="font-semibold">Incoming Call</span>
                    <span>9:41 AM</span>
                  </div>

                  {/* Call Content */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
                    {/* Caller Avatar */}
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {/* Caller Info */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      New Customer
                    </h3>
                    <p className="text-gray-600 mb-2">(555) 123-4567</p>

                    {/* AI Status */}
                    <div className="mt-6 bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">AI Answering...</span>
                    </div>

                    {/* Conversation Preview */}
                    <div className="mt-6 w-full space-y-2">
                      <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                        Hello! How can I help you today?
                      </div>
                      <div className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%] ml-auto">
                        I'd like to book an appointment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                <p className="text-sm font-semibold">✓ Call Answered!</p>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-xs">24/7 Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
