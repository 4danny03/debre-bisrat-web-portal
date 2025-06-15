import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  amount: string;
  donationType: string;
  purpose: string;
  email: string;
  name?: string;
  address?: string;
  memberId?: string;
}

// Input validation helper
function validateInput(data: CheckoutRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate amount
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount < 1 || amount > 10000) {
    errors.push("Amount must be between $1 and $10,000");
  }

  // Validate donation type
  const validDonationTypes = ["one_time", "monthly", "quarterly", "annually"];
  if (!validDonationTypes.includes(data.donationType)) {
    errors.push("Invalid donation type");
  }

  // Validate purpose
  const validPurposes = [
    "general_fund",
    "building_fund",
    "youth_programs",
    "charity",
    "membership_fee",
  ];
  if (!validPurposes.includes(data.purpose)) {
    errors.push("Invalid donation purpose");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push("Invalid email format");
  }

  // Sanitize string inputs
  if (data.name && data.name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (data.address && data.address.length > 200) {
    errors.push("Address must be less than 200 characters");
  }

  return { isValid: errors.length === 0, errors };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const requestData: CheckoutRequest = await req.json();

    // Validate input data
    const validation = validateInput(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.errors.join(", ") }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const { amount, donationType, purpose, email, name, address, memberId } =
      requestData;

    if (!amount || !donationType || !purpose || !email) {
      throw new Error(
        "Missing required fields: amount, donationType, purpose, email",
      );
    }

    // Use demo key for testing - in production, set STRIPE_SECRET_KEY environment variable
    const stripeKey =
      Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_51234567890abcdef";

    if (!stripeKey || stripeKey === "sk_test_51234567890abcdef") {
      console.log("Using demo Stripe key - this is for testing purposes only");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      if (name || address) {
        await stripe.customers.update(customerId, {
          name: name || undefined,
          address: address
            ? {
                line1: address,
              }
            : undefined,
        });
      }
    } else {
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        address: address
          ? {
              line1: address,
            }
          : undefined,
      });
      customerId = customer.id;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const productName =
      purpose === "general_fund"
        ? "General Fund Donation"
        : purpose === "building_fund"
          ? "Building Fund Donation"
          : purpose === "youth_programs"
            ? "Youth Programs Donation"
            : purpose === "membership_fee"
              ? "Membership Fee"
              : "Charitable Donation";

    const isRecurring = donationType !== "one_time";

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: `${purpose.replace("_", " ")} - ${isRecurring ? "Recurring" : "One-time"} donation`,
            },
            unit_amount: amountInCents,
            ...(isRecurring && {
              recurring: {
                interval:
                  donationType === "monthly"
                    ? "month"
                    : donationType === "quarterly"
                      ? "month"
                      : "year",
                interval_count: donationType === "quarterly" ? 3 : 1,
              },
            }),
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
        donationType,
        memberId: memberId || "",
        demo_mode: "true",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    try {
      console.log("Storing donation record in database");
      const { data: donationData, error: donationError } = await supabaseClient
        .from("donations")
        .insert([
          {
            amount: parseFloat(amount),
            donor_email: email,
            donor_name: name || null,
            purpose: purpose,
            payment_status: "pending",
            payment_id: session.id,
            payment_method: "stripe",
            is_anonymous: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (donationError) {
        console.error("Error storing donation record:", donationError);
      } else {
        console.log("Donation record stored successfully:", donationData);
      }
    } catch (dbError) {
      console.error("Exception storing donation record:", dbError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
