
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
    const {
      amount,
      currency = "usd",
      membershipType,
      memberName,
      memberEmail,
      memberId,
    } = await req.json();

    if (!amount || !membershipType || !memberName || !memberEmail) {
      throw new Error("Missing required parameters");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create or get customer
    let customerId;
    const existingCustomers = await stripe.customers.list({
      email: memberEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: memberEmail,
        name: memberName,
        metadata: {
          membershipType,
          memberId: memberId || "",
        },
      });
      customerId = customer.id;
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://your-domain.com";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Church Membership - ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)}`,
              description: `Annual membership fee for ${memberName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membership-registration?cancelled=true`,
      metadata: {
        membershipType,
        memberName,
        memberEmail,
        memberId: memberId || "",
      },
    });

    // Update member record with payment session ID
    if (memberId) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseClient
        .from("members")
        .update({
          membership_status: "payment_pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", memberId);
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
