import { corsHeaders } from "../_shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "../_shared/utils.ts";
import {
  createStripeInstance,
  verifyStripeSignature,
  processCompletedCheckout,
} from "../_shared/payment-utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get("VITE_STRIPE_SECRET_KEY") || "sk_test_51ROOqvPp3jAs3nkg9jWMW5dZtXdeGAB9SvrBjc5DonIXUtTLYGPeq2XusT45cXQeiQ0ELAsSOIKtc7ekmhwrOD2r00bbE6pqt9";
    const stripeWebhookSecret = Deno.env.get("VITE_STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Validate required environment variables
    if (!stripeSecretKey) {
      throw new Error("Missing VITE_STRIPE_SECRET_KEY environment variable");
    }
    if (!stripeWebhookSecret) {
      throw new Error("Missing VITE_STRIPE_WEBHOOK_SECRET environment variable");
    }
    if (!supabaseUrl) {
      throw new Error("Missing SUPABASE_URL environment variable");
    }
    if (!supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    // Get Stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return formatErrorResponse(new Error("Missing Stripe signature"), 400);
    }

    // Get request body as text for signature verification
    const payload = await req.text();

    // Create Stripe instance
    const stripe = createStripeInstance(stripeSecretKey);

    // Verify Stripe signature
    const { success, event, error } = verifyStripeSignature(
      stripe,
      payload,
      signature,
      stripeWebhookSecret,
    );

    if (!success || !event) {
      return formatErrorResponse(new Error(`Webhook error: ${error}`), 400);
    }

    // Create Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Process checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const result = await processCompletedCheckout(
        supabaseClient,
        session,
        stripe,
      );

      if (!result.success) {
        console.error("Error processing checkout:", result.error);
        // We still return 200 to acknowledge receipt to Stripe
        return formatSuccessResponse({ received: true, processed: false });
      }

      return formatSuccessResponse({ received: true, processed: true });
    } else {
      // For unsupported event types, just acknowledge receipt
      return formatSuccessResponse({ received: true, ignored: true });
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return formatErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      500,
    );
  }
});
