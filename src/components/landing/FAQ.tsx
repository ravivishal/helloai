import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "How does the AI receptionist work?",
      answer:
        "Our AI receptionist uses advanced natural language processing to understand and respond to customer calls in real-time. It can answer questions about your business, take messages, book appointments, and handle common inquiries. After each call, you receive an SMS summary with all the important details.",
    },
    {
      question: "Can I customize what the AI says?",
      answer:
        "Absolutely! You can customize your AI's greeting, business hours, services offered, pricing information, and FAQs. On our Starter and Pro plans, you have even more control over the conversation flow and can train the AI with specific responses for your business.",
    },
    {
      question: "What happens when I reach my call limit?",
      answer:
        "When you approach your monthly call limit, we'll notify you via email and SMS. You can upgrade to a higher plan at any time, or purchase additional calls. Your AI will continue to answer calls, but you'll be charged a small overage fee per additional call to ensure you never miss an important customer.",
    },
    {
      question: "How do I set up call forwarding?",
      answer:
        "We provide detailed instructions after signup. You can either use the dedicated phone number we provide, or forward your existing business number to your AI receptionist. Most phone carriers allow call forwarding setup in just 2-3 minutes. Our support team is available to help if you need assistance.",
    },
    {
      question: "Is there a contract?",
      answer:
        "No contracts required! All our plans are month-to-month and you can cancel anytime. We also offer a 14-day money-back guarantee, so you can try the service risk-free. If you're not satisfied for any reason, we'll refund your payment in full.",
    },
    {
      question: "What phone number do I get?",
      answer:
        "You'll receive a local phone number in your area code that your AI will answer. You can also choose a toll-free number for an additional fee. Alternatively, you can forward your existing business number to your AI and keep using the number your customers already know.",
    },
    {
      question: "Can the AI book appointments?",
      answer:
        "Yes! The AI can check your calendar availability and book appointments directly. It integrates with Google Calendar, Outlook, and other popular calendar apps. You can set your availability, appointment types, and duration, and the AI will handle the rest. Customers receive automatic confirmation texts too.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Security is our top priority. All calls are encrypted end-to-end, and we comply with HIPAA, GDPR, and other data protection regulations. Your call transcripts and customer data are stored securely and never shared with third parties. We use enterprise-grade security measures to protect your business information.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about hello.ai
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6 bg-white hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:support@hello.ai"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
}
