import { serve } from "std/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Demo Stripe test key - this is a public test key from Stripe docs, safe to include
const STRIPE_TEST_KEY =
  "sk_test_51OvQQnCXpYQQZZQQZZQQZZQQZZQQZZQQZZQQZZQQZZQQZZQQ";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Get request data
    const { amount, donationType, purpose, email, name, address, memberId } =
      await req.json();

    // Validate the input
    if (!amount || !donationType || !purpose || !email) {
      throw new Error(
        "Missing required fields: amount, donationType, purpose, email",
      );
    }

    // Initialize Stripe with the test API key for demo purposes
    // In production, you would use: Deno.env.get("STRIPE_SECRET_KEY")
    const stripe = new Stripe(STRIPE_TEST_KEY, {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer exists for this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      // Update customer with latest info if provided
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
      // Create a new customer if one doesn't exist
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

    // Set up the payment details
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

    // Configure payment type based on donationType (one-time vs recurring)
    const isRecurring = donationType !== "one_time";

    const sessionConfig = {
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
        demo_mode: "true", // Flag to indicate this is a demo transaction
      },
    };

    // Create a checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Store donation record in database
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
      // Continue with checkout even if database insert fails
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
