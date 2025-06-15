
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update donation status
      const { error: updateError } = await supabaseClient
        .from("donations")
        .update({ 
          payment_status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("payment_id", session.id);

      if (updateError) {
        console.error("Error updating donation:", updateError);
      }

      // Get donation details for email
      const { data: donation } = await supabaseClient
        .from("donations")
        .select("*")
        .eq("payment_id", session.id)
        .single();

      if (donation) {
        // Get site settings
        const { data: settings } = await supabaseClient
          .from("site_settings")
          .select("admin_email, enable_email_notifications")
          .single();

        // Send confirmation email to donor
        if (donation.donor_email && !donation.is_anonymous) {
          await supabaseClient.functions.invoke("send-email", {
            body: {
              type: "donation_confirmation",
              data: {
                donor_name: donation.donor_name,
                amount: donation.amount,
                purpose: donation.purpose,
                date: new Date(donation.created_at).toLocaleDateString()
              },
              recipients: [donation.donor_email]
            }
          });
        }

        // Send notification to admin
        if (settings?.admin_email && settings?.enable_email_notifications) {
          await supabaseClient.functions.invoke("send-email", {
            body: {
              type: "admin_notification",
              data: {
                donor_name: donation.donor_name || "Anonymous",
                donor_email: donation.donor_email || "Not provided",
                amount: donation.amount,
                purpose: donation.purpose,
                date: new Date(donation.created_at).toLocaleDateString(),
                status: "completed"
              },
              recipients: [settings.admin_email]
            }
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});
