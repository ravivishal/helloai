import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Phone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                MissedCall.ai
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Hero />
      <div id="how-it-works"><HowItWorks /></div>
      <div id="features"><Features /></div>
      <div id="pricing"><Pricing /></div>
      <Testimonials />
      <div id="faq"><FAQ /></div>

      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Stop Losing Customers?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Set up your AI receptionist in 5 minutes. No credit card required for the free plan.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
