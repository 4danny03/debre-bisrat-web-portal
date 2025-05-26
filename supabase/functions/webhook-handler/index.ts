import { serve } from "std/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Demo Stripe test key - this is a placeholder, replace with your test webhook secret
const STRIPE_WEBHOOK_SECRET = "whsec_test_placeholder";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get the raw body
    const body = await req.text();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Update donation status in database
        const { error } = await supabaseClient
          .from("donations")
          .update({
            payment_status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("payment_id", session.id);

        if (error) {
          console.error("Error updating donation status:", error);
        }

        // If this was a membership fee payment, update the member's status
        if (
          session.metadata?.purpose === "membership_fee" &&
          session.metadata?.memberId
        ) {
          const { error: memberError } = await supabaseClient
            .from("members")
            .update({
              membership_status: "active",
              membership_date: new Date().toISOString(),
            })
            .eq("id", session.metadata.memberId);

          if (memberError) {
            console.error("Error updating member status:", memberError);
          }
        }
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`,
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(
          `Payment failed: ${paymentIntent.last_payment_error?.message}`,
        );
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
