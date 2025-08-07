import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@latest"; // Changed import

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlContent: string;
  from?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable not set");
    }

    const requestData: EmailRequest = await req.json();
    
    // Initialize Resend client with NEW syntax
    const resend = new Resend(RESEND_API_KEY);

    // Send email
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Use test domain if no custom domain
      to: requestData.to,
      subject: requestData.subject,
      html: requestData.htmlContent
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Resend error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});