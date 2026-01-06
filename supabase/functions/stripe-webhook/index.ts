import { corsHeaders } from "../_shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
} from "../_shared/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "npm:stripe";
import { notifyOnPayment } from "../_shared/notify.ts";

function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return formatErrorResponse(new Error("Missing stripe-signature header"), 400);
    }

    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2024-06-20",
    });

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );

    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return formatSuccessResponse({ received: true, processed: false });
      }

      const metadata = session.metadata ?? {};
      const paymentType = (metadata.payment_type ?? "").toLowerCase();

      const amountCents = session.amount_total ?? 0;
      const currency = (session.currency ?? "usd").toLowerCase();

      const payerName = session.customer_details?.name ?? null;
      const payerEmail = session.customer_details?.email ?? session.customer_email ?? null;
      const payerPhone = session.customer_details?.phone ?? null;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.toString() ?? null;

      // Donation
      if (paymentType === "donation") {
        const donationId = metadata.donation_id ?? null;

        const update = supabase.from("donations").update({
          status: "completed",
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
        });

        const { error } = donationId
          ? await update.eq("id", donationId)
          : await update.eq("stripe_session_id", session.id);

        if (error) throw error;

        await notifyOnPayment({
          paymentType: "donation",
          amountCents,
          currency,
          payerName,
          payerEmail,
          payerPhone,
          referenceId: donationId ?? session.id,
        });

        return formatSuccessResponse({ received: true, processed: true, type: "donation" });
      }

      // Membership
      if (paymentType === "membership") {
        const memberId = metadata.member_id ?? metadata.memberId ?? null;
        const membershipType = metadata.membership_type ?? null;

        if (!memberId) {
          // Return OK to stop Stripe retries, but log loudly.
          console.warn("Membership payment missing member_id in metadata", metadata);
          return formatSuccessResponse({
            received: true,
            processed: false,
            reason: "Missing member_id in metadata",
          });
        }

        const { error } = await supabase
          .from("members")
          .update({
            membership_status: "active",
            membership_fee_paid: true,
            payment_status: "completed",
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq("id", memberId);

        if (error) throw error;

        await notifyOnPayment({
          paymentType: "membership",
          amountCents,
          currency,
          payerName,
          payerEmail,
          payerPhone,
          referenceId: memberId,
          membershipType,
        });

        return formatSuccessResponse({ received: true, processed: true, type: "membership" });
      }

      console.warn("Unknown payment_type metadata:", metadata.payment_type);
      return formatSuccessResponse({
        received: true,
        processed: false,
        reason: "Unknown payment_type metadata",
      });
    }

    return formatSuccessResponse({ received: true, ignored: true });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return formatErrorResponse(err as Error, 500);
  }
});
