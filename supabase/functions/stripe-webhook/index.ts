import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "@shared/utils.ts";
import {
  createStripeInstance,
  verifyStripeSignature,
} from "@shared/payment-utils.ts";
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
    if (!stripeWebhookSecret) {
      throw new Error(
        "Missing VITE_STRIPE_WEBHOOK_SECRET environment variable",
      );
    }
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Get Stripe signature and payload
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return formatErrorResponse(new Error("Missing Stripe signature"), 400);
    }
    const payload = await req.text();

    // Initialize Stripe and verify signature
    const stripe = createStripeInstance(stripeSecretKey);
    const { success, event, error } = verifyStripeSignature(
      stripe,
      payload,
      signature,
      stripeWebhookSecret,
    );

    if (!success || !event) {
      return formatErrorResponse(new Error(`Webhook error: ${error}`), 400);
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Process checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;
      const { metadata } = session;

      // Verify payment was successful
      if (session.payment_status !== "paid") {
        return formatSuccessResponse({ received: true, processed: false });
      }

      // 1. Update donation record
      const { error: donationError } = await supabaseClient
        .from("donations")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", session.id);

      if (donationError) throw donationError;

      // 2. Handle membership activation if applicable
      if (metadata?.memberId) {
        const { error: memberError } = await supabaseClient
          .from("members")
          .update({
            membership_status: "active",
            membership_fee_paid: true,
            payment_status: "completed",
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", metadata.memberId);

        if (memberError) throw memberError;
      }

      // 3. Send confirmation emails via notify-emails router
      try {
        // Get donation details (optional donor name/email)
        const { data: donation } = await supabaseClient
          .from("donations")
          .select("*")
          .eq("stripe_payment_intent_id", session.id)
          .single();

        const donorEmail =
          session.customer_email || donation?.donor_email || undefined;
        const donorName = donation?.donor_name || undefined;
        const currency = (session.currency || "usd").toLowerCase();
        const amountCents: number = Number(session.amount_total) || 0;

        // Single call will notify both admins and donor
        await supabaseClient.functions.invoke("notify-emails", {
          body: {
            type: "donation.created",
            payload: {
              amount: amountCents,
              currency,
              donorEmail: donorEmail || "",
              donorName,
              purpose: metadata?.purpose,
              receiptUrl: undefined,
            },
          },
        });

        // Membership confirmation email (if applicable)
        if (metadata?.purpose === "membership_fee") {
          if (donorEmail) {
            await supabaseClient.functions.invoke("notify-emails", {
              body: {
                type: "membership.payment_confirmed",
                payload: {
                  email: donorEmail,
                  name: donorName,
                  amount: amountCents,
                  currency,
                  receiptUrl: undefined,
                },
              },
            });
          }
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the webhook if emails fail
      }

      return formatSuccessResponse({ received: true, processed: true });
    }

    // Handle other event types
    return formatSuccessResponse({ received: true, ignored: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return formatSuccessResponse({
      received: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
