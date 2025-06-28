import express, { Request, Response } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ verify: (req, res, buf) => { (req as any).rawBody = buf; } }));

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY environment variable");
if (!stripeWebhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
if (!supabaseUrl) throw new Error("Missing SUPABASE_URL environment variable");
if (!supabaseServiceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

app.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook error:", message);
    return res.status(400).send(`Webhook error: ${message}`);
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

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
              date: new Date(donation.created_at).toISOString().split("T")[0]
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
              date: new Date(donation.created_at).toISOString().split("T")[0],
              status: "completed"
            },
            recipients: [settings.admin_email]
          }
        });
      }
    }
  }

  res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook handler listening on port ${PORT}`);
});
