export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId } = body;
    // Accept either a direct priceId or a plan name (starter/pro)
    let priceId = body.priceId;
    if (!priceId && body.plan) {
      const planPriceMap: Record<string, string | undefined> = {
        starter: process.env.STRIPE_STARTER_PRICE_ID,
        pro: process.env.STRIPE_PRO_PRICE_ID,
      };
      priceId = planPriceMap[body.plan];
    }

    if (!priceId || !businessId) {
      return NextResponse.json(
        { error: "Missing plan/priceId or businessId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const stripe = getStripe();

    // Get business and verify ownership
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let customerId = business.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.owner_email || user.email,
        name: business.owner_name,
        metadata: {
          businessId: business.id,
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update business with customer ID
      await supabase
        .from("businesses")
        .update({ stripe_customer_id: customerId })
        .eq("id", businessId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        business_id: business.id,
        user_id: user.id,
        price_id: priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/stripe/create-checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
