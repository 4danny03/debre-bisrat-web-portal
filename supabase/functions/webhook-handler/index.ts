import { serve } from "std/http/server.ts";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = Deno.env.get("VITE_STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("VITE_STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey)
  throw new Error("Missing VITE_STRIPE_SECRET_KEY environment variable");
if (!stripeWebhookSecret)
  throw new Error("Missing VITE_STRIPE_WEBHOOK_SECRET environment variable");
if (!supabaseUrl) throw new Error("Missing SUPABASE_URL environment variable");
if (!supabaseServiceRoleKey)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-05-28.basil" });

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }VITE_

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", message);
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Update donation status
    const { error: updateError } = await supabaseClient
      .from("donations")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", session.id);

    if (updateError) {
      console.error("Error updating donation:", updateError);
    }

    // Get donation details for email
    const { data: donation, error: donationError } = await supabaseClient
      .from("donations")
      .select("*")
      .eq("stripe_payment_intent_id", session.id)
      .single();

    if (donationError) {
      console.error("Error fetching donation:", donationError);
    }

    // --- AUTOMATE MEMBERSHIP ACTIVATION ---
    if (
      donation &&
      donation.purpose === "membership_fee" &&
      donation.member_id
    ) {
      const currentDate = new Date();
      const nextRenewalDate = new Date(currentDate);
      nextRenewalDate.setFullYear(currentDate.getFullYear() + 1);
      
      const { error: memberError } = await supabaseClient
        .from("members")
        .update({ 
          membership_fee_paid: true,
          membership_status: 'active',
          payment_status: 'paid',
          last_renewal_date: currentDate.toISOString().split('T')[0],
          next_renewal_date: nextRenewalDate.toISOString().split('T')[0],
          updated_at: currentDate.toISOString()
        })
        .eq("id", donation.member_id);
      if (memberError) {
        console.error("Error updating member as paid:", memberError);
      } else {
        console.log("Successfully activated membership for member:", donation.member_id);
      }
    }
    // --- END AUTOMATION ---

    if (donation) {
      // Get site settings
      const { data: settings, error: settingsError } = await supabaseClient
        .from("site_settings")
        .select("admin_email, enable_email_notifications")
        .single();
      if (settingsError) {
        console.error("Error fetching site settings:", settingsError);
      }

      // Send confirmation email to donor
      if (donation.donor_email && !donation.is_anonymous) {
        const emailType = donation.purpose === "membership_fee" ? "membership_confirmation" : "donation_confirmation";
        
        // For membership fees, get the member name from the member record
        let memberName = donation.donor_name;
        if (donation.purpose === "membership_fee" && donation.member_id) {
          const { data: member } = await supabaseClient
            .from("members")
            .select("first_name, last_name")
            .eq("id", donation.member_id)
            .single();
          if (member) {
            memberName = `${member.first_name} ${member.last_name}`;
          }
        }
        
        await supabaseClient.functions.invoke("send-email", {
          body: {
            type: emailType,
            data: {
              donor_name: memberName,
              amount: donation.amount,
              purpose: donation.purpose,
              date: new Date(donation.created_at).toISOString().split("T")[0],
            },
            recipients: [donation.donor_email],
          },
        });
      }

      // Send notification to admin
      if (settings?.admin_email && settings?.enable_email_notifications) {
        const adminEmailType = donation.purpose === "membership_fee" ? "admin_membership_notification" : "admin_notification";
        
        // For membership fees, try to get the member name from the member record
        let memberName = donation.donor_name || "Anonymous";
        if (donation.purpose === "membership_fee" && donation.member_id) {
          const { data: member } = await supabaseClient
            .from("members")
            .select("first_name, last_name, membership_type")
            .eq("id", donation.member_id)
            .single();
          if (member) {
            memberName = `${member.first_name} ${member.last_name}`;
          }
        }
        
        await supabaseClient.functions.invoke("send-email", {
          body: {
            type: adminEmailType,
            data: {
              donor_name: memberName,
              donor_email: donation.donor_email || "Not provided",
              amount: donation.amount,
              purpose: donation.purpose,
              date: new Date(donation.created_at).toISOString().split("T")[0],
              status: "completed",
            },
            recipients: [settings.admin_email],
          },
        });
      }
    }
  } else {
    // For unsupported event types, just acknowledge
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
