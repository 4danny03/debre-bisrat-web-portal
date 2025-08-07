import { corsHeaders } from "@shared/cors.ts";
import {
  handleCorsOptions,
  formatErrorResponse,
  formatSuccessResponse,
  sanitizeString,
  validateEmail,
  checkRateLimit,
} from "@shared/utils.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface CheckoutRequest {
  amount: string;
  donationType: string;
  purpose: string;
  email: string;
  name?: string;
  address?: string;
  memberId?: string;
}

// Input validation helper (keep existing)
function validateInput(data: CheckoutRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  // ... (keep your existing validation code) ...
  return { isValid: errors.length === 0, errors };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  // Rate limiting
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(clientIP, 10, 60000)) {
    return formatErrorResponse(new Error("Rate limit exceeded"), 429);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const requestData: CheckoutRequest = await req.json();
    const validation = validateInput(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.errors.join(", ") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { amount, donationType, purpose, email, name, address, memberId } = requestData;
    const stripe = new Stripe(Deno.env.get("VITE_STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Customer handling (keep existing)
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      await stripe.customers.update(customerId, {
        name: name || undefined,
        address: address ? { line1: address } : undefined,
      });
    } else {
      const customer = await stripe.customers.create({
        email, name: name || undefined, address: address ? { line1: address } : undefined
      });
      customerId = customer.id;
    }

    // Create Stripe session (keep existing)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: purpose === "membership_fee" 
              ? `Membership Fee (${memberId ? "Renewal" : "New Member"})`
              : purpose.replace(/_/g, " "),
            description: `${donationType.replace(/_/g, " ")} - ${donationType !== "one_time" ? "Recurring" : "One-time"}`,
          },
          unit_amount: Math.round(parseFloat(amount) * 100),
          ...(donationType !== "one_time" && {
            recurring: {
              interval: donationType === "monthly" ? "month" : donationType === "quarterly" ? "month" : "year",
              interval_count: donationType === "quarterly" ? 3 : 1,
            },
          }),
        },
        quantity: 1,
      }],
      mode: donationType !== "one_time" ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}${purpose === "membership_fee" ? "/membership-success" : "/donation-success"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}${purpose === "membership_fee" ? "/membership-registration" : "/donation"}`,
      metadata: { purpose, email, donationType, memberId: memberId || "" },
      ...(purpose === "membership_fee" && { phone_number_collection: { enabled: true } }),
    });

    // Store donation record
    const { data: donation, error: donationError } = await supabaseClient
      .from("donations")
      .insert([{
        amount: parseFloat(amount),
        donor_email: email,
        donor_name: name || null,
        purpose,
        status: "pending",
        payment_method: "stripe",
        stripe_payment_intent_id: session.id,
        member_id: memberId || null,
        is_membership_fee: purpose === "membership_fee",
        notes: purpose === "membership_fee" ? `Membership payment for member ${memberId}` : null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (donationError) throw donationError;

    // Send email notifications
    try {
      // 1. Send to donor
      await supabaseClient.functions.invoke("send-email", {
        body: {
          to: email,
          subject: purpose === "membership_fee" 
            ? "Your Membership Payment" 
            : "Thank You for Your Donation",
          // htmlContent: `
          //   <h1>Thank you for your ${purpose === "membership_fee" ? "membership payment" : "donation"}!</h1>
          //   <p>We're processing your ${purpose === "membership_fee" ? "membership" : "donation"} of $${amount}.</p>
          //   <p><a href="${session.url}">Complete your payment here</a></p>
          //   ${purpose === "membership_fee" ? "<p>You'll receive access upon payment confirmation.</p>" : ""}
          // `,
          htmlContent: `
            <h1>Thank you for your ${purpose === "membership_fee" ? "membership payment" : "donation"}!</h1>
            <p>We've received your ${purpose === "membership_fee" ? "membership" : "donation"} of $${amount}.</p>
            ${purpose === "membership_fee" ? "<p>You'll receive access upon payment confirmation.</p>" : ""}
          `,
        },
      });

      // 2. Notify admins
      const { data: admins } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("role", "admin");

      if (admins?.length) {
        await supabaseClient.functions.invoke("send-email", {
          body: {
            to: admins.map(a => a.email),
            subject: `New ${purpose === "membership_fee" ? "Membership" : "Donation"} Initiated`,
            htmlContent: `
              <h2>New ${purpose === "membership_fee" ? "Membership Payment" : "Donation"}</h2>
              <p><strong>Type:</strong> ${purpose.replace(/_/g, " ")} (${donationType})</p>
              <p><strong>Amount:</strong> $${amount}</p>
              <p><strong>From:</strong> ${name || email}</p>
              ${memberId ? `<p><strong>Member ID:</strong> ${memberId}</p>` : ""}
            `,
          },
        });
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if emails fail
    }

    return formatSuccessResponse({ url: session.url, donationId: donation.id });

  } catch (error) {
    console.error("Error in create-checkout:", error);
    return formatErrorResponse(
      error instanceof Error ? error : new Error("Payment initiation failed"),
      500
    );
  }
});