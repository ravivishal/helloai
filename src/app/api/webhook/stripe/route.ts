export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

// Map Stripe price IDs to plan details
const PRICE_ID_MAP: Record<string, { plan: string; calls: number }> = {
  [process.env.STRIPE_PRICE_ID_STARTER || ""]: { plan: "starter", calls: 50 },
  [process.env.STRIPE_PRICE_ID_PRO || ""]: { plan: "pro", calls: 200 },
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return new NextResponse("Bad Request", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return new NextResponse("Invalid Signature", { status: 400 });
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    const supabase = createSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const businessId = session.metadata?.business_id;
        const priceId = session.metadata?.price_id;

        if (!userId || !businessId || !priceId) {
          console.error("Missing metadata in checkout session:", session.id);
          return new NextResponse("Missing Metadata", { status: 400 });
        }

        const planDetails = PRICE_ID_MAP[priceId];
        if (!planDetails) {
          console.error("Unknown price ID:", priceId);
          return new NextResponse("Unknown Price ID", { status: 400 });
        }

        // Update business with subscription details
        const { error } = await supabase
          .from("businesses")
          .update({
            subscription_plan: planDetails.plan,
            calls_limit: planDetails.calls,
            subscription_status: "active",
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            billing_cycle_start: new Date().toISOString(),
          })
          .eq("id", businessId);

        if (error) {
          console.error("Failed to update business after checkout:", error);
          return new NextResponse("Database Error", { status: 500 });
        }

        console.log(`Subscription activated for business ${businessId}: ${planDetails.plan} plan`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) {
          console.error("No price ID in subscription update");
          return new NextResponse("Bad Request", { status: 400 });
        }

        const planDetails = PRICE_ID_MAP[priceId];
        if (!planDetails) {
          console.error("Unknown price ID in subscription update:", priceId);
          return new NextResponse("Unknown Price ID", { status: 400 });
        }

        // Update business subscription details
        const { error } = await supabase
          .from("businesses")
          .update({
            subscription_plan: planDetails.plan,
            calls_limit: planDetails.calls,
            subscription_status: subscription.status === "active" ? "active" : "past_due",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Failed to update subscription:", error);
          return new NextResponse("Database Error", { status: 500 });
        }

        console.log(`Subscription updated: ${subscription.id} to ${planDetails.plan} plan`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade to free plan
        const { error } = await supabase
          .from("businesses")
          .update({
            subscription_plan: "free",
            calls_limit: 5,
            subscription_status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Failed to downgrade after subscription deletion:", error);
          return new NextResponse("Database Error", { status: 500 });
        }

        console.log(`Subscription canceled and downgraded to free: ${subscription.id}`);
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

        if (!subId) {
          console.warn("Payment failed for non-subscription invoice");
          return new NextResponse("OK", { status: 200 });
        }

        // Mark subscription as past_due
        const { error } = await supabase
          .from("businesses")
          .update({
            subscription_status: "past_due",
          })
          .eq("stripe_subscription_id", subId);

        if (error) {
          console.error("Failed to mark subscription as past_due:", error);
          return new NextResponse("Database Error", { status: 500 });
        }

        console.log(`Payment failed for subscription: ${subId}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error in Stripe webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
