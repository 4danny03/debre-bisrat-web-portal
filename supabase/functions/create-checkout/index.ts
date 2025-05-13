
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get request data
    const { amount, donationType, purpose, email } = await req.json();
    
    // Validate the input
    if (!amount || !donationType || !purpose || !email) {
      throw new Error("Missing required fields: amount, donationType, purpose, email");
    }

    // Initialize Stripe with the API key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer exists for this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Set up the payment details
    const amountInCents = Math.round(parseFloat(amount) * 100);
    const productName = purpose === "general_fund" ? "General Fund Donation" : 
                       purpose === "building_fund" ? "Building Fund Donation" :
                       purpose === "youth_programs" ? "Youth Programs Donation" :
                       "Charitable Donation";

    // Configure payment type based on donationType (one-time vs recurring)
    const isRecurring = donationType !== "one_time";
    
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productName },
            unit_amount: amountInCents,
            ...(isRecurring && { recurring: { interval: donationType === "monthly" ? "month" : donationType === "quarterly" ? "month" : "year" } })
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
        donationType
      }
    };

    // Create a checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

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
