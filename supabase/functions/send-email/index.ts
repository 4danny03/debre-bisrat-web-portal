
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donorEmail, amount, purpose, donationType, adminEmails = ["admin@church.org"] } = await req.json();

    // Validate inputs
    if (!donorEmail || !amount || !purpose) {
      throw new Error("Missing required fields: donorEmail, amount, purpose");
    }
    
    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));

    // Format purpose
    const formattedPurpose = purpose
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Format donation type
    const formattedDonationType = donationType === "one_time" ? "One-time donation" :
                                 donationType === "monthly" ? "Monthly subscription" :
                                 donationType === "quarterly" ? "Quarterly subscription" :
                                 "Annual subscription";

    // Send thank you email to donor
    const donorEmailResponse = await resend.emails.send({
      from: "Debre Bisrat Ethiopian Orthodox Church <donation@church.org>",
      to: [donorEmail],
      subject: "Thank You for Your Donation",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #7D2224; padding: 20px; text-align: center;">
            <h1 style="color: #D4AF37; margin: 0;">Thank You for Your Donation</h1>
          </div>
          <div style="padding: 20px; background-color: #fff; border: 1px solid #e0e0e0;">
            <p>Dear Supporter,</p>
            <p>Thank you for your generous donation to Debre Bisrat Ethiopian Orthodox Church. Your contribution helps us continue our mission and service to the community.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #7D2224; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Donation Amount:</strong> ${formattedAmount}</p>
              <p style="margin: 5px 0;"><strong>Purpose:</strong> ${formattedPurpose}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${formattedDonationType}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>May God bless you for your generosity.</p>
            <p>Sincerely,<br>Debre Bisrat Ethiopian Orthodox Church</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await Promise.all(adminEmails.map(adminEmail => {
      return resend.emails.send({
        from: "Debre Bisrat Ethiopian Orthodox Church <donation@church.org>",
        to: [adminEmail],
        subject: "New Donation Received",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #7D2224; padding: 20px; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0;">New Donation Received</h1>
            </div>
            <div style="padding: 20px; background-color: #fff; border: 1px solid #e0e0e0;">
              <p>A new donation has been received:</p>
              <div style="background-color: #f9f9f9; border-left: 4px solid #7D2224; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Donor Email:</strong> ${donorEmail}</p>
                <p style="margin: 5px 0;"><strong>Donation Amount:</strong> ${formattedAmount}</p>
                <p style="margin: 5px 0;"><strong>Purpose:</strong> ${formattedPurpose}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${formattedDonationType}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        `,
      });
    }));

    console.log("Emails sent successfully:", { donorEmail, adminEmails });

    return new Response(JSON.stringify({ 
      donorEmail: donorEmailResponse, 
      adminEmails: adminEmailResponse
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
