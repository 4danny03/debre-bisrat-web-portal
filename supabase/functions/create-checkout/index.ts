
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  amount: string;
  donationType: string;
  purpose: string;
  email: string;
  name?: string;
  address?: string;
  memberId?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const requestData: CheckoutRequest = await req.json();
    const { amount, donationType, purpose, email, name, address, memberId } = requestData;

    if (!amount || !donationType || !purpose || !email) {
      throw new Error(
        "Missing required fields: amount, donationType, purpose, email",
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      if (name || address) {
        await stripe.customers.update(customerId, {
          name: name || undefined,
          address: address
            ? {
                line1: address,
              }
            : undefined,
        });
      }
    } else {
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        address: address
          ? {
              line1: address,
            }
          : undefined,
      });
      customerId = customer.id;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const productName =
      purpose === "general_fund"
        ? "General Fund Donation"
        : purpose === "building_fund"
          ? "Building Fund Donation"
          : purpose === "youth_programs"
            ? "Youth Programs Donation"
            : purpose === "membership_fee"
              ? "Membership Fee"
              : "Charitable Donation";

    const isRecurring = donationType !== "one_time";

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: `${purpose.replace("_", " ")} - ${isRecurring ? "Recurring" : "One-time"} donation`,
            },
            unit_amount: amountInCents,
            ...(isRecurring && {
              recurring: {
                interval:
                  donationType === "monthly"
                    ? "month"
                    : donationType === "quarterly"
                      ? "month"
                      : "year",
                interval_count: donationType === "quarterly" ? 3 : 1,
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/donation`,
      metadata: {
        purpose,
        email,
        donationType,
        memberId: memberId || "",
        demo_mode: "true",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    try {
      await supabaseClient.from("donations").insert([
        {
          amount: parseFloat(amount),
          donor_email: email,
          donor_name: name || null,
          purpose: purpose,
          payment_status: "pending",
          payment_id: session.id,
          payment_method: "stripe",
          is_anonymous: false,
        },
      ]);
    } catch (dbError) {
      console.error("Error storing donation record:", dbError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
