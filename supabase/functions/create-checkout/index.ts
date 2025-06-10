
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, purpose, donor_name, donor_email, is_anonymous } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: donor_email,
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else if (donor_email) {
      const customer = await stripe.customers.create({
        email: donor_email,
        name: donor_name,
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : donor_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: purpose || "Donation",
              description: `Donation to St. Gabriel Ethiopian Orthodox Church`
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/donation?canceled=true`,
      metadata: {
        donor_name: donor_name || "Anonymous",
        purpose: purpose || "General Donation",
        is_anonymous: is_anonymous ? "true" : "false"
      }
    });

    // Create donation record
    const { error: insertError } = await supabaseClient
      .from("donations")
      .insert({
        amount,
        donor_name: is_anonymous ? null : donor_name,
        donor_email: is_anonymous ? null : donor_email,
        purpose,
        is_anonymous,
        payment_id: session.id,
        payment_status: "pending",
        payment_method: "stripe"
      });

    if (insertError) {
      console.error("Error creating donation record:", insertError);
    }

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
