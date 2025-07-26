import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    const { action, payment_data, member_id, donation_data } = await req.json();

    switch (action) {
      case "create_membership_payment": {
        // Create a donation record for membership fee
        const { data: donation, error: donationError } = await supabaseClient
          .from("donations")
          .insert({
            amount: payment_data.amount,
            donor_name: payment_data.donor_name,
            donor_email: payment_data.donor_email,
            purpose: "membership_fee",
            status: "pending",
            payment_method: payment_data.payment_method || "stripe",
            member_id: member_id,
            is_membership_fee: true,
            stripe_payment_intent_id: payment_data.stripe_payment_intent_id,
            stripe_customer_id: payment_data.stripe_customer_id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (donationError) {
          console.error("Error creating donation record:", donationError);
          throw new Error(
            `Failed to create donation record: ${donationError.message}`,
          );
        }

        return new Response(JSON.stringify({ success: true, donation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "confirm_membership_payment": {
        // Update donation status and activate membership
        const { data: donation, error: donationError } = await supabaseClient
          .from("donations")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", payment_data.payment_intent_id)
          .select()
          .single();

        if (donationError) {
          console.error("Error updating donation:", donationError);
          throw new Error(
            `Failed to update donation: ${donationError.message}`,
          );
        }

        // Activate membership if this was a membership fee
        if (donation.is_membership_fee && donation.member_id) {
          const { error: memberError } = await supabaseClient
            .from("members")
            .update({
              membership_status: "active",
              membership_date: new Date().toISOString().split("T")[0],
              membership_fee_paid: true,
              payment_status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("id", donation.member_id);

          if (memberError) {
            console.error("Error activating membership:", memberError);
            // Don't throw here, payment was successful
          }
        }

        return new Response(JSON.stringify({ success: true, donation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "create_donation": {
        // Create a general donation record
        const { data: donation, error } = await supabaseClient
          .from("donations")
          .insert({
            ...donation_data,
            status: "pending",
            is_membership_fee: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating donation:", error);
          throw new Error(`Failed to create donation: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, donation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "confirm_donation": {
        // Update donation status
        const { data: donation, error } = await supabaseClient
          .from("donations")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", payment_data.payment_intent_id)
          .select()
          .single();

        if (error) {
          console.error("Error updating donation:", error);
          throw new Error(`Failed to update donation: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, donation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "handle_failed_payment": {
        // Update donation status to failed
        const { data: donation, error } = await supabaseClient
          .from("donations")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", payment_data.payment_intent_id)
          .select()
          .single();

        if (error) {
          console.error("Error updating failed donation:", error);
          throw new Error(`Failed to update donation: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, donation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_membership_fees": {
        // Get membership fee amounts from settings
        const { data: settings, error } = await supabaseClient
          .from("site_settings")
          .select("key, value")
          .in("key", [
            "membership_fee_regular",
            "membership_fee_student",
            "membership_fee_senior",
            "membership_fee_family",
          ]);

        if (error) {
          console.error("Error fetching membership fees:", error);
          throw new Error(`Failed to fetch membership fees: ${error.message}`);
        }

        const fees = settings.reduce(
          (acc, setting) => {
            acc[setting.key] = parseFloat(setting.value) || 0;
            return acc;
          },
          {} as Record<string, number>,
        );

        return new Response(JSON.stringify({ success: true, fees }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
