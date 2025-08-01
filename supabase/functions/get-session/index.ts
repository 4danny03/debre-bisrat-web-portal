import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SessionRequest {
  session_id: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: SessionRequest = await req.json();
    const { session_id } = requestData;

    if (!session_id) {
      throw new Error("Missing session_id parameter");
    }

    const stripeKey = Deno.env.get("VITE_STRIPE_SECRET_KEY") || "sk_test_51ROOqvPp3jAs3nkg9jWMW5dZtXdeGAB9SvrBjc5DonIXUtTLYGPeq2XusT45cXQeiQ0ELAsSOIKtc7ekmhwrOD2r00bbE6pqt9";
    if (!stripeKey) {
      throw new Error("Missing VITE_STRIPE_SECRET_KEY environment variable");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "subscription", "customer"],
    });

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get-session function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
