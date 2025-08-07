import { corsHeaders } from "../_shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "../_shared/utils.ts";
import {
  createStripeInstance,
  verifyStripeSignature,
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
    const stripeSecretKey = Deno.env.get("VITE_STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return formatErrorResponse(
        new Error("Missing VITE_STRIPE_SECRET_KEY environment variable"),
        500,
      );
    }
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

    // Create Supabase client with service role
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Process checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Extract member ID from metadata (should be set when creating checkout session)
      const memberId = session.metadata?.memberId;
      if (!memberId) {
        console.error("No memberId found in session metadata");
        return formatSuccessResponse({ received: true, processed: false });
      }

      // Verify payment was successful
      if (session.payment_status !== "paid") {
        console.log("Session not paid, skipping update");
        return formatSuccessResponse({ received: true, processed: false });
      }

      // Update member record
      const { error: updateError } = await supabaseClient
        .from("members")
        .update({
          membership_status: "active",
          membership_fee_paid: true,
          payment_status: "completed",
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Failed to update member:", updateError);
        throw new Error(`Failed to update member: ${updateError.message}`);
      }

      console.log(`Successfully updated member ${memberId} after payment`);
      return formatSuccessResponse({ received: true, processed: true });
    }

    // For other event types, just acknowledge receipt
    return formatSuccessResponse({ received: true, ignored: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Even if we error, we return 200 to prevent Stripe from retrying
    return formatSuccessResponse({ received: true, error: error.message });
  }
});