import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Stripe } from "https://esm.sh/stripe@18.2.1";

/**
 * Process a completed checkout session
 */
export async function processCompletedCheckout(
  supabaseClient: any,
  session: any,
  stripeInstance: any,
) {
  try {
    // Update donation status
    const { error: updateError } = await supabaseClient
      .from("donations")
      .update({
        payment_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", session.id);

    if (updateError) {
      console.error("Error updating donation:", updateError);
      return { success: false, error: updateError };
    }

    // Get donation details for email
    const { data: donation, error: donationError } = await supabaseClient
      .from("donations")
      .select("*")
      .eq("payment_id", session.id)
      .single();

    if (donationError) {
      console.error("Error fetching donation:", donationError);
      return { success: false, error: donationError };
    }

    // Process membership fee if applicable
    if (
      donation &&
      donation.purpose === "membership_fee" &&
      donation.memberId
    ) {
      await processMembershipFee(supabaseClient, donation);
    }

    // Send emails if donation exists
    if (donation) {
      await sendDonationEmails(supabaseClient, donation);
    }

    return { success: true, donation };
  } catch (error) {
    console.error("Error processing checkout:", error);
    return { success: false, error };
  }
}

/**
 * Process membership fee payment
 */
async function processMembershipFee(supabaseClient: any, donation: any) {
  try {
    const { error: memberError } = await supabaseClient
      .from("members")
      .update({ membership_fee_paid: true })
      .eq("id", donation.memberId);

    if (memberError) {
      console.error("Error updating member as paid:", memberError);
      return { success: false, error: memberError };
    }

    return { success: true };
  } catch (error) {
    console.error("Error processing membership fee:", error);
    return { success: false, error };
  }
}

/**
 * Send donation confirmation and admin notification emails
 */
async function sendDonationEmails(supabaseClient: any, donation: any) {
  try {
    // Get site settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from("site_settings")
      .select("admin_email, enable_email_notifications")
      .single();

    if (settingsError) {
      console.error("Error fetching site settings:", settingsError);
      return { success: false, error: settingsError };
    }

    // Send confirmation email to donor
    if (donation.donor_email && !donation.is_anonymous) {
      await supabaseClient.functions.invoke("supabase-functions-send-email", {
        body: {
          type: "donation_confirmation",
          data: {
            donor_name: donation.donor_name,
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
      await supabaseClient.functions.invoke("supabase-functions-send-email", {
        body: {
          type: "admin_notification",
          data: {
            donor_name: donation.donor_name || "Anonymous",
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

    return { success: true };
  } catch (error) {
    console.error("Error sending donation emails:", error);
    return { success: false, error };
  }
}

/**
 * Create a Stripe instance with the provided secret key
 */
export function createStripeInstance(secretKey: string) {
  return new Stripe(secretKey, { apiVersion: "2023-10-16" });
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  stripeInstance: any,
  payload: string,
  signature: string,
  webhookSecret: string,
) {
  try {
    return {
      success: true,
      event: stripeInstance.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      ),
    };
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
