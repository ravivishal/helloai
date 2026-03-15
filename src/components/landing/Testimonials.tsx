import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Mike Rodriguez",
      business: "Rodriguez Plumbing",
      role: "Owner",
      image: "MR",
      rating: 5,
      quote:
        "I used to miss 3-4 emergency calls a day while I was under sinks. Now my AI picks up every single call and books appointments automatically. My revenue is up 40% in just two months!",
    },
    {
      name: "Dr. Sarah Chen",
      business: "Chen Family Dentistry",
      role: "Dentist",
      image: "SC",
      rating: 5,
      quote:
        "Our front desk was overwhelmed with calls. The AI handles appointment scheduling flawlessly, even after hours. Patients love the instant responses, and my staff can focus on in-office care.",
    },
    {
      name: "Jessica Williams",
      business: "Luxe Hair Salon",
      role: "Salon Owner",
      image: "JW",
      rating: 5,
      quote:
        "Game changer! The AI knows our services, pricing, and availability. It books appointments 24/7 and sends me summaries after each call. I've captured so many late-night bookings I would have missed before.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real businesses, real results
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-gray-200 hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}, {testimonial.business}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
