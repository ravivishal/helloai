import { Bot, MessageSquare, FileText, Calendar, Building2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Features() {
  const features = [
    {
      icon: Bot,
      title: "AI Conversations",
      description:
        "Natural, human-like conversations powered by advanced AI. Your customers won't know they're talking to a bot.",
    },
    {
      icon: MessageSquare,
      title: "SMS Summaries",
      description:
        "Receive instant SMS notifications after each call with a complete summary of what was discussed.",
    },
    {
      icon: FileText,
      title: "Call Transcripts",
      description:
        "Full transcripts of every conversation stored securely in your dashboard for easy reference and review.",
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description:
        "Let your AI schedule appointments directly into your calendar. Automatic confirmations and reminders included.",
    },
    {
      icon: Building2,
      title: "Multi-Industry",
      description:
        "Perfect for plumbers, dentists, salons, lawyers, contractors, and any business that takes phone calls.",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Never miss a call again. Your AI receptionist works around the clock, even on holidays and weekends.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to never miss another customer call
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
